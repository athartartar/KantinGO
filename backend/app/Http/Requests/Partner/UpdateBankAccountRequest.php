<?php

namespace App\Http\Requests\Partner;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'bank_name' => ['required', 'string', 'max:100'],
            'account_holder' => ['required', 'string', 'max:150'],
            'account_number' => ['required', 'string', 'digits_between:6,30'],
        ];
    }

    public function messages(): array
    {
        return [
            'bank_name.required' => 'Nama bank wajib diisi.',
            'bank_name.max' => 'Nama bank maksimal 100 karakter.',
            'account_holder.required' => 'Nama pemilik rekening wajib diisi.',
            'account_holder.max' => 'Nama pemilik rekening maksimal 150 karakter.',
            'account_number.required' => 'Nomor rekening wajib diisi.',
            'account_number.digits_between' => 'Nomor rekening harus terdiri dari 6 hingga 30 digit angka.',
        ];
    }
}
