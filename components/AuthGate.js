'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { getCurrentCompany } from '@/lib/company';
import {
  hasRouteAccess,
  canAccessPath,
  getMyMenuPermissions
} from '@/lib/permissions';
import {
  getMyCompanyMembership,
  getMyPendingInvite,
  acceptMyPendingInvite
} from '@/lib/service';

export default function AuthGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        setError('');

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

        // 3) Se estiver logado mas ainda NÃO tem empresa
        if (!hasCompany) {
          const invite = await getMyPendingInvite();
          if (!active) return;

          const hasInvite = !!invite?.has_invite;

          // 3A) Se tem convite pendente -> aceita automaticamente
          if (hasInvite) {
            await acceptMyPendingInvite();
            if (!active) return;

            router.replace('/inicio');
            return;
          }

          // 3B) Se não tem convite -> onboarding
          if (pathname !== '/onboarding') {
            router.replace('/onboarding');
            return;
          }

          setReady(true);
          return;
        }

        // 4) Se estiver logado e JÁ tem empresa
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

        // 6) Nova lógica de permissões reais por aba
        let menuContext = {
          role: company.role || 'viewer',
          permissions: {}
        };

        try {
          menuContext = await getMyMenuPermissions();
        } catch {
          menuContext = {
            role: company.role || 'viewer',
            permissions: {}
          };
        }

        const finalRole = menuContext.role || company.role || 'viewer';
        const finalPermissions = menuContext.permissions || {};

        if (!canAccessPath(finalRole, finalPermissions, pathname)) {
          router.replace('/inicio');
          return;
        }

        setReady(true);
      } catch (e) {
        if (!active) return;
        console.error('Erro no AuthGate:', e);
        setError(e.message || 'Erro ao validar login/perfil/empresa/convite/permissões');
        setReady(true);
      }
    }

    boot();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      boot();
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
          <h3 className="section-title">Validando acesso, empresa, convite, perfil e permissões...</h3>
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
