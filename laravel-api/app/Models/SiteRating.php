<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteRating extends Model
{
    protected $table = 'site_ratings';

    protected $fillable = ['rating'];
}
