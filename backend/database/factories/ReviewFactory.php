<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\Review;
use App\Models\User;
use App\Models\Warung;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReviewFactory extends Factory
{
    protected $model = Review::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'warung_id' => Warung::factory(),
            'order_id' => Order::factory(),
            'rating' => fake()->numberBetween(4, 5),
            'comment' => fake()->sentence(),
        ];
    }
}
