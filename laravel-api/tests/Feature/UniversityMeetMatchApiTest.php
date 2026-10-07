<?php

namespace Tests\Feature;

use App\Models\College;
use App\Models\UniversityMeetMatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UniversityMeetMatchApiTest extends TestCase
{
    use RefreshDatabase;

    private function matchInput(array $overrides = []): array
    {
        return array_replace([
            'game_number' => 1,
            'event_name' => 'Volleyball',
            'category' => 'women',
            'team_a' => 'Campus A',
            'team_b' => 'Campus B',
            'planned_games' => 10,
            'games_won_a' => 5,
            'games_won_b' => 5,
        ], $overrides);
    }

    public function test_tied_ten_game_series_gets_a_tiebreak_and_public_winner(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'um_admin']));

        $created = $this->postJson('/api/university-meet/matches', $this->matchInput());
        $created->assertCreated()->assertJsonPath('winner', null)->assertJsonPath('winsRequired', 6);
        $id = $created->json('id');

        $this->putJson("/api/university-meet/matches/{$id}", $this->matchInput(['games_won_a' => 6]))
            ->assertOk()
            ->assertJsonPath('winnerSide', 'a')
            ->assertJsonPath('winner', 'Campus A');

        $this->getJson('/api/university-meet/matches')
            ->assertOk()
            ->assertJsonPath('0.gamesWonA', 6)
            ->assertJsonPath('0.gamesWonB', 5)
            ->assertJsonPath('0.winner', 'Campus A');

        $this->deleteJson("/api/university-meet/matches/{$id}")->assertNoContent();
        $this->assertDatabaseCount('university_meet_matches', 0);
    }

    public function test_series_can_finish_early_and_rejects_impossible_scores(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'um_admin']));

        $this->postJson('/api/university-meet/matches', $this->matchInput([
            'planned_games' => 7,
            'games_won_a' => 4,
            'games_won_b' => 1,
        ]))->assertCreated()->assertJsonPath('winner', 'Campus A')->assertJsonPath('winsRequired', 4);

        $this->postJson('/api/university-meet/matches', $this->matchInput([
            'games_won_a' => 6,
            'games_won_b' => 6,
        ]))->assertUnprocessable()->assertJsonValidationErrors('games_won_a');

        $this->postJson('/api/university-meet/matches', $this->matchInput([
            'team_b' => 'campus a',
        ]))->assertUnprocessable()->assertJsonValidationErrors('team_b');
    }

    public function test_public_read_and_role_isolation(): void
    {
        UniversityMeetMatch::query()->create($this->matchInput([
            'games_won_a' => 6,
            'games_won_b' => 4,
        ]));
        College::query()->create(['code' => 'campus-a', 'name' => 'Campus A']);

        $this->getJson('/api/university-meet/matches')
            ->assertOk()
            ->assertJsonPath('0.winner', 'Campus A');
        $this->postJson('/api/university-meet/matches', $this->matchInput())->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $this->postJson('/api/university-meet/matches', $this->matchInput())->assertForbidden();

        Sanctum::actingAs(User::factory()->create(['role' => 'tm']));
        $this->postJson('/api/university-meet/matches', $this->matchInput())->assertForbidden();

        Sanctum::actingAs(User::factory()->create(['role' => 'um_admin']));
        $this->postJson('/api/schedule', [])->assertForbidden();
        $this->postJson('/api/events', [])->assertForbidden();
        $this->patchJson('/api/colleges/campus-a/standing', [])->assertForbidden();
    }
}
