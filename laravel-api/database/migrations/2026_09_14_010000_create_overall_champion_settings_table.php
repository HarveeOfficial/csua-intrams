<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('overall_champion_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('champion_college_code', 100)->nullable();
            $table->string('first_runner_up_college_code', 100)->nullable();
            $table->string('second_runner_up_college_code', 100)->nullable();
            $table->timestamps();
        });

        // Seed the single settings row used by the app.
        \DB::table('overall_champion_settings')->insert([
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('overall_champion_settings');
    }
};
