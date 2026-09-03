<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Sport extends Model
{
    use HasFactory;

    protected $table = 'intrams_sports';

    protected $fillable = [
        'name',
        'slug',
        'player_count',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(EventDefinition::class, 'sport_id');
    }

    public function scheduleEntries(): HasMany
    {
        return $this->hasMany(ScheduleEntry::class, 'sport_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'intrams_user_sports');
    }
}
