<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreScheduleEntryRequest;
use App\Http\Requests\Api\UpdateScheduleWinnerRequest;
use App\Models\College;
use App\Models\EventCategory;
use App\Models\EventDefinition;
use App\Models\ScheduleEntry;
use App\Models\ScheduleEntryTeam;
use App\Models\Sport;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ScheduleController extends Controller
{
    public function index(): JsonResponse
    {
        $query = ScheduleEntry::query();
        $user = Auth::guard('sanctum')->user();
        if ($user?->role === 'tm') {
            $query->where(function ($query) use ($user): void {
                $query->whereIn('sport_id', $user->sports()->pluck('intrams_sports.id'))
                    ->orWhereIn('event_definition_id', $user->standingEvents()->where('standing_type', 'socio')->pluck('intrams_event_definitions.id'));
            });
        }

        $entries = $query
            ->with(['sport', 'eventDefinition', 'category', 'winnerCollege', 'teams.college'])
            ->get()
            ->sortBy([
                fn (ScheduleEntry $entry): string => $entry->sport?->name ?? '',
                fn (ScheduleEntry $entry): string => $entry->category?->name ?? '',
                fn (ScheduleEntry $entry): string => $entry->event_name ?? '',
                fn (ScheduleEntry $entry): int => (int) $entry->game,
            ])
            ->values()
            ->map(fn (ScheduleEntry $entry): array => $this->toLegacyPayload($entry));

        return response()->json($entries->all());
    }

    public function store(StoreScheduleEntryRequest $request): JsonResponse
    {
        $standingType = $request->input('standing_type', 'sports');
        $eventDefinition = null;
        if ($standingType === 'socio') {
            $eventDefinition = EventDefinition::query()->whereKey($request->integer('event_definition_id'))->where('standing_type', 'socio')->first();
            if (! $eventDefinition) {
                throw ValidationException::withMessages(['event_definition_id' => ['Select a valid socio event.']]);
            }
            if ($request->user()?->role === 'tm' && ! $request->user()->standingEvents()->whereKey($eventDefinition->id)->exists()) {
                throw ValidationException::withMessages(['event_definition_id' => ['You are not assigned to this socio event.']]);
            }
        }
        $sportName = trim($request->string('sport')->toString());
        $categoryName = trim((string) $request->input('category', '')) ?: '-';
        $eventName = trim((string) $request->input('event', '')) ?: null;
        $teams = collect($request->input('teams', []))
            ->map(fn (mixed $team) => mb_strtoupper(trim((string) $team)))
            ->filter()
            ->unique()
            ->values();

        $sport = $standingType === 'sports' ? Sport::query()->firstOrCreate(
            ['slug' => Str::slug($sportName)],
            ['name' => $sportName]
        ) : null;

        $user = $request->user();
        if ($standingType === 'sports' && $user?->role === 'tm' && ! $user->sports()->whereKey($sport->id)->exists()) {
            throw ValidationException::withMessages([
                'sport' => ['You are not assigned to this sport.'],
            ]);
        }

        $category = EventCategory::query()->firstOrCreate(
            ['slug' => Str::slug($categoryName)],
            ['name' => $categoryName]
        );

        $winnerCollege = null;
        $winnerInput = trim((string) $request->input('winner', ''));
        if ($winnerInput !== '') {
            $winnerCollege = $this->resolveCollegeByCode($winnerInput);
            if (! $winnerCollege) {
                throw ValidationException::withMessages([
                    'winner' => ['Winner team does not match an existing college.'],
                ]);
            }
        }

        $entry = DB::transaction(function () use ($request, $sport, $eventDefinition, $standingType, $category, $eventName, $winnerCollege, $teams): ScheduleEntry {
            $entry = ScheduleEntry::query()->create([
                'id' => (string) Str::uuid(),
                'sport_id' => $sport?->id,
                'event_definition_id' => $eventDefinition?->id,
                'standing_type' => $standingType,
                'event_category_id' => $category->id,
                'event_name' => $eventName,
                'game' => (int) $request->integer('game'),
                'type' => (string) $request->input('type'),
                'winner_college_id' => $winnerCollege?->id,
                'multi_winners' => null,
                'legacy_created_at_ms' => $request->integer('createdAt') ?: now()->valueOf(),
                'legacy_updated_at_ms' => $request->integer('updatedAt') ?: null,
            ]);

            foreach ($teams as $index => $teamCode) {
                $college = $this->resolveCollegeByCode($teamCode);
                if (! $college) {
                    throw ValidationException::withMessages([
                        'teams' => ["Unknown team code: {$teamCode}"],
                    ]);
                }

                ScheduleEntryTeam::query()->create([
                    'schedule_entry_id' => $entry->id,
                    'college_id' => $college->id,
                    'slot' => $index + 1,
                ]);
            }

            return $entry;
        });

        $entry->load(['sport', 'eventDefinition', 'category', 'winnerCollege', 'teams.college']);

        return response()->json($this->toLegacyPayload($entry), 201);
    }

    public function updateWinner(UpdateScheduleWinnerRequest $request, string $id): JsonResponse
    {
        $entry = ScheduleEntry::query()->with(['sport', 'category', 'winnerCollege', 'teams.college'])->find($id);
        if (! $entry) {
            return response()->json(['message' => 'Schedule entry not found'], 404);
        }

        $winnerInput = $entry->type === 'multi'
            ? null
            : trim((string) $request->input('winner', ''));
        $winnerCollege = null;
        if ($entry->type === 'multi') {
            $placements = collect($request->input('winner', []))
                ->map(fn (mixed $team): string => mb_strtoupper(trim((string) $team)))
                ->filter()
                ->all();
            $validTeams = $entry->teams->map(fn (ScheduleEntryTeam $team): string => mb_strtoupper($team->college?->code ?? ''))->all();
            if (count($placements) !== count(array_unique($placements)) || collect($placements)->diff($validTeams)->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'winner' => ['Each placement must be a different team from this event.'],
                ]);
            }
            $entry->multi_winners = array_merge(['first' => null, 'second' => null, 'third' => null], $request->input('winner', []));
        } elseif ($winnerInput !== '') {
            $winnerCollege = $this->resolveCollegeByCode($winnerInput);
            if (! $winnerCollege) {
                throw ValidationException::withMessages([
                    'winner' => ['Winner team does not match an existing college.'],
                ]);
            }
        }

        $entry->winner_college_id = $winnerCollege?->id;
        $entry->legacy_updated_at_ms = now()->valueOf();
        $entry->save();

        $entry->load(['sport', 'eventDefinition', 'category', 'winnerCollege', 'teams.college']);

        return response()->json($this->toLegacyPayload($entry));
    }

    public function destroy(string $id): JsonResponse
    {
        $deleted = ScheduleEntry::query()->where('id', $id)->delete();
        if (! $deleted) {
            return response()->json(['message' => 'Schedule entry not found'], 404);
        }

        return response()->json(status: 204);
    }

    private function resolveCollegeByCode(string $code): ?College
    {
        $normalized = mb_strtolower(trim($code));

        return College::query()
            ->whereRaw('LOWER(code) = ?', [$normalized])
            ->first();
    }

    private function toLegacyPayload(ScheduleEntry $entry): array
    {
        return [
            'id' => $entry->id,
            'sport' => $entry->sport?->name ?? $entry->eventDefinition?->name ?? '',
            'standingType' => $entry->standing_type ?? 'sports',
            'eventDefinitionId' => $entry->event_definition_id,
            'category' => $entry->category?->name ?? '-',
            'event' => $entry->event_name,
            'game' => (int) $entry->game,
            'teams' => $entry->teams->map(fn (ScheduleEntryTeam $team) => mb_strtoupper($team->college?->code ?? ''))->filter()->values()->all(),
            'type' => $entry->type,
            'winner' => $entry->type === 'multi'
                ? ($entry->multi_winners ?: ['first' => null, 'second' => null, 'third' => null])
                : ($entry->winnerCollege ? mb_strtoupper($entry->winnerCollege->code) : null),
            'createdAt' => $entry->legacy_created_at_ms ?: $entry->created_at?->valueOf(),
            'updatedAt' => $entry->legacy_updated_at_ms ?: $entry->updated_at?->valueOf(),
        ];
    }
}
