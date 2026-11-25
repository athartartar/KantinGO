<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\StoreMenuAddonRequest;
use App\Http\Requests\Partner\UpdateMenuAddonRequest;
use App\Models\Menu;
use App\Models\MenuAddon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;

class PartnerMenuAddonController extends Controller
{
    public function index(Menu $menu): JsonResponse
    {
        Gate::authorize('viewAny', [MenuAddon::class, $menu]);

        $addons = $menu->addons()->orderBy('sort_order')->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar addon menu berhasil diambil.',
            'data' => $addons,
        ]);
    }

    public function store(StoreMenuAddonRequest $request, Menu $menu): JsonResponse
    {
        Gate::authorize('create', [MenuAddon::class, $menu]);

        $validated = $request->validated();

        $addon = $menu->addons()->create([
            'group_key' => $validated['group_key'],
            'group_title' => $validated['group_title'],
            'selection_type' => $validated['selection_type'],
            'is_required' => $validated['is_required'] ?? false,
            'option_name' => $validated['option_name'],
            'additional_price' => (int) $validated['additional_price'],
            'is_available' => $validated['is_available'] ?? true,
            'sort_order' => (int) ($validated['sort_order'] ?? 0),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Addon menu berhasil ditambahkan.',
            'data' => $addon,
        ], 201);
    }

    public function update(UpdateMenuAddonRequest $request, Menu $menu, MenuAddon $addon): JsonResponse
    {
        Gate::authorize('update', [$addon, $menu]);

        $addon->fill($request->validated());
        $addon->save();

        return response()->json([
            'success' => true,
            'message' => 'Addon menu berhasil diperbarui.',
            'data' => $addon,
        ]);
    }

    public function destroy(Menu $menu, MenuAddon $addon): JsonResponse
    {
        Gate::authorize('delete', [$addon, $menu]);

        $addon->delete();

        return response()->json([
            'success' => true,
            'message' => 'Addon menu berhasil dihapus.',
        ]);
    }
}
