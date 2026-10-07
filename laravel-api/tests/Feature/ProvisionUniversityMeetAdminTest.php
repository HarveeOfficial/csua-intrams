<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProvisionUniversityMeetAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_deployment_command_creates_admin_once_without_resetting_password(): void
    {
        config()->set('university_meet.admin_email', 'um@example.com');
        config()->set('university_meet.admin_password', 'initial-secret-123');

        $this->artisan('intrams:provision-um-admin')->assertExitCode(0);

        $user = User::query()->where('email', 'um@example.com')->firstOrFail();
        $this->assertSame('um_admin', $user->role);
        $this->assertTrue(Hash::check('initial-secret-123', $user->password));

        config()->set('university_meet.admin_password', null);
        $this->artisan('intrams:provision-um-admin')->assertExitCode(0);

        $this->assertDatabaseCount('intrams_users', 1);
        $this->assertTrue(Hash::check('initial-secret-123', $user->fresh()->password));
    }

    public function test_deployment_command_requires_a_configured_password_for_new_admin(): void
    {
        config()->set('university_meet.admin_email', 'um@example.com');
        config()->set('university_meet.admin_password', null);

        $this->artisan('intrams:provision-um-admin')->assertExitCode(1);
        $this->assertDatabaseCount('intrams_users', 0);
    }

    public function test_deployment_command_refuses_to_convert_an_existing_campus_user(): void
    {
        User::factory()->create(['email' => 'um@example.com', 'role' => 'admin']);
        config()->set('university_meet.admin_email', 'um@example.com');
        config()->set('university_meet.admin_password', 'initial-secret-123');

        $this->artisan('intrams:provision-um-admin')->assertExitCode(1);
        $this->assertDatabaseHas('intrams_users', ['email' => 'um@example.com', 'role' => 'admin']);
    }
}
