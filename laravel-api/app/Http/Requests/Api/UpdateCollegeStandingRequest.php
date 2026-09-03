<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCollegeStandingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'event' => ['required', 'string', 'max:255'],
            'sport_id' => ['nullable', 'integer', 'exists:intrams_sports,id'],
            'standing_type' => ['nullable', 'string', 'in:sports,socio'],
            'playerCount' => ['nullable', 'integer', 'min:0'],
            'points' => ['required', 'integer'],
        ];
    }
}
