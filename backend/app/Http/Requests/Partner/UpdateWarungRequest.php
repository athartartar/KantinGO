<?php

namespace App\Http\Requests\Partner;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWarungRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'location' => ['nullable', 'string', 'max:150'],
            'opening_hours' => ['nullable', 'string', 'max:60'],
            'estimated_minutes' => ['nullable', 'integer', 'min:1', 'max:120'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama warung wajib diisi.',
            'name.max' => 'Nama warung maksimal 120 karakter.',
            'estimated_minutes.integer' => 'Estimasi waktu harus berupa angka.',
            'estimated_minutes.min' => 'Estimasi waktu minimal 1 menit.',
            'estimated_minutes.max' => 'Estimasi waktu maksimal 120 menit.',
        ];
    }
}
