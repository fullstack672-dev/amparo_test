import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CatalogService, CatalogItem, CatalogResponse } from '../../services/catalog.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfiles-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './perfiles-page.component.html',
  styleUrls: ['./perfiles-page.component.css']
})
export default class PerfilesPageComponent implements OnInit {
  perfiles: CatalogItem[] = [];
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  searchTerm = '';
  activoFilter = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Expose Math to template
  Math = Math;

  // Form for add/edit
  perfilForm: FormGroup;
  isEditing = false;
  editingId: number | null = null;
  showForm = false;

  constructor(
    private catalogService: CatalogService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.perfilForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadPerfiles();
  }

  loadPerfiles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.catalogService.getPerfiles(this.currentPage, this.itemsPerPage, this.searchTerm, this.activoFilter)
      .subscribe({
        next: (response: CatalogResponse) => {
          this.perfiles = response.data;
          this.currentPage = response.pagination.currentPage;
          this.totalPages = response.pagination.totalPages;
          this.totalItems = response.pagination.totalItems;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading perfiles:', error);
          this.errorMessage = error.error?.message || 'Error al cargar los perfiles';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPerfiles();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadPerfiles();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPerfiles();
  }

  onAdd(): void {
    this.isEditing = false;
    this.editingId = null;
    this.perfilForm.reset({ activo: true });
    this.showForm = true;
  }

  onEdit(perfil: CatalogItem): void {
    this.isEditing = true;
    this.editingId = perfil.id;
    this.perfilForm.patchValue({
      nombre: perfil.nombre,
      descripcion: perfil.descripcion || '',
      activo: perfil.activo
    });
    this.showForm = true;
  }

  onCancel(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.perfilForm.reset();
  }

  onSubmit(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    const formData = this.perfilForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditing && this.editingId) {
      // Update existing perfil
      this.catalogService.updatePerfil(this.editingId, formData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadPerfiles();
          this.onCancel();
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: (error) => {
          console.error('Error updating perfil:', error);
          this.errorMessage = error.error?.message || 'Error al actualizar el perfil';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    } else {
      // Create new perfil
      this.catalogService.createPerfil(formData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadPerfiles();
          this.onCancel();
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: (error) => {
          console.error('Error creating perfil:', error);
          this.errorMessage = error.error?.message || 'Error al crear el perfil';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    }
  }

  onDelete(perfil: CatalogItem): void {
    if (confirm(`¿Está seguro de que desea eliminar el perfil "${perfil.nombre}"?`)) {
      this.isLoading = true;
      this.errorMessage = '';

      this.catalogService.deletePerfil(perfil.id).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadPerfiles();
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: (error) => {
          console.error('Error deleting perfil:', error);
          this.errorMessage = error.error?.message || 'Error al eliminar el perfil';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.perfilForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.perfilForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
