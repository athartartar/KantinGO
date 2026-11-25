<?php

namespace Tests\Feature;

use App\Models\Canteen;
use App\Models\User;
use App\Models\Warung;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_with_strong_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'phone' => '081234567890',
            'password' => 'KantinGO2026!',
            'password_confirmation' => 'KantinGO2026!',
            'role' => 'customer',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'customer')
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['user', 'token', 'expires_at'],
            ]);

        $response->assertHeader('Cache-Control', 'no-store, private');

        $token = PersonalAccessToken::first();
        $this->assertNotNull($token);
        $this->assertEquals(['customer:read', 'customer:write'], $token->abilities);
        $this->assertNotNull($token->expires_at);
    }

    public function test_partner_can_register_and_creates_pending_warung(): void
    {
        $canteen = Canteen::factory()->create();

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Siti Aminah',
            'email' => 'siti.mitra@example.com',
            'phone' => '081234567891',
            'password' => 'KantinGO2026!',
            'password_confirmation' => 'KantinGO2026!',
            'role' => 'partner',
            'warung_name' => 'Warung Siti Jaya',
            'canteen_id' => $canteen->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.user.role', 'warung_owner')
            ->assertJsonPath('data.user.warung.status', 'pending')
            ->assertJsonPath('data.user.warung.is_open', false);

        $this->assertDatabaseHas('warungs', [
            'name' => 'Warung Siti Jaya',
            'canteen_id' => $canteen->id,
            'status' => 'pending',
        ]);
    }

    public function test_partner_registration_requires_warung_fields(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Siti Aminah',
            'email' => 'siti.incomplete@example.com',
            'password' => 'KantinGO2026!',
            'password_confirmation' => 'KantinGO2026!',
            'role' => 'partner',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone', 'warung_name', 'canteen_id']);
    }

    public function test_cannot_register_as_admin(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Hacker Admin',
            'email' => 'hacker@example.com',
            'password' => 'KantinGO2026!',
            'password_confirmation' => 'KantinGO2026!',
            'role' => 'admin',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_register_rejects_weak_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'User Lemah',
            'email' => 'weak@example.com',
            'password' => 'lemah123',
            'password_confirmation' => 'lemah123',
            'role' => 'customer',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_login_succeeds_and_revokes_previous_tokens(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => Hash::make('KantinGO2026!'),
        ]);
        $user->createToken('old_token', ['customer:read'], now()->addHours(12));

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'login@example.com',
            'password' => 'KantinGO2026!',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['user', 'token', 'expires_at']]);

        $this->assertEquals(1, $user->tokens()->count());
    }

    public function test_login_returns_generic_error_for_wrong_password_or_unknown_email(): void
    {
        User::factory()->create([
            'email' => 'real@example.com',
            'password' => Hash::make('KantinGO2026!'),
        ]);

        $wrongPass = $this->postJson('/api/v1/auth/login', [
            'email' => 'real@example.com',
            'password' => 'SalahPassword123',
        ]);

        $unknownEmail = $this->postJson('/api/v1/auth/login', [
            'email' => 'unknown@example.com',
            'password' => 'SalahPassword123',
        ]);

        $wrongPass->assertStatus(401)->assertJsonPath('message', 'Email atau kata sandi salah.');
        $unknownEmail->assertStatus(401)->assertJsonPath('message', 'Email atau kata sandi salah.');
    }

    public function test_login_is_throttled_after_five_failed_attempts(): void
    {
        User::factory()->create([
            'email' => 'brute@example.com',
            'password' => Hash::make('KantinGO2026!'),
        ]);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'brute@example.com',
                'password' => 'WrongPass123!',
            ])->assertStatus(401);
        }

        $this->postJson('/api/v1/auth/login', [
            'email' => 'brute@example.com',
            'password' => 'WrongPass123!',
        ])->assertStatus(429);
    }

    public function test_authenticated_user_can_get_me_and_update_profile_with_avatar(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();
        $token = $user->createToken('auth_token', ['customer:read', 'customer:write'], now()->addHours(12))->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(200)
            ->assertJsonPath('data.user.email', $user->email);

        $avatar = UploadedFile::fake()->image('avatar.png', 200, 200);

        $update = $this->withToken($token)->put('/api/v1/auth/me', [
            'name' => 'Nama Baru',
            'phone' => '081999888777',
            'avatar' => $avatar,
        ], ['Accept' => 'application/json']);

        $update->assertStatus(200)
            ->assertJsonPath('data.user.name', 'Nama Baru');

        $user->refresh();
        $this->assertNotNull($user->avatar_path);
        $this->assertStringStartsWith('avatars/', $user->avatar_path);
        $this->assertStringEndsWith('.jpg', $user->avatar_path);
        Storage::disk('local')->assertExists($user->avatar_path);
    }

    public function test_update_profile_rejects_non_image_avatar(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token', ['customer:read', 'customer:write'], now()->addHours(12))->plainTextToken;

        $fakeFile = UploadedFile::fake()->create('script.php', 10, 'application/x-php');

        $this->withToken($token)->put('/api/v1/auth/me', [
            'avatar' => $fakeFile,
        ], ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['avatar']);
    }

    public function test_update_password_revokes_old_tokens_and_issues_new_token(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('OldPass2026!'),
        ]);
        $oldToken = $user->createToken('auth_token', ['customer:read', 'customer:write'], now()->addHours(12))->plainTextToken;

        $this->withToken($oldToken)->putJson('/api/v1/auth/me/password', [
            'current_password' => 'WrongOldPass1!',
            'password' => 'NewPass2026!',
            'password_confirmation' => 'NewPass2026!',
        ])->assertStatus(422);

        $response = $this->withToken($oldToken)->putJson('/api/v1/auth/me/password', [
            'current_password' => 'OldPass2026!',
            'password' => 'NewPass2026!',
            'password_confirmation' => 'NewPass2026!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['token', 'expires_at']]);

        $this->assertEquals(1, $user->tokens()->count());
        $this->assertTrue(Hash::check('NewPass2026!', $user->fresh()->password));
    }

    public function test_logout_and_logout_all_revoke_tokens(): void
    {
        $user = User::factory()->create();
        $token1 = $user->createToken('device1', ['customer:read'], now()->addHours(12))->plainTextToken;
        $token2 = $user->createToken('device2', ['customer:read'], now()->addHours(12))->plainTextToken;

        $this->withToken($token1)
            ->postJson('/api/v1/auth/logout')
            ->assertStatus(200);

        $this->assertEquals(1, $user->tokens()->count());

        $this->withToken($token2)
            ->postJson('/api/v1/auth/logout-all')
            ->assertStatus(200);

        $this->assertEquals(0, $user->tokens()->count());
    }

    public function test_pending_partner_is_blocked_by_approved_partner_middleware(): void
    {
        Route::middleware([
            'auth:sanctum',
            \App\Http\Middleware\RoleMiddleware::class.':warung_owner',
            \App\Http\Middleware\EnsureApprovedPartner::class,
        ])->get('/_test/partner-only', fn () => response()->json(['ok' => true]));

        $pendingOwner = User::factory()->warungOwner()->create();
        Warung::factory()->pending()->create(['owner_id' => $pendingOwner->id]);
        $pendingToken = $pendingOwner->createToken('t', ['partner:read'], now()->addHours(12))->plainTextToken;

        $this->withToken($pendingToken)
            ->getJson('/_test/partner-only')
            ->assertStatus(403)
            ->assertJsonPath('message', 'Menunggu persetujuan admin');
    }

    public function test_approved_partner_passes_middleware(): void
    {
        Route::middleware([
            'auth:sanctum',
            \App\Http\Middleware\RoleMiddleware::class.':warung_owner',
            \App\Http\Middleware\EnsureApprovedPartner::class,
        ])->get('/_test/partner-approved', fn () => response()->json(['ok' => true]));

        $approvedOwner = User::factory()->warungOwner()->create();
        Warung::factory()->create(['owner_id' => $approvedOwner->id, 'status' => 'approved']);
        $approvedToken = $approvedOwner->createToken('t', ['partner:read'], now()->addHours(12))->plainTextToken;

        $this->withToken($approvedToken)
            ->getJson('/_test/partner-approved')
            ->assertStatus(200)
            ->assertJsonPath('ok', true);
    }

    public function test_customer_blocked_from_admin_only_routes(): void
    {
        Route::middleware([
            'auth:sanctum',
            \App\Http\Middleware\RoleMiddleware::class.':admin',
        ])->get('/_test/admin-only', fn () => response()->json(['ok' => true]));

        $customer = User::factory()->create();
        $token = $customer->createToken('t', ['customer:read'], now()->addHours(12))->plainTextToken;

        $this->withToken($token)
            ->getJson('/_test/admin-only')
            ->assertStatus(403);
    }
}
