<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\ChangePasswordRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        if (! $this->verifyRecaptcha($request->string('recaptcha_token')->toString(), $request->ip())) {
            return response()->json(['message' => 'reCAPTCHA verification failed. Please try again.'], 422);
        }

        $email = mb_strtolower(trim($request->string('email')->toString()));
        $password = $request->string('password')->toString();

        $user = User::query()->where('email', $email)->first();
        $isValidPassword = $user && (Hash::check($password, $user->password) || $user->password === $password);

        if (! $user || ! $isValidPassword) {
            return response()->json(['message' => 'Incorrect email or password.'], 401);
        }

        if ($user->password === $password) {
            $user->password = Hash::make($password);
            $user->save();
        }

        $user->tokens()->delete();
        $abilities = $user->role === 'admin' ? ['admin'] : ['tm'];
        $token = $user->createToken('api-token', $abilities, now()->addHours(8))->plainTextToken;

        $sports = $user->sports()->orderBy('name')->get(['intrams_sports.id', 'intrams_sports.name']);
        $socioEvents = $user->standingEvents()->where('standing_type', 'socio')->orderBy('name')->get(['intrams_event_definitions.id', 'intrams_event_definitions.name', 'intrams_event_definitions.event_key']);
        $sportId = $user->sport_id ?? $sports->first()?->id;
        $sportName = $sportId ? $sports->firstWhere('id', $sportId)?->name : null;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
                'sport_id' => $sportId,
                'sport_name' => $sportName,
                'sport_ids' => $sports->pluck('id')->values(),
                'sport_names' => $sports->pluck('name')->values(),
                'socio_event_ids' => $socioEvents->pluck('id')->values(),
                'socio_event_names' => $socioEvents->map(fn ($event) => $event->name ?: $event->event_key)->values(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->string('current_password')->toString(), $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->password = $request->string('new_password')->toString();
        $user->save();

        $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();

        return response()->json(['message' => 'Password updated.']);
    }

    private function verifyRecaptcha(string $token, ?string $ip): bool
    {
        $secret = config('services.recaptcha.secret');

        // Skip verification when not configured (e.g. local dev without keys set up).
        if (! $secret) {
            return true;
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $ip,
        ]);

        return (bool) $response->json('success');
    }
}
