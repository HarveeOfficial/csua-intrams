<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intrams_user_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('intrams_users')->cascadeOnDelete();
            $table->foreignId('event_definition_id')->constrained('intrams_event_definitions')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'event_definition_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intrams_user_events');
    }
};