<?php

namespace Tests\Feature;

use App\Events\PaymentPaid;
use App\Models\Canteen;
use App\Models\Category;
use App\Models\Menu;
use App\Models\MenuAddon;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\Voucher;
use App\Models\Warung;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderAndPaymentTest extends TestCase
{
    use RefreshDatabase;

    private function futurePickupTime(int $hour = 12, int $minute = 0): string
    {
        return now()->addDay()->setTime($hour, $minute)->format('Y-m-d H:i:s');
    }

    private function createApprovedWarung(array $attrs = []): Warung
    {
        $owner = User::factory()->warungOwner()->create();
        $canteen = Canteen::factory()->create();

        return Warung::factory()->create(array_merge([
            'owner_id' => $owner->id,
            'canteen_id' => $canteen->id,
            'status' => 'approved',
            'is_open' => true,
            'opening_hours' => '08:00 - 17:00',
        ], $attrs));
    }

    private function createMenuForWarung(Warung $warung, array $attrs = []): Menu
    {
        $category = Category::factory()->create();

        return Menu::factory()->create(array_merge([
            'warung_id' => $warung->id,
            'category_id' => $category->id,
            'price' => 15000,
            'is_available' => true,
        ], $attrs));
    }

    public function test_price_manipulation_is_ignored_and_recalculated_server_side(): void
    {
        $customer = User::factory()->create();
        $warung = $this->createApprovedWarung();
        $menu = $this->createMenuForWarung($warung, ['price' => 18000]);
        $addon = MenuAddon::factory()->create([
            'menu_id' => $menu->id,
            'additional_price' => 3000,
            'is_available' => true,
        ]);
        Voucher::factory()->create([
            'code' => 'HEMAT5K',
            'type' => 'nominal',
            'value' => 5000,
            'min_spend' => 20000,
            'is_active' => true,
        ]);

        Sanctum::actingAs($customer);

        $response = $this->postJson('/api/v1/orders', [
            'items' => [
                [
                    'menu_id' => $menu->id,
                    'qty' => 2,
                    'addon_id' => [$addon->id],
                    'unit_price' => 1,
                    'subtotal' => 2,
                ],
            ],
            'pickup_time' => $this->futurePickupTime(),
            'voucher_code' => 'HEMAT5K',
            'subtotal' => 100,
            'discount' => 999999,
            'service_fee' => 0,
            'total' => 1,
            'status' => 'selesai',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'menunggu_pembayaran')
            ->assertJsonPath('data.subtotal', 42000)
            ->assertJsonPath('data.discount', 5000)
            ->assertJsonPath('data.service_fee', 1000)
            ->assertJsonPath('data.total', 38000);

        $this->assertDatabaseHas('orders', [
            'user_id' => $customer->id,
            'warung_id' => $warung->id,
            'subtotal' => 42000,
            'discount' => 5000,
            'service_fee' => 1000,
            'total' => 38000,
            'status' => 'menunggu_pembayaran',
        ]);
    }

    public function test_idempotency_key_prevents_duplicate_orders(): void
    {
        $customer = User::factory()->create();
        $warung = $this->createApprovedWarung();
        $menu = $this->createMenuForWarung($warung, ['price' => 12000]);

        Sanctum::actingAs($customer);

        $payload = [
            'items' => [
                ['menu_id' => $menu->id, 'qty' => 2],
            ],
            'pickup_time' => $this->futurePickupTime(),
        ];

        $first = $this->withHeaders(['Idempotency-Key' => 'order-abc-123'])
            ->postJson('/api/v1/orders', $payload);
        $first->assertStatus(201);

        $second = $this->withHeaders(['Idempotency-Key' => 'order-abc-123'])
            ->postJson('/api/v1/orders', $payload);
        $second->assertStatus(200)
            ->assertJsonPath('data.id', $first->json('data.id'));

        $this->assertSame(1, Order::where('user_id', $customer->id)->count());
    }

    public function test_order_validation_rules(): void
    {
        $customer = User::factory()->create();
        $warung1 = $this->createApprovedWarung();
        $warung2 = $this->createApprovedWarung();
        $menu1 = $this->createMenuForWarung($warung1);
        $menu2 = $this->createMenuForWarung($warung2);
        $unavailableMenu = $this->createMenuForWarung($warung1, ['is_available' => false]);

        Sanctum::actingAs($customer);

        $this->postJson('/api/v1/orders', [
            'items' => [
                ['menu_id' => $menu1->id, 'qty' => 1],
                ['menu_id' => $menu2->id, 'qty' => 1],
            ],
            'pickup_time' => $this->futurePickupTime(),
        ])->assertStatus(422);

        $this->postJson('/api/v1/orders', [
            'items' => [
                ['menu_id' => $unavailableMenu->id, 'qty' => 1],
            ],
            'pickup_time' => $this->futurePickupTime(),
        ])->assertStatus(422);

        $this->postJson('/api/v1/orders', [
            'items' => [
                ['menu_id' => $menu1->id, 'qty' => 21],
            ],
            'pickup_time' => $this->futurePickupTime(),
        ])->assertStatus(422);

        $this->postJson('/api/v1/orders', [
            'items' => [
                ['menu_id' => $menu1->id, 'qty' => 1],
            ],
            'pickup_time' => now()->subHour()->format('Y-m-d H:i:s'),
        ])->assertStatus(422);

        $this->postJson('/api/v1/orders', [
            'items' => [
                ['menu_id' => $menu1->id, 'qty' => 1],
            ],
            'pickup_time' => $this->futurePickupTime(22, 0),
        ])->assertStatus(422);

        $warung1->update(['is_open' => false]);
        $this->postJson('/api/v1/orders', [
            'items' => [
                ['menu_id' => $menu1->id, 'qty' => 1],
            ],
            'pickup_time' => $this->futurePickupTime(),
        ])->assertStatus(422);
    }

    public function test_idor_protection_across_customers_and_warung_owners(): void
    {
        $customerA = User::factory()->create();
        $customerB = User::factory()->create();
        $warungA = $this->createApprovedWarung();
        $warungB = $this->createApprovedWarung();
        $unapprovedOwner = User::factory()->warungOwner()->create();
        $unapprovedWarung = Warung::factory()->pending()->create([
            'owner_id' => $unapprovedOwner->id,
            'canteen_id' => $warungA->canteen_id,
        ]);

        $orderA = Order::factory()->create([
            'user_id' => $customerA->id,
            'warung_id' => $warungA->id,
            'status' => 'diproses',
        ]);
        $orderUnapproved = Order::factory()->create([
            'user_id' => $customerA->id,
            'warung_id' => $unapprovedWarung->id,
            'status' => 'diproses',
        ]);

        Sanctum::actingAs($customerB);
        $this->getJson("/api/v1/orders/{$orderA->id}")->assertStatus(403);
        $this->postJson("/api/v1/orders/{$orderA->id}/cancel")->assertStatus(403);
        $this->postJson("/api/v1/orders/{$orderA->id}/pay")->assertStatus(403);
        $this->getJson("/api/v1/orders/{$orderA->id}/payment")->assertStatus(403);
        $this->postJson("/api/v1/orders/{$orderA->id}/confirm-pickup")->assertStatus(403);

        Sanctum::actingAs($customerA);
        $this->patchJson("/api/v1/orders/{$orderA->id}/status", ['status' => 'siap'])->assertStatus(403);

        Sanctum::actingAs($warungB->owner);
        $this->getJson("/api/v1/orders/{$orderA->id}")->assertStatus(403);
        $this->patchJson("/api/v1/orders/{$orderA->id}/status", ['status' => 'siap'])->assertStatus(403);

        Sanctum::actingAs($unapprovedOwner);
        $this->patchJson("/api/v1/orders/{$orderUnapproved->id}/status", ['status' => 'siap'])->assertStatus(403);
    }

    public function test_strict_status_machine_transitions(): void
    {
        $customer = User::factory()->create();
        $warung = $this->createApprovedWarung();
        $admin = User::factory()->admin()->create();

        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'warung_id' => $warung->id,
            'status' => 'menunggu_pembayaran',
        ]);

        Sanctum::actingAs($warung->owner);
        $this->patchJson("/api/v1/orders/{$order->id}/status", ['status' => 'siap'])->assertStatus(422);

        Sanctum::actingAs($customer);
        $this->postJson("/api/v1/orders/{$order->id}/confirm-pickup")->assertStatus(422);

        $order->update(['status' => 'diproses']);

        Sanctum::actingAs($customer);
        $this->postJson("/api/v1/orders/{$order->id}/confirm-pickup")->assertStatus(422);

        Sanctum::actingAs($warung->owner);
        $this->patchJson("/api/v1/orders/{$order->id}/status", ['status' => 'selesai'])->assertStatus(422);
        $this->patchJson("/api/v1/orders/{$order->id}/status", ['status' => 'siap'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'siap');

        Sanctum::actingAs($customer);
        $this->postJson("/api/v1/orders/{$order->id}/cancel")->assertStatus(422);
        $this->postJson("/api/v1/orders/{$order->id}/confirm-pickup")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'selesai');

        Sanctum::actingAs($admin);
        $this->patchJson("/api/v1/orders/{$order->id}/status", ['status' => 'siap'])->assertStatus(422);
    }

    public function test_payment_creation_simulation_and_double_payment_prevention(): void
    {
        Event::fake([PaymentPaid::class]);

        $customer = User::factory()->create();
        $warung = $this->createApprovedWarung(['name' => 'Warung Nusantara']);
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'warung_id' => $warung->id,
            'total' => 26000,
            'status' => 'menunggu_pembayaran',
        ]);

        Sanctum::actingAs($customer);

        $pay1 = $this->postJson("/api/v1/orders/{$order->id}/pay");
        $pay1->assertStatus(201)
            ->assertJsonPath('data.amount', 26000)
            ->assertJsonPath('data.status', 'pending');

        $code = $pay1->json('data.code');
        $this->assertSame(40, strlen($code));
        $this->assertStringEndsWith("/simulasi-bayar/{$code}", $pay1->json('data.qr_payload'));

        $pay2 = $this->postJson("/api/v1/orders/{$order->id}/pay");
        $pay2->assertStatus(200)
            ->assertJsonPath('data.code', $code);
        $this->assertSame(1, Payment::where('order_id', $order->id)->where('status', 'pending')->count());

        $this->getJson("/api/v1/orders/{$order->id}/payment")
            ->assertStatus(200)
            ->assertJsonPath('data.code', $code)
            ->assertJsonPath('data.status', 'pending');

        $this->getJson("/api/v1/payments/simulate/{$code}")
            ->assertStatus(200)
            ->assertJsonPath('data.warung_name', 'Warung Nusantara')
            ->assertJsonPath('data.amount', 26000)
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.expired', false);

        $this->postJson("/api/v1/payments/simulate/{$code}/pay")
            ->assertStatus(200)
            ->assertJsonPath('data.payment.status', 'paid')
            ->assertJsonPath('data.order_status', 'diproses');

        Event::assertDispatched(PaymentPaid::class, fn (PaymentPaid $event) => $event->payment->code === $code);

        $this->postJson("/api/v1/payments/simulate/{$code}/pay")
            ->assertStatus(422);
    }

    public function test_payment_after_expired_is_rejected_and_command_expires_unpaid_orders(): void
    {
        $customer = User::factory()->create();
        $warung = $this->createApprovedWarung();
        $order = Order::factory()->create([
            'user_id' => $customer->id,
            'warung_id' => $warung->id,
            'total' => 20000,
            'status' => 'menunggu_pembayaran',
        ]);

        $payment = Payment::factory()->create([
            'order_id' => $order->id,
            'amount' => 20000,
            'status' => 'pending',
            'expires_at' => now()->subMinutes(2),
        ]);

        $this->postJson("/api/v1/payments/simulate/{$payment->code}/pay")
            ->assertStatus(422);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'expired',
        ]);

        $order2 = Order::factory()->create([
            'user_id' => $customer->id,
            'warung_id' => $warung->id,
            'total' => 25000,
            'status' => 'menunggu_pembayaran',
        ]);
        $payment2 = Payment::factory()->create([
            'order_id' => $order2->id,
            'amount' => 25000,
            'status' => 'pending',
            'expires_at' => now()->subMinute(),
        ]);

        $this->artisan('payments:expire')->assertExitCode(0);

        $this->assertDatabaseHas('payments', [
            'id' => $payment2->id,
            'status' => 'expired',
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => $order2->id,
            'status' => 'dibatalkan',
        ]);
    }

    public function test_simulator_pay_is_blocked_when_disabled(): void
    {
        config(['payment.simulator_enabled' => false]);

        $payment = Payment::factory()->create([
            'status' => 'pending',
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->postJson("/api/v1/payments/simulate/{$payment->code}/pay")
            ->assertStatus(403);
    }

    public function test_orders_index_filters_by_owner_and_status(): void
    {
        $customer = User::factory()->create();
        $other = User::factory()->create();
        $warung = $this->createApprovedWarung();

        Order::factory()->create([
            'user_id' => $customer->id,
            'warung_id' => $warung->id,
            'status' => 'menunggu_pembayaran',
        ]);
        Order::factory()->create([
            'user_id' => $customer->id,
            'warung_id' => $warung->id,
            'status' => 'diproses',
        ]);
        Order::factory()->create([
            'user_id' => $other->id,
            'warung_id' => $warung->id,
            'status' => 'diproses',
        ]);

        Sanctum::actingAs($customer);

        $this->getJson('/api/v1/orders')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/v1/orders?status=diproses')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.status', 'diproses');
    }
}
