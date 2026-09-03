<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('intrams_schedule_entries', function (Blueprint $table): void {
            $table->json('multi_winners')->nullable()->after('winner_college_id');
        });
    }

    public function down(): void
    {
        Schema::table('intrams_schedule_entries', function (Blueprint $table): void {
            $table->dropColumn('multi_winners');
        });
    }
};