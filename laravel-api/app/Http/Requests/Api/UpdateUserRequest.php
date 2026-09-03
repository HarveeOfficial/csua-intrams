<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('intrams_users', 'email')->ignore($this->route('user'))],
            'password' => ['nullable', 'string', 'min:8', 'max:255'],
            'sportIds' => ['present', 'array'],
            'sportIds.*' => ['integer', 'distinct', 'exists:intrams_sports,id'],
            'socioEventIds' => ['present', 'array'],
            'socioEventIds.*' => ['integer', 'distinct', 'exists:intrams_event_definitions,id'],
        ];
    }
}