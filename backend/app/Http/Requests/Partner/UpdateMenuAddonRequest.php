<?php

namespace App\Http\Requests\Partner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMenuAddonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_key' => ['sometimes', 'string', 'max:50'],
            'group_title' => ['sometimes', 'string', 'max:100'],
            'selection_type' => ['sometimes', 'string', Rule::in(['single', 'multiple'])],
            'is_required' => ['sometimes', 'boolean'],
            'option_name' => ['sometimes', 'string', 'max:100'],
            'additional_price' => ['sometimes', 'integer', 'min:0'],
            'is_available' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'selection_type.in' => 'Tipe pilihan harus single atau multiple.',
            'additional_price.integer' => 'Harga tambahan harus berupa angka bulat.',
            'additional_price.min' => 'Harga tambahan minimal 0.',
        ];
    }
}
