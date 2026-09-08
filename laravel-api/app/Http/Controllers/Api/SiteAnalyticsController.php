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
            'total_visits' => 0,
            'avg_time_spent_minutes' => 0,
            'visit_trend' => [],
            'time_trend' => [],
        ]);

        $avgRating = (float) SiteRating::query()->avg('rating');
        $ratingCount = SiteRating::query()->count();

        return response()->json([
            'totalVisits' => (int) $analytics->total_visits,
            'avgTimeSpentMinutes' => (int) $analytics->avg_time_spent_minutes,
            'visitTrend' => $analytics->visit_trend ?? [],
            'timeTrend' => $analytics->time_trend ?? [],
            'avgRating' => $avgRating,
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

    public function recordVisit(): JsonResponse
    {
        $analytics = SiteAnalytics::query()->firstOrCreate(['id' => 1]);
        $analytics->increment('total_visits');

        return response()->json(['totalVisits' => (int) $analytics->fresh()->total_visits]);
    }

    public function recordTimeSpent(Request $request): JsonResponse
    {
        $data = $request->validate([
            'duration_seconds' => ['required', 'integer', 'min:1', 'max:86400'],
        ]);

        $analytics = SiteAnalytics::query()->firstOrCreate(['id' => 1]);
        $analytics->increment('total_time_spent_seconds', $data['duration_seconds']);
        $analytics->refresh();
        $analytics->avg_time_spent_minutes = $analytics->total_visits > 0
            ? (int) round($analytics->total_time_spent_seconds / $analytics->total_visits / 60)
            : 0;
        $analytics->save();

        return response()->json(['avgTimeSpentMinutes' => $analytics->avg_time_spent_minutes]);
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
