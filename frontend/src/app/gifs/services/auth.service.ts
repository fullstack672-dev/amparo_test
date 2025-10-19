import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse, CatalogItem } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in
    this.checkStoredUser();
  }

  private checkStoredUser(): void {
    const token = localStorage.getItem('token');
    const currentUser = localStorage.getItem('currentUser');
    
    if (token && currentUser) {
      // Load user from localStorage first (for immediate access)
      try {
        const user = JSON.parse(currentUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
      
      // Validate token with backend and refresh user data
      this.getCurrentUser().subscribe({
        next: (response) => {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        },
        error: () => {
          // Token invalid or expired - clear storage
          this.logout();
        }
      });
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  getCurrentUser(): Observable<{ user: User }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`, { headers });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Catalog services
  getJuzgados(): Observable<{ data: CatalogItem[] }> {
    return this.http.get<{ data: CatalogItem[] }>(`${this.apiUrl}/catalogs/juzgados`);
  }

  getPerfiles(): Observable<{ data: CatalogItem[] }> {
    return this.http.get<{ data: CatalogItem[] }>(`${this.apiUrl}/catalogs/perfiles`);
  }

  // Super Administrator methods
  isSuperAdmin(): boolean {
    // Check if current user has admin profile (id_perfil === 1)
    const user = this.currentUserSubject.value;
    if (!user) return false;
    
    // Admin profile ID is 1
    return user.id_perfil === 1;
  }

  getCurrentUserData(): User | null {
    // Return current user from BehaviorSubject
    return this.currentUserSubject.value;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUserData();
    if (!user) return false;
    
    // Admin users (id_perfil === 1) have all permissions
    if (this.isSuperAdmin()) return true;
    
    // Add other permission checks based on user profile
    // This can be expanded based on your permission system
    return true; // For now, all logged-in users have basic permissions
  }

  canAccessAllPages(): boolean {
    // Admin users can access all pages
    return this.isSuperAdmin();
  }

  getCurrentUserDisplayName(): string {
    const user = this.getCurrentUserData();
    if (!user) return 'Usuario';
    
    // Build full name
    const fullName = [user.Nombre, user.APaterno, user.AMaterno]
      .filter(Boolean)
      .join(' ');
    
    return fullName || user.Usuario || 'Usuario';
  }
}
