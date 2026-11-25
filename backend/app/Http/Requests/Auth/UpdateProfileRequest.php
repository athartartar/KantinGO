<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'phone' => ['sometimes', 'nullable', 'string', 'min:9', 'max:20'],
            'avatar' => ['sometimes', 'nullable', 'file', 'image', 'mimetypes:image/jpeg,image/png,image/webp', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama tidak boleh kosong.',
            'avatar.file' => 'Avatar harus berupa berkas gambar.',
            'avatar.image' => 'Avatar harus berupa gambar yang valid.',
            'avatar.mimetypes' => 'Format avatar harus JPG, PNG, atau WebP.',
            'avatar.max' => 'Ukuran avatar maksimal 2MB.',
        ];
    }
}
