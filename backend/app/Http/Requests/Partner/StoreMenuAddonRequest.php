<?php

namespace App\Http\Requests\Partner;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMenuAddonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'group_key' => ['required', 'string', 'max:50'],
            'group_title' => ['required', 'string', 'max:100'],
            'selection_type' => ['required', 'string', Rule::in(['single', 'multiple'])],
            'is_required' => ['sometimes', 'boolean'],
            'option_name' => ['required', 'string', 'max:100'],
            'additional_price' => ['required', 'integer', 'min:0'],
            'is_available' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'group_key.required' => 'Kunci grup addon wajib diisi.',
            'group_title.required' => 'Judul grup addon wajib diisi.',
            'selection_type.required' => 'Tipe pilihan addon wajib diisi.',
            'selection_type.in' => 'Tipe pilihan harus single atau multiple.',
            'option_name.required' => 'Nama opsi addon wajib diisi.',
            'additional_price.required' => 'Harga tambahan addon wajib diisi.',
            'additional_price.integer' => 'Harga tambahan harus berupa angka bulat.',
            'additional_price.min' => 'Harga tambahan minimal 0.',
        ];
    }
}
