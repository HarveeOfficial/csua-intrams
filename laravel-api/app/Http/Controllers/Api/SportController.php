<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreSportRequest;
use App\Models\Sport;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class SportController extends Controller
{
    private function resolvePlayerCount(string $sportName, ?int $fallback = null): int
    {
        $normalized = strtolower(trim($sportName));
        $explicit = max(1, (int) ($fallback ?? 1));

        if ($fallback !== null && $fallback > 0) {
            return $explicit;
        }

        $defaults = [
            'badminton doubles' => 2,
            'badminton singles' => 1,
            'basketball' => 5,
            'volleyball' => 6,
            'swimming' => 1,
            'track and field' => 1,
        ];

        if (isset($defaults[$normalized])) {
            return $defaults[$normalized];
        }

        return max(1, (int) ($fallback ?? 1));
    }

    public function index(): JsonResponse
    {
        $sports = Sport::query()->orderBy('name')->get(['id', 'name', 'slug', 'player_count']);

        return response()->json(
            $sports->map(fn (Sport $sport) => [
                'id' => $sport->id,
                'name' => $sport->name,
                'slug' => $sport->slug,
                'playerCount' => (int) $sport->player_count,
            ])->values()->all()
        );
    }

    public function store(StoreSportRequest $request): JsonResponse
    {
        $name = trim($request->string('name')->toString());
        $slug = Str::slug($name);
        $playerCount = $this->resolvePlayerCount(
            $name,
            $request->filled('playerCount') ? max(1, (int) $request->input('playerCount')) : null
        );

        if (Sport::query()->where('slug', $slug)->exists()) {
            return response()->json(['message' => 'That sport already exists.'], 409);
        }

        $sport = Sport::query()->create([
            'name' => $name,
            'slug' => $slug,
            'player_count' => $playerCount,
        ]);

        return response()->json([
            'id' => $sport->id,
            'name' => $sport->name,
            'slug' => $sport->slug,
            'playerCount' => (int) $sport->player_count,
        ], 201);
    }

    public function update(StoreSportRequest $request, Sport $sport): JsonResponse
    {
        $name = trim($request->string('name')->toString());
        $slug = Str::slug($name);
        $playerCount = $this->resolvePlayerCount(
            $name,
            $request->filled('playerCount') ? max(1, (int) $request->input('playerCount')) : $sport->player_count ?? 1
        );

        if (Sport::query()->where('slug', $slug)->where('id', '!=', $sport->id)->exists()) {
            return response()->json(['message' => 'That sport already exists.'], 409);
        }

        $sport->update([
            'name' => $name,
            'slug' => $slug,
            'player_count' => $playerCount,
        ]);

        return response()->json([
            'id' => $sport->id,
            'name' => $sport->name,
            'slug' => $sport->slug,
            'playerCount' => (int) $sport->player_count,
        ]);
    }

    public function destroy(Sport $sport): JsonResponse
    {
        if ($sport->scheduleEntries()->exists()) {
            return response()->json([
                'message' => 'Cannot delete a sport that has schedule entries. Remove those schedule entries first.',
            ], 409);
        }

        $sport->delete();

        return response()->json(status: 204);
    }
}

