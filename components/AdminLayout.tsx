/**
 * Layout compartido para todas las páginas del panel de administración.
 *
 * Contiene la estructura visual común: sidebar lateral + header superior.
 * Se usa en /dashboard, /users y /incidents para no repetir código.
 * También se encarga de verificar que el usuario esté autenticado.
 *
 * Estructura visual:
 * ┌──────────┬──────────────────────────┐
 * │          │        Header            │
 * │ Sidebar  ├──────────────────────────┤
 * │          │                          │
 * │          │     Contenido (children) │
 * │          │                          │
 * └──────────┴──────────────────────────┘
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Si termina de cargar y no hay usuario, redirigir al login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Mientras se comprueba la sesión, mostrar spinner de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <svg className="animate-spin w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
