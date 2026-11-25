<?php

namespace App\Http\Requests\Partner;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string', 'max:1000'],
            'price' => ['required', 'integer', 'min:1000'],
            'is_available' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Kategori menu wajib dipilih.',
            'category_id.exists' => 'Kategori menu tidak ditemukan.',
            'name.required' => 'Nama menu wajib diisi.',
            'name.max' => 'Nama menu maksimal 150 karakter.',
            'price.required' => 'Harga menu wajib diisi.',
            'price.integer' => 'Harga menu harus berupa angka bulat rupiah.',
            'price.min' => 'Harga menu minimal Rp 1.000.',
            'image.file' => 'Gambar harus berupa file yang valid.',
            'image.mimes' => 'Format gambar harus JPEG, PNG, atau WebP.',
            'image.max' => 'Ukuran gambar maksimal 2MB.',
        ];
    }
}
