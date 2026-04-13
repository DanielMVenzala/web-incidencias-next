/**
 * Página de incidencias (/incidents).
 *
 * Muestra una tabla paginada con todas las incidencias del sistema.
 * El administrador puede:
 * - Buscar por texto (título, descripción, dirección)
 * - Filtrar por estado y prioridad
 * - Ordenar por columnas clicando en la cabecera
 * - Navegar entre páginas (paginación con limit/offset)
 * - Exportar a Excel con los filtros aplicados
 * - Pulsar una fila para ir al detalle (/incidents/[id])
 *
 * Los filtros se envían al backend como query params para que el
 * filtrado y la paginación se hagan en el servidor (no en el cliente).
 */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getIncidents, downloadIncidentsExcel, Incident, IncidentsFilters } from '@/services/incidents.service';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';

const PAGE_SIZE = 15;

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [prioridadFilter, setPrioridadFilter] = useState('');

  // Ordenación: columna y dirección (ASC o DESC)
  const [sortBy, setSortBy] = useState<'creadoEn' | 'actualizadoEn'>('creadoEn');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Construir los filtros a partir del estado actual
  const buildFilters = useCallback((): IncidentsFilters => ({
    search: search || undefined,
    estado: estadoFilter || undefined,
    prioridad: prioridadFilter || undefined,
    orderBy: sortBy,
    order: sortOrder,
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  }), [search, estadoFilter, prioridadFilter, sortBy, sortOrder, page]);

  // Cargar incidencias cuando cambian los filtros o la página
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getIncidents(buildFilters())
      .then((data) => {
        if (!cancelled) {
          setIncidents(data);
          // Si devuelve menos del límite, no hay más páginas
          setHasMore(data.length === PAGE_SIZE);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [buildFilters]);

  // Al cambiar un filtro, volver a la primera página
  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(0);
  }

  // Al pulsar una cabecera de columna, cambiar la ordenación
  function handleSort(column: 'creadoEn' | 'actualizadoEn') {
    if (sortBy === column) {
      // Si ya estamos ordenando por esta columna, invertir dirección
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
    setPage(0);
  }

  // Icono de flecha para indicar la dirección de ordenación
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

  // Formatear fecha para mostrar en la tabla (ej: "15 ene 2026")
  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Incidencias</h2>
          <p className="text-text-secondary text-sm">Gestión de incidencias reportadas</p>
        </div>
        <button
          onClick={() => downloadIncidentsExcel(buildFilters())}
          className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar Excel
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Búsqueda por texto */}
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

        {/* Filtro por estado */}
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

        {/* Filtro por prioridad */}
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
                  incidents.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => router.push(`/incidents/${inc.id}`)}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      {/* Título (máximo 1 línea, cortado con ...) */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-text-primary line-clamp-1">{inc.titulo}</span>
                      </td>

                      {/* Dirección */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-text-secondary line-clamp-1">{inc.direccion}</span>
                      </td>

                      {/* Estado (badge con color) */}
                      <td className="px-6 py-4">
                        <StatusBadge estado={inc.estado} />
                      </td>

                      {/* Prioridad (badge con color) */}
                      <td className="px-6 py-4">
                        <PriorityBadge prioridad={inc.prioridad} />
                      </td>

                      {/* Fecha de creación */}
                      <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">
                        {formatDate(inc.creadoEn)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && (incidents.length > 0 || page > 0) && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-text-light">
              Página {page + 1}
            </p>
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
