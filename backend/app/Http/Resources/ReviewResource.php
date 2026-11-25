<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'warung_id' => $this->warung_id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'created_at' => $this->created_at?->toIso8601String(),
            'user' => [
                'name' => $this->whenLoaded('user', fn () => $this->user->name),
                'avatar_path' => $this->whenLoaded('user', fn () => $this->user->avatar_path),
            ],
        ];
    }
}
