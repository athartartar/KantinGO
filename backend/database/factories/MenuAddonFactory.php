<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\MenuAddon;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuAddonFactory extends Factory
{
    protected $model = MenuAddon::class;

    public function definition(): array
    {
        return [
            'menu_id' => Menu::factory(),
            'group_key' => 'addon-'.fake()->slug(2),
            'group_title' => 'Pilihan Tambahan',
            'selection_type' => 'single',
            'is_required' => false,
            'option_name' => fake()->word(),
            'additional_price' => fake()->randomElement([0, 2000, 3000, 5000]),
            'is_available' => true,
            'sort_order' => 0,
        ];
    }
}
