<?php

namespace Database\Factories;

use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $unitPrice = fake()->numberBetween(10, 25) * 1000;
        $quantity = fake()->numberBetween(1, 3);

        return [
            'order_id' => Order::factory(),
            'menu_id' => Menu::factory(),
            'menu_name' => fake()->words(3, true),
            'menu_image' => null,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'addons_snapshot' => [],
            'notes' => null,
            'subtotal' => $unitPrice * $quantity,
        ];
    }
}
