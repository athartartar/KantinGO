<?php

namespace Tests\Feature;

use App\Events\OrderCompleted;
use App\Models\Canteen;
use App\Models\Category;
use App\Models\Menu;
use App\Models\Notification;
use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use App\Models\Voucher;
use App\Models\Warung;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EngagementTest extends TestCase
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
            'rating_avg' => 0,
            'review_count' => 0,
        ]);
    }

    public function test_voucher_list_redeem_quota_race_and_claim_with_points(): void
    {
        $userA = User::factory()->create(['points' => 250]);
        $userB = User::factory()->create(['points' => 50]);

        $limitedVoucher = Voucher::factory()->create([
            'code' => 'LIMITED1',
            'quota' => 1,
            'used_count' => 0,
            'points_cost' => 100,
            'is_active' => true,
        ]);

        $expiredVoucher = Voucher::factory()->create([
            'code' => 'EXPIRED1',
            'valid_until' => now()->subDay(),
            'is_active' => true,
        ]);

        $claimVoucher = Voucher::factory()->create([
            'code' => 'CLAIM100',
            'quota' => 10,
            'used_count' => 0,
            'points_cost' => 100,
            'is_active' => true,
        ]);

        Sanctum::actingAs($userA);

        $this->getJson('/api/v1/vouchers')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');

        $this->postJson('/api/v1/vouchers/redeem', ['code' => $expiredVoucher->code])
            ->assertStatus(422);

        $this->postJson('/api/v1/vouchers/redeem', ['code' => $limitedVoucher->code])
            ->assertStatus(201);

        $this->postJson('/api/v1/vouchers/redeem', ['code' => $limitedVoucher->code])
            ->assertStatus(422);

        Sanctum::actingAs($userB);
        $this->postJson('/api/v1/vouchers/redeem', ['code' => $limitedVoucher->code])
            ->assertStatus(422);

        $this->postJson("/api/v1/vouchers/{$claimVoucher->id}/claim")
            ->assertStatus(422);

        Sanctum::actingAs($userA);
        $this->postJson("/api/v1/vouchers/{$claimVoucher->id}/claim")
            ->assertStatus(201)
            ->assertJsonPath('data.points_remaining', 150);

        $this->assertDatabaseHas('point_transactions', [
            'user_id' => $userA->id,
            'type' => 'redeem',
            'amount' => -100,
            'balance_after' => 150,
        ]);

        $this->getJson('/api/v1/me/vouchers')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_points_awarded_once_on_order_completed_and_notifications_created(): void
    {
        $customer = User::factory()->create(['points' => 0]);
        $partner = User::factory()->warungOwner()->create();
        $warung = $this->createApprovedWarung($partner);
        $category = Category::factory()->create();
        $menu = Menu::factory()->create([
            'warung_id' => $warung->id,
            'category_id' => $category->id,
            'price' => 24000,
            'is_available' => true,
        ]);

        Sanctum::actingAs($customer);
        $orderRes = $this->postJson('/api/v1/orders', [
            'items' => [['menu_id' => $menu->id, 'qty' => 1]],
            'pickup_time' => now()->addDay()->setTime(12, 0)->format('Y-m-d H:i:s'),
        ])->assertStatus(201);

        $orderId = $orderRes->json('data.id');
        $payRes = $this->postJson("/api/v1/orders/{$orderId}/pay")->assertStatus(201);
        $code = $payRes->json('data.code');

        $this->postJson("/api/v1/payments/simulate/{$code}/pay")->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $customer->id,
            'type' => 'payment_paid',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $partner->id,
            'type' => 'new_paid_order',
        ]);

        Sanctum::actingAs($partner);
        $this->patchJson("/api/v1/orders/{$orderId}/status", ['status' => 'siap'])->assertStatus(200);

        Sanctum::actingAs($customer);
        $this->postJson("/api/v1/orders/{$orderId}/confirm-pickup")->assertStatus(200);

        $customer->refresh();
        $this->assertSame(25, $customer->points);

        $order = Order::findOrFail($orderId);
        OrderCompleted::dispatch($order);

        $customer->refresh();
        $this->assertSame(25, $customer->points);
        $this->assertDatabaseCount('point_transactions', 1);

        $notifRes = $this->getJson('/api/v1/notifications')
            ->assertStatus(200)
            ->assertJsonPath('meta.unread_count', 3);

        $firstNotifId = $notifRes->json('data.0.id');

        Sanctum::actingAs($partner);
        $this->patchJson("/api/v1/notifications/{$firstNotifId}/read")->assertStatus(403);

        Sanctum::actingAs($customer);
        $this->patchJson("/api/v1/notifications/{$firstNotifId}/read")
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->postJson('/api/v1/notifications/read-all')
            ->assertStatus(200)
            ->assertJsonPath('data.updated_count', 2);

        $this->assertSame(0, Notification::where('user_id', $customer->id)->whereNull('read_at')->count());
    }

    public function test_review_requires_completed_order_strips_html_and_enforces_policy(): void
    {
        $customerA = User::factory()->create();
        $customerB = User::factory()->create();
        $warung = $this->createApprovedWarung();

        $processingOrder = Order::factory()->create([
            'user_id' => $customerA->id,
            'warung_id' => $warung->id,
            'status' => 'diproses',
        ]);

        $completedOrder = Order::factory()->create([
            'user_id' => $customerA->id,
            'warung_id' => $warung->id,
            'status' => 'selesai',
        ]);

        Sanctum::actingAs($customerA);
        $this->postJson("/api/v1/orders/{$processingOrder->id}/review", [
            'rating' => 5,
            'comment' => 'Bagus',
        ])->assertStatus(422);

        Sanctum::actingAs($customerB);
        $this->postJson("/api/v1/orders/{$completedOrder->id}/review", [
            'rating' => 5,
            'comment' => 'IDOR',
        ])->assertStatus(403);

        Sanctum::actingAs($customerA);
        $reviewRes = $this->postJson("/api/v1/orders/{$completedOrder->id}/review", [
            'rating' => 5,
            'comment' => '<b>Mantap</b> <script>alert(1)</script>sekali!',
        ]);
        $reviewRes->assertStatus(201)
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.comment', 'Mantap alert(1)sekali!');

        $this->postJson("/api/v1/orders/{$completedOrder->id}/review", [
            'rating' => 4,
            'comment' => 'Duplikat',
        ])->assertStatus(422);

        $warung->refresh();
        $this->assertSame(1, $warung->review_count);
        $this->assertSame(5.0, $warung->rating_avg);

        $this->getJson('/api/v1/me/reviews')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');

        $reviewId = $reviewRes->json('data.id');

        Sanctum::actingAs($customerB);
        $this->deleteJson("/api/v1/reviews/{$reviewId}")->assertStatus(403);

        Sanctum::actingAs($customerA);
        $this->deleteJson("/api/v1/reviews/{$reviewId}")->assertStatus(200);

        $this->assertNull(Review::find($reviewId));
        $warung->refresh();
        $this->assertSame(0, $warung->review_count);
    }
}
