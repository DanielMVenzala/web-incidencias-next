/**
 * Servicio de usuarios.
 *
 * Funciones para gestionar usuarios desde el panel de administración:
 * - getUsers: obtener la lista de usuarios con filtros opcionales
 * - toggleBlock: bloquear o desbloquear un usuario
 * - deleteUser: eliminar un usuario
 * - downloadUsersExcel: descargar informe Excel de usuarios
 */
import api from './api';

// Interfaz del usuario tal como lo devuelve GET /api/v1/users
export interface UserAdmin {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'usuario';
  activo: boolean;
  bloqueado: boolean;
  fotoPerfil: string | null;
  creadoEn: string;
  actualizadoEn: string;
  incidentes: string[]; // Array de IDs de incidencias creadas por el usuario
}

// Filtros opcionales para la consulta de usuarios
export interface UsersFilters {
  nombre?: string;
  email?: string;
  rol?: 'admin' | 'usuario';
  limit?: number;
  offset?: number;
}

/**
 * Obtiene la lista de usuarios. Solo accesible para administradores.
 * Soporta filtros por nombre (búsqueda parcial), email y rol.
 */
export async function getUsers(filters?: UsersFilters): Promise<UserAdmin[]> {
  const params = new URLSearchParams();
  if (filters?.nombre) params.append('nombre', filters.nombre);
  if (filters?.email) params.append('email', filters.email);
  if (filters?.rol) params.append('rol', filters.rol);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());

  const { data } = await api.get<UserAdmin[]>(`/users?${params.toString()}`);
  return data;
}

/**
 * Alterna el estado de bloqueo de un usuario.
 * Si está desbloqueado lo bloquea, y viceversa.
 */
export async function toggleBlock(userId: string): Promise<{ bloqueado: boolean; mensaje: string }> {
  const { data } = await api.patch(`/users/${userId}/toggle-block`);
  return data;
}

/**
 * Elimina un usuario permanentemente.
 */
export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/users/${userId}`);
}

/**
 * Descarga el informe Excel de usuarios.
 * El backend devuelve un archivo .xlsx que se descarga directamente.
 */
export async function downloadUsersExcel(): Promise<void> {
  const response = await api.get('/users/report/excel', {
    responseType: 'blob', // Indicar a Axios que espere un archivo binario
  });

  // Crear un enlace temporal para descargar el archivo
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'informe_usuarios.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
