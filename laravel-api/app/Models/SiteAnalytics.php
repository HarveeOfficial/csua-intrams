<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteAnalytics extends Model
{
    protected $table = 'site_analytics';

    protected $fillable = [
        'total_visits',
        'avg_time_spent_minutes',
        'visit_trend',
        'time_trend',
    ];

    protected $casts = [
        'visit_trend' => 'array',
        'time_trend' => 'array',
    ];
}
