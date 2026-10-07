<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SaveUniversityMeetMatchRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'event_name' => trim((string) $this->input('event_name', '')),
            'team_a' => trim((string) $this->input('team_a', '')),
            'team_b' => trim((string) $this->input('team_b', '')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'game_number' => ['required', 'integer', 'min:1'],
            'event_name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:men,women'],
            'team_a' => ['required', 'string', 'max:255', 'different:team_b'],
            'team_b' => ['required', 'string', 'max:255'],
            'planned_games' => ['required', 'integer', 'min:1', 'max:99'],
            'games_won_a' => ['required', 'integer', 'min:0'],
            'games_won_b' => ['required', 'integer', 'min:0'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $planned = (int) $this->input('planned_games');
            $a = (int) $this->input('games_won_a');
            $b = (int) $this->input('games_won_b');
            $winsRequired = intdiv($planned, 2) + 1;
            $maximumPlayed = $planned + ($planned % 2 === 0 ? 1 : 0);

            if ($a > $winsRequired || $b > $winsRequired || ($a === $winsRequired && $b === $winsRequired) || $a + $b > $maximumPlayed) {
                $validator->errors()->add('games_won_a', 'Games won must describe a valid series score.');
            }

            if (mb_strtolower((string) $this->input('team_a')) === mb_strtolower((string) $this->input('team_b'))) {
                $validator->errors()->add('team_b', 'Teams must be different.');
            }
        });
    }
}
