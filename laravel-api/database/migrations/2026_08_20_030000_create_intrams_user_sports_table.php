<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intrams_user_sports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('intrams_users')->cascadeOnDelete();
            $table->foreignId('sport_id')->constrained('intrams_sports')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'sport_id']);
        });

        DB::table('intrams_users')->whereNotNull('sport_id')->get(['id', 'sport_id'])
            ->each(function (object $user): void {
                DB::table('intrams_user_sports')->insert([
                    'user_id' => $user->id,
                    'sport_id' => $user->sport_id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('intrams_user_sports');
    }
};