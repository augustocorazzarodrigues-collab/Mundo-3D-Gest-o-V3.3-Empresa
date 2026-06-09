'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { getCurrentCompany } from '@/lib/company';
import { hasRouteAccess } from '@/lib/permissions';
import { getMyCompanyMembership } from '@/lib/service';

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

        // 1) Se não estiver logado -> só pode ficar no /login
        if (!sess) {
          if (pathname !== '/login') {
            router.replace('/login');
            return;
          }

          setReady(true);
          return;
        }

        // 2) Se estiver logado, verificar se já possui vínculo com empresa
        const membership = await getMyCompanyMembership();
        if (!active) return;

        const hasCompany = !!membership?.company_id;

        // 3) Se estiver logado mas ainda NÃO tem empresa:
        //    - pode acessar /onboarding
        //    - qualquer outra rota vai para /onboarding
        if (!hasCompany) {
          if (pathname !== '/onboarding') {
            router.replace('/onboarding');
            return;
          }

          setReady(true);
          return;
        }

        // 4) Se estiver logado e JÁ tem empresa:
        //    - não deve voltar para /login
        //    - não deve ficar em /onboarding
        if (pathname === '/login' || pathname === '/onboarding') {
          router.replace('/inicio');
          return;
        }

        // 5) Mantém a lógica existente de perfil por rota
        const company = await getCurrentCompany();
        if (!active) return;

        if (!hasRouteAccess(company.role, pathname)) {
          router.replace('/inicio');
          return;
        }

        setReady(true);
      } catch (e) {
        if (!active) return;
        setError(e.message || 'Erro ao validar login/perfil/empresa');
        setReady(true);
      }
    }

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!sess && pathname !== '/login') {
        router.replace('/login');
        return;
      }

      if (sess) {
        try {
          const membership = await getMyCompanyMembership();
          const hasCompany = !!membership?.company_id;

          if (!hasCompany && pathname !== '/onboarding') {
            router.replace('/onboarding');
            return;
          }

          if (hasCompany && (pathname === '/login' || pathname === '/onboarding')) {
            router.replace('/inicio');
            return;
          }
        } catch (e) {
          console.error('Erro no onAuthStateChange:', e);
        }
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
          <h3 className="section-title">Validando acesso, empresa e perfil...</h3>
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
