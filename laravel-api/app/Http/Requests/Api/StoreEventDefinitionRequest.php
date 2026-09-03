<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventDefinitionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'standing_type' => ['required', 'string', 'in:sports,socio'],
            'sport_id' => ['nullable', 'integer', 'exists:intrams_sports,id'],
        ];
    }
}