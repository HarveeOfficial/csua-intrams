<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreScheduleEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sport' => ['nullable', 'string', 'max:255'],
            'standing_type' => ['nullable', 'string', 'in:sports,socio'],
            'event_definition_id' => ['nullable', 'integer', 'exists:intrams_event_definitions,id'],
            'category' => ['nullable', 'string', 'max:255'],
            'event' => ['nullable', 'string', 'max:255'],
            'game' => ['required', 'integer', 'min:1'],
            'scheduledAt' => ['nullable', 'date'],
            'venue' => ['nullable', 'string', 'max:255'],
            'teams' => ['required', 'array', 'min:2'],
            'teams.*' => ['required', 'string', 'max:100'],
            'type' => ['required', 'in:h2h,multi'],
            'winner' => ['nullable', 'string', 'max:100'],
            'createdAt' => ['nullable', 'integer', 'min:0'],
            'updatedAt' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $teams = $this->input('teams', []);
            $uniqueTeams = collect($teams)->map(fn (mixed $team) => mb_strtoupper(trim((string) $team)))->filter()->unique();

            if ($this->input('type') === 'h2h' && $uniqueTeams->count() !== 2) {
                $validator->errors()->add('teams', 'Head-to-head schedules require exactly 2 unique teams.');
            }

            $winner = trim((string) $this->input('winner', ''));
            if ($winner !== '' && ! $uniqueTeams->contains(mb_strtoupper($winner))) {
                $validator->errors()->add('winner', 'Winner must be one of the selected teams.');
            }
        });
    }
}
