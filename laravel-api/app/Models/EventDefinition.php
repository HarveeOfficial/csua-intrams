<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EventDefinition extends Model
{
    use HasFactory;

    protected $table = 'intrams_event_definitions';

    protected $fillable = [
        'event_key',
        'name',
        'standing_type',
        'sport_id',
        'event_category_id',
    ];

    public function sport(): BelongsTo
    {
        return $this->belongsTo(Sport::class, 'sport_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class, 'event_category_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(CollegeEventScore::class, 'event_definition_id');
    }

    public function assignedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'intrams_user_events');
    }
}
