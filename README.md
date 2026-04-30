<!--
======================================================================
VERSIÓN EN ESPAÑOL — comentada para mostrar solo la versión en inglés.
Para reactivarla, mueve el cierre `-->` que hay al final del bloque.
======================================================================

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

-->

<h1 align="center">Martos Arregla — Admin Web</h1>

<p align="center">
  <strong>The desktop companion to the Martos Arregla mobile app — a Next.js dashboard for council staff to triage incidents and manage citizens at scale</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel" alt="Vercel">
</p>

---

## What it does

This is the **web cockpit** of the Martos Arregla system. While citizens file reports from their phones via the Flutter app, council staff jump into this Next.js panel on a desktop to do the heavy lifting: bulk status changes, advanced filters, exporting Excel reports, and managing user accounts. Same API, same data — different surface tuned for keyboard-and-mouse productivity.

It is part of a **three-client architecture** that all share the same NestJS REST API:

- Mobile app (Flutter) — for residents
- Web admin panel (this repo) — for staff
- NestJS backend — the single source of truth

---

## Highlights

| Feature                | What it gives you                                                                |
| ---------------------- | -------------------------------------------------------------------------------- |
| Dashboard              | KPI cards, status donut, priority bar chart and 6-month trend line               |
| Incidents table        | Combined filters, sortable columns, inline editing with batch save               |
| Incident detail        | Image gallery, comment timeline, in-place status/priority controls               |
| User management        | Role swap, block/unblock and delete — all queued and committed in one click      |
| Excel export           | Filter-aware downloads with an executive summary plus the full backlog           |
| Three-layer auth       | Next.js middleware + client guard + Axios interceptor                            |

### Polish

- Same colour palette and Poppins typography as the mobile app
- Pending-change indicators that highlight unsaved edits in orange
- Confirm dialogs on destructive actions (delete, role change)
- Live error toasts for failed API calls
- Responsive layout from desktop down to tablet

---

## Architecture (in context)

```
   Flutter mobile app             Next.js admin panel  ←  you are here
   +------------------+           +---------------------+
   |  Citizens-side   |           |  Staff-side         |
   |  (Android)       |           |  (Browser, desktop) |
   +--------+---------+           +----------+----------+
            \                                /
             \      HTTP + JWT             /
              \                           /
               v                         v
            +---------------------------+
            |    NestJS REST API        |
            |   Controllers · Services  |
            |   TypeORM · Guards · DTOs |
            +--------------+------------+
                           |
                  +--------+---------+
                  |   PostgreSQL     |
                  |     (Neon)       |
                  +--------+---------+
                           |
           +---------------+---------------+
           |               |               |
      Cloudinary     Google Maps        Resend
       (images)      (geocoding)        (emails)
```

---

## Tech stack

| Layer            | Tooling                                |
| ---------------- | -------------------------------------- |
| Framework        | Next.js 14 (App Router)                |
| UI               | React 18 + Tailwind CSS                |
| Language         | TypeScript                             |
| HTTP             | Axios with JWT interceptors            |
| Charts           | Recharts                               |
| Session          | Cookies via `js-cookie`                |
| Hosting          | Vercel                                 |

---

## Run it locally

```bash
git clone https://github.com/DanielMVenzala/web-incidencias-next.git
cd web-incidencias-next
npm install
# Drop your backend URL into .env.local (see the table below)
npm run dev
```

The dashboard will be reachable at `http://localhost:3001`.

---

## Environment variables

| Variable              | Purpose                                              |
| --------------------- | ---------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Public URL where the NestJS backend is reachable     |

---

## Technical highlights

- **No backend changes for CORS.** The web hits a same-origin path (`/api/v1/...`) that Next.js rewrites to the real backend. CORS never fires because the rewrite happens server-side.
- **Three-layer authentication.** A Next.js middleware blocks unauthenticated routes before render, a client-side `AdminLayout` enforces the admin role once mounted, and an Axios response interceptor cleans up cookies if the API ever returns 401.
- **Cookie-based JWT.** Tokens live in cookies (not `localStorage`) so the server-side middleware can read them and decide whether to render or redirect.
- **Batch editing for low-traffic admin work.** Edits in the incidents and users tables are kept in local state and committed in a single click, slashing API calls and giving staff a discard option.
- **Shared visual identity.** Same Poppins typography, same primary `#2C5F7C`, same accent `#C4704B`, same status palette as the mobile app — so anyone moving between phone and desktop feels at home.

---

## Repositories of the system

| Project              | Link                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| Backend (NestJS)     | [backendIncidenciasNest](https://github.com/DanielMVenzala/backendIncidenciasNest)   |
| Mobile app (Flutter) | [frontIncidenciasFlutter](https://github.com/DanielMVenzala/frontIncidenciasFlutter) |
| Web admin (this)     | [web-incidencias-next](https://github.com/DanielMVenzala/web-incidencias-next)       |

---

<p align="center">
  Final-year project for the Multiplatform App Development course (Spain) — 2026
</p>
