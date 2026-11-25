<?php

namespace Database\Factories;

use App\Models\Canteen;
use App\Models\User;
use App\Models\Warung;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class WarungFactory extends Factory
{
    protected $model = Warung::class;

    public function definition(): array
    {
        $name = 'Warung '.fake()->unique()->company();

        return [
            'owner_id' => User::factory()->warungOwner(),
            'canteen_id' => Canteen::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 999),
            'description' => fake()->sentence(),
            'location' => 'Kantin Utama',
            'opening_hours' => '08:00 - 17:00',
            'logo_path' => null,
            'estimated_minutes' => 10,
            'rating_avg' => 4.80,
            'review_count' => 0,
            'status' => 'approved',
            'rejection_reason' => null,
            'is_open' => true,
            'approved_at' => now(),
            'approved_by' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'is_open' => false,
            'approved_at' => null,
            'approved_by' => null,
        ]);
    }
}
