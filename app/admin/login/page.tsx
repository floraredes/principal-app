'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de autenticación
    if (rememberMe) {
      localStorage.setItem('admin_logged_in', 'true');
    }
    router.push('/admin');
  };

  return (
    <main className="min-h-screen bg-emerald-800 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900">Principal SALE</h1>
          <p className="text-sm text-gray-500 font-medium">Acceso Administrador</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="mamafarmacia@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 pl-10 border rounded-xl text-base focus:ring-2 focus:ring-emerald-600 outline-none"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
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
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300"
            />
            <label htmlFor="remember" className="text-sm font-semibold text-gray-700">
              Mantener sesión iniciada
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-base active:scale-95 transition shadow-md mt-4"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}