<?php

namespace App\Http\Requests\Partner;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['sometimes', 'integer', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['sometimes', 'integer', 'min:1000'],
            'is_available' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.exists' => 'Kategori menu tidak ditemukan.',
            'name.max' => 'Nama menu maksimal 150 karakter.',
            'price.integer' => 'Harga menu harus berupa angka bulat rupiah.',
            'price.min' => 'Harga menu minimal Rp 1.000.',
            'image.file' => 'Gambar harus berupa file yang valid.',
            'image.mimes' => 'Format gambar harus JPEG, PNG, atau WebP.',
            'image.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}
