<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OfficialResultSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfficialResultController extends Controller
{
    public function show(): JsonResponse
    {
        $setting = OfficialResultSetting::query()->first();

        return response()->json($this->transform($setting));
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'is_official' => ['required', 'boolean'],
        ]);

        $setting = OfficialResultSetting::query()->first() ?? new OfficialResultSetting();

        $setting->is_official = $data['is_official'];
        $setting->certified_by = $data['is_official'] ? $request->user()?->name : null;
        $setting->certified_at = $data['is_official'] ? now() : null;
        $setting->save();

        return response()->json($this->transform($setting));
    }

    private function transform(?OfficialResultSetting $setting): array
    {
        return [
            'isOfficial' => (bool) ($setting?->is_official ?? false),
            'certifiedBy' => $setting?->certified_by,
            'certifiedAt' => $setting?->certified_at?->toIso8601String(),
        ];
    }
}
