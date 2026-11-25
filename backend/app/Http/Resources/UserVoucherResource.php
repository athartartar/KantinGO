<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserVoucherResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'claimed_at' => $this->claimed_at?->toIso8601String(),
            'used_at' => $this->used_at?->toIso8601String(),
            'voucher' => new VoucherResource($this->whenLoaded('voucher')),
        ];
    }
}
