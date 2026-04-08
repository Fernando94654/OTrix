import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService, SignUpPayload } from '../../core/auth.service';
import { NotificationService } from '../../core/notifications/notification.service';

@Component({
  selector: 'app-signup-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  isSubmitting = false;
  errorMessage = '';
  isPasswordVisible = false;
  isConfirmPasswordVisible = false;

  readonly signupForm = this.fb.group({
    name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    birthday: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    company: [''],
    password: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]]
  });

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid || this.isSubmitting) {
      this.signupForm.markAllAsTouched();
      this.notifications.info('Please complete all required fields to create your account.');
      return;
    }

    if (this.signupForm.controls.password.value !== this.signupForm.controls.confirmPassword.value) {
      this.errorMessage = 'Passwords do not match.';
      this.notifications.error(this.errorMessage);
      return;
    }

    const birthdayValue = this.signupForm.controls.birthday.value;
    if (!birthdayValue) {
      this.errorMessage = 'Please provide a valid birthday.';
      this.notifications.error(this.errorMessage);
      return;
    }

    const payload: SignUpPayload = {
      name: this.signupForm.controls.name.value ?? '',
      last_name: this.signupForm.controls.last_name.value ?? '',
      email: this.signupForm.controls.email.value ?? '',
      password: this.signupForm.controls.password.value ?? '',
      birthday: new Date(birthdayValue).toISOString(),
      gender: (this.signupForm.controls.gender.value ?? 'OTHER') as SignUpPayload['gender']
    };

    const company = this.signupForm.controls.company.value?.trim();
    if (company) {
      payload.company = company;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      const response = await firstValueFrom(this.authService.signUp(payload));
      this.authService.saveToken(response.refresh_token);
      this.notifications.success('Account created successfully. Welcome to Otrix!');
      await this.router.navigate(['/videogame']);
    } catch {
      this.errorMessage = 'Signup error. Please verify your data and try again.';
      this.notifications.error(this.errorMessage);
    } finally {
      this.isSubmitting = false;
    }
  }
}
