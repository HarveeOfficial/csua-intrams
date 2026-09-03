<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollegeEventScore extends Model
{
    use HasFactory;

    protected $table = 'intrams_college_event_scores';

    protected $fillable = [
        'college_id',
        'event_definition_id',
        'player_count',
        'points',
    ];

    public function college(): BelongsTo
    {
        return $this->belongsTo(College::class, 'college_id');
    }

    public function eventDefinition(): BelongsTo
    {
        return $this->belongsTo(EventDefinition::class, 'event_definition_id');
    }
}
