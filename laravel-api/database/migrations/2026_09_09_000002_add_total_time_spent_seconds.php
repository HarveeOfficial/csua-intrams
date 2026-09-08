<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_analytics', function (Blueprint $table): void {
            $table->unsignedBigInteger('total_time_spent_seconds')->default(0)->after('avg_time_spent_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('site_analytics', function (Blueprint $table): void {
            $table->dropColumn('total_time_spent_seconds');
        });
    }
};