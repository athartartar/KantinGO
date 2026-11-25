<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WarungSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'location' => $this->location,
            'opening_hours' => $this->opening_hours,
            'logo_path' => $this->logo_path,
            'estimated_minutes' => $this->estimated_minutes,
            'rating_avg' => $this->rating_avg,
            'review_count' => $this->review_count,
            'is_open' => $this->is_open,
            'canteen' => $this->whenLoaded('canteen', fn () => new CanteenResource($this->canteen)),
        ];
    }
}
