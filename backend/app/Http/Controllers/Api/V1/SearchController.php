<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Http\Resources\WarungSummaryResource;
use App\Models\Menu;
use App\Models\Warung;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $raw = $request->input('q', '');
        $q = trim(preg_replace('/[^\p{L}\p{N}\s\-]/u', '', $raw));

        if (mb_strlen($q) < 2) {
            return response()->json([
                'success' => true,
                'data' => ['warungs' => [], 'menus' => []],
            ]);
        }

        $perPage = min((int) $request->input('per_page', 10), 50);
        $term = '%'.$q.'%';

        $warungs = Warung::with('canteen')
            ->where('status', 'approved')
            ->where(fn ($w) => $w->where('name', 'like', $term)->orWhere('description', 'like', $term))
            ->limit($perPage)
            ->get();

        $menus = Menu::with(['warung:id,name,slug,logo_path,is_open,status', 'category'])
            ->where('is_available', true)
            ->whereHas('warung', fn ($q) => $q->where('status', 'approved'))
            ->where(fn ($m) => $m->where('name', 'like', $term)->orWhere('description', 'like', $term))
            ->limit($perPage)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'warungs' => WarungSummaryResource::collection($warungs),
                'menus' => MenuResource::collection($menus),
            ],
        ]);
    }
}
