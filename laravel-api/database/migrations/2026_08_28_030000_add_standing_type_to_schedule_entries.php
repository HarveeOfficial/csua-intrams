<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('intrams_schedule_entries', function (Blueprint $table): void {
            $table->foreignId('event_definition_id')->nullable()->after('sport_id')->constrained('intrams_event_definitions')->nullOnDelete();
            $table->string('standing_type', 20)->default('sports')->after('event_definition_id');
            $table->index('standing_type');
        });
        Schema::table('intrams_schedule_entries', function (Blueprint $table): void {
            $table->foreignId('sport_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('intrams_schedule_entries', function (Blueprint $table): void {
            $table->dropForeign(['event_definition_id']);
            $table->dropIndex(['standing_type']);
            $table->dropColumn(['event_definition_id', 'standing_type']);
        });
    }
};