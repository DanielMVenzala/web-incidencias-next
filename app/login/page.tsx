'use client';

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading, user } = useAuth();
  const router = useRouter();

  // Si ya está logueado, redirigir al dashboard
  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, clave);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-dark flex flex-col items-center justify-center px-4">
      {/* Hero: Logo + Título */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-[180px] h-[180px] relative mb-4">
          <Image
            src="/logo.png"
            alt="Martos Arregla"
            fill
            className="rounded-3xl shadow-lg object-cover"
            priority
          />
        </div>
        <h1 className="text-white text-2xl font-bold tracking-wide">
          Martos Arregla
        </h1>
        <p className="text-white/70 text-sm mt-1">
          Gestión municipal de incidencias
        </p>
      </div>

      {/* Card del formulario */}
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-8">
        <h2 className="text-text-primary text-xl font-semibold text-center mb-6">
          Iniciar sesión
        </h2>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3.5 bg-surface-variant rounded-xl border border-gray-200 text-text-primary placeholder-text-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Contraseña */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-3.5 bg-surface-variant rounded-xl border border-gray-200 text-text-primary placeholder-text-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
            >
              {showPassword ? (
                <svg className="w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-text-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Botón de login */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="text-white/50 text-xs mt-6">
        Panel exclusivo para administradores
      </p>
    </div>
  );
}
