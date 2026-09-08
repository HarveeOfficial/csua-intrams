<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_analytics', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('total_visits')->default(0);
            $table->unsignedInteger('avg_time_spent_minutes')->default(0);
            $table->json('visit_trend')->nullable();
            $table->json('time_trend')->nullable();
            $table->timestamps();
        });

        Schema::create('site_ratings', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('rating');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_ratings');
        Schema::dropIfExists('site_analytics');
    }
};
