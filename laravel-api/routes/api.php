<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollegeController;
use App\Http\Controllers\Api\DownloadableFileController;
use App\Http\Controllers\Api\EventDefinitionController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\SportController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::get('/colleges', [CollegeController::class, 'index']);
Route::get('/colleges/{college:code}', [CollegeController::class, 'show']);

Route::get('/schedule', [ScheduleController::class, 'index']);

Route::get('/sports', [SportController::class, 'index']);
Route::get('/events', [EventDefinitionController::class, 'index']);
Route::get('/downloadable-files', [DownloadableFileController::class, 'index']);
Route::get('/downloadable-files/{filename}/download', [DownloadableFileController::class, 'download']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::post('/events', [EventDefinitionController::class, 'store']);
    Route::patch('/events/{event}', [EventDefinitionController::class, 'update']);
    Route::delete('/events/{event}', [EventDefinitionController::class, 'destroy']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::patch('/auth/password', [AuthController::class, 'updatePassword']);

    // schedule: accessible to both admin and tm
    Route::post('/schedule', [ScheduleController::class, 'store']);
    Route::patch('/schedule/{id}', [ScheduleController::class, 'updateWinner']);
    Route::delete('/schedule/{id}', [ScheduleController::class, 'destroy']);
    Route::patch('/colleges/{college:code}/standing', [CollegeController::class, 'updateStanding']);
    Route::delete('/colleges/{college:code}/standing', [CollegeController::class, 'deleteStanding']);

    // admin-only routes
    Route::middleware(EnsureAdmin::class)->group(function (): void {
        Route::post('/downloadable-files', [DownloadableFileController::class, 'store']);
        Route::delete('/downloadable-files/{filename}', [DownloadableFileController::class, 'destroy']);

        Route::post('/colleges', [CollegeController::class, 'store']);
        Route::patch('/colleges/{college:code}', [CollegeController::class, 'updateEvents']);

        Route::post('/sports', [SportController::class, 'store']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users', [UserController::class, 'index']);
        Route::patch('/users/{user}', [UserController::class, 'update']);
        Route::patch('/sports/{sport}', [SportController::class, 'update']);
        Route::delete('/sports/{sport}', [SportController::class, 'destroy']);
    });
});
