<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CanteenResource;
use App\Models\Canteen;
use Illuminate\Http\JsonResponse;

class CanteenController extends Controller
{
    public function index(): JsonResponse
    {
        $canteens = Canteen::where('is_active', true)
            ->withCount(['warungs as approved_warungs_count' => fn ($q) => $q->where('status', 'approved')])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => CanteenResource::collection($canteens),
        ]);
    }

    public function show(Canteen $canteen): JsonResponse
    {
        abort_if(! $canteen->is_active, 404);

        return response()->json([
            'success' => true,
            'data' => new CanteenResource($canteen),
        ]);
    }
}
