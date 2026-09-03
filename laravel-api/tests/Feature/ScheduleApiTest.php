<?php

namespace Tests\Feature;

use App\Models\College;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ScheduleApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_schedule_create_update_winner_and_delete_flow(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($user);

        College::query()->create([
            'code' => 'cics',
            'name' => 'CICS',
            'color' => '#123456',
        ]);

        College::query()->create([
            'code' => 'cfas',
            'name' => 'CFAS',
            'color' => '#654321',
        ]);

        $createResponse = $this->postJson('/api/schedule', [
            'sport' => 'Basketball 5v5',
            'category' => 'Men',
            'event' => 'Basketball 5v5 Game 1',
            'game' => 1,
            'teams' => ['CICS', 'CFAS'],
            'type' => 'h2h',
            'winner' => null,
            'createdAt' => 1720000000000,
        ]);

        $createResponse->assertStatus(201)->assertJsonFragment([
            'sport' => 'Basketball 5v5',
            'category' => 'Men',
            'type' => 'h2h',
        ]);

        $id = $createResponse->json('id');
        $this->assertNotEmpty($id);

        $winnerResponse = $this->patchJson("/api/schedule/{$id}", [
            'winner' => 'CICS',
        ]);

        $winnerResponse->assertOk()->assertJsonFragment([
            'winner' => 'CICS',
        ]);

        $listResponse = $this->getJson('/api/schedule');
        $listResponse->assertOk();
        $this->assertCount(1, $listResponse->json());

        $deleteResponse = $this->deleteJson("/api/schedule/{$id}");
        $deleteResponse->assertNoContent();
    }
}
