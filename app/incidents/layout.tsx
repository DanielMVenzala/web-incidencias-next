/**
 * Layout de /incidents.
 * Reutiliza el AdminLayout compartido (sidebar + header + protección de rutas).
 */
import AdminLayout from '@/components/AdminLayout';

export default function IncidentsLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
