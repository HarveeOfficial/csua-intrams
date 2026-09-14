<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\PollVote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PollController extends Controller
{
    private const DIRECTORY = 'poll-options';

    public function index(Request $request): JsonResponse
    {
        $onlyActive = ! $request->boolean('all');

        $polls = Poll::query()
            ->with('options')
            ->when($onlyActive, fn ($query) => $query->where('active', true))
            ->orderByDesc('id')
            ->get();

        return response()->json($polls->map(fn (Poll $poll) => $this->present($poll, $request)));
    }

    public function show(Request $request, Poll $poll): JsonResponse
    {
        $poll->load('options');

        return response()->json($this->present($poll, $request));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $poll = Poll::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'active' => $data['active'] ?? true,
        ]);

        return response()->json($this->present($poll->fresh('options'), $request), 201);
    }

    public function update(Request $request, Poll $poll): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'active' => ['sometimes', 'boolean'],
        ]);

        $poll->update($data);

        return response()->json($this->present($poll->fresh('options'), $request));
    }

    public function destroy(Poll $poll): JsonResponse
    {
        foreach ($poll->options as $option) {
            if ($option->image_path) {
                Storage::disk('public')->delete($option->image_path);
            }
        }

        $poll->delete();

        return response()->json(status: 204);
    }

    public function storeOption(Request $request, Poll $poll): JsonResponse
    {
        $data = $request->validate([
            'text' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'file', 'image', 'max:10240'],
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store(self::DIRECTORY, 'public');
        }

        $option = $poll->options()->create([
            'text' => $data['text'],
            'image_path' => $imagePath,
        ]);

        return response()->json($this->presentOption($option, $request), 201);
    }

    public function destroyOption(Poll $poll, PollOption $option): JsonResponse
    {
        if ($option->poll_id !== $poll->id) {
            abort(404);
        }

        if ($option->image_path) {
            Storage::disk('public')->delete($option->image_path);
        }

        $option->delete();

        return response()->json(status: 204);
    }

    public function vote(Request $request, Poll $poll): JsonResponse
    {
        $data = $request->validate([
            'option_id' => ['required', 'integer'],
            'voter_id' => ['required', 'string', 'max:100'],
        ]);

        if (! $poll->active) {
            throw ValidationException::withMessages(['poll' => 'This poll is no longer accepting votes.']);
        }

        $option = $poll->options()->where('id', $data['option_id'])->first();
        if (! $option) {
            abort(404, 'Poll option not found.');
        }

        $alreadyVoted = PollVote::query()
            ->where('poll_id', $poll->id)
            ->where('voter_identifier', $data['voter_id'])
            ->exists();

        if ($alreadyVoted) {
            throw ValidationException::withMessages(['voter_id' => 'You have already voted on this poll.']);
        }

        DB::transaction(function () use ($poll, $option, $data): void {
            PollVote::create([
                'poll_id' => $poll->id,
                'poll_option_id' => $option->id,
                'voter_identifier' => $data['voter_id'],
            ]);

            $option->increment('vote_count');
        });

        $poll->load('options');

        return response()->json($this->present($poll, $request));
    }

    private function present(Poll $poll, Request $request): array
    {
        $totalVotes = $poll->options->sum('vote_count');

        return [
            'id' => $poll->id,
            'title' => $poll->title,
            'description' => $poll->description,
            'active' => $poll->active,
            'totalVotes' => $totalVotes,
            'createdAt' => $poll->created_at?->timestamp,
            'options' => $poll->options->map(fn (PollOption $option) => $this->presentOption($option, $request))->values(),
        ];
    }

    private function presentOption(PollOption $option, Request $request): array
    {
        return [
            'id' => $option->id,
            'text' => $option->text,
            'imageUrl' => $option->image_path
                ? $request->getSchemeAndHttpHost().'/storage/'.$option->image_path
                : null,
            'voteCount' => $option->vote_count,
        ];
    }
}
