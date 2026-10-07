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
        'planned_games',
        'games_won_a',
        'games_won_b',
    ];

    protected function casts(): array
    {
        return [
            'game_number' => 'integer',
            'planned_games' => 'integer',
            'games_won_a' => 'integer',
            'games_won_b' => 'integer',
        ];
    }

    public function winnerSide(): ?string
    {
        $winsRequired = intdiv($this->planned_games, 2) + 1;

        if ($this->games_won_a >= $winsRequired) {
            return 'a';
        }

        return $this->games_won_b >= $winsRequired ? 'b' : null;
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
            'plannedGames' => $this->planned_games,
            'gamesWonA' => $this->games_won_a,
            'gamesWonB' => $this->games_won_b,
            'winsRequired' => intdiv($this->planned_games, 2) + 1,
            'winnerSide' => $winnerSide,
            'winner' => $winnerSide === 'a' ? $this->team_a : ($winnerSide === 'b' ? $this->team_b : null),
            'updatedAt' => $this->updated_at?->toIso8601String(),
        ];
    }
}
