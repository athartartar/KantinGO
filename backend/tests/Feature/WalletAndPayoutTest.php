<?php

namespace Tests\Feature;

use App\Models\Canteen;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Order;
use App\Models\PartnerBankAccount;
use App\Models\Payment;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Warung;
use App\Models\Withdrawal;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use RuntimeException;
use Tests\TestCase;

class WalletAndPayoutTest extends TestCase
{
    use RefreshDatabase;

    private function createApprovedWarung(?User $owner = null): Warung
    {
        $owner = $owner ?? User::factory()->warungOwner()->create();
        $canteen = Canteen::factory()->create();

        return Warung::factory()->create([
            'owner_id' => $owner->id,
            'canteen_id' => $canteen->id,
            'status' => 'approved',
            'is_open' => true,
            'opening_hours' => '08:00 - 17:00',
        ]);
    }

    private function createPaidOrderForWarung(Warung $warung, User $customer, int $menuPrice = 29000): array
    {
        $category = Category::factory()->create();
        $menu = Menu::factory()->create([
            'warung_id' => $warung->id,
            'category_id' => $category->id,
            'price' => $menuPrice,
            'is_available' => true,
        ]);

        Sanctum::actingAs($customer);

        $orderResponse = $this->postJson('/api/v1/orders', [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'pickup_time' => now()->addDay()->setTime(12, 0)->format('Y-m-d H:i:s'),
        ])->assertStatus(201);

        $orderId = $orderResponse->json('data.id');

        $payResponse = $this->postJson("/api/v1/orders/{$orderId}/pay")->assertStatus(201);
        $code = $payResponse->json('data.code');

        $this->postJson("/api/v1/payments/simulate/{$code}/pay")->assertStatus(200);

        return [
            'order' => Order::findOrFail($orderId),
            'payment' => Payment::where('code', $code)->firstOrFail(),
        ];
    }

    public function test_full_wallet_flow_with_fee_release_withdrawal_and_reconcile(): void
    {
        config(['wallet.platform_fee_percent' => 10]);

        $customer = User::factory()->create();
        $partner = User::factory()->warungOwner()->create();
        $warung = $this->createApprovedWarung($partner);

        ['order' => $order] = $this->createPaidOrderForWarung($warung, $customer, 29000);

        $this->assertSame(30000, $order->total);

        $platformWallet = Wallet::where('type', 'platform')->firstOrFail();
        $partnerWallet = Wallet::where('type', 'partner')->where('user_id', $partner->id)->firstOrFail();

        $this->assertSame(30000, $platformWallet->available_balance);
        $this->assertSame(27000, $partnerWallet->pending_balance);
        $this->assertSame(0, $partnerWallet->available_balance);

        Sanctum::actingAs($partner);
        $this->patchJson("/api/v1/orders/{$order->id}/status", ['status' => 'siap'])->assertStatus(200);

        Sanctum::actingAs($customer);
        $this->postJson("/api/v1/orders/{$order->id}/confirm-pickup")->assertStatus(200);

        $partnerWallet->refresh();
        $this->assertSame(0, $partnerWallet->pending_balance);
        $this->assertSame(27000, $partnerWallet->available_balance);

        Sanctum::actingAs($partner);
        $this->putJson('/api/v1/partner/bank-account', [
            'bank_name' => 'BCA',
            'account_holder' => 'Budi Santoso',
            'account_number' => '1234567890',
        ])
            ->assertStatus(200)
            ->assertJsonPath('data.account_number_masked', '******7890');

        $rawAccountNumber = DB::table('partner_bank_accounts')->where('user_id', $partner->id)->value('account_number');
        $this->assertNotSame('1234567890', $rawAccountNumber);

        $this->postJson('/api/v1/partner/withdrawals', ['amount' => 15000])
            ->assertStatus(201)
            ->assertJsonPath('data.amount', 15000)
            ->assertJsonPath('data.status', 'success');

        $partnerWallet->refresh();
        $this->assertSame(12000, $partnerWallet->available_balance);

        $this->artisan('wallet:reconcile')->assertExitCode(0);
    }

    public function test_withdraw_exceeding_available_balance_or_while_pending_is_rejected(): void
    {
        $customer = User::factory()->create();
        $partner = User::factory()->warungOwner()->create();
        $warung = $this->createApprovedWarung($partner);

        ['order' => $order] = $this->createPaidOrderForWarung($warung, $customer, 19000);

        Sanctum::actingAs($partner);
        $this->putJson('/api/v1/partner/bank-account', [
            'bank_name' => 'BRI',
            'account_holder' => 'Siti Aminah',
            'account_number' => '9876543210',
        ])->assertStatus(200);

        $this->postJson('/api/v1/partner/withdrawals', ['amount' => 10000])
            ->assertStatus(422);

        $this->patchJson("/api/v1/orders/{$order->id}/status", ['status' => 'siap'])->assertStatus(200);
        Sanctum::actingAs($customer);
        $this->postJson("/api/v1/orders/{$order->id}/confirm-pickup")->assertStatus(200);

        Sanctum::actingAs($partner);
        $this->postJson('/api/v1/partner/withdrawals', ['amount' => 25000])
            ->assertStatus(422);

        $this->postJson('/api/v1/partner/withdrawals', ['amount' => 5000])
            ->assertStatus(422);

        $wallet = Wallet::where('user_id', $partner->id)->firstOrFail();
        $this->assertSame(20000, $wallet->available_balance);
    }

