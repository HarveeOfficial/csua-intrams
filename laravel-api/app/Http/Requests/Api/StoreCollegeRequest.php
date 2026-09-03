<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreCollegeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => ['required', 'string', 'regex:/^[a-z0-9_-]+$/i', 'max:100'],
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:100'],
            'photo_url' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
