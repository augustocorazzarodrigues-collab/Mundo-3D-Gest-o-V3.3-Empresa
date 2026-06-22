'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { signOutUser } from '@/lib/auth';
import { getCurrentCompany } from '@/lib/company';
import {
  filterLinksByRole,
  filterMenuItemsByPermissions,
  getMyMenuPermissions,
  groupVisibleLinks
} from '@/lib/permissions';

const links = [
  { href: '/inicio', label: 'Início', icon: '🏠', tabKey: 'Início' },
  { href: '/dashboard-geral', label: 'Dashboard Geral', icon: '📊', tabKey: 'Dashboard Geral' },

  { title: 'Administração' },
  { href: '/usuarios', label: 'Usuários', icon: '👤', tabKey: 'Usuários' },

  { title: 'Operacional' },
  {
    href: '/operacional/dashboard-operacional',
    label: 'Dashboard Operacional',
    icon: '🏭',
    tabKey: 'Dashboard Operacional'
  },
  { href: '/operacional/produtos', label: 'Produtos', icon: '📦', tabKey: 'Produtos' },
  { href: '/operacional/maquinas', label: 'Máquinas', icon: '🖨️', tabKey: 'Máquinas' },
  { href: '/operacional/estoque', label: 'Estoque', icon: '📚', tabKey: 'Estoque' },
  { href: '/operacional/mov-estoque', label: 'Mov. Estoque', icon: '🔄', tabKey: 'Mov. Estoque' },
  {
    href: '/operacional/ordens-producao',
    label: 'Ordens Produção',
    icon: '🛠️',
    tabKey: 'Ordens Produção'
  },
  { href: '/operacional/projetos', label: 'Projetos', icon: '🧩', tabKey: 'Projetos' },
  { href: '/operacional/precificacao', label: 'Precificação', icon: '💹', tabKey: 'Precificação' },

  { title: 'Comercial' },
  {
    href: '/comercial/dashboard-comercial',
    label: 'Dashboard Comercial',
    icon: '📈',
    tabKey: 'Dashboard Comercial'
  },
  { href: '/comercial/clientes', label: 'Clientes', icon: '👥', tabKey: 'Clientes' },
  { href: '/comercial/pedidos', label: 'Pedidos', icon: '🧾', tabKey: 'Pedidos' },
  { href: '/comercial/prospeccoes', label: 'Prospecções', icon: '🎯', tabKey: 'Prospecções' },
  {
    href: '/comercial/cartilha-clientes',
    label: 'Cartilha Clientes',
    icon: '📘',
    tabKey: 'Cartilha Clientes'
  },
  {
    href: '/comercial/rentabilidade-clientes',
    label: 'Rentabilidade Clientes',
    icon: '💰',
    tabKey: 'Rentabilidade Clientes'
  },
  { href: '/comercial/financeiro', label: 'Financeiro', icon: '🏦', tabKey: 'Financeiro' }
];

const roleLabel = {
  owner: 'Owner',
  admin: 'Admin',
  comercial: 'Comercial',
  operacional: 'Operacional',
  financeiro: 'Financeiro',
  viewer: 'Leitura'
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('Carregando...');
  const [role, setRole] = useState('viewer');
  const [tabPermissions, setTabPermissions] = useState({});
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    async function loadContext() {
      try {
        setLoadingMenu(true);

        const { data } = await supabase.auth.getSession();
        setEmail(data?.session?.user?.email || '');

        try {
          const company = await getCurrentCompany();
          setCompanyName(company.company_name || 'Empresa');
          setRole(company.role || 'viewer');
        } catch {
          setCompanyName('Sem empresa');
          setRole('viewer');
        }

        try {
          const menuData = await getMyMenuPermissions();
          setTabPermissions(menuData.permissions || {});
        } catch {
          setTabPermissions({});
        }
      } finally {
        setLoadingMenu(false);
      }
    }

    loadContext();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadContext();
    });

    return () => authListener?.subscription?.unsubscribe?.();
  }, []);

  async function handleLogout() {
    await signOutUser();
    router.replace('/login');
  }

  const visibleLinks = useMemo(() => {
    const roleFiltered = filterLinksByRole(links, role);
    const permissionFiltered =
      role === 'owner'
        ? roleFiltered
        : filterMenuItemsByPermissions(roleFiltered, role, tabPermissions);

    return groupVisibleLinks(permissionFiltered, role, tabPermissions);
  }, [role, tabPermissions]);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge" />
        <div>
          <h1>Mundo 3D</h1>
          <div className="brand-subtitle">Gestão • V4 Multiempresa</div>
        </div>
      </div>

      <div className="sidebar-card">
        <strong>Empresa atual:</strong>
        <br />
        {companyName}
      </div>

      <div className="sidebar-card">
        <strong>Usuário logado:</strong>
        <br />
        {email || 'Não identificado'}

        <div style={{ marginTop: 10 }}>
          <strong>Perfil:</strong>
          <br />
          {roleLabel[role] || role}
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn-secondary" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </div>

      <div className="sidebar-title">Navegação</div>

      <nav className="nav-list">
        {loadingMenu
          ? null
          : visibleLinks.map((item, index) =>
              item.title ? (
                <div
                  key={`t-${index}`}
                  className="sidebar-title"
                  style={{ marginTop: 12 }}
                >
                  {item.title}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${pathname === item.href ? 'active' : ''}`}
                >
                  <span className="nav-emoji">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            )}
      </nav>

      <div className="sidebar-card">
        O menu agora respeita o perfil do usuário e também as permissões reais por aba configuradas na tela de usuários.
      </div>
    </aside>
  );
}
