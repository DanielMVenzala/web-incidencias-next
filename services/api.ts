/**
 * Configuración central de Axios.
 *
 * Axios es el equivalente a Dio en Flutter: un cliente HTTP para hacer
 * peticiones al backend. Aquí se crea una instancia reutilizable con la
 * URL base de la API y se configuran dos "interceptores":
 *
 * - Interceptor de petición: antes de cada llamada HTTP, lee el token JWT
 *   guardado en las cookies y lo añade automáticamente a la cabecera
 *   Authorization. Así no hay que pasarlo manualmente en cada petición.
 *
 * - Interceptor de respuesta: traduce los errores de red a mensajes
 *   legibles y los muestra en un toast. También captura el 401 (token
 *   expirado) y redirige al login.
 *
 * El timeout está fijado a 70 segundos porque el backend está en Render
 * con el plan gratuito, que se "duerme" tras 15 min de inactividad y
 * tarda hasta 60s en arrancar de nuevo (cold start).
 */
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { getGlobalShowToast } from '@/hooks/useToast';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 70000, // 70s para tolerar el cold start de Render
});

// INTERCEPTOR DE PETICIÓN — añade el JWT a cada llamada
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// INTERCEPTOR DE RESPUESTA — gestiona errores globales
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const showToast = getGlobalShowToast();

    // 401: token expirado o inválido — limpiar sesión y redirigir
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      Cookies.remove('user_id');
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        showToast?.('Tu sesión ha expirado. Vuelve a iniciar sesión.', 'warning');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Error de red (sin respuesta del servidor): backend caído, sin internet, etc.
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        showToast?.('La petición ha tardado demasiado. Inténtalo de nuevo.', 'error');
      } else {
        showToast?.('No se pudo conectar con el servidor. Comprueba tu conexión.', 'error');
      }
      return Promise.reject(error);
    }

    // 5xx: error del servidor
    if (error.response.status >= 500) {
      showToast?.('Error en el servidor. Inténtalo más tarde.', 'error');
      return Promise.reject(error);
    }

    // 4xx (excepto 401): error de validación o lógica de negocio
    // No mostramos toast genérico aquí porque cada llamada decide su mensaje
    return Promise.reject(error);
  },
);

/**
 * Extrae el mensaje de error de una respuesta del backend.
 * El backend NestJS devuelve errores con la forma:
 *   { message: "texto" | ["texto1", "texto2"], statusCode: 400 }
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message[0] : data.message;
    }
  }
  return fallback;
}

export default api;
