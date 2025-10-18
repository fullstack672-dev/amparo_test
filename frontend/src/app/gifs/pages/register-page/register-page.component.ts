import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormUtils } from '../../../utils/form-utils';
import { CatalogItem } from '../../interfaces/user.interface';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export default class RegisterPageComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  formUtils = FormUtils;
  
  juzgados: CatalogItem[] = [];
  perfiles: CatalogItem[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      Nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      APaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      AMaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      Usuario: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      Clave: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      Correo: ['', [Validators.required, Validators.email]],
      Telefono: ['', [Validators.minLength(10), Validators.maxLength(20)]],
      Extension: ['', [Validators.maxLength(10)]],
      id_perfil: ['', [Validators.required]],
      organo_impartidor_justicia: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadCatalogs();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('Clave');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  loadCatalogs(): void {
    // Load judicial courts
    this.authService.getJuzgados().subscribe({
      next: (response) => {
        this.juzgados = response.data;
      },
      error: (error) => {
        console.error('Error loading juzgados:', error);
      }
    });

    // Load user profiles
    this.authService.getPerfiles().subscribe({
      next: (response) => {
        this.perfiles = response.data;
      },
      error: (error) => {
        console.error('Error loading perfiles:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formData = this.registerForm.value;
    // Remove confirmPassword from the data sent to backend
    const { confirmPassword, ...registerData } = formData;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.successMessage = 'Registro exitoso. Redirigiendo...';
        this.isLoading = false;
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.errorMessage = error.error?.message || 'Error al registrar usuario';
        this.isLoading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return null;

    if (field.errors['passwordMismatch']) {
      return 'Las contraseñas no coinciden';
    }

    return this.formUtils.getFieldError(this.registerForm, fieldName);
  }
}
