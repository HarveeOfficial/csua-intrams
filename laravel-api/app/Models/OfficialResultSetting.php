<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficialResultSetting extends Model
{
    protected $table = 'official_result_settings';

    protected $fillable = [
        'is_official',
        'certified_by',
        'certified_at',
    ];

    protected $casts = [
        'is_official' => 'boolean',
        'certified_at' => 'datetime',
    ];
}
