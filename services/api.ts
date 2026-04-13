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
 * - Interceptor de respuesta: si el backend devuelve un 401 (no autorizado),
 *   significa que el token ha expirado (caduca a los 15 minutos). En ese caso
 *   se borran las cookies y se redirige al login para que el usuario vuelva
 *   a autenticarse.
 *
 * Es el mismo patrón que usamos en Flutter con Dio interceptors.
 */
import axios from 'axios';
import Cookies from 'js-cookie';

// Se crea una instancia de Axios con la URL base de la API.
// Todas las peticiones (get, post, patch, delete) usarán esta instancia.
const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// INTERCEPTOR DE PETICIÓN
// Se ejecuta automáticamente ANTES de cada petición HTTP.
// Lee el token JWT de las cookies y lo inyecta en la cabecera Authorization.
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// INTERCEPTOR DE RESPUESTA
// Se ejecuta automáticamente DESPUÉS de cada respuesta HTTP.
// Si el servidor devuelve 401 (token expirado o inválido),
// limpia las cookies y redirige al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      Cookies.remove('user_id');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
