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

    // Check for super administrator credentials
    if (identifier === 'admin@admin.com' && password === 'admin123') {
      // Super admin login - bypass database validation
      console.log('Super administrator login successful');
      
      // Create super admin user object
      const superAdminUser = {
        IdUsuario: 0,
        Nombre: 'Super Administrator',
        APaterno: 'Admin',
        AMaterno: 'System',
        Usuario: 'admin@admin.com',
        Correo: 'admin@admin.com',
        Telefono: '',
        Extension: '',
        id_perfil: 1, // Assuming 1 is admin profile
        organo_impartidor_justicia: 1, // Assuming 1 is a valid organo
        Estado: 'A',
        Eliminado: 0,
        isSuperAdmin: true
      };

      // Store super admin info in localStorage
      localStorage.setItem('currentUser', JSON.stringify(superAdminUser));
      localStorage.setItem('token', 'super-admin-token-' + Date.now());
      
      // Update auth service current user
      this.authService['currentUserSubject'].next(superAdminUser);
      
      this.isLoading = false;
      this.router.navigate(['/dashboard/usuario']);
      return;
    }

    // Regular user login - check database
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
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
