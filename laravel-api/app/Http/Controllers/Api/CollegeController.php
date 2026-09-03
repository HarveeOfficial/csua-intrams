<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCollegeRequest;
use App\Http\Requests\Api\UpdateCollegeStandingRequest;
use App\Http\Requests\Api\DeleteCollegeStandingRequest;
use App\Http\Requests\Api\UpdateCollegeEventsRequest;
use App\Models\College;
use App\Models\CollegeEventScore;
use App\Models\EventDefinition;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CollegeController extends Controller
{
    public function index(): JsonResponse
    {
        $colleges = College::query()
            ->with(['eventScores.eventDefinition'])
            ->orderBy('name')
            ->get()
            ->map(fn (College $college): array => $this->toLegacyPayload($college));

        return response()->json($colleges->values()->all());
    }

    public function show(College $college): JsonResponse
    {
        $college->load(['eventScores.eventDefinition']);

        return response()->json($this->toLegacyPayload($college));
    }

    public function store(StoreCollegeRequest $request): JsonResponse
    {
        $code = mb_strtolower(trim($request->string('id')->toString()));

        if (College::query()->where('code', $code)->exists()) {
            return response()->json(['message' => 'That college id already exists.'], 409);
        }

        $college = College::query()->create([
            'code' => $code,
            'name' => trim($request->string('name')->toString()),
            'color' => trim((string) $request->input('color', '#475569')) ?: '#475569',
            'photo_url' => trim((string) $request->input('photo_url', '')) ?: null,
        ]);

        $college->load(['eventScores.eventDefinition']);

        return response()->json($this->toLegacyPayload($college), 201);
    }

    public function updateEvents(UpdateCollegeEventsRequest $request, College $college): JsonResponse
    {
        $events = $request->input('events', []);
        $eventDefinitionIds = [];

        DB::transaction(function () use ($events, $college, &$eventDefinitionIds): void {
            foreach ($events as $eventKey => $data) {
                $key = trim((string) $eventKey);
                if ($key === '') {
                    continue;
                }

                $eventDefinition = EventDefinition::query()->firstOrCreate(
                    ['event_key' => $key],
                    ['name' => $key, 'standing_type' => 'sports']
                );

                CollegeEventScore::query()->updateOrCreate(
                    [
                        'college_id' => $college->id,
                        'event_definition_id' => $eventDefinition->id,
                    ],
                    [
                        'player_count' => max(0, (int) ($data['playerCount'] ?? 1)),
                        'points' => (int) ($data['points'] ?? 0),
                    ]
                );

                $eventDefinitionIds[] = $eventDefinition->id;
            }

            $deleteQuery = CollegeEventScore::query()->where('college_id', $college->id);
            if (count($eventDefinitionIds) > 0) {
                $deleteQuery->whereNotIn('event_definition_id', $eventDefinitionIds);
            }
            $deleteQuery->delete();
        });

        $college->load(['eventScores.eventDefinition']);

        return response()->json($this->toLegacyPayload($college));
    }

    public function updateStanding(UpdateCollegeStandingRequest $request, College $college): JsonResponse
    {
        $user = $request->user();
        $standingType = $request->input('standing_type', 'sports');
        $sportId = $request->filled('sport_id') ? (int) $request->integer('sport_id') : null;
        if ($standingType === 'sports' && ! $sportId) {
            throw ValidationException::withMessages(['sport_id' => ['A sport is required for sports standings.']]);
        }
        if ($standingType === 'sports' && $user?->role !== 'admin' && ! $user?->sports()->whereKey($sportId)->exists()) {
            throw ValidationException::withMessages([
                'sport_id' => ['You are not assigned to this sport.'],
            ]);
        }
        $eventKey = trim($request->string('event')->toString());
        $eventDefinition = EventDefinition::query()->firstOrCreate(
            ['event_key' => $eventKey],
            ['name' => $eventKey, 'sport_id' => $sportId, 'standing_type' => $standingType]
        );
        if ($standingType === 'socio' && $user?->role !== 'admin' && ! $user?->standingEvents()->whereKey($eventDefinition->id)->exists()) {
            throw ValidationException::withMessages(['event' => ['You are not assigned to this socio event.']]);
        }
        if (($eventDefinition->standing_type ?? 'sports') !== $standingType) {
            throw ValidationException::withMessages([
                'event' => ['This event belongs to another standing type.'],
            ]);
        }
        if ($standingType === 'sports' && $eventDefinition->sport_id && (int) $eventDefinition->sport_id !== $sportId) {
            throw ValidationException::withMessages([
                'event' => ['This event belongs to another sport.'],
            ]);
        }
        if ($standingType === 'sports' && ! $eventDefinition->sport_id) {
            $eventDefinition->update(['sport_id' => $sportId]);
        }

        CollegeEventScore::query()->updateOrCreate(
            ['college_id' => $college->id, 'event_definition_id' => $eventDefinition->id],
            [
                'player_count' => max(0, (int) $request->input('playerCount', 1)),
                'points' => (int) $request->input('points'),
            ]
        );

        $college->load(['eventScores.eventDefinition']);
        return response()->json($this->toLegacyPayload($college));
    }

    public function deleteStanding(DeleteCollegeStandingRequest $request, College $college): JsonResponse
    {
        $user = $request->user();
        $standingType = $request->input('standing_type', 'sports');
        $sportId = $request->filled('sport_id') ? (int) $request->integer('sport_id') : null;
        if ($standingType === 'sports' && $user?->role !== 'admin' && ! $user?->sports()->whereKey($sportId)->exists()) {
            throw ValidationException::withMessages([
                'sport_id' => ['You are not assigned to this sport.'],
            ]);
        }

        $eventDefinition = EventDefinition::query()
            ->where('event_key', trim($request->string('event')->toString()))
            ->where('standing_type', $standingType)
            ->when($standingType === 'sports', fn ($query) => $query->where('sport_id', $sportId))
            ->first();
        if ($eventDefinition) {
            CollegeEventScore::query()
                ->where('college_id', $college->id)
                ->where('event_definition_id', $eventDefinition->id)
                ->delete();
        }

        $college->load(['eventScores.eventDefinition.sport']);
        return response()->json($this->toLegacyPayload($college));
    }

    private function toLegacyPayload(College $college): array
    {
        $events = [];

        foreach ($college->eventScores as $score) {
            $key = $score->eventDefinition?->event_key;
            if (! $key) {
                continue;
            }

            $events[$key] = [
                'playerCount' => (int) $score->player_count,
                'points' => (int) $score->points,
                'sportId' => $score->eventDefinition?->sport_id,
                'sportName' => $score->eventDefinition?->sport?->name,
                'standingType' => $score->eventDefinition?->standing_type ?? 'sports',
                'eventDefinitionId' => $score->eventDefinition?->id,
            ];
        }

        ksort($events);

        return [
            'id' => $college->code,
            'name' => $college->name,
            'color' => $college->color,
            'photo_url' => $college->photo_url,
            'events' => $events,
        ];
    }
}
