<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Models\User;
use App\Models\Warung;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private const DUMMY_HASH = '$argon2id$v=19$m=65536,t=4,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = DB::transaction(function () use ($validated) {
            $role = $validated['role'] === 'partner' ? 'warung_owner' : 'customer';

            $user = new User();
            $user->fill([
                'name' => $validated['name'],
                'email' => strtolower($validated['email']),
                'phone' => $validated['phone'] ?? null,
                'password' => $validated['password'],
                'points' => 0,
            ]);
            $user->role = $role;
            $user->save();

            if ($role === 'warung_owner') {
                Warung::create([
                    'owner_id' => $user->id,
                    'canteen_id' => $validated['canteen_id'],
                    'name' => $validated['warung_name'],
                    'slug' => Str::slug($validated['warung_name']).'-'.Str::lower(Str::random(5)),
                    'status' => 'pending',
                    'is_open' => false,
                ]);
            }

            $expiresAt = now()->addHours(12);
            $token = $user->createToken('auth_token', $this->abilitiesForRole($user->role), $expiresAt);

            return [
                'user' => $user->role === 'warung_owner' ? $user->load('warung') : $user,
                'token' => $token->plainTextToken,
                'expires_at' => $expiresAt->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil.',
            'data' => $result,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $email = strtolower($validated['email']);
        $lockoutKey = 'login-lockout:'.$request->ip().'|'.$email;

        if (RateLimiter::tooManyAttempts($lockoutKey, 5)) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak percobaan masuk. Silakan coba lagi nanti.',
            ], 429);
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            Hash::check($validated['password'], self::DUMMY_HASH);
            RateLimiter::hit($lockoutKey, 900);

            return response()->json([
                'success' => false,
                'message' => 'Email atau kata sandi salah.',
            ], 401);
        }

        if (! Hash::check($validated['password'], $user->password)) {
            RateLimiter::hit($lockoutKey, 900);

            return response()->json([
                'success' => false,
                'message' => 'Email atau kata sandi salah.',
            ], 401);
        }

        RateLimiter::clear($lockoutKey);

        $user->tokens()->delete();

        $expiresAt = now()->addHours(12);
        $token = $user->createToken('auth_token', $this->abilitiesForRole($user->role), $expiresAt);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil masuk.',
            'data' => [
                'user' => $user->role === 'warung_owner' ? $user->load('warung') : $user,
                'token' => $token->plainTextToken,
                'expires_at' => $expiresAt->toIso8601String(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil keluar.',
        ]);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil keluar dari semua perangkat.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user->role === 'warung_owner') {
            $user->load('warung');
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
            ],
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if (array_key_exists('name', $validated)) {
            $user->name = $validated['name'];
        }

        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }

        if ($request->hasFile('avatar')) {
            $encoded = $this->reencodeAvatar($request->file('avatar')->getRealPath());
            $newPath = 'avatars/'.Str::uuid()->toString().'.jpg';

            Storage::disk('local')->put($newPath, $encoded);

            if ($user->avatar_path && ! str_starts_with($user->avatar_path, 'http')) {
                Storage::disk('local')->delete($user->avatar_path);
            }

            $user->avatar_path = $newPath;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'user' => $user,
            ],
        ]);
    }

    public function updatePassword(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi saat ini tidak sesuai.',
                'errors' => [
                    'current_password' => ['Kata sandi saat ini tidak sesuai.'],
                ],
            ], 422);
        }

        $user->password = $validated['password'];
        $user->save();

        $user->tokens()->delete();

        $expiresAt = now()->addHours(12);
        $token = $user->createToken('auth_token', $this->abilitiesForRole($user->role), $expiresAt);

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui.',
            'data' => [
                'token' => $token->plainTextToken,
                'expires_at' => $expiresAt->toIso8601String(),
            ],
        ]);
    }

    private function abilitiesForRole(string $role): array
    {
        return match ($role) {
            'admin' => ['admin:read', 'admin:write'],
            'warung_owner' => ['partner:read', 'partner:write'],
            default => ['customer:read', 'customer:write'],
        };
    }

    private function reencodeAvatar(string $filePath): string
    {
        $raw = file_get_contents($filePath);
        if ($raw === false) {
            throw ValidationException::withMessages([
                'avatar' => ['Berkas avatar tidak dapat dibaca.'],
            ]);
        }

        $source = @imagecreatefromstring($raw);
        if ($source === false) {
            throw ValidationException::withMessages([
                'avatar' => ['Berkas gambar tidak valid atau rusak.'],
            ]);
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $canvas = imagecreatetruecolor($width, $height);
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefill($canvas, 0, 0, $white);
        imagecopy($canvas, $source, 0, 0, 0, 0, $width, $height);

        ob_start();
        imagejpeg($canvas, null, 85);
        $encoded = ob_get_clean();

        imagedestroy($source);
        imagedestroy($canvas);

        if ($encoded === false || $encoded === '') {
            throw ValidationException::withMessages([
                'avatar' => ['Gagal memproses ulang gambar avatar.'],
            ]);
        }

        return $encoded;
    }
}
