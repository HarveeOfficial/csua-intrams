<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCollegeEventsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'events' => ['present', 'array'],
            'events.*.playerCount' => ['nullable', 'integer', 'min:0'],
            'events.*.points' => ['nullable', 'integer'],
        ];
    }
}
