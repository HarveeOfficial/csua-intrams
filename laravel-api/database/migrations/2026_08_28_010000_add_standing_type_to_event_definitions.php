<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('intrams_event_definitions', function (Blueprint $table): void {
            $table->string('standing_type', 20)->default('sports')->after('name');
            $table->index('standing_type');
        });
    }

    public function down(): void
    {
        Schema::table('intrams_event_definitions', function (Blueprint $table): void {
            $table->dropIndex(['standing_type']);
            $table->dropColumn('standing_type');
        });
    }
};