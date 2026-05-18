

<h1 align="center">Martos Arregla — Panel de administración</h1>

<p align="center">
  <strong>Aplicación web para que los administradores municipales gestionen incidencias y usuarios desde el navegador</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel" alt="Vercel">
</p>

---

## Qué es esto

El panel web complementa la app móvil de **Martos Arregla** con una interfaz orientada a la gestión avanzada en escritorio: tablas grandes, filtros combinados, edición masiva en lote y exportación a Excel. Solo accesible para administradores.

Forma parte de un sistema de tres clientes que consumen la **misma API REST** del backend NestJS:

- App móvil (Flutter) — para los ciudadanos
- Panel web (este proyecto) — para administradores
- Backend NestJS — API REST común

## Funcionalidades

| Funcionalidad | Descripción |
| ------------- | ----------- |
| Dashboard | KPIs, gráfico de donut por estado, barras por prioridad y evolución mensual |
| Listado de incidencias | Filtros combinados, ordenación clickable, edición masiva en lote |
| Detalle de incidencia | Galería de imágenes, timeline de comentarios, gestión de estado y prioridad |
| Gestión de usuarios | Cambio de rol, bloquear/desbloquear y eliminación con cambios pendientes |
| Exportación Excel | Informes con filtros aplicados, dos hojas (resumen + listado completo) |
| Autenticación robusta | Tres niveles de protección: middleware, layout y interceptor Axios |

## Stack

| Capa | Tecnología |
| ---- | ---------- |
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS |
| Lenguaje | TypeScript |
| HTTP | Axios con interceptores JWT |
| Gráficos | Recharts |
| Sesión | Cookies (js-cookie) |
| Despliegue | Vercel |

## Cómo ejecutar en local

```bash
git clone https://github.com/DanielMVenzala/web-incidencias-next.git
cd web-incidencias-next
npm install
# Configurar .env.local con la URL del backend
npm run dev
```

La web estará disponible en `http://localhost:3001`.

## Variables de entorno

| Variable | Propósito |
| -------- | --------- |
| `NEXT_PUBLIC_API_URL` | URL pública del backend NestJS |

## Repositorios del sistema

| Proyecto | Enlace |
| -------- | ------ |
| Backend (NestJS) | [backendIncidenciasNest](https://github.com/DanielMVenzala/backendIncidenciasNest) |
| App móvil (Flutter) | [frontIncidenciasFlutter](https://github.com/DanielMVenzala/frontIncidenciasFlutter) |
| Panel web (este repo) | [web-incidencias-next](https://github.com/DanielMVenzala/web-incidencias-next) |

---

<p align="center">
  Proyecto de fin de ciclo — Desarrollo de Aplicaciones Multiplataforma (DAM) 2026
</p>

