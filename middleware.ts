/**
 * Middleware de Next.js — Protección de rutas.
 *
 * Este archivo se ejecuta automáticamente ANTES de que se cargue cada página.
 * Es una funcionalidad propia de Next.js que actúa como un "guardia de ruta"
 * (similar a los Guards de Angular o los route guards de Flutter con GoRouter).
 *
 * Lógica:
 * - Si el usuario intenta acceder a una ruta protegida (/dashboard, /incidents,
 *   /users) sin tener un token en las cookies → redirige al /login.
 * - Si el usuario ya tiene token e intenta ir al /login → redirige al /dashboard
 *   (no tiene sentido volver a loguearse).
 *
 * NOTA: Este middleware solo comprueba si la cookie existe, no si el token es
 * válido. La validación real del token la hace el backend cuando se hacen
 * peticiones a la API. Si el token ha expirado, el interceptor de Axios
 * (en api.ts) se encarga de redirigir al login.
 *
 * El campo "matcher" al final indica a Next.js en qué rutas debe ejecutarse
 * este middleware (para no ejecutarlo en archivos estáticos, imágenes, etc.).
 */
import { NextRequest, NextResponse } from 'next/server';

// Rutas que requieren autenticación
const PROTECTED_ROUTES = ['/dashboard', '/incidents', '/users'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // Comprobar si la ruta actual es una ruta protegida
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Sin token y accediendo a zona protegida → redirigir al login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Con token y accediendo al login → redirigir al dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // En cualquier otro caso, dejar pasar la petición
  return NextResponse.next();
}

// Indicar a Next.js en qué rutas debe ejecutarse este middleware
export const config = {
  matcher: ['/dashboard/:path*', '/incidents/:path*', '/users/:path*', '/login'],
};
