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
            'score_a' => 120,
            'score_b' => 115,
        ], $overrides);
    }

    public function test_scores_determine_winner_and_can_exceed_any_game_count(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'um_admin']));

        $created = $this->postJson('/api/university-meet/matches', $this->matchInput());
        $created->assertCreated()
            ->assertJsonPath('scoreA', 120)
            ->assertJsonPath('scoreB', 115)
            ->assertJsonPath('winner', 'Campus A')
            ->assertJsonMissingPath('plannedGames')
            ->assertJsonMissingPath('winsRequired');
        $id = $created->json('id');

        $this->putJson("/api/university-meet/matches/{$id}", $this->matchInput(['score_b' => 125]))
            ->assertOk()
            ->assertJsonPath('winnerSide', 'b')
            ->assertJsonPath('winner', 'Campus B');

        $this->getJson('/api/university-meet/matches')
            ->assertOk()
            ->assertJsonPath('0.scoreA', 120)
            ->assertJsonPath('0.scoreB', 125)
            ->assertJsonPath('0.winner', 'Campus B');

        $this->deleteJson("/api/university-meet/matches/{$id}")->assertNoContent();
        $this->assertDatabaseCount('university_meet_matches', 0);
    }

    public function test_tied_scores_have_no_winner_and_duplicate_team_names_are_rejected(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'um_admin']));

        $this->postJson('/api/university-meet/matches', $this->matchInput([
            'score_a' => 120,
            'score_b' => 120,
        ]))->assertCreated()->assertJsonPath('winner', null);

        $this->postJson('/api/university-meet/matches', $this->matchInput([
            'team_b' => 'campus a',
        ]))->assertUnprocessable()->assertJsonValidationErrors('team_b');

        $this->postJson('/api/university-meet/matches', $this->matchInput([
            'score_a' => 65536,
        ]))->assertUnprocessable()->assertJsonValidationErrors('score_a');
    }

    public function test_public_read_and_role_isolation(): void
    {
        UniversityMeetMatch::query()->create($this->matchInput([
            'score_a' => 18,
            'score_b' => 13,
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
