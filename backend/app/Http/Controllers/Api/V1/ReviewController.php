<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Review;
use App\Models\Warung;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function myReviews(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Review::class);

        $perPage = min((int) $request->input('per_page', 15), 50);

        $reviews = Review::with(['user', 'warung'])
            ->where('user_id', $request->user()->id)
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar ulasan Anda berhasil diambil.',
            'data' => ReviewResource::collection($reviews->items()),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    public function store(StoreReviewRequest $request, Order $order): JsonResponse
    {
        Gate::authorize('createForOrder', [Review::class, $order]);

        $validated = $request->validated();
        $rawComment = $validated['comment'] ?? null;
        $cleanComment = $rawComment !== null ? trim(strip_tags($rawComment)) : null;

        $review = DB::transaction(function () use ($order, $validated, $cleanComment) {
            $lockedOrder = Order::where('id', $order->id)->lockForUpdate()->firstOrFail();

            if ($lockedOrder->status !== Order::STATUS_SELESAI) {
                throw ValidationException::withMessages([
                    'order' => ['Ulasan hanya dapat diberikan untuk pesanan yang sudah selesai.'],
                ]);
            }

            if (Review::where('order_id', $lockedOrder->id)->exists()) {
                throw ValidationException::withMessages([
                    'order' => ['Pesanan ini sudah memiliki ulasan.'],
                ]);
            }

            $review = Review::create([
                'user_id' => $lockedOrder->user_id,
                'warung_id' => $lockedOrder->warung_id,
                'order_id' => $lockedOrder->id,
                'rating' => (int) $validated['rating'],
                'comment' => $cleanComment,
            ]);

            $this->recalculateWarungRating($lockedOrder->warung_id);

            return $review->load('user');
        });

        return response()->json([
            'success' => true,
            'message' => 'Ulasan berhasil dikirim.',
            'data' => new ReviewResource($review),
        ], 201);
    }

    public function destroy(Review $review): JsonResponse
    {
        Gate::authorize('delete', $review);

        DB::transaction(function () use ($review) {
            $warungId = $review->warung_id;
            $review->delete();
            $this->recalculateWarungRating($warungId);
        });

        return response()->json([
            'success' => true,
            'message' => 'Ulasan berhasil dihapus.',
        ]);
    }

    private function recalculateWarungRating(int $warungId): void
    {
        $warung = Warung::where('id', $warungId)->lockForUpdate()->first();
        if (! $warung) {
            return;
        }

        $stats = Review::where('warung_id', $warungId)
            ->selectRaw('COUNT(*) as total_count, COALESCE(AVG(rating), 0) as avg_rating')
            ->first();

        $warung->review_count = (int) ($stats->total_count ?? 0);
        $warung->rating_avg = round((float) ($stats->avg_rating ?? 0), 2);
        $warung->save();
    }
}
