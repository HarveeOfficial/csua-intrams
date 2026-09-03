<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateIntramsUser extends Command
{
    protected $signature = 'intrams:create-user {email} {password} {--role=admin}';

    protected $description = 'Create or update an intrams admin user.';

    public function handle(): int
    {
        $email = mb_strtolower(trim((string) $this->argument('email')));
        $password = (string) $this->argument('password');
        $role = trim((string) $this->option('role')) ?: 'admin';

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => strstr($email, '@', true) ?: $email,
                'password' => Hash::make($password),
                'role' => $role,
            ]
        );

        $this->info("Created or updated {$email}");

        return self::SUCCESS;
    }
}
