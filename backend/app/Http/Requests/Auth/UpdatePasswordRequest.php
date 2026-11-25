<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $passwordRule = Password::min(10)->mixedCase()->numbers();
        if (app()->isProduction()) {
            $passwordRule = $passwordRule->uncompromised();
        }

        return [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', $passwordRule],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
            'password.min' => 'Kata sandi baru minimal 10 karakter.',
        ];
    }
}
