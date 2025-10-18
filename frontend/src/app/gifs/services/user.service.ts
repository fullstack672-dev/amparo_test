import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserItem {
  IdUsuario: number;
  Nombre: string;
  APaterno: string;
  AMaterno: string;
  Usuario: string;
  Correo: string;
  Telefono?: string;
  Extension?: string;
  id_perfil: number;
  perfil_nombre?: string;
  organo_impartidor_justicia: number;
  juzgado_nombre?: string;
  Estado: string;
  Eliminado: number;
}

export interface UserResponse {
  success: boolean;
  data: UserItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface UserCreateRequest {
  Nombre: string;
  APaterno: string;
  AMaterno: string;
  Usuario: string;
  Clave: string;
  Correo: string;
  Telefono?: string;
  Extension?: string;
  id_perfil: number;
  organo_impartidor_justicia: number;
}

export interface UserUpdateRequest {
  Nombre: string;
  APaterno: string;
  AMaterno: string;
  Usuario: string;
  Correo: string;
  Telefono?: string;
  Extension?: string;
  id_perfil: number;
  organo_impartidor_justicia: number;
  Estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getUsers(page: number = 1, limit: number = 10, search: string = '', estado: string = ''): Observable<UserResponse> {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    if (search) params.set('search', search);
    if (estado !== '') params.set('estado', estado);

    return this.http.get<UserResponse>(`${this.apiUrl}/users?${params.toString()}`, {
      headers: this.getHeaders()
    });
  }

  getUser(id: number): Observable<{ success: boolean; data: UserItem }> {
    return this.http.get<{ success: boolean; data: UserItem }>(`${this.apiUrl}/users/${id}`, {
      headers: this.getHeaders()
    });
  }

  createUser(data: UserCreateRequest): Observable<{ success: boolean; message: string; data: UserItem }> {
    return this.http.post<{ success: boolean; message: string; data: UserItem }>(`${this.apiUrl}/users`, data, {
      headers: this.getHeaders()
    });
  }

  updateUser(id: number, data: UserUpdateRequest): Observable<{ success: boolean; message: string; data: UserItem }> {
    return this.http.put<{ success: boolean; message: string; data: UserItem }>(`${this.apiUrl}/users/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteUser(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/users/${id}`, {
      headers: this.getHeaders()
    });
  }

  toggleUserStatus(id: number): Observable<{ success: boolean; message: string; data: UserItem }> {
    return this.http.patch<{ success: boolean; message: string; data: UserItem }>(`${this.apiUrl}/users/${id}/toggle-status`, {}, {
      headers: this.getHeaders()
    });
  }
}

