/**
 * Badge (etiqueta) que muestra la prioridad de una incidencia con color.
 * Los colores son los mismos que en la app Flutter (app_colors.dart):
 * - Crítica: rojo
 * - Alta: rojo-naranja
 * - Media: naranja
 * - Baja: verde
 */

const PRIORITY_STYLES: Record<string, string> = {
  critica: 'bg-[#E53935]/10 text-[#E53935]',
  alta: 'bg-[#FF7043]/10 text-[#FF7043]',
  media: 'bg-[#FFA726]/10 text-[#e08f1a]',
  baja: 'bg-[#4CAF50]/10 text-[#4CAF50]',
};

const PRIORITY_LABELS: Record<string, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

interface PriorityBadgeProps {
  prioridad: string;
}

export default function PriorityBadge({ prioridad }: PriorityBadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${PRIORITY_STYLES[prioridad] || 'bg-gray-100 text-gray-600'}`}>
      {PRIORITY_LABELS[prioridad] || prioridad}
    </span>
  );
}
