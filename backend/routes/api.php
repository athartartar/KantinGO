<?php

use Illuminate\Http\Request;
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

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
