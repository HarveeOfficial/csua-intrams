<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('intrams_colleges', function (Blueprint $table): void {
            $table->id();
            $table->string('code', 100)->unique();
            $table->string('name');
            $table->string('color', 100)->default('#475569');
            $table->text('photo_url')->nullable();
            $table->timestamps();
        });

        Schema::create('intrams_sports', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->unsignedInteger('player_count')->default(1);
            $table->timestamps();
        });

        Schema::create('intrams_event_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('intrams_event_definitions', function (Blueprint $table): void {
            $table->id();
            $table->string('event_key')->unique();
            $table->string('name')->nullable();
            $table->foreignId('sport_id')->nullable()->constrained('intrams_sports')->nullOnDelete();
            $table->foreignId('event_category_id')->nullable()->constrained('intrams_event_categories')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('intrams_college_event_scores', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('college_id')->constrained('intrams_colleges')->cascadeOnDelete();
            $table->foreignId('event_definition_id')->constrained('intrams_event_definitions')->cascadeOnDelete();
            $table->unsignedInteger('player_count')->default(1);
            $table->integer('points')->default(0);
            $table->timestamps();
            $table->unique(['college_id', 'event_definition_id'], 'intrams_college_event_scores_unique');
        });

        Schema::create('intrams_schedule_entries', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignId('sport_id')->constrained('intrams_sports')->cascadeOnDelete();
            $table->foreignId('event_category_id')->nullable()->constrained('intrams_event_categories')->nullOnDelete();
            $table->string('event_name')->nullable();
            $table->unsignedInteger('game');
            $table->enum('type', ['h2h', 'multi']);
            $table->foreignId('winner_college_id')->nullable()->constrained('intrams_colleges')->nullOnDelete();
            $table->unsignedBigInteger('legacy_created_at_ms')->nullable();
            $table->unsignedBigInteger('legacy_updated_at_ms')->nullable();
            $table->timestamps();
            $table->index(['sport_id', 'event_category_id', 'event_name', 'game'], 'intrams_schedule_entries_sort_idx');
        });

        Schema::create('intrams_schedule_entry_teams', function (Blueprint $table): void {
            $table->id();
            $table->uuid('schedule_entry_id');
            $table->foreign('schedule_entry_id')->references('id')->on('intrams_schedule_entries')->cascadeOnDelete();
            $table->foreignId('college_id')->constrained('intrams_colleges')->cascadeOnDelete();
            $table->unsignedInteger('slot')->default(1);
            $table->timestamps();
            $table->unique(['schedule_entry_id', 'college_id'], 'intrams_schedule_entry_teams_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('intrams_schedule_entry_teams');
        Schema::dropIfExists('intrams_schedule_entries');
        Schema::dropIfExists('intrams_college_event_scores');
        Schema::dropIfExists('intrams_event_definitions');
        Schema::dropIfExists('intrams_event_categories');
        Schema::dropIfExists('intrams_sports');
        Schema::dropIfExists('intrams_colleges');
    }
};
