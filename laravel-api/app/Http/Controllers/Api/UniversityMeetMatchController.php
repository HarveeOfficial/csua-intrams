<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SaveUniversityMeetMatchRequest;
use App\Models\UniversityMeetMatch;
use Illuminate\Http\JsonResponse;

class UniversityMeetMatchController extends Controller
{
    public function index(): JsonResponse
    {
        $matches = UniversityMeetMatch::query()
            ->orderBy('event_name')
            ->orderBy('category')
            ->orderBy('game_number')
            ->orderBy('id')
            ->get()
            ->map(fn (UniversityMeetMatch $match): array => $match->toPublicPayload());

        return response()->json($matches);
    }

    public function store(SaveUniversityMeetMatchRequest $request): JsonResponse
    {
        $match = UniversityMeetMatch::query()->create($request->validated());

        return response()->json($match->toPublicPayload(), 201);
    }

    public function update(SaveUniversityMeetMatchRequest $request, UniversityMeetMatch $match): JsonResponse
    {
        $match->update($request->validated());

        return response()->json($match->toPublicPayload());
    }

    public function destroy(UniversityMeetMatch $match): JsonResponse
    {
        $match->delete();

        return response()->json(status: 204);
    }
}
