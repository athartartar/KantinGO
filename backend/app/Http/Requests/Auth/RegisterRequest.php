<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'phone' => [
                Rule::requiredIf(fn () => $this->input('role') === 'partner'),
                'nullable',
                'string',
                'min:9',
                'max:20',
            ],
            'password' => ['required', 'string', 'confirmed', $passwordRule],
            'role' => ['required', 'string', Rule::in(['customer', 'partner'])],
            'warung_name' => [
                Rule::requiredIf(fn () => $this->input('role') === 'partner'),
                'nullable',
                'string',
                'max:120',
            ],
            'canteen_id' => [
                Rule::requiredIf(fn () => $this->input('role') === 'partner'),
                'nullable',
                'integer',
                'exists:canteens,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'phone.required' => 'Nomor telepon wajib diisi untuk pendaftaran mitra.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.min' => 'Kata sandi minimal 10 karakter.',
            'role.required' => 'Peran akun wajib dipilih.',
            'role.in' => 'Peran hanya boleh customer atau partner.',
            'warung_name.required' => 'Nama warung wajib diisi untuk pendaftaran mitra.',
            'canteen_id.required' => 'Lokasi kantin wajib dipilih untuk pendaftaran mitra.',
            'canteen_id.exists' => 'Kantin yang dipilih tidak ditemukan.',
        ];
    }
}
