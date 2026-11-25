<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'menu_id' => $this->menu_id,
            'menu_name' => $this->menu_name,
            'menu_image' => $this->menu_image,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'addons_snapshot' => $this->addons_snapshot ?? [],
            'notes' => $this->notes,
            'subtotal' => $this->subtotal,
        ];
    }
}
