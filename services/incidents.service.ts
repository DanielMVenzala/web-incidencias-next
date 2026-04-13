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

export async function getIncidents(): Promise<Incident[]> {
  const { data } = await api.get<Incident[]>('/incidents');
  return data;
}
