<?php

namespace App\Http\Requests\Partner;

use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PartnerOrderIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string', Rule::in([
                Order::STATUS_DIPROSES,
                Order::STATUS_SIAP,
                Order::STATUS_SELESAI,
                Order::STATUS_DIBATALKAN,
            ])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Filter status pesanan mitra tidak valid.',
        ];
    }
}
