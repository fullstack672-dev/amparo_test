import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CatalogService, CatalogItem, CatalogResponse } from '../../services/catalog.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-juzgados-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './juzgados-page.component.html',
  styleUrls: ['./juzgados-page.component.css']
})
export default class JuzgadosPageComponent implements OnInit {
  juzgados: CatalogItem[] = [];
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
  juzgadoForm: FormGroup;
  isEditing = false;
  editingId: number | null = null;
  showForm = false;

  constructor(
    private catalogService: CatalogService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.juzgadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadJuzgados();
  }

  loadJuzgados(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.catalogService.getJuzgados(this.currentPage, this.itemsPerPage, this.searchTerm, this.activoFilter)
      .subscribe({
        next: (response: CatalogResponse) => {
          this.juzgados = response.data;
          this.currentPage = response.pagination.currentPage;
          this.totalPages = response.pagination.totalPages;
          this.totalItems = response.pagination.totalItems;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading juzgados:', error);
          this.errorMessage = error.error?.message || 'Error al cargar los juzgados';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadJuzgados();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadJuzgados();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadJuzgados();
  }

  onAdd(): void {
    this.isEditing = false;
    this.editingId = null;
    this.juzgadoForm.reset({ activo: true });
    this.showForm = true;
  }

  onEdit(juzgado: CatalogItem): void {
    this.isEditing = true;
    this.editingId = juzgado.id;
    this.juzgadoForm.patchValue({
      nombre: juzgado.nombre,
      descripcion: juzgado.descripcion || '',
      activo: juzgado.activo
    });
    this.showForm = true;
  }

  onCancel(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.juzgadoForm.reset();
  }

  onSubmit(): void {
    if (this.juzgadoForm.invalid) {
      this.juzgadoForm.markAllAsTouched();
      return;
    }

    const formData = this.juzgadoForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    if (this.isEditing && this.editingId) {
      // Update existing juzgado
      this.catalogService.updateJuzgado(this.editingId, formData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadJuzgados();
          this.onCancel();
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: (error) => {
          console.error('Error updating juzgado:', error);
          this.errorMessage = error.error?.message || 'Error al actualizar el juzgado';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    } else {
      // Create new juzgado
      this.catalogService.createJuzgado(formData).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadJuzgados();
          this.onCancel();
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: (error) => {
          console.error('Error creating juzgado:', error);
          this.errorMessage = error.error?.message || 'Error al crear el juzgado';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    }
  }

  onDelete(juzgado: CatalogItem): void {
    if (confirm(`¿Está seguro de que desea eliminar el juzgado "${juzgado.nombre}"?`)) {
      this.isLoading = true;
      this.errorMessage = '';

      this.catalogService.deleteJuzgado(juzgado.id).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.loadJuzgados();
          this.isLoading = false;
          setTimeout(() => this.successMessage = '', 2000);
        },
        error: (error) => {
          console.error('Error deleting juzgado:', error);
          this.errorMessage = error.error?.message || 'Error al eliminar el juzgado';
          this.isLoading = false;
          setTimeout(() => this.errorMessage = '', 2000);
        }
      });
    }
  }

  getFieldError(fieldName: string): string | null {
    const field = this.juzgadoForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.juzgadoForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
