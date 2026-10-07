<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniversityMeetMatch extends Model
{
    protected $fillable = [
        'game_number',
        'event_name',
        'category',
        'team_a',
        'team_b',
        'score_a',
        'score_b',
    ];

    protected function casts(): array
    {
        return [
            'game_number' => 'integer',
            'score_a' => 'integer',
            'score_b' => 'integer',
        ];
    }

    public function winnerSide(): ?string
    {
        if ($this->score_a > $this->score_b) {
            return 'a';
        }

        return $this->score_b > $this->score_a ? 'b' : null;
    }

    public function toPublicPayload(): array
    {
        $winnerSide = $this->winnerSide();

        return [
            'id' => $this->id,
            'gameNumber' => $this->game_number,
            'eventName' => $this->event_name,
            'category' => $this->category,
            'teamA' => $this->team_a,
            'teamB' => $this->team_b,
            'scoreA' => $this->score_a,
            'scoreB' => $this->score_b,
            'winnerSide' => $winnerSide,
            'winner' => $winnerSide === 'a' ? $this->team_a : ($winnerSide === 'b' ? $this->team_b : null),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
