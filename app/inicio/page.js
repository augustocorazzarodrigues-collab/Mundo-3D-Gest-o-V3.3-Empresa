'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Hero from '@/components/Hero';
import StatCard from '@/components/StatCard';
import { dashboardMetrics, getFinancialSummary } from '@/lib/business';
import { getMaintenanceStatus, getStockStatus, moneyBR } from '@/lib/format';
import { loadAllDb } from '@/lib/loadAll';

export default function InicioPage(){
  const [db,setDb]=useState(null);
  const [error,setError]=useState('');
  useEffect(()=>{ loadAllDb().then(setDb).catch((e)=>setError(e.message)); },[]);
  if(error) return <AppShell><section className="section alert-box">{error}</section></AppShell>;
  if(!db) return null;
  const metrics=dashboardMetrics(db);
  const fin=getFinancialSummary(db);
  return (
    <AppShell>
      <Hero kicker="Banco online" title="Dashboard Geral" description="Nesta V3.3 todos os módulos usam Supabase. O que você alterar aparece para o seu sócio e vice-versa, tudo online." actions={<><Link className="btn" href="/operacional/produtos">Novo Produto</Link><Link className="btn-secondary" href="/operacional/ordens-producao">Nova O.P.</Link><Link className="btn-ghost" href="/operacional/mov-estoque">Movimentar Estoque</Link><Link className="btn-secondary" href="/comercial/pedidos">Novo Pedido</Link></>} />
      <section className="section cards-grid">
        <StatCard title="Receita Prevista" value={moneyBR(metrics.receita)} description="Calculada pelo banco" icon="💰" toneClass="green" />
        <StatCard title="Saldo Previsto" value={moneyBR(metrics.lucro)} description="Receitas previstas menos despesas" icon="📈" toneClass="blue" />
        <StatCard title="O.P. em aberto" value={metrics.opsAbertas} description="Ordens não concluídas" icon="🏭" toneClass="orange" />
        <StatCard title="Leads abertos" value={metrics.leadsAbertos} description="Pipeline comercial" icon="🎯" toneClass="red" />
      </section>
      <section className="section quick-grid">
        <Link href="/operacional/ordens-producao" className="quick-link"><div className="mini-icon">🏭</div><h3>Ordens Produção</h3><p>Controle de O.P., máquinas, material e prazo.</p></Link>
        <Link href="/comercial/pedidos" className="quick-link"><div className="mini-icon">🧾</div><h3>Pedidos</h3><p>Pedidos conectados a clientes, projetos e financeiro.</p></Link>
        <Link href="/operacional/precificacao" className="quick-link"><div className="mini-icon">💰</div><h3>Precificação</h3><p>Custo total, preço sugerido e margem real.</p></Link>
      </section>
      <section className="section split-even">
        <div className="surface panel"><h3 className="section-title">Alertas rápidos</h3><div className="kpi-list"><div className="kpi-item"><span>Estoque em atenção</span><span className="small-value">{db.stockItems.filter((i)=>getStockStatus(i).tone!=='success').length}</span></div><div className="kpi-item"><span>Máquinas em atenção</span><span className="small-value">{db.machines.filter((i)=>getMaintenanceStatus(i).tone!=='success').length}</span></div><div className="kpi-item"><span>Pedidos em produção</span><span className="small-value">{db.orders.filter((o)=>o.status==='Em produção').length}</span></div><div className="kpi-item"><span>Projetos ativos</span><span className="small-value">{db.projects.filter((p)=>p.status!=='Arquivado').length}</span></div></div></div>
        <div className="surface panel"><h3 className="section-title">Divisões</h3><p className="note">Operacional alimenta produção, estoque, O.P. e custos. Comercial usa a mesma base para clientes, pedidos, pipeline e financeiro.</p><div className="divider" /><div className="kpi-item"><span>Receitas previstas</span><strong>{moneyBR(fin.receitasPrevistas)}</strong></div><div className="kpi-item"><span>Receitas reais</span><strong>{moneyBR(fin.receitasReais)}</strong></div><div className="kpi-item"><span>Despesas</span><strong>{moneyBR(fin.despesas)}</strong></div><div className="kpi-item"><span>Saldo real</span><strong>{moneyBR(fin.saldoReal)}</strong></div></div>
      </section>
    </AppShell>
  );
}
