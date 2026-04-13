/**
 * Servicio de autenticación.
 *
 * Contiene las funciones para gestionar la sesión del usuario:
 * - login: envía credenciales al backend y guarda el token en cookies
 * - getProfile: obtiene los datos completos del usuario (incluido el rol)
 * - logout: elimina las cookies de sesión
 * - restoreSession: al recargar la página, comprueba si hay una sesión
 *   válida guardada en cookies e intenta recuperarla
 *
 * Las cookies se usan en lugar de localStorage porque el middleware de
 * Next.js (que se ejecuta en el servidor) puede leerlas para proteger
 * rutas antes de que la página cargue.
 */
import Cookies from 'js-cookie';
import api from './api';

// Interfaz que define la forma de un usuario.
// Es el equivalente a un modelo/clase en Flutter o Java.
export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  activo: boolean;
  bloqueado: boolean;
  fotoPerfil: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

// Lo que devuelve el endpoint POST /users/login
interface LoginResponse {
  id: string;
  email: string;
  token: string;
}

/**
 * Inicia sesión: envía email y contraseña al backend.
 * Si es correcto, guarda el token JWT y el ID del usuario en cookies,
 * y después obtiene el perfil completo (para saber el rol).
 */
export async function login(email: string, clave: string): Promise<User> {
  const { data } = await api.post<LoginResponse>('/users/login', { email, clave });

  // Guardar token e ID en cookies para mantener la sesión
  Cookies.set('access_token', data.token);
  Cookies.set('user_id', data.id);

  // El login solo devuelve id, email y token, así que hacemos
  // una segunda petición para obtener el perfil completo (con el rol)
  const user = await getProfile(data.id);
  return user;
}

/**
 * Obtiene el perfil completo de un usuario por su ID.
 */
export async function getProfile(userId: string): Promise<User> {
  const { data } = await api.get<User>(`/users/${userId}`);
  return data;
}

/**
 * Cierra sesión eliminando las cookies de autenticación.
 */
export function logout() {
  Cookies.remove('access_token');
  Cookies.remove('user_id');
}

/**
 * Intenta restaurar la sesión al cargar la página.
 * Lee las cookies guardadas y, si existen, pide el perfil al backend.
 * Si el token ha expirado (el backend devuelve error), limpia las cookies.
 */
export async function restoreSession(): Promise<User | null> {
  const userId = Cookies.get('user_id');
  const token = Cookies.get('access_token');

  // Si no hay cookies, no hay sesión que restaurar
  if (!userId || !token) return null;

  try {
    return await getProfile(userId);
  } catch {
    // El token ha expirado o es inválido
    logout();
    return null;
  }
}
