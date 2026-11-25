<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('items') && $this->has('menu_id')) {
            $this->merge([
                'items' => [
                    [
                        'menu_id' => $this->input('menu_id'),
                        'qty' => $this->input('qty'),
                        'addon_id' => $this->input('addon_id'),
                    ],
                ],
            ]);
        }

        if (is_array($this->input('items'))) {
            $normalized = [];
            foreach ($this->input('items') as $item) {
                if (! is_array($item)) {
                    $normalized[] = $item;
                    continue;
                }

                $addonIds = $item['addon_id'] ?? null;
                if ($addonIds !== null && ! is_array($addonIds)) {
                    $addonIds = [$addonIds];
                }

                $normalized[] = [
                    'menu_id' => $item['menu_id'] ?? null,
                    'qty' => $item['qty'] ?? null,
                    'addon_id' => $addonIds,
                ];
            }

            $this->merge(['items' => $normalized]);
        }
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'exists:menus,id'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:20'],
            'items.*.addon_id' => ['nullable', 'array'],
            'items.*.addon_id.*' => ['integer', 'exists:menu_addons,id'],
            'pickup_time' => ['required', 'string', 'max:50'],
            'voucher_code' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'Daftar menu pesanan wajib diisi.',
            'items.array' => 'Format daftar menu tidak valid.',
            'items.min' => 'Pesanan harus memiliki minimal 1 item.',
            'items.*.menu_id.required' => 'Menu wajib dipilih.',
            'items.*.menu_id.integer' => 'ID menu harus berupa angka.',
            'items.*.menu_id.exists' => 'Menu tidak ditemukan.',
            'items.*.qty.required' => 'Jumlah pesanan wajib diisi.',
            'items.*.qty.integer' => 'Jumlah pesanan harus berupa angka.',
            'items.*.qty.min' => 'Jumlah pesanan minimal 1.',
            'items.*.qty.max' => 'Jumlah pesanan maksimal 20 per item.',
            'items.*.addon_id.array' => 'Format addon tidak valid.',
            'items.*.addon_id.*.integer' => 'ID addon harus berupa angka.',
            'items.*.addon_id.*.exists' => 'Addon tidak ditemukan.',
            'pickup_time.required' => 'Waktu pengambilan wajib diisi.',
            'pickup_time.string' => 'Waktu pengambilan tidak valid.',
            'pickup_time.max' => 'Waktu pengambilan maksimal 50 karakter.',
            'voucher_code.string' => 'Kode voucher tidak valid.',
            'voucher_code.max' => 'Kode voucher maksimal 50 karakter.',
        ];
    }
}
