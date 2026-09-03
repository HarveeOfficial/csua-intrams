<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(CollegeSeeder::class);
        

        User::query()->updateOrCreate(
            ['email' => env('INTRAMS_SEED_EMAIL', 'admin@example.com')],
            [
                'name' => 'Intrams Admin',
                'password' => env('INTRAMS_SEED_PASSWORD', 'password'),
                'role' => 'admin',
            ]
        );
    }
}
