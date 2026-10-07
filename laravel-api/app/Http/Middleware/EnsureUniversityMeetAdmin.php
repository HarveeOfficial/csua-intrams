<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUniversityMeetAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== 'um_admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
