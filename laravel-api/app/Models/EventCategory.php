<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventCategory extends Model
{
    use HasFactory;

    protected $table = 'intrams_event_categories';

    protected $fillable = [
        'name',
        'slug',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(EventDefinition::class, 'event_category_id');
    }
}