    public function test_duplicate_withdrawal_with_idempotency_key_deducts_once(): void
    {
        $partner = User::factory()->warungOwner()->create();
        $this->createApprovedWarung($partner);

        Wallet::create([
            'type' => 'partner',
            'user_id' => $partner->id,
            'pending_balance' => 0,
            'available_balance' => 50000,
        ]);

        PartnerBankAccount::create([
            'user_id' => $partner->id,
            'bank_name' => 'Mandiri',
            'account_holder' => 'Andi',
            'account_number' => '1122334455',
        ]);

        Sanctum::actingAs($partner);

        $first = $this->withHeaders(['Idempotency-Key' => 'wd-key-001'])
            ->postJson('/api/v1/partner/withdrawals', ['amount' => 20000]);
        $first->assertStatus(201);

        $second = $this->withHeaders(['Idempotency-Key' => 'wd-key-001'])
            ->postJson('/api/v1/partner/withdrawals', ['amount' => 20000]);
        $second->assertStatus(200)
            ->assertJsonPath('data.reference', $first->json('data.reference'));

        $this->assertSame(1, Withdrawal::where('user_id', $partner->id)->count());

        $wallet = Wallet::where('user_id', $partner->id)->firstOrFail();
        $this->assertSame(30000, $wallet->available_balance);
    }

    public function test_negative_wallet_balance_is_impossible_at_database_level(): void
    {
        $partner = User::factory()->warungOwner()->create();

        $this->expectException(QueryException::class);

        Wallet::create([
            'type' => 'partner',
            'user_id' => $partner->id,
            'pending_balance' => 0,
            'available_balance' => -100,
        ]);
    }

    public function test_partner_cannot_view_other_partner_wallet_and_unapproved_partner_is_blocked(): void
    {
        $partnerA = User::factory()->warungOwner()->create();
        $partnerB = User::factory()->warungOwner()->create();
        $this->createApprovedWarung($partnerA);
        $this->createApprovedWarung($partnerB);

        Wallet::create([
            'type' => 'partner',
            'user_id' => $partnerA->id,
            'pending_balance' => 10000,
            'available_balance' => 25000,
        ]);

        Wallet::create([
            'type' => 'partner',
            'user_id' => $partnerB->id,
            'pending_balance' => 99000,
            'available_balance' => 88000,
        ]);

        Sanctum::actingAs($partnerA);
        $this->getJson('/api/v1/partner/wallet')
            ->assertStatus(200)
            ->assertJsonPath('data.pending_balance', 10000)
            ->assertJsonPath('data.available_balance', 25000);

        $unapproved = User::factory()->warungOwner()->create();
        Warung::factory()->pending()->create(['owner_id' => $unapproved->id]);
        Sanctum::actingAs($unapproved);
        $this->getJson('/api/v1/partner/wallet')->assertStatus(403);
    }

    public function test_cancel_paid_order_reverses_pending_and_records_refund(): void
    {
        config(['wallet.platform_fee_percent' => 10]);

        $customer = User::factory()->create();
        $partner = User::factory()->warungOwner()->create();
        $warung = $this->createApprovedWarung($partner);

        ['order' => $order, 'payment' => $payment] = $this->createPaidOrderForWarung($warung, $customer, 29000);

        Sanctum::actingAs($customer);
        $this->postJson("/api/v1/orders/{$order->id}/cancel")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'dibatalkan');

        $payment->refresh();
        $this->assertSame('refunded', $payment->status);

        $platformWallet = Wallet::where('type', 'platform')->firstOrFail();
        $partnerWallet = Wallet::where('type', 'partner')->where('user_id', $partner->id)->firstOrFail();

        $this->assertSame(0, $platformWallet->available_balance);
        $this->assertSame(0, $partnerWallet->pending_balance);
        $this->assertSame(0, $partnerWallet->available_balance);

        $this->assertDatabaseHas('wallet_transactions', [
            'wallet_id' => $partnerWallet->id,
            'type' => 'refund',
            'amount' => 27000,
            'order_id' => $order->id,
        ]);

        $this->assertDatabaseHas('wallet_transactions', [
            'wallet_id' => $platformWallet->id,
            'type' => 'refund',
            'amount' => 30000,
            'order_id' => $order->id,
        ]);

        $this->artisan('wallet:reconcile')->assertExitCode(0);
    }

    public function test_wallet_transactions_ledger_is_append_only(): void
    {
        $wallet = Wallet::create([
            'type' => 'platform',
            'user_id' => null,
            'pending_balance' => 0,
            'available_balance' => 10000,
        ]);

        $tx = WalletTransaction::create([
            'wallet_id' => $wallet->id,
            'type' => 'payment_in',
            'amount' => 10000,
            'balance_after' => 10000,
            'reference' => 'WTX-TEST-APPEND-ONLY',
        ]);

        $this->expectException(RuntimeException::class);
        $tx->update(['amount' => 1]);
    }
}
