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
        ];
    }
}
