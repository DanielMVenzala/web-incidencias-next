/**
 * Página de gestión de usuarios (/users).
 *
 * Muestra una tabla con todos los usuarios registrados en la aplicación.
 * El administrador puede:
 * - Buscar usuarios por nombre o email
 * - Filtrar por rol (admin/usuario)
 * - Cambiar el rol de un usuario con un selector en la tabla
 * - Bloquear/desbloquear usuarios
 * - Eliminar usuarios (con confirmación)
 * - Guardar todos los cambios de rol pendientes con un botón
 * - Descargar un informe Excel con todos los usuarios
 *
 * Los cambios de rol NO se guardan automáticamente: se acumulan en local
 * y se envían al backend solo al pulsar "Guardar cambios".
 */
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getUsers, toggleBlock, changeRole, deleteUser, downloadUsersExcel, UserAdmin } from '@/services/users.service';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function UsersPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState<'' | 'admin' | 'usuario'>('');

  // Cambios de rol pendientes de guardar: { userId: nuevoRol }
  const [pendingRoles, setPendingRoles] = useState<Record<string, 'admin' | 'usuario'>>({});
  const [saving, setSaving] = useState(false);

  // Diálogo de confirmación para eliminar
  const [deleteTarget, setDeleteTarget] = useState<UserAdmin | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      // Error manejado por el interceptor
    } finally {
      setLoading(false);
    }
  }

  // Registrar un cambio de rol (sin guardar aún)
  function handleRoleSelect(user: UserAdmin, newRol: 'admin' | 'usuario') {
    if (newRol === user.rol) {
      // Si vuelve al valor original, quitar de pendientes
      setPendingRoles((prev) => {
        const copy = { ...prev };
        delete copy[user.id];
        return copy;
      });
    } else {
      setPendingRoles((prev) => ({ ...prev, [user.id]: newRol }));
    }
  }

  // Guardar todos los cambios de rol pendientes
  async function handleSaveChanges() {
    setSaving(true);
    try {
      // Enviar cada cambio al backend
      const entries = Object.entries(pendingRoles);
      await Promise.all(entries.map(([userId, rol]) => changeRole(userId, rol)));

      // Actualizar el estado local
      setUsers((prev) =>
        prev.map((u) => (pendingRoles[u.id] ? { ...u, rol: pendingRoles[u.id] } : u))
      );
      setPendingRoles({});
    } catch {
      // Error manejado por el interceptor
    } finally {
      setSaving(false);
    }
  }

  // Bloquear o desbloquear un usuario
  async function handleToggleBlock(user: UserAdmin) {
    try {
      const result = await toggleBlock(user.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, bloqueado: result.bloqueado } : u))
      );
    } catch {
      // Error manejado por el interceptor
    }
  }

  // Confirmar y eliminar un usuario
  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      // Limpiar cambios pendientes del usuario eliminado
      setPendingRoles((prev) => {
        const copy = { ...prev };
        delete copy[deleteTarget.id];
        return copy;
      });
    } catch {
      // Error manejado por el interceptor
    } finally {
      setDeleteTarget(null);
    }
  }

  // Filtrar usuarios según búsqueda y rol
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRol = !rolFilter || u.rol === rolFilter;
    return matchesSearch && matchesRol;
  });

  const hasPendingChanges = Object.keys(pendingRoles).length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Usuarios</h2>
          <p className="text-text-secondary text-sm">{users.length} usuarios registrados</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Botón guardar cambios (solo visible si hay cambios pendientes) */}
          {hasPendingChanges && (
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {saving ? 'Guardando...' : `Guardar cambios (${Object.keys(pendingRoles).length})`}
            </button>
          )}
          <button
            onClick={downloadUsersExcel}
            className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[250px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-text-primary placeholder-text-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
        <select
          value={rolFilter}
          onChange={(e) => setRolFilter(e.target.value as '' | 'admin' | 'usuario')}
          className="px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="usuario">Usuario</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4">Usuario</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4">Email</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4">Rol</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4">Estado</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4">Incidencias</th>
                <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-light text-sm">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const currentRol = pendingRoles[user.id] || user.rol;
                  const hasChange = !!pendingRoles[user.id];

                  return (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {/* Nombre + foto */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                            {user.fotoPerfil ? (
                              <Image src={user.fotoPerfil} alt={user.nombre} width={36} height={36} className="rounded-full object-cover" />
                            ) : (
                              <span className="text-primary text-sm font-semibold">{user.nombre.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-text-primary">{user.nombre}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-text-secondary">{user.email}</td>

                      {/* Rol (selector) */}
                      <td className="px-6 py-4">
                        <select
                          value={currentRol}
                          onChange={(e) => handleRoleSelect(user, e.target.value as 'admin' | 'usuario')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors focus:outline-none focus:ring-1 focus:ring-primary ${
                            hasChange
                              ? 'border-orange-300 bg-orange-50 text-orange-700'
                              : 'border-gray-200 bg-white text-text-primary'
                          }`}
                        >
                          <option value="usuario">Usuario</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* Estado */}
                      <td className="px-6 py-4">
                        {user.bloqueado ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Bloqueado
                          </span>
                        ) : !user.activo ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600">
                            Inactivo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-600">
                            Activo
                          </span>
                        )}
                      </td>

                      {/* Incidencias */}
                      <td className="px-6 py-4 text-sm text-text-secondary">{user.incidentes.length}</td>

                      {/* Acciones: solo bloquear y eliminar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleBlock(user)}
                            title={user.bloqueado ? 'Desbloquear' : 'Bloquear'}
                            className={`p-2 rounded-lg transition-colors ${
                              user.bloqueado
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-orange-500 hover:bg-orange-50'
                            }`}
                          >
                            {user.bloqueado ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            title="Eliminar usuario"
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar usuario"
        message={`¿Estás seguro de que quieres eliminar a "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
