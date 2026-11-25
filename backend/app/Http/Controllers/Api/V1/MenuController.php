<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    private const SORT_WHITELIST = ['price', 'rating_avg', 'sold_count', 'name', 'created_at'];

    public function popular(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 10), 50);

        $menus = Menu::with(['warung:id,name,slug,logo_path,is_open,status', 'category'])
            ->where('is_available', true)
            ->whereHas('warung', fn ($q) => $q->where('status', 'approved'))
            ->orderByDesc('sold_count')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'data' => MenuResource::collection($menus),
            'meta' => [
                'current_page' => $menus->currentPage(),
                'last_page' => $menus->lastPage(),
                'per_page' => $menus->perPage(),
                'total' => $menus->total(),
            ],
        ]);
    }

    public function show(Menu $menu): JsonResponse
    {
        abort_if(! $menu->is_available, 404);
        abort_if($menu->warung?->status !== 'approved', 404);

        $menu->load(['warung.canteen', 'category', 'addons']);

        return response()->json([
            'success' => true,
            'data' => new MenuResource($menu),
        ]);
    }
}
