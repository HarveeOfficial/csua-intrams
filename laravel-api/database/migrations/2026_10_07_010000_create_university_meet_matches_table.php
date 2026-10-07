<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('university_meet_matches', function (Blueprint $table): void {
            $table->id();
            $table->unsignedInteger('game_number');
            $table->string('event_name');
            $table->string('category', 20);
            $table->string('team_a');
            $table->string('team_b');
            $table->unsignedSmallInteger('planned_games');
            $table->unsignedSmallInteger('games_won_a')->default(0);
            $table->unsignedSmallInteger('games_won_b')->default(0);
            $table->timestamps();
            $table->index(['event_name', 'category', 'game_number'], 'university_meet_match_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('university_meet_matches');
    }
};
