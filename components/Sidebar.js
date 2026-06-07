'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { signOutUser } from '@/lib/auth';

const links = [
  { href:'/inicio', label:'Início', icon:'🏠' },
  { href:'/dashboard-geral', label:'Dashboard Geral', icon:'📊' },
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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data?.session?.user?.email || '');
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email || '');
    });

    return () => authListener?.subscription?.unsubscribe?.();
  }, []);

  async function handleLogout() {
    await signOutUser();
    router.replace('/login');
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-badge" />
        <div>
          <h1>Mundo 3D</h1>
          <div className="brand-subtitle">Gestão • V3.3 FULL Banco</div>
        </div>
      </div>

      <div className="sidebar-card">
        Dados centralizados no Supabase. O que você alterar aparece para o seu sócio e vice-versa, tudo online.
      </div>

      <div className="sidebar-card">
        <strong>Usuário logado:</strong><br />
        {email || 'Não identificado'}
        <div style={{ marginTop: 10 }}>
          <button className="btn-secondary" onClick={handleLogout}>Sair</button>
        </div>
      </div>

      <div className="sidebar-title">Navegação</div>
      <nav className="nav-list">
        {links.map((item, index) => item.title ? (
          <div key={`t-${index}`} className="sidebar-title" style={{ marginTop: 12 }}>{item.title}</div>
        ) : (
          <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
            <span className="nav-emoji">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-card">
        Operação compartilhada com login por usuário. Se quiser, no próximo passo podemos separar permissões por área.
      </div>
    </aside>
  );
}
