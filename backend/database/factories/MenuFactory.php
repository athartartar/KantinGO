<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Menu;
use App\Models\Warung;
use Illuminate\Database\Eloquent\Factories\Factory;

class MenuFactory extends Factory
{
    protected $model = Menu::class;

    public function definition(): array
    {
        return [
            'warung_id' => Warung::factory(),
            'category_id' => Category::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'price' => fake()->numberBetween(5, 30) * 1000,
            'image_path' => null,
            'is_available' => true,
            'rating_avg' => 4.70,
            'sold_count' => fake()->numberBetween(0, 500),
        ];
    }
}
