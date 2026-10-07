<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('university_meet_matches', function (Blueprint $table): void {
            $table->renameColumn('games_won_a', 'score_a');
            $table->renameColumn('games_won_b', 'score_b');
        });

        Schema::table('university_meet_matches', function (Blueprint $table): void {
            $table->dropColumn('planned_games');
        });
    }

    public function down(): void
    {
        Schema::table('university_meet_matches', function (Blueprint $table): void {
            $table->unsignedSmallInteger('planned_games')->default(10);
        });

        Schema::table('university_meet_matches', function (Blueprint $table): void {
            $table->renameColumn('score_a', 'games_won_a');
            $table->renameColumn('score_b', 'games_won_b');
        });
    }
};
