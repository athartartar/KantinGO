<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Canteen;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\PartnerBankAccount;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Warung;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_role_escalation_via_register_is_blocked(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Attacker',
            'email' => 'attacker@example.com',
            'password' => 'StrongPass!123',
            'password_confirmation' => 'StrongPass!123',
            'role' => 'admin',
        ])->assertStatus(422);

        $res = $this->postJson('/api/v1/auth/register', [
            'name' => 'Normal User',
            'email' => 'normal@example.com',
            'password' => 'StrongPass!123',
            'password_confirmation' => 'StrongPass!123',
            'role' => 'customer',
            'points' => 999999,
        ])->assertStatus(201);

        $this->assertSame('customer', $res->json('data.user.role'));
        $this->assertSame(0, $res->json('data.user.points'));
    }

    public function test_customer_cannot_access_partner_or_admin_endpoints_and_pending_partner_is_blocked(): void
    {
        $customer = User::factory()->create();
        Sanctum::actingAs($customer);

        $this->getJson('/api/v1/partner/warung')->assertStatus(403);
        $this->getJson('/api/v1/partner/wallet')->assertStatus(403);
        $this->getJson('/api/v1/admin/partner-applications')->assertStatus(403);
        $this->getJson('/api/v1/admin/wallet/summary')->assertStatus(403);

        $pendingOwner = User::factory()->warungOwner()->create();
        $canteen = Canteen::factory()->create();
        Warung::factory()->pending()->create([
            'owner_id' => $pendingOwner->id,
            'canteen_id' => $canteen->id,
        ]);

        Sanctum::actingAs($pendingOwner);
        $this->getJson('/api/v1/partner/warung')->assertStatus(403);
        $this->getJson('/api/v1/partner/wallet')->assertStatus(403);
        $this->postJson('/api/v1/partner/withdrawals', ['amount' => 10000])->assertStatus(403);
    }

    public function test_cross_warung_idor_is_blocked(): void
    {
        $ownerA = User::factory()->warungOwner()->create();
        $ownerB = User::factory()->warungOwner()->create();
        $canteen = Canteen::factory()->create();
        $warungA = Warung::factory()->create(['owner_id' => $ownerA->id, 'canteen_id' => $canteen->id, 'status' => 'approved']);
        $warungB = Warung::factory()->create(['owner_id' => $ownerB->id, 'canteen_id' => $canteen->id, 'status' => 'approved']);

        $category = Category::factory()->create();
        $menuB = Menu::factory()->create(['warung_id' => $warungB->id, 'category_id' => $category->id]);
        $orderB = Order::factory()->create(['warung_id' => $warungB->id, 'status' => 'diproses']);

        Sanctum::actingAs($ownerA);
        $this->getJson("/api/v1/partner/menus/{$menuB->id}")->assertStatus(403);
        $this->patchJson("/api/v1/partner/orders/{$orderB->id}/status", ['status' => 'siap'])->assertStatus(403);
        $this->getJson('/api/v1/partner/orders')->assertStatus(200)->assertJsonCount(0, 'data');
    }

    public function test_payment_code_guessing_and_replay_attack_are_blocked(): void
    {
        $this->getJson('/api/v1/payments/simulate/nonexistentcode123456789012345678901234')
            ->assertStatus(404)
            ->assertHeader('X-RateLimit-Limit', '20');

        $this->postJson('/api/v1/payments/simulate/nonexistentcode123456789012345678901234/pay')
            ->assertStatus(404)
            ->assertHeader('X-RateLimit-Limit', '10');
    }

    public function test_withdrawal_race_idempotency_ledger_integrity_and_audit_logs(): void
    {
        $customer = User::factory()->create([
            'email' => 'audit@kantingo.id',
            'password' => Hash::make('SecretPass!123'),
        ]);
        $partner = User::factory()->warungOwner()->create();
        $canteen = Canteen::factory()->create();
        $warung = Warung::factory()->create([
            'owner_id' => $partner->id,
            'canteen_id' => $canteen->id,
            'status' => 'approved',
            'is_open' => true,
            'opening_hours' => '08:00 - 17:00',
        ]);
        $category = Category::factory()->create();
        $menu = Menu::factory()->create([
            'warung_id' => $warung->id,
            'category_id' => $category->id,
            'price' => 29000,
            'is_available' => true,
        ]);

        $this->withHeaders(['User-Agent' => 'AuditTestAgent/1.0'])
            ->postJson('/api/v1/auth/login', [
                'email' => 'audit@kantingo.id',
                'password' => 'WrongPassword!123',
            ])->assertStatus(401);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'auth.login_failed',
            'user_agent' => 'AuditTestAgent/1.0',
        ]);

        $loginRes = $this->withHeaders(['User-Agent' => 'AuditTestAgent/1.0'])
            ->postJson('/api/v1/auth/login', [
                'email' => 'audit@kantingo.id',
                'password' => 'SecretPass!123',
            ])->assertStatus(200);

        $token = $loginRes->json('data.token');

        $orderRes = $this->withToken($token)->postJson('/api/v1/orders', [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'pickup_time' => now()->addDay()->setTime(12, 0)->format('Y-m-d H:i:s'),
        ])->assertStatus(201);

        $orderId = $orderRes->json('data.id');
        $payRes = $this->withToken($token)->postJson("/api/v1/orders/{$orderId}/pay")->assertStatus(201);
        $paymentCode = $payRes->json('data.code');

        $this->postJson("/api/v1/payments/simulate/{$paymentCode}/pay")->assertStatus(200);
        $this->postJson("/api/v1/payments/simulate/{$paymentCode}/pay")->assertStatus(422);

        Sanctum::actingAs($partner);
        $this->patchJson("/api/v1/partner/orders/{$orderId}/status", ['status' => 'siap'])->assertStatus(200);

        Sanctum::actingAs($customer);
        $this->postJson("/api/v1/orders/{$orderId}/confirm-pickup")->assertStatus(200);

        Sanctum::actingAs($partner);
        $this->putJson('/api/v1/partner/bank-account', [
            'bank_name' => 'BCA',
            'account_holder' => 'Mitra Kantin',
            'account_number' => '8877665544',
        ])->assertStatus(200);

        $this->withHeaders(['Idempotency-Key' => 'sec-wd-1'])
            ->postJson('/api/v1/partner/withdrawals', ['amount' => 15000])
            ->assertStatus(201);

        $this->withHeaders(['Idempotency-Key' => 'sec-wd-1'])
            ->postJson('/api/v1/partner/withdrawals', ['amount' => 15000])
            ->assertStatus(200);

        $wallet = Wallet::where('user_id', $partner->id)->firstOrFail();
        $this->assertSame(15000, $wallet->available_balance);

        $this->artisan('wallet:reconcile')->assertExitCode(0);

        $allLogs = AuditLog::all()->toJson();
        $this->assertStringNotContainsString('SecretPass!123', $allLogs);
        $this->assertStringNotContainsString('WrongPassword!123', $allLogs);
        $this->assertStringNotContainsString('8877665544', $allLogs);
        $this->assertStringNotContainsString($paymentCode, $allLogs);
    }
}
