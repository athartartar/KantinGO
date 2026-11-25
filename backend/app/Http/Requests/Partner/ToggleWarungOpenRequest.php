<?php

namespace App\Http\Requests\Partner;

use Illuminate\Foundation\Http\FormRequest;

class ToggleWarungOpenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_open' => ['required', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'is_open.required' => 'Status buka warung wajib diisi.',
            'is_open.boolean' => 'Status buka warung harus berupa boolean.',
        ];
    }
}
