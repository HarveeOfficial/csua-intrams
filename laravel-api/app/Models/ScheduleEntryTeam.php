<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduleEntryTeam extends Model
{
    use HasFactory;

    protected $table = 'intrams_schedule_entry_teams';

    protected $fillable = [
        'schedule_entry_id',
        'college_id',
        'slot',
    ];

    public function scheduleEntry(): BelongsTo
    {
        return $this->belongsTo(ScheduleEntry::class, 'schedule_entry_id');
    }

    public function college(): BelongsTo
    {
        return $this->belongsTo(College::class, 'college_id');
    }
}
