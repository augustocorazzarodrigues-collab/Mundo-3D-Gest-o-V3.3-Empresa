'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { signOutUser } from '@/lib/auth';
import { getCurrentCompany } from '@/lib/company';
import { filterLinksByRole } from '@/lib/permissions';

const links = [
  { href:'/inicio', label:'Início', icon:'🏠' },
  { href:'/dashboard-geral', label:'Dashboard Geral', icon:'📊' },

  { title:'Administração' },
  { href:'/usuarios', label:'Usuários', icon:'👤' },

  { title:'Operacional' },
  { href:'/operacional/dashboard-operacional', label:'Dashboard Operacional', icon:'🏭' },
  { href:'/operacional/produtos', label:'Produtos', icon:'📦' },
  { href:'/operacional/maquinas', label:'Máquinas', icon:'🖨️' },
  { href:'/operacional/estoque', label:'Estoque', icon:'📚' },
  { href:'/operacional/mov-estoque', label:'Mov. Estoque', icon:'🔄' },
  { href:'/operacional/ordens-producao', label:'Ordens Produção', icon:'🛠️' },
  { href:'/operacional/projetos', label:'Projetos', icon:'🧩' },
  { href:'/operacional/precificacao', label:'Precificação', icon:'💹' },

  { title:'Comercial' },
  { href:'/comercial/dashboard-comercial', label:'Dashboard Comercial', icon:'📈' },
  { href:'/comercial/clientes', label:'Clientes', icon:'👥' },
  { href:'/comercial/pedidos', label:'Pedidos', icon:'🧾' },
  { href:'/comercial/prospeccoes', label:'Prospecções', icon:'🎯' },
  { href:'/comercial/cartilha-clientes', label:'Cartilha Clientes', icon:'📘' },
  { href:'/comercial/rentabilidade-clientes', label:'Rentabilidade Clientes', icon:'💰' },
  { href:'/comercial/financeiro', label:'Financeiro', icon:'🏦' },
];

const roleLabel = {
  owner: 'Owner',
  admin: 'Admin',
  comercial: 'Comercial',
  operacional: 'Operacional',
  financeiro: 'Financeiro',
  viewer: 'Leitura',
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('Carregando...');
  const [role, setRole] = useState('viewer');

  useEffect(() => {
    async function loadContext() {
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

  const visibleLinks = useMemo(() => filterLinksByRole(links, role), [role]);

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
        <strong>Empresa atual:</strong><br />
        {companyName}
      </div>

      <div className="sidebar-card">
        <strong>Usuário logado:</strong><br />
        {email || 'Não identificado'}
        <div style={{ marginTop: 10 }}>
          <strong>Perfil:</strong><br />
          {roleLabel[role] || role}
        </div>
        <div style={{ marginTop: 12 }}>
          <button className="btn-secondary" onClick={handleLogout}>Sair</button>
        </div>
      </div>

      <div className="sidebar-title">Navegação</div>
      <nav className="nav-list">
        {visibleLinks.map((item, index) => item.title ? (
          <div key={`t-${index}`} className="sidebar-title" style={{ marginTop: 12 }}>{item.title}</div>
        ) : (
          <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
            <span className="nav-emoji">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-card">
        O menu agora respeita o perfil do usuário. Se quiser, no próximo passo podemos separar também permissões por ação (ex.: pode ver, mas não pode editar).
      </div>
    </aside>
  );
}
