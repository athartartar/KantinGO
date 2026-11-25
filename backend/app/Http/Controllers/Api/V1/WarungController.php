<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MenuResource;
use App\Http\Resources\ReviewResource;
use App\Http\Resources\WarungResource;
use App\Http\Resources\WarungSummaryResource;
use App\Models\Warung;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarungController extends Controller
{
    private const SORT_WHITELIST = ['rating_avg', 'review_count', 'name', 'estimated_minutes', 'created_at'];

    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 15), 50);
        $sortBy = in_array($request->input('sort_by'), self::SORT_WHITELIST, true)
            ? $request->input('sort_by')
            : 'rating_avg';
        $sortDir = $request->input('sort_dir') === 'asc' ? 'asc' : 'desc';

        $query = Warung::with('canteen')
            ->where('status', 'approved')
            ->when($request->input('canteen_id'), fn ($q, $v) => $q->where('canteen_id', (int) $v))
            ->when($request->boolean('is_open'), fn ($q) => $q->where('is_open', true))
            ->when($request->input('category_slug'), function ($q, $slug) {
                $q->whereHas('menus.category', fn ($mq) => $mq->where('slug', $slug));
            })
            ->orderBy($sortBy, $sortDir);

        $warungs = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'success' => true,
            'data' => WarungSummaryResource::collection($warungs),
            'meta' => [
                'current_page' => $warungs->currentPage(),
                'last_page' => $warungs->lastPage(),
                'per_page' => $warungs->perPage(),
                'total' => $warungs->total(),
            ],
        ]);
    }

    public function show(Warung $warung): JsonResponse
    {
        abort_if($warung->status !== 'approved', 404);

        $warung->load(['canteen', 'menus' => fn ($q) => $q->where('is_available', true)->with(['category', 'addons'])]);

        return response()->json([
            'success' => true,
            'data' => new WarungResource($warung),
        ]);
    }

    public function menus(Request $request, Warung $warung): JsonResponse
    {
        abort_if($warung->status !== 'approved', 404);

        $perPage = min((int) $request->input('per_page', 15), 50);
        $sortBy = in_array($request->input('sort_by'), ['price', 'rating_avg', 'sold_count', 'name'], true)
            ? $request->input('sort_by')
            : 'name';
        $sortDir = $request->input('sort_dir') === 'desc' ? 'desc' : 'asc';

        $menus = $warung->menus()
            ->where('is_available', true)
            ->with(['category', 'addons'])
            ->when($request->input('category_id'), fn ($q, $v) => $q->where('category_id', (int) $v))
            ->orderBy($sortBy, $sortDir)
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

    public function reviews(Request $request, Warung $warung): JsonResponse
    {
        abort_if($warung->status !== 'approved', 404);

        $perPage = min((int) $request->input('per_page', 15), 50);

        $reviews = $warung->reviews()
            ->with('user:id,name,avatar_path')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }
}
