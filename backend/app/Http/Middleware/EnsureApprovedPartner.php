<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApprovedPartner
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== 'warung_owner') {
            return response()->json([
                'success' => false,
                'message' => 'Akses khusus mitra warung.',
            ], 403);
        }

        $warung = $user->warung;

        if (! $warung || $warung->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Menunggu persetujuan admin',
            ], 403);
        }

        return $next($request);
    }
}
