<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreEventDefinitionRequest;
use App\Http\Requests\Api\UpdateEventDefinitionRequest;
use App\Models\EventDefinition;
use App\Models\ScheduleEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class EventDefinitionController extends Controller
{
    public function index(): JsonResponse
    {
        $query = EventDefinition::query()->where('standing_type', 'socio');
        $user = Auth::guard('sanctum')->user();
        if ($user?->role === 'tm') {
            $query->whereHas('assignedUsers', fn ($assignedUsers) => $assignedUsers->whereKey($user->id));
        }

        return response()->json($query
            ->with('sport:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (EventDefinition $event): array => [
                'id' => $event->id,
                'name' => $event->name ?: $event->event_key,
                'standingType' => $event->standing_type ?? 'sports',
                'sportId' => $event->sport_id,
                'sportName' => $event->sport?->name,
            ])
            ->values()
            ->all());
    }

    public function store(StoreEventDefinitionRequest $request): JsonResponse
    {
        $name = trim($request->string('name')->toString());
        $standingType = $request->string('standing_type')->toString();
        $sportId = $standingType === 'sports' ? $request->integer('sport_id') ?: null : null;

        $event = EventDefinition::query()->firstOrCreate(
            ['event_key' => $name],
            ['name' => $name, 'standing_type' => $standingType, 'sport_id' => $sportId]
        );

        if (($event->standing_type ?? 'sports') !== $standingType) {
            return response()->json(['message' => 'That event already belongs to another standing type.'], 409);
        }

        return response()->json([
            'id' => $event->id,
            'name' => $event->name ?: $event->event_key,
            'standingType' => $event->standing_type ?? 'sports',
            'sportId' => $event->sport_id,
        ], 201);
    }

    public function update(UpdateEventDefinitionRequest $request, EventDefinition $event): JsonResponse
    {
        if (($event->standing_type ?? 'sports') !== 'socio') {
            return response()->json(['message' => 'Only socio events can be edited here.'], 422);
        }

        $name = trim($request->string('name')->toString());
        if (EventDefinition::query()->where('event_key', $name)->where('id', '!=', $event->id)->exists()) {
            return response()->json(['message' => 'That event already exists.'], 409);
        }

        $event->update(['name' => $name, 'event_key' => $name]);

        return response()->json([
            'id' => $event->id,
            'name' => $event->name,
            'standingType' => 'socio',
            'sportId' => null,
        ]);
    }

    public function destroy(EventDefinition $event): JsonResponse
    {
        if (($event->standing_type ?? 'sports') !== 'socio') {
            return response()->json(['message' => 'Only socio events can be deleted here.'], 422);
        }

        if ($event->scores()->exists() || ScheduleEntry::query()->where('event_definition_id', $event->id)->exists()) {
            return response()->json([
                'message' => 'Cannot delete a socio event that already has standings or schedules.',
            ], 409);
        }

        $event->delete();

        return response()->json(status: 204);
    }
}