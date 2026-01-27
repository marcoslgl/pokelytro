import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
    FormBuilder,
    ReactiveFormsModule,
    Validators,
    FormGroup
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    public errorMessage = '';

    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    constructor() {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/profile']);
        }
    }

    // --- GETTERS para acceder a los controles fácilmente en el HTML ---
    get email() {
        return this.loginForm.get('email');
    }

    get password() {
        return this.loginForm.get('password');
    }

    // --- LÓGICA DE ENVÍO ---
    onSubmit(): void {
        this.errorMessage = '';

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const { email, password } = this.loginForm.value;

        this.authService.login({ email, password }).subscribe({
            next: (response) => {
                console.log('Login exitoso:', response.message);
                this.router.navigate(['/profile']);
            },
            error: (error: HttpErrorResponse) => {
                this.errorMessage = error.error?.message || 'Error desconocido al iniciar sesión. Intenta de nuevo.';
                console.error('Error de Login:', error);
            }
        });
    }
}