<?php

namespace Tests\Feature;

use App\Models\Poll;
use App\Models\PollVote;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PollsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_voter_can_remove_their_vote_for_a_poll(): void
    {
        $poll = Poll::query()->create([
            'title' => 'Favorite snack',
            'active' => true,
        ]);

        $option = $poll->options()->create([
            'text' => 'Burger',
            'image_path' => null,
            'vote_count' => 1,
        ]);

        PollVote::query()->create([
            'poll_id' => $poll->id,
            'poll_option_id' => $option->id,
            'voter_identifier' => 'voter-123',
        ]);

        $response = $this->deleteJson("/api/polls/{$poll->id}/vote", [
            'voter_id' => 'voter-123',
        ]);

        $response->assertOk();
        $this->assertDatabaseMissing('poll_votes', [
            'poll_id' => $poll->id,
            'voter_identifier' => 'voter-123',
        ]);
        $this->assertDatabaseHas('poll_options', [
            'id' => $option->id,
            'vote_count' => 0,
        ]);
    }

    public function test_poll_images_use_the_live_https_host_in_the_response(): void
    {
        $poll = Poll::query()->create([
            'title' => 'UM Shirt Design',
            'active' => true,
        ]);

        $poll->options()->create([
            'text' => 'UM Shirt Design #1',
            'image_path' => 'poll-options/shirt-design.jpg',
            'vote_count' => 0,
        ]);

        $response = $this->withServerVariables([
            'HTTPS' => 'on',
            'HTTP_HOST' => 'api.intrams.csuaparri.net',
        ])->getJson('/api/polls');

        $response->assertOk()->assertJsonPath('0.options.0.imageUrl', 'https://api.intrams.csuaparri.net/api/polls/'.$poll->id.'/options/'.$poll->options()->first()->id.'/image');
    }
}
