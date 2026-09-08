<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('official_result_settings', function (Blueprint $table): void {
            $table->id();
            $table->boolean('is_official')->default(false);
            $table->string('certified_by')->nullable();
            $table->timestamp('certified_at')->nullable();
            $table->timestamps();
        });

        // Seed the single settings row used by the app.
        \DB::table('official_result_settings')->insert([
            'is_official' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('official_result_settings');
    }
};
