/**
 * Badge (etiqueta) que muestra el estado de una incidencia con color.
 * Los colores son los mismos que en la app Flutter (app_colors.dart):
 * - Pendiente: naranja
 * - En progreso: azul
 * - Resuelto: verde
 * - Rechazada: rojo
 */

// Mapeo de cada estado a sus colores de fondo y texto (usando Tailwind)
const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-[#EA9133]/10 text-[#EA9133]',
  'en progreso': 'bg-[#3535EA]/10 text-[#3535EA]',
  resuelto: 'bg-[#32EA33]/10 text-[#22a823]',
  rechazada: 'bg-[#E53935]/10 text-[#E53935]',
};

// Texto visible con la primera letra en mayúscula
const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  'en progreso': 'En progreso',
  resuelto: 'Resuelto',
  rechazada: 'Rechazada',
};

interface StatusBadgeProps {
  estado: string;
}

export default function StatusBadge({ estado }: StatusBadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_STYLES[estado] || 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[estado] || estado}
    </span>
  );
}
