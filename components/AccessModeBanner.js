'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCurrentCompany } from '@/lib/company';
import {
  getMyMenuPermissions,
  getPermissionLevelForPath
} from '@/lib/permissions';

export default function AccessModeBanner() {
  const pathname = usePathname();
  const [mode, setMode] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadMode() {
      try {
        const company = await getCurrentCompany().catch(() => null);

        if (!active || !company) {
          return;
        }

        if (company.role === 'owner' || company.role === 'admin') {
          setMode(null);
          return;
        }

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

        const level = getPermissionLevelForPath(
          menuContext.role || company.role || 'viewer',
          menuContext.permissions || {},
          pathname
        );

        if (!active) return;

        if (level === 'view') {
          setMode('view');
        } else {
          setMode(null);
        }
      } catch {
        if (active) {
          setMode(null);
        }
      }
    }

    loadMode();

    return () => {
      active = false;
    };
  }, [pathname]);

  if (mode !== 'view') {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: 16,
        padding: '12px 14px',
        borderRadius: 14,
        border: '1px solid #BFDBFE',
        background: '#EFF6FF',
        color: '#1D4ED8',
        fontSize: 14,
        fontWeight: 600
      }}
    >
      Modo visualização: você pode consultar esta tela, mas não pode salvar, editar ou excluir registros.
    </div>
  );
}
