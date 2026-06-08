'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { getCurrentCompany } from '@/lib/company';
import { hasRouteAccess } from '@/lib/permissions';

export default function AuthGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        const sess = await getSession();
        if (!active) return;

        if (!sess && pathname !== '/login') {
          router.replace('/login');
          return;
        }

        if (sess && pathname === '/login') {
          router.replace('/inicio');
          return;
        }

        if (sess && pathname !== '/login') {
          const company = await getCurrentCompany();
          if (!hasRouteAccess(company.role, pathname)) {
            router.replace('/inicio');
            return;
          }
        }

        setReady(true);
      } catch (e) {
        if (!active) return;
        setError(e.message || 'Erro ao validar login/perfil');
        setReady(true);
      }
    }

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!sess && pathname !== '/login') {
        router.replace('/login');
      }
      if (sess && pathname === '/login') {
        router.replace('/inicio');
      }
    });

    return () => {
      active = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#e9edf3' }}>
        <div className="surface panel" style={{ width: 460 }}>
          <h3 className="section-title">Validando acesso e perfil...</h3>
          <div className="note">Aguarde um instante.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#e9edf3' }}>
        <div className="surface panel" style={{ width: 560 }}>
          <h3 className="section-title">Erro de autenticação/perfil</h3>
          <div className="alert-box">{error}</div>
        </div>
      </div>
    );
  }

  return children;
}
