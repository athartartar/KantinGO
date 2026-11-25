<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoucherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'type' => $this->type,
            'value' => $this->value,
            'min_spend' => $this->min_spend,
            'points_cost' => $this->points_cost,
            'max_discount' => $this->max_discount,
            'quota' => $this->quota,
            'used_count' => $this->used_count,
            'valid_from' => $this->valid_from?->toIso8601String(),
            'valid_until' => $this->valid_until?->toIso8601String(),
        ];
    }
}
