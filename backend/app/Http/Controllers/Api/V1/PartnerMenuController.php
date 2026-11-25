<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Partner\StoreMenuRequest;
use App\Http\Requests\Partner\UpdateMenuRequest;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use App\Models\Warung;
use App\Services\Media\ImageUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class PartnerMenuController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Menu::class);

        $warung = Warung::where('owner_id', $request->user()->id)->firstOrFail();
        $perPage = min((int) $request->input('per_page', 15), 50);

        $menus = Menu::with(['category', 'addons'])
            ->where('warung_id', $warung->id)
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar menu warung berhasil diambil.',
            'data' => MenuResource::collection($menus->items()),
            'meta' => [
                'current_page' => $menus->currentPage(),
                'last_page' => $menus->lastPage(),
                'per_page' => $menus->perPage(),
                'total' => $menus->total(),
            ],
        ]);
    }

    public function store(StoreMenuRequest $request, ImageUploadService $imageUploadService): JsonResponse
    {
        Gate::authorize('create', Menu::class);

        $warung = Warung::where('owner_id', $request->user()->id)->firstOrFail();
        $validated = $request->validated();

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $imageUploadService->storeMenuImage($request->file('image'));
        }

        $menu = Menu::create([
            'warung_id' => $warung->id,
            'category_id' => (int) $validated['category_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price' => (int) $validated['price'],
            'image_path' => $imagePath,
            'is_available' => $validated['is_available'] ?? true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil ditambahkan.',
            'data' => new MenuResource($menu->load(['category', 'addons'])),
        ], 201);
    }

    public function show(Menu $menu): JsonResponse
    {
        Gate::authorize('view', $menu);

        return response()->json([
            'success' => true,
            'message' => 'Detail menu berhasil diambil.',
            'data' => new MenuResource($menu->load(['category', 'addons'])),
        ]);
    }

    public function update(UpdateMenuRequest $request, Menu $menu, ImageUploadService $imageUploadService): JsonResponse
    {
        Gate::authorize('update', $menu);

        $validated = $request->validated();

        if ($request->hasFile('image')) {
            $oldPath = $menu->image_path;
            $menu->image_path = $imageUploadService->storeMenuImage($request->file('image'));
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $menu->fill(collect($validated)->except('image')->all());
        $menu->save();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil diperbarui.',
            'data' => new MenuResource($menu->load(['category', 'addons'])),
        ]);
    }

    public function destroy(Menu $menu): JsonResponse
    {
        Gate::authorize('delete', $menu);

        if ($menu->image_path && Storage::disk('public')->exists($menu->image_path)) {
            Storage::disk('public')->delete($menu->image_path);
        }

        $menu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Menu berhasil dihapus.',
        ]);
    }
}
