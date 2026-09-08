<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteAnalytics;
use App\Models\SiteRating;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SiteAnalyticsController extends Controller
{
    public function index(): JsonResponse
    {
        $analytics = SiteAnalytics::query()->firstOrCreate([
            'id' => 1,
        ], [
            'total_visits' => 12840,
            'avg_time_spent_minutes' => 22,
            'visit_trend' => [68, 82, 75, 94, 112, 124, 138],
            'time_trend' => [12, 17, 16, 20, 24, 26, 22],
        ]);

        $avgRating = (float) SiteRating::query()->avg('rating');
        $ratingCount = SiteRating::query()->count();

        return response()->json([
            'totalVisits' => (int) $analytics->total_visits,
            'avgTimeSpentMinutes' => (int) $analytics->avg_time_spent_minutes,
            'visitTrend' => $analytics->visit_trend ?? [68, 82, 75, 94, 112, 124, 138],
            'timeTrend' => $analytics->time_trend ?? [12, 17, 16, 20, 24, 26, 22],
            'avgRating' => $avgRating ?: 4.8,
            'ratingCount' => $ratingCount,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'total_visits' => ['sometimes', 'integer', 'min:0'],
            'avg_time_spent_minutes' => ['sometimes', 'integer', 'min:0'],
            'visit_trend' => ['sometimes', 'array'],
            'time_trend' => ['sometimes', 'array'],
        ]);

        $analytics = SiteAnalytics::query()->firstOrCreate([
            'id' => 1,
        ]);

        $analytics->fill($data);
        $analytics->save();

        return $this->index();
    }

    public function submitRating(Request $request): JsonResponse
    {
        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        SiteRating::query()->create([
            'rating' => $data['rating'],
        ]);

        $avgRating = (float) SiteRating::query()->avg('rating');
        $ratingCount = SiteRating::query()->count();

        return response()->json([
            'rating' => $data['rating'],
            'average' => round($avgRating, 1),
            'count' => $ratingCount,
        ]);
    }
}
