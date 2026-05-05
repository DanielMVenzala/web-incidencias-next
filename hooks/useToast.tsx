/**
 * Sistema global de notificaciones (toasts).
 *
 * Un toast es un mensaje breve que aparece en una esquina de la pantalla
 * (típicamente abajo a la derecha) para informar al usuario de algo:
 * un error, una acción exitosa, una advertencia, etc. Desaparece solo
 * después de unos segundos.
 *
 * Funcionamiento:
 * - ToastProvider envuelve la app y mantiene la lista de toasts visibles
 * - useToast() devuelve la función showToast() que cualquier componente puede usar
 * - El interceptor de Axios (api.ts) también puede mostrar toasts gracias a
 *   una referencia global que se asigna al montar el Provider
 */
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Referencia global para que el interceptor de Axios pueda mostrar toasts
// (el interceptor está fuera del árbol de componentes React)
let globalShowToast: ((message: string, variant?: ToastVariant) => void) | null = null;

export function getGlobalShowToast() {
  return globalShowToast;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);

    // Auto-eliminar el toast después de 4 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Registrar la referencia global al montar
  globalShowToast = showToast;

  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Contenedor de toasts (esquina inferior derecha) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const styles: Record<ToastVariant, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-orange-50 border-orange-200 text-orange-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons: Record<ToastVariant, JSX.Element> = {
    success: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in-right ${styles[toast.variant]}`}
    >
      {icons[toast.variant]}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="opacity-50 hover:opacity-100 transition-opacity shrink-0"
        aria-label="Cerrar"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
}
