/**
 * Página de incidencias (/incidents).
 *
 * Muestra una tabla paginada con todas las incidencias del sistema.
 * El administrador puede:
 * - Buscar por texto (título, descripción, dirección)
 * - Filtrar por estado y prioridad
 * - Cambiar estado y prioridad de cada incidencia con selectores en la tabla
 * - Ordenar por columnas clicando en la cabecera
 * - Navegar entre páginas (paginación con limit/offset)
 * - Guardar todos los cambios pendientes con un botón
 * - Exportar a Excel con los filtros aplicados
 * - Pulsar el título de una fila para ir al detalle (/incidents/[id])
 *
 * Los cambios de estado/prioridad NO se guardan automáticamente: se acumulan
 * en local y se envían al backend solo al pulsar "Guardar cambios".
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getIncidents, updateIncident, downloadIncidentsExcel, Incident, IncidentsFilters } from '@/services/incidents.service';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/services/api';

const PAGE_SIZE = 15;

// Estilos de los selectores según el valor (mismos colores que la app Flutter)
const ESTADO_STYLES: Record<string, string> = {
  pendiente: 'border-[#EA9133]/40 bg-[#EA9133]/10 text-[#EA9133]',
  'en progreso': 'border-[#3535EA]/40 bg-[#3535EA]/10 text-[#3535EA]',
  resuelto: 'border-[#22a823]/40 bg-[#32EA33]/10 text-[#22a823]',
  rechazada: 'border-[#E53935]/40 bg-[#E53935]/10 text-[#E53935]',
};

const PRIORIDAD_STYLES: Record<string, string> = {
  critica: 'border-[#E53935]/40 bg-[#E53935]/10 text-[#E53935]',
  alta: 'border-[#FF7043]/40 bg-[#FF7043]/10 text-[#FF7043]',
  media: 'border-[#e08f1a]/40 bg-[#FFA726]/10 text-[#e08f1a]',
  baja: 'border-[#4CAF50]/40 bg-[#4CAF50]/10 text-[#4CAF50]',
};

// Tipo para los cambios pendientes de una incidencia
interface PendingChange {
  estado?: Incident['estado'];
  prioridad?: Incident['prioridad'];
}

export default function IncidentsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [prioridadFilter, setPrioridadFilter] = useState('');

  // Ordenación
  const [sortBy, setSortBy] = useState<'creadoEn' | 'actualizadoEn'>('creadoEn');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Cambios pendientes de guardar: { incidentId: { estado?, prioridad? } }
  const [pendingChanges, setPendingChanges] = useState<Record<string, PendingChange>>({});
  const [saving, setSaving] = useState(false);

  const buildFilters = useCallback((): IncidentsFilters => ({
    search: search || undefined,
    estado: estadoFilter || undefined,
    prioridad: prioridadFilter || undefined,
    orderBy: sortBy,
    order: sortOrder,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  }), [search, estadoFilter, prioridadFilter, sortBy, sortOrder, page]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getIncidents(buildFilters())
      .then((data) => {
        if (!cancelled) {
          setIncidents(data);
          setHasMore(data.length === PAGE_SIZE);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          showToast(getErrorMessage(err, 'No se pudieron cargar las incidencias'), 'error');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [buildFilters]);

  // Registrar un cambio de estado o prioridad (sin guardar aún)
  function handleFieldChange(inc: Incident, field: 'estado' | 'prioridad', value: string) {
    setPendingChanges((prev) => {
      const current = prev[inc.id] || {};
      const updated = { ...current, [field]: value as Incident['estado'] & Incident['prioridad'] };

      // Si el valor vuelve al original, quitar ese campo del cambio pendiente
      if (value === inc[field]) {
        delete updated[field];
      }

      // Si no quedan campos modificados, eliminar la entrada
      if (Object.keys(updated).length === 0) {
        const copy = { ...prev };
        delete copy[inc.id];
        return copy;
      }

      return { ...prev, [inc.id]: updated };
    });
  }

  // Guardar todos los cambios pendientes
  async function handleSaveChanges() {
    setSaving(true);
    try {
      const entries = Object.entries(pendingChanges);
      await Promise.all(entries.map(([id, fields]) => updateIncident(id, fields)));

      // Actualizar el estado local con los cambios guardados
      setIncidents((prev) =>
        prev.map((inc) => {
          const changes = pendingChanges[inc.id];
          if (!changes) return inc;
          return { ...inc, ...changes } as Incident;
        })
      );
      setPendingChanges({});
      showToast('Cambios guardados correctamente', 'success');
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudieron guardar los cambios'), 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(0);
  }

  function handleSort(column: 'creadoEn' | 'actualizadoEn') {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
    setPage(0);
  }

  function SortIcon({ column }: { column: string }) {
    if (sortBy !== column) return null;
    return (
      <svg className="w-3 h-3 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {sortOrder === 'ASC'
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        }
      </svg>
    );
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const hasPendingChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Incidencias</h2>
          <p className="text-text-secondary text-sm">Gestión de incidencias reportadas</p>
        </div>
        <div className="flex items-center gap-3">
          {hasPendingChanges && (
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {saving ? 'Guardando...' : `Guardar cambios (${Object.keys(pendingChanges).length})`}
            </button>
          )}
          <button
            onClick={async () => {
              try {
                await downloadIncidentsExcel(buildFilters());
              } catch (err) {
                showToast(getErrorMessage(err, 'No se pudo descargar el Excel'), 'error');
              }
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[250px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por título, descripción o dirección..."
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-text-primary placeholder-text-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        <select
          value={estadoFilter}
          onChange={(e) => handleFilterChange(setEstadoFilter, e.target.value)}
          className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en progreso">En progreso</option>
          <option value="resuelto">Resuelto</option>
          <option value="rechazada">Rechazada</option>
        </select>
        <select
          value={prioridadFilter}
          onChange={(e) => handleFilterChange(setPrioridadFilter, e.target.value)}
          className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        >
          <option value="">Todas las prioridades</option>
          <option value="critica">Crítica</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4">Título</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4">Dirección</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4">Estado</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4">Prioridad</th>
                  <th
                    className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4 cursor-pointer hover:text-primary select-none"
                    onClick={() => handleSort('creadoEn')}
                  >
                    Fecha <SortIcon column="creadoEn" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-text-light text-sm">
                      No se encontraron incidencias
                    </td>
                  </tr>
                ) : (
                  incidents.map((inc) => {
                    const pending = pendingChanges[inc.id];
                    const currentEstado = pending?.estado || inc.estado;
                    const currentPrioridad = pending?.prioridad || inc.prioridad;

                    return (
                      <tr key={inc.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        {/* Título (enlace al detalle) */}
                        <td className="px-6 py-4">
                          <span
                            onClick={() => router.push(`/incidents/${inc.id}`)}
                            className="text-sm font-medium text-primary hover:underline cursor-pointer line-clamp-1"
                          >
                            {inc.titulo}
                          </span>
                        </td>

                        {/* Dirección */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-text-secondary line-clamp-1">{inc.direccion}</span>
                        </td>

                        {/* Estado (selector con color) */}
                        <td className="px-6 py-4">
                          <select
                            value={currentEstado}
                            onChange={(e) => handleFieldChange(inc, 'estado', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors focus:outline-none focus:ring-1 focus:ring-primary ${
                              pending?.estado
                                ? 'border-orange-300 bg-orange-50 text-orange-700'
                                : ESTADO_STYLES[currentEstado] || 'border-gray-200 bg-white'
                            }`}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="en progreso">En progreso</option>
                            <option value="resuelto">Resuelto</option>
                            <option value="rechazada">Rechazada</option>
                          </select>
                        </td>

                        {/* Prioridad (selector con color) */}
                        <td className="px-6 py-4">
                          <select
                            value={currentPrioridad}
                            onChange={(e) => handleFieldChange(inc, 'prioridad', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors focus:outline-none focus:ring-1 focus:ring-primary ${
                              pending?.prioridad
                                ? 'border-orange-300 bg-orange-50 text-orange-700'
                                : PRIORIDAD_STYLES[currentPrioridad] || 'border-gray-200 bg-white'
                            }`}
                          >
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                            <option value="critica">Crítica</option>
                          </select>
                        </td>

                        {/* Fecha */}
                        <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">
                          {formatDate(inc.creadoEn)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && (incidents.length > 0 || page > 0) && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-text-light">Página {page + 1}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-text-secondary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 text-text-secondary hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
