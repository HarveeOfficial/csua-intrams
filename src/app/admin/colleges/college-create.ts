import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { DataApi } from '../../data-api.service';

@Component({
  selector: 'app-college-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './college-create.html',
  styleUrl: './college-create.css',
})
export class CollegeCreate {
  private fb = inject(FormBuilder);
  private api = inject(DataApi);
  private router = inject(Router);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    id: ['', [Validators.required, Validators.pattern(/^[a-z0-9_-]+$/i)]],
    name: ['', Validators.required],
    color: ['#475569', Validators.required],
    photo_url: [''],
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Enter a college ID and name. The ID may contain only letters, numbers, hyphens, or underscores.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      const value = this.form.getRawValue();
      await firstValueFrom(this.api.createCollege({ ...value, id: value.id.toLowerCase(), events: {} }));
      await this.router.navigate(['/admin/colleges']);
    } catch (error: any) {
      this.error.set(error?.error?.message || 'Unable to create college.');
    } finally {
      this.saving.set(false);
    }
  }
}