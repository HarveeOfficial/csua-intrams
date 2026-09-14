<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\College;
use App\Models\OverallChampionSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OverallChampionController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = OverallChampionSetting::query()->get()->keyBy('standing_type');

        return response()->json([
            'sports' => $this->transform($settings->get('sports')),
            'socio' => $this->transform($settings->get('socio')),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'standing_type' => ['required', 'string', 'in:sports,socio'],
            'champion_college_code' => ['nullable', 'string', 'exists:intrams_colleges,code'],
            'first_runner_up_college_code' => ['nullable', 'string', 'exists:intrams_colleges,code'],
            'second_runner_up_college_code' => ['nullable', 'string', 'exists:intrams_colleges,code'],
        ]);

        $setting = OverallChampionSetting::query()->firstOrNew(['standing_type' => $data['standing_type']]);

        $setting->champion_college_code = $data['champion_college_code'] ?? null;
        $setting->first_runner_up_college_code = $data['first_runner_up_college_code'] ?? null;
        $setting->second_runner_up_college_code = $data['second_runner_up_college_code'] ?? null;
        $setting->save();

        return response()->json($this->transform($setting));
    }

    private function transform(?OverallChampionSetting $setting): array
    {
        return [
            'champion' => $this->collegeSummary($setting?->champion_college_code),
            'firstRunnerUp' => $this->collegeSummary($setting?->first_runner_up_college_code),
            'secondRunnerUp' => $this->collegeSummary($setting?->second_runner_up_college_code),
        ];
    }

    private function collegeSummary(?string $code): ?array
    {
        if (! $code) {
            return null;
        }

        $college = College::query()->where('code', $code)->first();
        if (! $college) {
            return null;
        }

        return [
            'id' => $college->code,
            'name' => $college->name,
            'color' => $college->color,
            'photo_url' => $college->photo_url,
        ];
    }
}
