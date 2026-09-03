<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScheduleEntry extends Model
{
    use HasFactory;

    protected $table = 'intrams_schedule_entries';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'sport_id',
        'event_definition_id',
        'standing_type',
        'event_category_id',
        'event_name',
        'game',
        'type',
        'winner_college_id',
        'multi_winners',
        'legacy_created_at_ms',
        'legacy_updated_at_ms',
    ];

    protected function casts(): array
    {
        return [
            'multi_winners' => 'array',
        ];
    }

    public function sport(): BelongsTo
    {
        return $this->belongsTo(Sport::class, 'sport_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class, 'event_category_id');
    }

    public function eventDefinition(): BelongsTo
    {
        return $this->belongsTo(EventDefinition::class, 'event_definition_id');
    }

    public function winnerCollege(): BelongsTo
    {
        return $this->belongsTo(College::class, 'winner_college_id');
    }

    public function teams(): HasMany
    {
        return $this->hasMany(ScheduleEntryTeam::class, 'schedule_entry_id')->orderBy('slot');
    }
}
