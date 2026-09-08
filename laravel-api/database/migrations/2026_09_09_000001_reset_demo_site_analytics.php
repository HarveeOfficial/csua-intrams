<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('site_analytics')
            ->where('total_visits', 12840)
            ->where('avg_time_spent_minutes', 22)
            ->update([
                'total_visits' => 0,
                'avg_time_spent_minutes' => 0,
                'visit_trend' => json_encode([]),
                'time_trend' => json_encode([]),
            ]);
    }

    public function down(): void
    {
        DB::table('site_analytics')
            ->where('total_visits', 0)
            ->where('avg_time_spent_minutes', 0)
            ->update([
                'total_visits' => 12840,
                'avg_time_spent_minutes' => 22,
                'visit_trend' => json_encode([68, 82, 75, 94, 112, 124, 138]),
                'time_trend' => json_encode([12, 17, 16, 20, 24, 26, 22]),
            ]);
    }
};