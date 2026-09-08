<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleWinnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'winner' => ['nullable'],
            'winner.first' => ['nullable', 'string', 'max:100'],
            'winner.second' => ['nullable', 'string', 'max:100'],
            'winner.third' => ['nullable', 'string', 'max:100'],
            'scheduledAt' => ['nullable', 'date'],
            'venue' => ['nullable', 'string', 'max:255'],
            'sport' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category' => ['sometimes', 'nullable', 'string', 'max:255'],
            'event' => ['sometimes', 'nullable', 'string', 'max:255'],
            'game' => ['sometimes', 'integer', 'min:1'],
            'type' => ['sometimes', 'in:h2h,multi'],
            'teams' => ['sometimes', 'array', 'min:2'],
            'teams.*' => ['required', 'string', 'max:100'],
        ];
    }
}
