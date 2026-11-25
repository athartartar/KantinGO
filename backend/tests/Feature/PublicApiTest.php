<?php

namespace Tests\Feature;

use App\Models\Canteen;
use App\Models\Category;
use App\Models\Menu;
use App\Models\MenuAddon;
use App\Models\Review;
use App\Models\User;
use App\Models\Warung;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    private function makeApprovedWarung(array $attrs = []): Warung
    {
        $canteen = Canteen::factory()->create();

        return Warung::factory()->create(array_merge([
            'canteen_id' => $canteen->id,
            'status' => 'approved',
            'is_open' => true,
        ], $attrs));
    }

    public function test_canteens_index_returns_active_canteens(): void
    {
        Canteen::factory()->count(3)->create(['is_active' => true]);
        Canteen::factory()->create(['is_active' => false]);

        $this->getJson('/api/v1/canteens')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data');
    }

    public function test_canteen_show_returns_404_for_inactive(): void
    {
        $inactive = Canteen::factory()->create(['is_active' => false]);

        $this->getJson("/api/v1/canteens/{$inactive->id}")
            ->assertStatus(404);
    }

    public function test_categories_index(): void
    {
        Category::factory()->count(4)->create();

        $this->getJson('/api/v1/categories')
            ->assertStatus(200)
            ->assertJsonCount(4, 'data');
    }

    public function test_warungs_index_only_returns_approved(): void
    {
        $this->makeApprovedWarung();
        $this->makeApprovedWarung();
        Warung::factory()->create(['status' => 'pending', 'owner_id' => User::factory()->warungOwner()->create()->id]);
        Warung::factory()->create(['status' => 'rejected', 'owner_id' => User::factory()->warungOwner()->create()->id]);

        $this->getJson('/api/v1/warungs')
            ->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_warungs_index_per_page_is_capped_at_50(): void
    {
        $owners = User::factory()->warungOwner()->count(5)->create();
        foreach ($owners as $owner) {
            $this->makeApprovedWarung(['owner_id' => $owner->id]);
        }

        $this->getJson('/api/v1/warungs?per_page=999')
            ->assertStatus(200)
            ->assertJsonPath('meta.per_page', 50);
    }

    public function test_warung_show_returns_menus_and_hides_internal_fields(): void
    {
        $warung = $this->makeApprovedWarung();
        $cat = Category::factory()->create();
        Menu::factory()->count(3)->create(['warung_id' => $warung->id, 'is_available' => true, 'category_id' => $cat->id]);
        Menu::factory()->create(['warung_id' => $warung->id, 'is_available' => false]);

        $response = $this->getJson("/api/v1/warungs/{$warung->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(3, 'data.menus');

        $data = $response->json('data');
        $this->assertArrayNotHasKey('status', $data);
        $this->assertArrayNotHasKey('rejection_reason', $data);
        $this->assertArrayNotHasKey('owner_id', $data);
        $this->assertArrayNotHasKey('approved_by', $data);
    }

    public function test_warung_show_returns_404_for_pending(): void
    {
        $warung = Warung::factory()->pending()->create();

        $this->getJson("/api/v1/warungs/{$warung->id}")
            ->assertStatus(404);
    }

    public function test_warung_menus_endpoint_paginates_and_excludes_unavailable(): void
    {
        $warung = $this->makeApprovedWarung();
        Menu::factory()->count(5)->create(['warung_id' => $warung->id, 'is_available' => true]);
        Menu::factory()->create(['warung_id' => $warung->id, 'is_available' => false]);

        $this->getJson("/api/v1/warungs/{$warung->id}/menus?per_page=3")
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 5)
            ->assertJsonPath('meta.per_page', 3)
            ->assertJsonCount(3, 'data');
    }

    public function test_warung_reviews_paginated(): void
    {
        $warung = $this->makeApprovedWarung();
        $user = User::factory()->create();

        Review::factory()->count(5)->create([
            'warung_id' => $warung->id,
            'user_id' => $user->id,
        ]);

        $this->getJson("/api/v1/warungs/{$warung->id}/reviews?per_page=3")
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 5)
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data' => [['id', 'rating', 'comment', 'user']]]);
    }

    public function test_menu_show_includes_addon_groups(): void
    {
        $warung = $this->makeApprovedWarung();
        $menu = Menu::factory()->create(['warung_id' => $warung->id, 'is_available' => true]);

        MenuAddon::factory()->count(2)->create(['menu_id' => $menu->id, 'group_key' => 'grp-1', 'group_title' => 'Level Pedas', 'selection_type' => 'single', 'is_required' => true]);
        MenuAddon::factory()->count(3)->create(['menu_id' => $menu->id, 'group_key' => 'grp-2', 'group_title' => 'Topping', 'selection_type' => 'multiple', 'is_required' => false]);

        $response = $this->getJson("/api/v1/menus/{$menu->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data.addon_groups');

        $group = collect($response->json('data.addon_groups'))->firstWhere('group_key', 'grp-1');
        $this->assertEquals('Level Pedas', $group['group_title']);
        $this->assertCount(2, $group['options']);
    }

    public function test_menu_show_returns_404_for_unavailable_or_non_approved_warung(): void
    {
        $warung = $this->makeApprovedWarung();
        $unavailableMenu = Menu::factory()->create(['warung_id' => $warung->id, 'is_available' => false]);

        $this->getJson("/api/v1/menus/{$unavailableMenu->id}")->assertStatus(404);

        $pendingWarung = Warung::factory()->pending()->create();
        $menuOfPending = Menu::factory()->create(['warung_id' => $pendingWarung->id, 'is_available' => true]);

        $this->getJson("/api/v1/menus/{$menuOfPending->id}")->assertStatus(404);
    }

    public function test_menus_popular_returns_sorted_by_sold_count(): void
    {
        $warung = $this->makeApprovedWarung();
        Menu::factory()->create(['warung_id' => $warung->id, 'is_available' => true, 'sold_count' => 10, 'name' => 'Jarang']);
        Menu::factory()->create(['warung_id' => $warung->id, 'is_available' => true, 'sold_count' => 999, 'name' => 'Paling Laris']);
        Menu::factory()->create(['warung_id' => $warung->id, 'is_available' => true, 'sold_count' => 500, 'name' => 'Lumayan']);

        $response = $this->getJson('/api/v1/menus/popular');
        $names = collect($response->json('data'))->pluck('name');

        $this->assertEquals('Paling Laris', $names->first());
        $this->assertEquals('Jarang', $names->last());
    }

    public function test_search_sanitizes_input_and_returns_warungs_and_menus(): void
    {
        $warung = $this->makeApprovedWarung(['name' => 'Warung Nusantara Spesial']);
        Menu::factory()->create(['warung_id' => $warung->id, 'is_available' => true, 'name' => 'Ayam Nusantara Bakar']);

        $response = $this->getJson('/api/v1/search?q=Nusantara');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['warungs', 'menus']]);

        $this->assertCount(1, $response->json('data.warungs'));
        $this->assertCount(1, $response->json('data.menus'));
    }

    public function test_search_returns_empty_for_query_less_than_2_chars(): void
    {
        $this->getJson('/api/v1/search?q=a')
            ->assertStatus(200)
            ->assertJsonCount(0, 'data.warungs')
            ->assertJsonCount(0, 'data.menus');
    }

    public function test_search_strips_dangerous_characters(): void
    {
        $warung = $this->makeApprovedWarung(['name' => 'Warung Spesial']);

        $this->getJson('/api/v1/search?q=Spesial%27%20OR%201%3D1--')
            ->assertStatus(200);
    }

    public function test_warungs_sort_by_whitelist_ignores_invalid_column(): void
    {
        $this->makeApprovedWarung();

        $this->getJson('/api/v1/warungs?sort_by=password&sort_dir=asc')
            ->assertStatus(200);
    }

    public function test_no_n_plus_one_on_warung_index(): void
    {
        $canteen = Canteen::factory()->create();
        Warung::factory()->count(5)->create(['canteen_id' => $canteen->id, 'status' => 'approved']);

        $queryCount = 0;
        \Illuminate\Support\Facades\DB::listen(function () use (&$queryCount) {
            $queryCount++;
        });

        $this->getJson('/api/v1/warungs');

        $this->assertLessThanOrEqual(3, $queryCount, "N+1 terdeteksi: {$queryCount} query dijalankan.");
    }
}
