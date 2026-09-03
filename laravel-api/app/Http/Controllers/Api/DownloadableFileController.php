<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DownloadableFileController extends Controller
{
    private const DIRECTORY = 'downloadable-files';

    public function index(Request $request): JsonResponse
    {
        $files = collect(Storage::disk('public')->files(self::DIRECTORY))
            ->map(function (string $path) use ($request): array {
                return [
                    'name' => basename($path),
                    'url' => $this->downloadUrl($request, basename($path)),
                    'size' => Storage::disk('public')->size($path),
                    'uploadedAt' => Storage::disk('public')->lastModified($path),
                ];
            })
            ->sortByDesc('uploadedAt')
            ->values();

        return response()->json($files);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:25600'],
        ]);

        $file = $request->file('file');
        $extension = Str::lower($file->getClientOriginalExtension());
        $basename = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $filename = ($basename ?: 'download').($extension ? '.'.$extension : '');

        if (Storage::disk('public')->exists(self::DIRECTORY.'/'.$filename)) {
            return response()->json(['message' => "A file named \"{$filename}\" already exists."], 409);
        }

        $newHash = hash_file('sha256', $file->getRealPath());
        foreach (Storage::disk('public')->files(self::DIRECTORY) as $existingPath) {
            if (hash_file('sha256', Storage::disk('public')->path($existingPath)) === $newHash) {
                return response()->json(['message' => 'This file was already uploaded as "'.basename($existingPath).'".'], 409);
            }
        }

        $path = $file->storeAs(self::DIRECTORY, $filename, 'public');

        return response()->json([
            'name' => $filename,
            'url' => $this->downloadUrl($request, $filename),
            'size' => Storage::disk('public')->size($path),
            'uploadedAt' => Storage::disk('public')->lastModified($path),
        ], 201);
    }

    public function download(string $filename): BinaryFileResponse
    {
        if (basename($filename) !== $filename || ! Storage::disk('public')->exists(self::DIRECTORY.'/'.$filename)) {
            abort(404);
        }

        return response()->download(Storage::disk('public')->path(self::DIRECTORY.'/'.$filename), $filename);
    }

    public function destroy(string $filename): JsonResponse
    {
        if (basename($filename) !== $filename) {
            abort(404);
        }

        Storage::disk('public')->delete(self::DIRECTORY.'/'.$filename);

        return response()->json(status: 204);
    }

    private function downloadUrl(Request $request, string $filename): string
    {
        return $request->getSchemeAndHttpHost().'/api/downloadable-files/'.rawurlencode($filename).'/download';
    }
}