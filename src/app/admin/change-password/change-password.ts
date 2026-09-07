import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '../../auth-api.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.html',
})
export class ChangePassword {
  private fb = inject(FormBuilder);
  private auth = inject(AuthApi);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', Validators.required],
  });

  async submit() {
    this.success.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Fill in your current password and a new password of at least 8 characters.');
      return;
    }

    const { current_password, new_password, confirm_password } = this.form.getRawValue();
    if (new_password !== confirm_password) {
      this.error.set('New password and confirmation do not match.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    try {
      await this.auth.changePassword(current_password, new_password);
      this.success.set('Password updated.');
      this.form.reset();
    } catch (error: any) {
      this.error.set(error?.error?.message || 'Unable to update password.');
    } finally {
      this.saving.set(false);
    }
  }
}
