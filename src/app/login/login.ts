import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthApi } from '../auth-api.service';
import { RECAPTCHA_SITE_KEY } from '../api-config';

declare const grecaptcha: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit, OnDestroy {
  fb = inject(FormBuilder);
  private auth = inject(AuthApi);
  private router = inject(Router); // Angular Router instance

  @ViewChild('recaptchaContainer') recaptchaContainer!: ElementRef<HTMLDivElement>;
  private widgetId: number | null = null;
  private static recaptchaReadyPromise: Promise<void> | null = null;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  authError = signal<string | null>(null);
  recaptchaToken = signal<string | null>(null);

  async ngAfterViewInit() {
    await this.loadRecaptchaScript();
    this.widgetId = grecaptcha.render(this.recaptchaContainer.nativeElement, {
      sitekey: RECAPTCHA_SITE_KEY,
      callback: (token: string) => this.recaptchaToken.set(token),
      'expired-callback': () => this.recaptchaToken.set(null),
      'error-callback': () => this.recaptchaToken.set(null),
    });
  }

  ngOnDestroy() {
    if (this.widgetId !== null && typeof grecaptcha !== 'undefined') {
      grecaptcha.reset(this.widgetId);
    }
  }

  private loadRecaptchaScript(): Promise<void> {
    // grecaptcha exists once the script tag loads, but .render() isn't ready
    // until the library signals it via the onload= query-param callback.
    if (Login.recaptchaReadyPromise) {
      return Login.recaptchaReadyPromise;
    }
    Login.recaptchaReadyPromise = new Promise((resolve) => {
      const callbackName = '__recaptchaOnLoad';
      (window as any)[callbackName] = () => resolve();
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?onload=${callbackName}&render=explicit`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    });
    return Login.recaptchaReadyPromise;
  }


  async onLogin() {
    if (!this.recaptchaToken()) {
      this.authError.set('Please complete the reCAPTCHA verification.');
      return;
    }
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        this.authError.set(null);
        await this.auth.login(email!, password!, this.recaptchaToken()!);
        const destination = this.auth.currentUser()?.role === 'admin'
          ? '/admin'
          : '/admin/event-sched-and-stats';
        this.router.navigate([destination]);
      } catch (err) {
        this.authError.set((err as any)?.error?.message || 'Login failed. Please try again.');
        if (this.widgetId !== null) {
          grecaptcha.reset(this.widgetId);
        }
        this.recaptchaToken.set(null);
      }
    }
  }
}

