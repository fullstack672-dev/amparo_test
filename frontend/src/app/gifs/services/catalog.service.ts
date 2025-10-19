import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CatalogItem {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  // Juzgados specific fields - matching Cat_Juzgados table
  IdJuzgadoPJHGO?: number;
  Clave?: string;
  Correo?: string;
  TipoJuicio?: string;
  IdDistrito?: number;
  organo_impartidor_justicia?: number;
  // District information
  distrito_nombre?: string;
  // Allow bracket notation access
  [key: string]: any;
}

export interface CatalogResponse {
  success: boolean;
  data: CatalogItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CatalogCreateRequest {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  // Juzgados specific fields
  clave?: string;
  tipoJuicio?: string;
  idDistrito?: number;
  correo?: string;
}

export interface CatalogUpdateRequest {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  // Juzgados specific fields
  clave?: string;
  tipoJuicio?: string;
  idDistrito?: number;
  correo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Juzgados CRUD operations
  getJuzgados(page: number = 1, limit: number = 10, search: string = '', activo: string = ''): Observable<CatalogResponse> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (search) params.set('search', search);
    if (activo !== '') params.set('activo', activo);

    return this.http.get<CatalogResponse>(`${this.apiUrl}/juzgados?${params.toString()}`, {
      headers: this.getHeaders()
    });
  }

  getJuzgado(id: number): Observable<{ success: boolean; data: CatalogItem }> {
    return this.http.get<{ success: boolean; data: CatalogItem }>(`${this.apiUrl}/juzgados/${id}`, {
      headers: this.getHeaders()
    });
  }

  createJuzgado(data: CatalogCreateRequest): Observable<{ success: boolean; message: string; data: CatalogItem }> {
    return this.http.post<{ success: boolean; message: string; data: CatalogItem }>(`${this.apiUrl}/juzgados`, data, {
      headers: this.getHeaders()
    });
  }

  updateJuzgado(id: number, data: CatalogUpdateRequest): Observable<{ success: boolean; message: string; data: CatalogItem }> {
    return this.http.put<{ success: boolean; message: string; data: CatalogItem }>(`${this.apiUrl}/juzgados/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  // Get districts for juzgados
  getDistritos(): Observable<{ success: boolean; data: CatalogItem[] }> {
    return this.http.get<{ success: boolean; data: CatalogItem[] }>(`${this.apiUrl}/catalogs/distritos`, {
      headers: this.getHeaders()
    });
  }

  deleteJuzgado(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/juzgados/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Perfiles CRUD operations
  getPerfiles(page: number = 1, limit: number = 10, search: string = '', activo: string = ''): Observable<CatalogResponse> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (search) params.set('search', search);
    if (activo !== '') params.set('activo', activo);

    return this.http.get<CatalogResponse>(`${this.apiUrl}/perfiles?${params.toString()}`, {
      headers: this.getHeaders()
    });
  }

  getPerfil(id: number): Observable<{ success: boolean; data: CatalogItem }> {
    return this.http.get<{ success: boolean; data: CatalogItem }>(`${this.apiUrl}/perfiles/${id}`, {
      headers: this.getHeaders()
    });
  }

  createPerfil(data: CatalogCreateRequest): Observable<{ success: boolean; message: string; data: CatalogItem }> {
    return this.http.post<{ success: boolean; message: string; data: CatalogItem }>(`${this.apiUrl}/perfiles`, data, {
      headers: this.getHeaders()
    });
  }

  updatePerfil(id: number, data: CatalogUpdateRequest): Observable<{ success: boolean; message: string; data: CatalogItem }> {
    return this.http.put<{ success: boolean; message: string; data: CatalogItem }>(`${this.apiUrl}/perfiles/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deletePerfil(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/perfiles/${id}`, {
      headers: this.getHeaders()
    });
  }
}
