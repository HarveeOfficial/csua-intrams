<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ProvisionUniversityMeetAdmin extends Command
{
    protected $signature = 'intrams:provision-um-admin';

    protected $description = 'Create the University Meet admin from deployment configuration if needed.';

    public function handle(): int
    {
        $email = mb_strtolower(trim((string) config('university_meet.admin_email')));

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Set UM_ADMIN_EMAIL in the deployed Laravel .env file.');

            return self::FAILURE;
        }

        $existing = User::query()->where('email', $email)->first();
        if ($existing) {
            if ($existing->role !== 'um_admin') {
                $this->error('UM_ADMIN_EMAIL already belongs to another role.');

                return self::FAILURE;
            }

            $this->info('University Meet admin already exists; password was left unchanged.');

            return self::SUCCESS;
        }

        $password = (string) config('university_meet.admin_password');
        if (mb_strlen($password) < 12) {
            $this->error('Set UM_ADMIN_PASSWORD to at least 12 characters in the deployed Laravel .env file.');

            return self::FAILURE;
        }

        User::query()->create([
            'name' => 'University Meet Admin',
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'um_admin',
        ]);

        $this->info('University Meet admin created.');

        return self::SUCCESS;
    }
}
