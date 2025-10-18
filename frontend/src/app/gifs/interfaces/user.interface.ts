export interface User {
  IdUsuario: number;
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
  Eliminado: number;
  isSuperAdmin?: boolean;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  Nombre: string;
  APaterno: string;
  AMaterno: string;
  Usuario: string;
  Clave: string;
  confirmPassword: string;
  Correo: string;
  Telefono?: string;
  Extension?: string;
  id_perfil: number;
  organo_impartidor_justicia: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface CatalogItem {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  Clave?: string;
  Correo?: string;
  TipoJuicio?: string;
  IdDistrito?: number;
  [key: string]: any; // Allow additional properties
}
