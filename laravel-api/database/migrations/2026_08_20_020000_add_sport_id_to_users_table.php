<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('intrams_users', function (Blueprint $table): void {
            $table->foreignId('sport_id')->nullable()->after('role')
                ->constrained('intrams_sports')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('intrams_users', function (Blueprint $table): void {
            $table->dropForeign(['sport_id']);
            $table->dropColumn('sport_id');
        });
    }
};
