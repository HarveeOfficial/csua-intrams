<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreUserRequest;
use App\Http\Requests\Api\UpdateUserRequest;
use App\Models\Sport;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()->where('role', 'tm')->with(['sports', 'standingEvents'])->orderBy('name')->get();

        return response()->json($users->map(fn (User $user) => $this->payload($user))->values()->all());
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $sportIds = array_map('intval', $request->input('sportIds', []));
        $socioEventIds = array_map('intval', $request->input('socioEventIds', []));
        if (! count($sportIds) && ! count($socioEventIds)) {
            return response()->json(['message' => 'Assign at least one sport or socio event.'], 422);
        }
        $this->ensureSocioEventsAvailable($socioEventIds);
        $sports = Sport::query()->whereIn('id', $sportIds)->orderBy('name')->get();
        $primarySport = $sports->first();
        $password = $request->string('password')->toString();

        $user = User::query()->create([
            'name' => trim($request->string('name')->toString()),
            'email' => strtolower(trim($request->string('email')->toString())),
            'password' => Hash::make($password),
            'role' => 'tm',
            'sport_id' => $primarySport?->id,
        ]);
        $user->sports()->sync($sportIds);
        $user->standingEvents()->sync($socioEventIds);

        return response()->json([...$this->payload($user->load(['sports', 'standingEvents'])), 'password' => $password], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $sportIds = array_map('intval', $request->input('sportIds', []));
        $socioEventIds = array_map('intval', $request->input('socioEventIds', []));
        if (! count($sportIds) && ! count($socioEventIds)) {
            return response()->json(['message' => 'Assign at least one sport or socio event.'], 422);
        }
        $this->ensureSocioEventsAvailable($socioEventIds, $user->id);
        $sports = Sport::query()->whereIn('id', $sportIds)->orderBy('name')->get();
        $user->name = trim($request->string('name')->toString());
        $user->email = strtolower(trim($request->string('email')->toString()));
        $user->sport_id = $sports->firstWhere('id', $sportIds[0] ?? null)?->id;
        if ($request->filled('password')) {
            $user->password = Hash::make($request->string('password')->toString());
        }
        $user->save();
        $user->sports()->sync($sportIds);
        $user->standingEvents()->sync($socioEventIds);

        return response()->json($this->payload($user->load(['sports', 'standingEvents'])));
    }

    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'sportIds' => $user->sports->pluck('id')->values(),
            'sportNames' => $user->sports->pluck('name')->values(),
            'socioEventIds' => $user->standingEvents->pluck('id')->values(),
            'socioEventNames' => $user->standingEvents->map(fn ($event) => $event->name ?: $event->event_key)->values(),
        ];
    }

    private function ensureSocioEventsAvailable(array $socioEventIds, ?int $exceptUserId = null): void
    {
        $assignedEventIds = User::query()
            ->where('role', 'tm')
            ->when($exceptUserId !== null, fn ($query) => $query->where('id', '!=', $exceptUserId))
            ->whereHas('standingEvents', fn ($query) => $query->whereIn('intrams_event_definitions.id', $socioEventIds))
            ->with('standingEvents:id')
            ->get()
            ->flatMap(fn (User $user) => $user->standingEvents->pluck('id'))
            ->unique()
            ->values();

        if ($assignedEventIds->isNotEmpty()) {
            throw ValidationException::withMessages([
                'socioEventIds' => ['Each socio event can only be assigned to one tournament manager.'],
            ]);
        }
    }
}