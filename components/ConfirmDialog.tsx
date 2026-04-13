/**
 * Diálogo de confirmación reutilizable.
 *
 * Se muestra como un modal superpuesto (overlay) cuando el administrador
 * va a realizar una acción destructiva (eliminar usuario, etc.).
 * Pide confirmación antes de ejecutar la acción.
 *
 * Props:
 * - open: si el diálogo está visible o no
 * - title: título del diálogo (ej: "Eliminar usuario")
 * - message: mensaje descriptivo
 * - confirmLabel: texto del botón de confirmar (ej: "Eliminar")
 * - variant: "danger" (rojo) o "warning" (naranja) para el botón
 * - onConfirm: función que se ejecuta al confirmar
 * - onCancel: función que se ejecuta al cancelar
 */
'use client';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const buttonColor = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-orange-500 hover:bg-orange-600';

  return (
    // Overlay oscuro que cubre toda la pantalla
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {/* Tarjeta del diálogo */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary text-sm mb-6">{message}</p>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors ${buttonColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
