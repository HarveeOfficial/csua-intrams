<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('overall_champion_settings', function (Blueprint $table): void {
            $table->string('standing_type', 20)->default('sports')->after('id');
        });

        // Existing singleton row becomes the "sports" row.
        \DB::table('overall_champion_settings')->limit(1)->update(['standing_type' => 'sports']);

        // Seed the "socio" row.
        \DB::table('overall_champion_settings')->insert([
            'standing_type' => 'socio',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::table('overall_champion_settings', function (Blueprint $table): void {
            $table->unique('standing_type');
        });
    }

    public function down(): void
    {
        Schema::table('overall_champion_settings', function (Blueprint $table): void {
            $table->dropUnique(['standing_type']);
            $table->dropColumn('standing_type');
        });
    }
};
