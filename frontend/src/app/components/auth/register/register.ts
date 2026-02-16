import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal('');

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/),
      ],
    ],
  });

  readonly ctrl = {
    username: this.registerForm.get('username')!,
    email: this.registerForm.get('email')!,
    password: this.registerForm.get('password')!,
  };

  onSubmit(): void {
    this.errorMessage.set('');

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const data = this.registerForm.value;

    this.authService
      .register({
        username: data.username!,
        email: data.email!,
        password: data.password!,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/profile']);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(
            error.error?.message || 'Unknown error while registering. Please try again.',
          );
        },
      });
  }
}
