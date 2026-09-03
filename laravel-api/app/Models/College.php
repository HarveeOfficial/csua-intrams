<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class College extends Model
{
    use HasFactory;

    protected $table = 'intrams_colleges';

    protected $fillable = [
        'code',
        'name',
        'color',
        'photo_url',
    ];

    public function getRouteKeyName(): string
    {
        return 'code';
    }

    public function eventScores(): HasMany
    {
        return $this->hasMany(CollegeEventScore::class, 'college_id');
    }

    public function scheduleTeams(): HasMany
    {
        return $this->hasMany(ScheduleEntryTeam::class, 'college_id');
    }
}
