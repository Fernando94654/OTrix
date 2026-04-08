import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/notifications/notification.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  isSubmitting = false;
  errorMessage = '';
  isPasswordVisible = false;

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid || this.isSubmitting) {
      this.loginForm.markAllAsTouched();
      this.notifications.info('Please complete the required fields before signing in.');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const response = await firstValueFrom(this.authService.signIn({
        email: this.loginForm.controls.email.value ?? '',
        password: this.loginForm.controls.password.value ?? ''
      }));

      this.authService.saveToken(response.refresh_token);
      this.notifications.success('Welcome back! You are now signed in.');
      await this.router.navigate(['/videogame']);
    } catch {
      this.errorMessage = 'Login error. Verify your email and password.';
      this.notifications.error(this.errorMessage);
    } finally {
      this.isSubmitting = false;
    }
  }
}
