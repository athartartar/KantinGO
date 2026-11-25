<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CanteenController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\MenuController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\WarungController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'Server KantinGO berjalan normal.',
        'data' => [
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
        ],
    ]);
});

Route::prefix('auth')->group(function () {
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::put('/me', [AuthController::class, 'updateProfile']);
        Route::put('/me/password', [AuthController::class, 'updatePassword']);
    });
});

Route::get('/canteens', [CanteenController::class, 'index']);
Route::get('/canteens/{canteen}', [CanteenController::class, 'show']);

Route::get('/categories', [CategoryController::class, 'index']);

Route::get('/warungs', [WarungController::class, 'index']);
Route::get('/warungs/{warung}', [WarungController::class, 'show']);
Route::get('/warungs/{warung}/menus', [WarungController::class, 'menus']);
Route::get('/warungs/{warung}/reviews', [WarungController::class, 'reviews']);

Route::get('/menus/popular', [MenuController::class, 'popular']);
Route::get('/menus/{menu}', [MenuController::class, 'show']);

Route::get('/search', SearchController::class);
