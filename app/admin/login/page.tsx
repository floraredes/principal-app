'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg('Credenciales incorrectas o usuario no registrado.');
      setLoading(false);
    } else {
      // Guardar preferencia de sesión
      if (!rememberMe) {
        // Si no desea mantener sesión, se puede marcar para limpiar al cerrar pestaña
        sessionStorage.setItem('temp_session', 'true');
      } else {
        localStorage.setItem('remember_admin', 'true');
      }

      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900">Principal SALE</h1>
          <p className="text-sm text-slate-500 font-medium">Acceso Administrador</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="tu_email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 pl-10 border rounded-xl text-base focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 pl-10 border rounded-xl text-base focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Casilla Mantener Sesión Iniciada */}
          <div className="pt-1">
            <label className="flex items-center gap-3 p-1 cursor-pointer select-none rounded-xl hover:bg-slate-50 transition">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 rounded border-slate-300 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-700">
                Mantener sesión iniciada
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-base transition shadow-md mt-4 disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </main>
  );
}