<?php

namespace Database\Factories;

use App\Models\Canteen;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CanteenFactory extends Factory
{
    protected $model = Canteen::class;

    public function definition(): array
    {
        $name = 'Kantin '.fake()->unique()->words(2, true);

        return [
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 999),
            'location' => 'Gedung '.fake()->randomLetter().', Lantai '.fake()->numberBetween(1, 3),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
