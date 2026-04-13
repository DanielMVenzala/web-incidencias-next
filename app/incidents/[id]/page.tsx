/**
 * Página de detalle de una incidencia (/incidents/[id]).
 *
 * Muestra toda la información de una incidencia concreta:
 * - Datos principales: título, descripción, dirección, coordenadas
 * - Galería de imágenes adjuntas
 * - Timeline de comentarios ordenados por fecha
 * - Controles para cambiar estado y prioridad (selects)
 * - Formulario para añadir un nuevo comentario/nota
 * - Botón de eliminar con diálogo de confirmación
 *
 * El ID de la incidencia se obtiene de la URL (parámetro dinámico [id]).
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import {
  getIncidentById,
  updateIncident,
  addComment,
  deleteIncident,
  Incident,
} from '@/services/incidents.service';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para los controles de edición
  const [newEstado, setNewEstado] = useState('');
  const [newPrioridad, setNewPrioridad] = useState('');
  const [saving, setSaving] = useState(false);

  // Estado para añadir comentario
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  // Estado para el diálogo de eliminar
  const [showDelete, setShowDelete] = useState(false);

  // Estado para la galería de imágenes (imagen ampliada)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Cargar incidencia al montar
  useEffect(() => {
    getIncidentById(id)
      .then((data) => {
        setIncident(data);
        setNewEstado(data.estado);
        setNewPrioridad(data.prioridad);
      })
      .catch(() => setError('No se pudo cargar la incidencia'))
      .finally(() => setLoading(false));
  }, [id]);

  // Guardar cambios de estado o prioridad
  async function handleSave() {
    if (!incident) return;
    setSaving(true);
    try {
      const fields: Record<string, string> = {};
      if (newEstado !== incident.estado) fields.estado = newEstado;
      if (newPrioridad !== incident.prioridad) fields.prioridad = newPrioridad;

      if (Object.keys(fields).length > 0) {
        const updated = await updateIncident(id, fields);
        setIncident(updated);
      }
    } catch {
      // Error manejado por el interceptor
    } finally {
      setSaving(false);
    }
  }

  // Añadir un comentario
  async function handleAddComment() {
    if (!commentText.trim() || !user) return;
    setAddingComment(true);
    try {
      const newComment = await addComment(id, commentText.trim(), user.email);
      // Añadir el comentario al estado local sin recargar
      setIncident((prev) =>
        prev ? { ...prev, comentarios: [...prev.comentarios, newComment] } : prev
      );
      setCommentText('');
    } catch {
      // Error manejado por el interceptor
    } finally {
      setAddingComment(false);
    }
  }

  // Eliminar la incidencia
  async function handleDelete() {
    try {
      await deleteIncident(id);
      router.push('/incidents');
    } catch {
      // Error manejado por el interceptor
    }
  }

  // Formatear fecha legible (ej: "15 ene 2026, 10:30")
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">{error || 'Incidencia no encontrada'}</p>
        <button onClick={() => router.push('/incidents')} className="mt-4 text-primary font-medium text-sm hover:underline">
          Volver a incidencias
        </button>
      </div>
    );
  }

  // Comprobar si hay cambios pendientes de guardar
  const hasChanges = newEstado !== incident.estado || newPrioridad !== incident.prioridad;

  return (
    <div>
      {/* Cabecera con botón volver y eliminar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push('/incidents')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a incidencias
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos principales */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-3 mb-4">
              <StatusBadge estado={incident.estado} />
              <PriorityBadge prioridad={incident.prioridad} />
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">{incident.titulo}</h2>
            <p className="text-text-secondary text-sm mb-4">{incident.descripcion}</p>

            {/* Dirección y coordenadas */}
            <div className="flex items-start gap-2 text-sm text-text-secondary">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p>{incident.direccion}</p>
                <p className="text-text-light text-xs mt-0.5">
                  {incident.latitud.toFixed(6)}, {incident.longitud.toFixed(6)}
                </p>
              </div>
            </div>

            <p className="text-text-light text-xs mt-4">
              Creada el {formatDate(incident.creadoEn)}
            </p>
          </div>

          {/* Galería de imágenes */}
          {incident.imagenes.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-text-primary mb-4">
                Imágenes ({incident.imagenes.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {incident.imagenes.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(url)}
                  >
                    <Image src={url} alt={`Imagen ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline de comentarios */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-text-primary mb-4">
              Comentarios ({incident.comentarios.length})
            </h3>

            {incident.comentarios.length === 0 ? (
              <p className="text-text-light text-sm">No hay comentarios todavía</p>
            ) : (
              <div className="space-y-4">
                {incident.comentarios.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    {/* Indicador de timeline (punto + línea) */}
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="w-px flex-1 bg-gray-200 mt-1" />
                    </div>
                    {/* Contenido del comentario */}
                    <div className="pb-4">
                      <p className="text-sm text-text-primary">{comment.texto}</p>
                      <p className="text-xs text-text-light mt-1">
                        {comment.autor?.nombre || 'Sistema'} · {formatDate(comment.creadoEn)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para añadir comentario */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribir una nota o comentario..."
                rows={3}
                className="w-full px-4 py-3 bg-surface-variant rounded-xl border border-gray-200 text-sm text-text-primary placeholder-text-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || addingComment}
                  className="px-4 py-2 bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingComment ? 'Enviando...' : 'Añadir comentario'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Columna lateral (1/3): controles de edición */}
        <div className="space-y-6">
          {/* Cambiar estado y prioridad */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-text-primary mb-4">Gestionar</h3>

            {/* Selector de estado */}
            <label className="block text-sm text-text-secondary mb-1.5">Estado</label>
            <select
              value={newEstado}
              onChange={(e) => setNewEstado(e.target.value)}
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors mb-4"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en progreso">En progreso</option>
              <option value="resuelto">Resuelto</option>
              <option value="rechazada">Rechazada</option>
            </select>

            {/* Selector de prioridad */}
            <label className="block text-sm text-text-secondary mb-1.5">Prioridad</label>
            <select
              value={newPrioridad}
              onChange={(e) => setNewPrioridad(e.target.value)}
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors mb-4"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>

            {/* Botón guardar (solo visible si hay cambios) */}
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            )}
          </div>

          {/* Info adicional */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-text-primary mb-3">Información</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-text-light">Creada</dt>
                <dd className="text-text-primary">{formatDate(incident.creadoEn)}</dd>
              </div>
              <div>
                <dt className="text-text-light">Última actualización</dt>
                <dd className="text-text-primary">{formatDate(incident.actualizadoEn)}</dd>
              </div>
              <div>
                <dt className="text-text-light">Imágenes</dt>
                <dd className="text-text-primary">{incident.imagenes.length}</dd>
              </div>
              <div>
                <dt className="text-text-light">Comentarios</dt>
                <dd className="text-text-primary">{incident.comentarios.length}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full h-full">
            <Image
              src={selectedImage}
              alt="Imagen ampliada"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={showDelete}
        title="Eliminar incidencia"
        message={`¿Estás seguro de que quieres eliminar "${incident.titulo}"? Se eliminarán también las imágenes y comentarios. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
