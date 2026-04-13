/**
 * Layout de /dashboard.
 * Reutiliza el AdminLayout compartido (sidebar + header + protección de rutas).
 */
import AdminLayout from '@/components/AdminLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
