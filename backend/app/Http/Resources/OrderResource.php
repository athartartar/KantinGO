<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_code' => $this->order_code,
            'user_id' => $this->user_id,
            'warung_id' => $this->warung_id,
            'warung' => $this->whenLoaded('warung', fn () => [
                'id' => $this->warung->id,
                'name' => $this->warung->name,
                'slug' => $this->warung->slug,
                'location' => $this->warung->location,
                'opening_hours' => $this->warung->opening_hours,
            ]),
            'pickup_time' => $this->pickup_time,
            'subtotal' => $this->subtotal,
            'discount' => $this->discount,
            'service_fee' => $this->service_fee,
            'total' => $this->total,
            'status' => $this->status,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
