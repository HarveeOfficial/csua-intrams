<?php

namespace Tests\Feature;

use App\Models\College;
use App\Models\EventDefinition;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CollegesApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_colleges_returns_legacy_compatible_payload(): void
    {
        $college = College::query()->create([
            'code' => 'cics',
            'name' => 'College of Information and Computing Sciences',
            'color' => '#112233',
        ]);

        $event = EventDefinition::query()->create([
            'event_key' => 'Chess-M',
            'name' => 'Chess-M',
        ]);

        $college->eventScores()->create([
            'event_definition_id' => $event->id,
            'player_count' => 1,
            'points' => 5,
        ]);

        $response = $this->getJson('/api/colleges');

        $response->assertOk()->assertJsonFragment([
            'id' => 'cics',
            'name' => 'College of Information and Computing Sciences',
            'color' => '#112233',
        ]);

        $events = $response->json('0.events');
        $this->assertSame(5, $events['Chess-M']['points']);
        $this->assertSame(1, $events['Chess-M']['playerCount']);
    }

    public function test_post_college_requires_authentication(): void
    {
        $response = $this->postJson('/api/colleges', [
            'id' => 'cics',
            'name' => 'CICS',
        ]);

        $response->assertStatus(401);
    }

    public function test_authenticated_college_create_and_event_update(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($user);

        $createResponse = $this->postJson('/api/colleges', [
            'id' => 'cics',
            'name' => 'CICS',
            'color' => '#000000',
            'photo_url' => 'https://example.com/cics.png',
        ]);

        $createResponse->assertStatus(201)->assertJsonFragment([
            'id' => 'cics',
            'name' => 'CICS',
        ]);

        $patchResponse = $this->patchJson('/api/colleges/cics', [
            'events' => [
                'Volleyball-W' => ['playerCount' => 6, 'points' => 3],
                'Chess-M' => ['playerCount' => 1, 'points' => 5],
            ],
        ]);

        $patchResponse->assertOk();
        $events = $patchResponse->json('events');
        $this->assertSame(3, $events['Volleyball-W']['points']);
        $this->assertSame(6, $events['Volleyball-W']['playerCount']);
    }

    public function test_socio_standing_is_not_assigned_to_a_sport(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $college = College::query()->create([
            'code' => 'cics',
            'name' => 'CICS',
            'color' => '#000000',
        ]);
        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/colleges/cics/standing', [
            'event' => 'Cultural Dance',
            'standing_type' => 'socio',
            'playerCount' => 1,
            'points' => 5,
        ]);

        $response->assertOk();
        $response->assertJsonPath('events.Cultural Dance.standingType', 'socio');
        $response->assertJsonPath('events.Cultural Dance.sportId', null);
        $this->assertDatabaseHas('intrams_event_definitions', [
            'event_key' => 'Cultural Dance',
            'standing_type' => 'socio',
            'sport_id' => null,
        ]);
    }
}
