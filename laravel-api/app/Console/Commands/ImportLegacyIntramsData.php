<?php

namespace App\Console\Commands;

use App\Models\College;
use App\Models\CollegeEventScore;
use App\Models\EventCategory;
use App\Models\EventDefinition;
use App\Models\ScheduleEntry;
use App\Models\ScheduleEntryTeam;
use App\Models\Sport;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ImportLegacyIntramsData extends Command
{
    protected $signature = 'intrams:import-legacy {--truncate : Clear normalized intrams tables before importing}';

    protected $description = 'Import legacy users/colleges/schedule tables into normalized intrams tables.';

    public function handle(): int
    {
        if ($this->option('truncate')) {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
            DB::table('intrams_schedule_entry_teams')->truncate();
            DB::table('intrams_schedule_entries')->truncate();
            DB::table('intrams_college_event_scores')->truncate();
            DB::table('intrams_event_definitions')->truncate();
            DB::table('intrams_event_categories')->truncate();
            DB::table('intrams_sports')->truncate();
            DB::table('intrams_colleges')->truncate();
            DB::table('intrams_users')->truncate();
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        }

        $userCount = $this->importUsers();
        $collegeCount = $this->importColleges();
        $scheduleCount = $this->importSchedule();

        $this->info("Imported {$userCount} users, {$collegeCount} colleges, and {$scheduleCount} schedule rows.");

        return self::SUCCESS;
    }

    private function importUsers(): int
    {
        if (! Schema::hasTable('users')) {
            $this->warn('Legacy table users not found. Skipping user import.');
            return 0;
        }

        $count = 0;
        $rows = DB::table('users')->get();
        foreach ($rows as $row) {
            $email = mb_strtolower(trim((string) ($row->email ?? '')));
            $hash = (string) ($row->password_hash ?? '');
            if ($email === '' || $hash === '') {
                continue;
            }

            User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => strstr($email, '@', true) ?: $email,
                    'password' => $hash,
                    'role' => (string) ($row->role ?? 'admin'),
                ]
            );

            $count++;
        }

        return $count;
    }

    private function importColleges(): int
    {
        if (! Schema::hasTable('colleges')) {
            $this->warn('Legacy table colleges not found. Skipping college import.');
            return 0;
        }

        $count = 0;
        $rows = DB::table('colleges')->get();
        foreach ($rows as $row) {
            $code = mb_strtolower(trim((string) ($row->id ?? '')));
            if ($code === '') {
                continue;
            }

            $college = College::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => (string) ($row->name ?? $code),
                    'color' => (string) ($row->color ?? '#475569'),
                    'photo_url' => $row->photo_url ?: null,
                ]
            );

            $eventsRaw = $row->events;
            $events = [];
            if (is_string($eventsRaw)) {
                $decoded = json_decode($eventsRaw, true);
                if (is_array($decoded)) {
                    $events = $decoded;
                }
            } elseif (is_array($eventsRaw)) {
                $events = $eventsRaw;
            }

            $eventDefinitionIds = [];
            foreach ($events as $eventKey => $data) {
                $key = trim((string) $eventKey);
                if ($key === '') {
                    continue;
                }

                $definition = EventDefinition::query()->firstOrCreate(
                    ['event_key' => $key],
                    ['name' => $key]
                );

                CollegeEventScore::query()->updateOrCreate(
                    [
                        'college_id' => $college->id,
                        'event_definition_id' => $definition->id,
                    ],
                    [
                        'player_count' => max(0, (int) ($data['playerCount'] ?? 1)),
                        'points' => (int) ($data['points'] ?? 0),
                    ]
                );

                $eventDefinitionIds[] = $definition->id;
            }

            if (count($eventDefinitionIds) > 0) {
                CollegeEventScore::query()
                    ->where('college_id', $college->id)
                    ->whereNotIn('event_definition_id', $eventDefinitionIds)
                    ->delete();
            }

            $count++;
        }

        return $count;
    }

    private function importSchedule(): int
    {
        if (! Schema::hasTable('schedule')) {
            $this->warn('Legacy table schedule not found. Skipping schedule import.');
            return 0;
        }

        $count = 0;
        $rows = DB::table('schedule')->get();
        foreach ($rows as $row) {
            $sportName = trim((string) ($row->sport ?? ''));
            if ($sportName === '') {
                continue;
            }

            $categoryName = trim((string) ($row->category ?? '-')) ?: '-';
            $sport = Sport::query()->firstOrCreate(
                ['slug' => Str::slug($sportName)],
                ['name' => $sportName]
            );
            $category = EventCategory::query()->firstOrCreate(
                ['slug' => Str::slug($categoryName)],
                ['name' => $categoryName]
            );

            $winnerCode = trim((string) ($row->winner ?? ''));
            $winnerCollege = $winnerCode === '' ? null : College::query()->whereRaw('LOWER(code) = ?', [mb_strtolower($winnerCode)])->first();

            $id = (string) ($row->id ?? Str::uuid()->toString());
            $entry = ScheduleEntry::query()->updateOrCreate(
                ['id' => $id],
                [
                    'sport_id' => $sport->id,
                    'event_category_id' => $category->id,
                    'event_name' => $row->event ?: null,
                    'game' => max(1, (int) ($row->game ?? 1)),
                    'type' => in_array(($row->type ?? 'h2h'), ['h2h', 'multi'], true) ? $row->type : 'h2h',
                    'winner_college_id' => $winnerCollege?->id,
                    'legacy_created_at_ms' => is_numeric($row->created_at ?? null) ? (int) $row->created_at : now()->valueOf(),
                    'legacy_updated_at_ms' => is_numeric($row->updated_at ?? null) ? (int) $row->updated_at : null,
                ]
            );

            ScheduleEntryTeam::query()->where('schedule_entry_id', $entry->id)->delete();

            $teamsRaw = $row->teams;
            $teams = [];
            if (is_string($teamsRaw)) {
                $decoded = json_decode($teamsRaw, true);
                if (is_array($decoded)) {
                    $teams = $decoded;
                }
            } elseif (is_array($teamsRaw)) {
                $teams = $teamsRaw;
            }

            $slot = 1;
            foreach (collect($teams)->map(fn (mixed $t) => mb_strtolower(trim((string) $t)))->filter()->unique()->values() as $teamCode) {
                $college = College::query()->whereRaw('LOWER(code) = ?', [$teamCode])->first();
                if (! $college) {
                    $college = College::query()->create([
                        'code' => $teamCode,
                        'name' => mb_strtoupper($teamCode),
                        'color' => '#475569',
                    ]);
                }

                ScheduleEntryTeam::query()->create([
                    'schedule_entry_id' => $entry->id,
                    'college_id' => $college->id,
                    'slot' => $slot,
                ]);
                $slot++;
            }

            $count++;
        }

        return $count;
    }
}
