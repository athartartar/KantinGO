<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuAddonGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'group_key' => $this->first()->group_key,
            'group_title' => $this->first()->group_title,
            'selection_type' => $this->first()->selection_type,
            'is_required' => (bool) $this->first()->is_required,
            'options' => $this->map(fn ($addon) => [
                'id' => $addon->id,
                'name' => $addon->option_name,
                'additional_price' => $addon->additional_price,
                'is_available' => $addon->is_available,
            ])->values(),
        ];
    }
}
