<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 999),
            'icon' => null,
            'sort_order' => fake()->numberBetween(1, 10),
        ];
    }
}
