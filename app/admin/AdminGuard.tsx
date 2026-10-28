'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [loading, setLoading] = useState(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) return;

    let isMounted = true;

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (!session) {
        router.replace('/admin/login');
      } else {
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [isLoginPage, router]);

  if (loading && !isLoginPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  return <>{children}</>;
}