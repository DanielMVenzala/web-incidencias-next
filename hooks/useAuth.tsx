/**
 * Contexto de autenticación (AuthProvider + useAuth).
 *
 * En React, cuando varios componentes necesitan acceder a los mismos datos
 * (en este caso, el usuario logueado), se usa el patrón Context + Provider.
 * Es el equivalente al Provider/ChangeNotifier que usamos en Flutter.
 *
 * - AuthProvider: envuelve toda la aplicación (en layout.tsx) y mantiene
 *   el estado de autenticación (usuario, loading, errores).
 * - useAuth(): hook que cualquier componente puede llamar para acceder
 *   al usuario actual, hacer login o logout.
 *
 * Flujo:
 * 1. Al cargar la app, AuthProvider intenta restaurar la sesión (cookies)
 * 2. Al hacer login, verifica que el usuario sea admin
 * 3. Si no es admin, muestra error y limpia la sesión
 * 4. Al hacer logout, limpia cookies y redirige al login
 */
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as authService from '@/services/auth.service';
import type { User } from '@/services/auth.service';

// Define qué datos y funciones estarán disponibles en el contexto.
// Cualquier componente que use useAuth() tendrá acceso a estos valores.
interface AuthContextType {
  user: User | null;       // Usuario logueado (null si no hay sesión)
  isLoading: boolean;      // true mientras se verifica la sesión
  error: string | null;    // Mensaje de error del último intento de login
  login: (email: string, clave: string) => Promise<void>;
  logout: () => void;
}

// Crear el contexto con valor inicial undefined
// (se rellenará cuando AuthProvider monte)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Componente Provider que envuelve la app y proporciona el estado de auth.
 * Se coloca en app/layout.tsx para que esté disponible en todas las páginas.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Al montar el componente (primera carga de la app),
  // intentar restaurar la sesión desde las cookies
  useEffect(() => {
    authService.restoreSession()
      .then((restored) => {
        if (restored && restored.rol === 'admin') {
          setUser(restored);
        } else if (restored) {
          // Si el usuario existe pero no es admin, limpiar sesión
          authService.logout();
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Función de login que se llama desde la página de login
  const login = async (email: string, clave: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(email, clave);

      // Solo permitir acceso a administradores
      if (loggedUser.rol !== 'admin') {
        authService.logout();
        setError('Acceso restringido a administradores');
        return;
      }

      // Solo actualizamos el estado. La redirección la dispara el
      // useEffect de LoginPage cuando detecta que `user` cambió.
      // Hacer router.push aquí mismo provoca una race condition:
      // Next.js renderiza /dashboard antes de que el setUser se haya
      // propagado, AdminLayout ve user=null y te devuelve al login.
      setUser(loggedUser);
    } catch (err: unknown) {
      // Extraer el mensaje de error del backend (si existe)
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Error al iniciar sesión');
      } else {
        setError('Error de conexión con el servidor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout: limpia cookies y redirige al login
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  // El Provider pasa los valores a todos los componentes hijos
  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para acceder al contexto de autenticación.
 * Se usa así en cualquier componente: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
