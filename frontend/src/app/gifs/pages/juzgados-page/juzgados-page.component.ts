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
  distritos: CatalogItem[] = [];
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

  // Trial type options
  tipoJuicioOptions = [
    { value: 'A', label: 'Amparo' },
    { value: 'C', label: 'Constitucional' },
    { value: 'L', label: 'Laboral' },
    { value: 'P', label: 'Penal' },
    { value: 'M', label: 'Mercantil' },
    { value: 'F', label: 'Familiar' }
  ];

  constructor(
    private catalogService: CatalogService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.juzgadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      clave: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(4)]],
      tipoJuicio: ['A', [Validators.required]],
      idDistrito: [1, [Validators.required]],
      correo: ['', [Validators.email, Validators.maxLength(255)]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadJuzgados();
    this.loadDistritos();
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

  loadDistritos(): void {
    this.catalogService.getDistritos().subscribe({
      next: (response) => {
        this.distritos = response.data;
      },
      error: (error) => {
        console.error('Error loading distritos:', error);
        // Don't show error to user, just log it
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
    this.juzgadoForm.reset({ 
      activo: true,
      tipoJuicio: 'A',
      idDistrito: this.distritos.length > 0 ? this.distritos[0].id : 1
    });
    this.showForm = true;
  }

  onEdit(juzgado: CatalogItem): void {
    this.isEditing = true;
    this.editingId = juzgado.id;
    this.juzgadoForm.patchValue({
      nombre: juzgado.nombre,
      clave: juzgado.Clave || '',
      tipoJuicio: juzgado.TipoJuicio || 'A',
      idDistrito: juzgado.IdDistrito || 1,
      correo: juzgado.Correo || '',
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
      if (field.errors['maxlength']) return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['email']) return 'Formato de correo electrónico inválido';
    }
    return null;
  }

  getTipoJuicioLabel(tipoJuicio: string): string {
    const option = this.tipoJuicioOptions.find(opt => opt.value === tipoJuicio);
    return option ? option.label : tipoJuicio || '-';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.juzgadoForm.get(fieldName);
    return !!(field?.errors && field.touched);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
