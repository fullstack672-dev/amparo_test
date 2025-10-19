import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormUtils } from '../../../utils/form-utils';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export default class LoginPageComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  formUtils = FormUtils;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { identifier, password } = this.loginForm.value;

    // All users (including admin@admin.com) go through regular login
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;
        
        // Check if user is admin and redirect to user management page
        if (response.user.id_perfil === 1) {
          // Admin user - redirect to user administration page
          this.router.navigate(['/dashboard/usuario-admin']);
        } else {
          // Regular user - redirect to their usuario page
          this.router.navigate(['/dashboard/usuario']);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Error al iniciar sesión';
        this.isLoading = false;
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
