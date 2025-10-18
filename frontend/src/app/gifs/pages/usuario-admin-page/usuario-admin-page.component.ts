import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UserItem, UserResponse } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { CatalogItem } from '../../interfaces/user.interface';

@Component({
  selector: 'app-usuario-admin-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './usuario-admin-page.component.html',
  styleUrls: ['./usuario-admin-page.component.css']
})
export default class UsuarioAdminPageComponent implements OnInit {
  users: UserItem[] = [];
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  searchTerm = '';
  estadoFilter = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Catalogs
  juzgados: CatalogItem[] = [];
  perfiles: CatalogItem[] = [];

  // Expose Math to template
  Math = Math;

  // Form for add/edit
  userForm: FormGroup;
  isEditing = false;
  editingId: number | null = null;
  showForm = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      Nombre: ['', [Validators.required, Validators.minLength(2)]],
      APaterno: ['', [Validators.required, Validators.minLength(2)]],
      AMaterno: ['', [Validators.required, Validators.minLength(2)]],
      Usuario: ['', [Validators.required, Validators.minLength(3)]],
      Clave: ['', [Validators.minLength(6)]],
      Correo: ['', [Validators.required, Validators.email]],
      Telefono: [''],
      Extension: [''],
      id_perfil: ['', [Validators.required]],
      organo_impartidor_justicia: ['', [Validators.required]],
      Estado: ['A']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadCatalogs();
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

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUsers(this.currentPage, this.itemsPerPage, this.searchTerm, this.estadoFilter)
      .subscribe({
        next: (response: UserResponse) => {
          this.users = response.data;
          this.currentPage = response.pagination.currentPage;
          this.totalPages = response.pagination.totalPages;
          this.totalItems = response.pagination.totalItems;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.errorMessage = error.error?.message || 'Error al cargar los usuarios';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }

  onAdd(): void {
    this.isEditing = false;
    this.editingId = null;
    this.userForm.reset({ Estado: 'A' });
    this.userForm.get('Clave')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('Clave')?.updateValueAndValidity();
    this.showForm = true;
  }

  onEdit(user: UserItem): void {
    this.isEditing = true;
    this.editingId = user.IdUsuario;
    this.userForm.patchValue({
      Nombre: user.Nombre,
      APaterno: user.APaterno,
      AMaterno: user.AMaterno,
      Usuario: user.Usuario,
      Correo: user.Correo,
      Telefono: user.Telefono || '',
      Extension: user.Extension || '',
      id_perfil: user.id_perfil,
      organo_impartidor_justicia: user.organo_impartidor_justicia,
      Estado: user.Estado
    });
    // Password is optional when editing
    this.userForm.get('Clave')?.clearValidators();
    this.userForm.get('Clave')?.updateValueAndValidity();
    this.showForm = true;
  }

  onCancel(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.userForm.reset();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formData = this.userForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditing && this.editingId) {
      // Update existing user
      const updateData = { ...formData };
      delete updateData.Clave; // Don't send password on update
      
      this.userService.updateUser(this.editingId, updateData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadUsers();
          this.onCancel();
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.errorMessage = error.error?.message || 'Error al actualizar el usuario';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    } else {
      // Create new user
      this.userService.createUser(formData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadUsers();
          this.onCancel();
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.errorMessage = error.error?.message || 'Error al crear el usuario';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    }
  }

  onDelete(user: UserItem): void {
    if (confirm(`¿Está seguro de que desea eliminar al usuario "${user.Nombre} ${user.APaterno}"?`)) {
      this.isLoading = true;
      this.errorMessage = '';

      this.userService.deleteUser(user.IdUsuario).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadUsers();
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.errorMessage = error.error?.message || 'Error al eliminar el usuario';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    }
  }

  onToggleStatus(user: UserItem): void {
    this.userService.toggleUserStatus(user.IdUsuario).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.loadUsers();
        setTimeout(() => this.successMessage = '', 2000);
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
        this.errorMessage = error.error?.message || 'Error al cambiar el estado del usuario';
        setTimeout(() => this.errorMessage = '', 2000);
      }
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.userForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Ingrese un correo válido';
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
