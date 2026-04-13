/**
 * Servicio de incidencias.
 *
 * Funciones para obtener, filtrar y exportar incidencias.
 * Los filtros se envían como query params al backend, que soporta
 * búsqueda por texto, estado, prioridad, fechas, ordenación y paginación.
 */
import api from './api';

export interface Incident {
  id: string;
  titulo: string;
  descripcion: string;
  direccion: string;
  estado: 'pendiente' | 'en progreso' | 'resuelto' | 'rechazada';
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  latitud: number;
  longitud: number;
  creadoEn: string;
  actualizadoEn: string;
  imagenes: string[];
  usuario: string;
  comentarios: {
    id: number;
    texto: string;
    creadoEn: string;
    autor: { id: string; nombre: string } | null;
  }[];
}

// Filtros opcionales para la consulta de incidencias
export interface IncidentsFilters {
  search?: string;
  estado?: string;
  prioridad?: string;
  desde?: string;       // Formato "YYYY-MM-DD"
  hasta?: string;
  orderBy?: 'creadoEn' | 'actualizadoEn';
  order?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

/**
 * Obtiene incidencias con filtros opcionales.
 */
export async function getIncidents(filters?: IncidentsFilters): Promise<Incident[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.estado) params.append('estado', filters.estado);
  if (filters?.prioridad) params.append('prioridad', filters.prioridad);
  if (filters?.desde) params.append('desde', filters.desde);
  if (filters?.hasta) params.append('hasta', filters.hasta);
  if (filters?.orderBy) params.append('orderBy', filters.orderBy);
  if (filters?.order) params.append('order', filters.order);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());

  const { data } = await api.get<Incident[]>(`/incidents?${params.toString()}`);
  return data;
}

/**
 * Descarga el informe Excel de incidencias con los filtros aplicados.
 */
export async function downloadIncidentsExcel(filters?: IncidentsFilters): Promise<void> {
  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.estado) params.append('estado', filters.estado);
  if (filters?.prioridad) params.append('prioridad', filters.prioridad);
  if (filters?.desde) params.append('desde', filters.desde);
  if (filters?.hasta) params.append('hasta', filters.hasta);

  const response = await api.get(`/incidents/report/excel?${params.toString()}`, {
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'informe_incidencias.xlsx';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
