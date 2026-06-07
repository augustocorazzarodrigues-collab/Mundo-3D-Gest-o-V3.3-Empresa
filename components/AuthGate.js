'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';

export default function AuthGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        const sess = await getSession();
        if (!active) return;
        setSession(sess);

        if (!sess && pathname !== '/login') {
          router.replace('/login');
          return;
        }

        if (sess && pathname === '/login') {
          router.replace('/inicio');
          return;
        }

        setReady(true);
      } catch (e) {
        if (!active) return;
        setError(e.message || 'Erro ao validar login');
        setReady(true);
      }
    }

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess || null);
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
        <div className="surface panel" style={{ width: 420 }}>
          <h3 className="section-title">Validando acesso...</h3>
          <div className="note">Aguarde um instante.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#e9edf3' }}>
        <div className="surface panel" style={{ width: 520 }}>
          <h3 className="section-title">Erro de autenticação</h3>
          <div className="alert-box">{error}</div>
        </div>
      </div>
    );
  }

  if (!session && pathname !== '/login') return null;
  return children;
}
