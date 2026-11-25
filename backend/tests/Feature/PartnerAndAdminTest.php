<?php

namespace Tests\Feature;

use App\Models\Canteen;
use App\Models\Category;
use App\Models\Menu;
use App\Models\MenuAddon;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Warung;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PartnerAndAdminTest extends TestCase
{
    use RefreshDatabase;

    private function createWarungForOwner(User $owner, string $status = 'approved', bool $isOpen = true): Warung
    {
        $canteen = Canteen::factory()->create();

        return Warung::factory()->create([
            'owner_id' => $owner->id,
            'canteen_id' => $canteen->id,
            'status' => $status,
            'is_open' => $isOpen,
        ]);
    }

    public function test_pending_partner_is_blocked_from_all_partner_endpoints(): void
    {
        $pendingOwner = User::factory()->warungOwner()->create();
        $this->createWarungForOwner($pendingOwner, 'pending', false);

        Sanctum::actingAs($pendingOwner);

        $this->getJson('/api/v1/partner/warung')->assertStatus(403);
        $this->putJson('/api/v1/partner/warung', ['name' => 'Warung Baru'])->assertStatus(403);
        $this->patchJson('/api/v1/partner/warung/open', ['is_open' => true])->assertStatus(403);
        $this->getJson('/api/v1/partner/menus')->assertStatus(403);
        $this->getJson('/api/v1/partner/orders')->assertStatus(403);
        $this->getJson('/api/v1/partner/stats')->assertStatus(403);
    }

    public function test_partner_idor_protection_across_warungs_menus_addons_and_orders(): void
    {
        $ownerA = User::factory()->warungOwner()->create();
        $ownerB = User::factory()->warungOwner()->create();
        $warungA = $this->createWarungForOwner($ownerA);
        $warungB = $this->createWarungForOwner($ownerB);

        $category = Category::factory()->create();
        $menuB = Menu::factory()->create([
            'warung_id' => $warungB->id,
            'category_id' => $category->id,
            'price' => 15000,
        ]);
        $addonB = MenuAddon::factory()->create(['menu_id' => $menuB->id]);

        $orderB = Order::factory()->create([
            'warung_id' => $warungB->id,
            'status' => 'diproses',
        ]);

        Sanctum::actingAs($ownerA);

        $this->getJson("/api/v1/partner/menus/{$menuB->id}")->assertStatus(403);
        $this->putJson("/api/v1/partner/menus/{$menuB->id}", ['name' => 'Hack'])->assertStatus(403);
        $this->deleteJson("/api/v1/partner/menus/{$menuB->id}")->assertStatus(403);
        $this->getJson("/api/v1/partner/menus/{$menuB->id}/addons")->assertStatus(403);
        $this->putJson("/api/v1/partner/menus/{$menuB->id}/addons/{$addonB->id}", ['option_name' => 'Hack'])->assertStatus(403);
        $this->deleteJson("/api/v1/partner/menus/{$menuB->id}/addons/{$addonB->id}")->assertStatus(403);
        $this->patchJson("/api/v1/partner/orders/{$orderB->id}/status", ['status' => 'siap'])->assertStatus(403);

        $created = $this->postJson('/api/v1/partner/menus', [
            'warung_id' => $warungB->id,
            'category_id' => $category->id,
            'name' => 'Nasi Goreng A',
            'price' => 15000,
        ]);
        $created->assertStatus(201)
            ->assertJsonPath('data.warung_id', $warungA->id);
    }

    public function test_partner_warung_menu_image_upload_addon_orders_and_stats(): void
    {
        Storage::fake('public');

        $owner = User::factory()->warungOwner()->create();
        $warung = $this->createWarungForOwner($owner);
        $category = Category::factory()->create();

        Sanctum::actingAs($owner);

        $this->putJson('/api/v1/partner/warung', [
            'name' => 'Warung Mantap',
            'opening_hours' => '08:00 - 18:00',
            'estimated_minutes' => 15,
        ])
            ->assertStatus(200)
            ->assertJsonPath('data.name', 'Warung Mantap');

        $this->patchJson('/api/v1/partner/warung/open', ['is_open' => false])
            ->assertStatus(200)
            ->assertJsonPath('data.is_open', false);

        $this->postJson('/api/v1/partner/menus', [
            'category_id' => $category->id,
            'name' => 'Murah',
            'price' => 500,
        ])->assertStatus(422);

        $menuRes = $this->post('/api/v1/partner/menus', [
            'category_id' => $category->id,
            'name' => 'Ayam Bakar',
            'price' => 22000,
            'image' => UploadedFile::fake()->image('ayam.png', 120, 120),
        ], ['Accept' => 'application/json']);

        $menuRes->assertStatus(201)
            ->assertJsonPath('data.name', 'Ayam Bakar')
            ->assertJsonPath('data.price', 22000);

        $imagePath = $menuRes->json('data.image_path');
        $this->assertNotNull($imagePath);
        Storage::disk('public')->assertExists($imagePath);

        $menuId = $menuRes->json('data.id');

        $addonRes = $this->postJson("/api/v1/partner/menus/{$menuId}/addons", [
            'group_key' => 'level_pedas',
            'group_title' => 'Level Pedas',
            'selection_type' => 'single',
            'is_required' => true,
            'option_name' => 'Pedas Sedang',
            'additional_price' => 2000,
        ]);
        $addonRes->assertStatus(201);
        $addonId = $addonRes->json('data.id');

        $this->putJson("/api/v1/partner/menus/{$menuId}/addons/{$addonId}", [
            'additional_price' => 3000,
        ])->assertStatus(200)->assertJsonPath('data.additional_price', 3000);

        $this->deleteJson("/api/v1/partner/menus/{$menuId}/addons/{$addonId}")
            ->assertStatus(200);

        $unpaidOrder = Order::factory()->create([
            'warung_id' => $warung->id,
            'status' => 'menunggu_pembayaran',
            'total' => 20000,
        ]);
        $paidOrder = Order::factory()->create([
            'warung_id' => $warung->id,
            'status' => 'diproses',
            'total' => 25000,
        ]);
        Payment::factory()->create([
            'order_id' => $paidOrder->id,
            'status' => 'paid',
            'amount' => 25000,
        ]);

        Wallet::create([
            'type' => 'partner',
            'user_id' => $owner->id,
            'pending_balance' => 25000,
            'available_balance' => 50000,
        ]);

        $this->getJson('/api/v1/partner/orders')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $paidOrder->id);

        $this->patchJson("/api/v1/partner/orders/{$paidOrder->id}/status", ['status' => 'siap'])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'siap');

        $this->getJson('/api/v1/partner/stats')
            ->assertStatus(200)
            ->assertJsonPath('data.orders_today', 1)
            ->assertJsonPath('data.revenue_today', 25000)
            ->assertJsonPath('data.available_balance', 50000);
    }

    public function test_admin_partner_applications_and_non_admin_rejection(): void
    {
        $customer = User::factory()->create();
        $ownerPending = User::factory()->warungOwner()->create();
        $warungPending = $this->createWarungForOwner($ownerPending, 'pending', false);
        $ownerReject = User::factory()->warungOwner()->create();
        $warungReject = $this->createWarungForOwner($ownerReject, 'pending', false);
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs($customer);
        $this->getJson('/api/v1/admin/partner-applications')->assertStatus(403);
        $this->postJson("/api/v1/admin/partner-applications/{$warungPending->id}/approve")->assertStatus(403);
        $this->postJson("/api/v1/admin/partner-applications/{$warungReject->id}/reject", ['reason' => 'No'])->assertStatus(403);
        $this->getJson('/api/v1/admin/wallet/summary')->assertStatus(403);

        Sanctum::actingAs($ownerPending);
        $this->postJson("/api/v1/admin/partner-applications/{$warungPending->id}/approve")->assertStatus(403);

        Sanctum::actingAs($admin);
        $this->getJson('/api/v1/admin/partner-applications?status=pending')
            ->assertStatus(200)
            ->assertJsonCount(2, 'data');

        $this->postJson("/api/v1/admin/partner-applications/{$warungPending->id}/approve")
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'approved');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $ownerPending->id,
            'type' => 'partner_application_approved',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'partner_application.approved',
            'auditable_id' => $warungPending->id,
        ]);

        $this->postJson("/api/v1/admin/partner-applications/{$warungReject->id}/reject", [
            'reason' => 'Dokumen tidak lengkap',
        ])
            ->assertStatus(200)
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('data.rejection_reason', 'Dokumen tidak lengkap');

        $this->assertDatabaseHas('notifications', [
            'user_id' => $ownerReject->id,
            'type' => 'partner_application_rejected',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $admin->id,
            'action' => 'partner_application.rejected',
            'auditable_id' => $warungReject->id,
        ]);

        Wallet::create([
            'type' => 'platform',
            'user_id' => null,
            'pending_balance' => 0,
            'available_balance' => 150000,
        ]);
        Withdrawal::create([
            'user_id' => $ownerPending->id,
            'amount' => 30000,
            'status' => 'success',
            'reference' => 'WD-ADMIN-TEST-1',
        ]);

        $this->getJson('/api/v1/admin/wallet/summary')
            ->assertStatus(200)
            ->assertJsonPath('data.platform_balance', 150000)
            ->assertJsonPath('data.total_withdrawn', 30000);
    }
}
