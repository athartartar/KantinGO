<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $addonGroups = collect();
        if ($this->relationLoaded('addons') && $this->addons->isNotEmpty()) {
            $addonGroups = $this->addons
                ->groupBy('group_key')
                ->map(fn ($group) => new MenuAddonGroupResource($group))
                ->values();
        }

        return [
            'id' => $this->id,
            'warung_id' => $this->warung_id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'image_path' => $this->image_path,
            'is_available' => $this->is_available,
            'rating_avg' => $this->rating_avg,
            'sold_count' => $this->sold_count,
            'category' => $this->whenLoaded('category', fn () => new CategoryResource($this->category)),
            'warung' => $this->whenLoaded('warung', fn () => new WarungSummaryResource($this->warung)),
            'addon_groups' => $addonGroups,
        ];
    }
}
