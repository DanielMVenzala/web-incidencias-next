/**
 * Página principal del dashboard.
 *
 * Muestra un resumen visual de todas las incidencias:
 * - 4 tarjetas KPI (total, pendientes, en progreso, resueltas)
 * - Gráfico de donut con la distribución por estado
 * - Gráfico de barras con la distribución por prioridad
 * - Gráfico de área con la evolución mensual (últimos 6 meses)
 *
 * Los datos se obtienen del endpoint GET /api/v1/incidents y se procesan
 * en el frontend para calcular los contadores y agrupar por mes.
 * Los colores de estado y prioridad son los mismos que usa la app Flutter
 * (definidos en app_colors.dart).
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getIncidents, Incident } from '@/services/incidents.service';
import StatsCard from '@/components/StatsCard';
import StatusChart from '@/components/StatusChart';
import PriorityChart from '@/components/PriorityChart';
import MonthlyChart from '@/components/MonthlyChart';

// Colores de estado — mismos que en la app Flutter (app_colors.dart)
const STATUS_COLORS: Record<string, string> = {
  pendiente: '#EA9133',
  'en progreso': '#3535EA',
  resuelto: '#32EA33',
  rechazada: '#E53935',
};

// Colores de prioridad — mismos que en la app Flutter (app_colors.dart)
const PRIORITY_COLORS: Record<string, string> = {
  critica: '#E53935',
  alta: '#FF7043',
  media: '#FFA726',
  baja: '#4CAF50',
};

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Procesa el array de incidencias y calcula las estadísticas:
 * - Conteo por estado (pendiente, en progreso, resuelto, rechazada)
 * - Conteo por prioridad (crítica, alta, media, baja)
 * - Conteo mensual de los últimos 6 meses
 */
function computeStats(incidents: Incident[]) {
  // Inicializar contadores a 0
  const byStatus: Record<string, number> = { pendiente: 0, 'en progreso': 0, resuelto: 0, rechazada: 0 };
  const byPriority: Record<string, number> = { critica: 0, alta: 0, media: 0, baja: 0 };

  // Recorrer todas las incidencias y sumar a cada contador
  incidents.forEach((inc) => {
    if (inc.estado in byStatus) byStatus[inc.estado]++;
    if (inc.prioridad in byPriority) byPriority[inc.prioridad]++;
  });

  // Calcular incidencias por mes (últimos 6 meses)
  const now = new Date();
  const monthly: { name: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const count = incidents.filter((inc) => {
      const created = new Date(inc.creadoEn);
      return created.getMonth() === month && created.getFullYear() === year;
    }).length;
    monthly.push({ name: `${MONTH_NAMES[month]} ${year.toString().slice(2)}`, value: count });
  }

  return {
    total: incidents.length,
    byStatus,
    byPriority,
    monthly,
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // Al montar la página, obtener todas las incidencias del backend
  useEffect(() => {
    getIncidents()
      .then(setIncidents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  // Calcular estadísticas a partir de las incidencias
  const stats = computeStats(incidents);

  // Preparar datos para los gráficos (formato que espera Recharts)
  const statusData = [
    { name: 'Pendiente', value: stats.byStatus.pendiente, color: STATUS_COLORS.pendiente },
    { name: 'En progreso', value: stats.byStatus['en progreso'], color: STATUS_COLORS['en progreso'] },
    { name: 'Resuelto', value: stats.byStatus.resuelto, color: STATUS_COLORS.resuelto },
    { name: 'Rechazada', value: stats.byStatus.rechazada, color: STATUS_COLORS.rechazada },
  ];

  const priorityData = [
    { name: 'Crítica', value: stats.byPriority.critica, color: PRIORITY_COLORS.critica },
    { name: 'Alta', value: stats.byPriority.alta, color: PRIORITY_COLORS.alta },
    { name: 'Media', value: stats.byPriority.media, color: PRIORITY_COLORS.media },
    { name: 'Baja', value: stats.byPriority.baja, color: PRIORITY_COLORS.baja },
  ];

  return (
    <div>
      {/* Título de bienvenida */}
      <h2 className="text-2xl font-bold text-text-primary mb-1">
        Bienvenido, {user?.nombre}
      </h2>
      <p className="text-text-secondary mb-8">Resumen general de incidencias</p>

      {/* 4 tarjetas KPI en fila */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total"
          value={stats.total}
          color="#2C5F7C"
          bgColor="#2C5F7C1A"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Pendientes"
          value={stats.byStatus.pendiente}
          color="#EA9133"
          bgColor="#EA91331A"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="En progreso"
          value={stats.byStatus['en progreso']}
          color="#3535EA"
          bgColor="#3535EA1A"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatsCard
          title="Resueltas"
          value={stats.byStatus.resuelto}
          color="#32EA33"
          bgColor="#32EA331A"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Gráficos: donut por estado + barras por prioridad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <StatusChart data={statusData} />
        <PriorityChart data={priorityData} />
      </div>

      {/* Gráfico de evolución mensual */}
      <MonthlyChart data={stats.monthly} />
    </div>
  );
}
