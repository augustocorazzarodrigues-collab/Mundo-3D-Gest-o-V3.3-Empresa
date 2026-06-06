'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Hero from '@/components/Hero';
import StatCard from '@/components/StatCard';
import { getMaintenanceStatus, getStockStatus } from '@/lib/format';
import { loadAllDb } from '@/lib/loadAll';

export default function DashboardOperacionalPage(){
  const [db,setDb]=useState(null); const [error,setError]=useState('');
  useEffect(()=>{ loadAllDb().then(setDb).catch((e)=>setError(e.message)); },[]);
  if(error) return <AppShell><section className="section alert-box">{error}</section></AppShell>;
  if(!db) return null;
  return <AppShell><Hero kicker="Operacional" title="Dashboard Operacional" description="Visão rápida do chão de fábrica, materiais e produção usando banco online." /><section className="section cards-grid"><StatCard title="Produtos ativos" value={db.products.filter((p)=>p.status==='Ativo').length} description="Cadastro mestre" icon="📦" toneClass="green" /><StatCard title="Estoque em atenção" value={db.stockItems.filter((i)=>getStockStatus(i).tone!=='success').length} description="Reposição ou falta" icon="📚" toneClass="orange" /><StatCard title="O.P. pendentes" value={db.productionOrders.filter((o)=>!['Concluída','Cancelada'].includes(o.status)).length} description="Produção pendente" icon="🏭" toneClass="blue" /><StatCard title="Máquinas em atenção" value={db.machines.filter((m)=>getMaintenanceStatus(m).tone!=='success').length} description="Manutenção preventiva" icon="🖨️" toneClass="red" /></section><section className="section split-even"><div className="surface panel"><h3 className="section-title">Ordens recentes</h3><div className="stack">{db.productionOrders.slice(0,4).map((op)=><div key={op.id} className="alert-card"><div className="mini-row"><strong style={{flex:1}}>{op.number}</strong><span className={`badge ${op.status==='Concluída'?'success':op.status==='Cancelada'?'danger':'info'}`}>{op.status}</span></div></div>)}</div></div><div className="surface panel"><h3 className="section-title">Manutenção</h3><div className="stack">{db.machines.map((machine,index)=>{ const st=getMaintenanceStatus(machine); return <div key={machine.id} className="maintenance-card"><div className="mini-row"><strong style={{flex:1}}>Impressora - {String(index+1).padStart(2,'0')}</strong><span className={`badge ${st.tone}`}>{st.label}</span></div><div className="progress"><span style={{width:`${st.progress||0}%`, background: st.tone==='danger' ? '#ef4444' : st.tone==='warning' ? '#f59e0b' : st.tone==='info' ? '#60a5fa' : '#22c55e'}} /></div></div>; })}</div></div></section></AppShell>;
}
