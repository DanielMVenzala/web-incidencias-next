/**
 * Configuración de Next.js.
 *
 * Se configura un "rewrite" (reescritura de rutas) para solucionar el
 * problema de CORS. CORS es una política de seguridad del navegador que
 * impide que una web (localhost:3001) haga peticiones a un servidor
 * en otro dominio (backendincidenciasnest.onrender.com).
 *
 * En vez de hacer las peticiones directamente al backend externo,
 * las hacemos a nuestra propia URL (/api/v1/...) y Next.js las
 * redirige internamente al backend real. Como la redirección ocurre
 * en el servidor (no en el navegador), CORS no se aplica.
 *
 * Es el equivalente a configurar un proxy en un servidor de desarrollo.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir imágenes externas de Cloudinary (fotos de perfil e incidencias)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        // Cualquier petición a /api/v1/... en nuestra web
        source: '/api/v1/:path*',
        // Se redirige al backend real en Render
        destination: 'https://backendincidenciasnest.onrender.com/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
