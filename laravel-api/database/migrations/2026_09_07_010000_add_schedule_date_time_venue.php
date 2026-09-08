<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('intrams_schedule_entries', function (Blueprint $table): void {
            $table->dateTime('scheduled_at')->nullable()->after('game');
            $table->string('venue')->nullable()->after('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::table('intrams_schedule_entries', function (Blueprint $table): void {
            $table->dropColumn(['scheduled_at', 'venue']);
        });
    }
};
