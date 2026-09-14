<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OverallChampionSetting extends Model
{
    protected $table = 'overall_champion_settings';

    protected $fillable = [
        'standing_type',
        'champion_college_code',
        'first_runner_up_college_code',
        'second_runner_up_college_code',
    ];
}
