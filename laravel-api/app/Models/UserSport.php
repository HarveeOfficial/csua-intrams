<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSport extends Model
{
    protected $table = 'intrams_user_sports';

    protected $fillable = ['user_id', 'sport_id'];
}