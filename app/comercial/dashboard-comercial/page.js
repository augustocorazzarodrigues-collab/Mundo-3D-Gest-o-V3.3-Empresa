'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Hero from '@/components/Hero';
import StatCard from '@/components/StatCard';
import BarPanel from '@/components/BarPanel';
import { getFinancialSummary } from '@/lib/business';
import { moneyBR } from '@/lib/format';
import { loadAllDb } from '@/lib/loadAll';

export default function DashboardComercialPage(){
  const [db,setDb]=useState(null); const [error,setError]=useState('');
  useEffect(()=>{ loadAllDb().then(setDb).catch((e)=>setError(e.message)); },[]);
  if(error) return <AppShell><section className="section alert-box">{error}</section></AppShell>;
  if(!db) return null;
  const fin=getFinancialSummary(db);
  const pedidos=useMemo(()=>({ Aprovado: db.orders.filter((o)=>o.status==='Aprovado').length, 'Em produção': db.orders.filter((o)=>o.status==='Em produção').length, Entregue: db.orders.filter((o)=>o.status==='Entregue').length, Cancelado: db.orders.filter((o)=>o.status==='Cancelado').length }), [db]);
  const pipeline=useMemo(()=>({ 'Novo contato': db.leads.filter((l)=>l.stage==='Novo contato').length, Qualificado: db.leads.filter((l)=>l.stage==='Qualificado').length, 'Orçamento enviado': db.leads.filter((l)=>l.stage==='Orçamento enviado').length, Negociação: db.leads.filter((l)=>l.stage==='Negociação').length, Perdidas: db.leads.filter((l)=>l.stage==='Perdido').length }), [db]);
  return <AppShell><Hero kicker="Comercial" title="Dashboard Comercial" description="Visão de clientes, pedidos, pipeline e financeiro comercial usando dados do banco." /><section className="section cards-grid"><StatCard title="Receitas previstas" value={moneyBR(fin.receitasPrevistas)} description="Composição do comercial" icon="💸" toneClass="green" /><StatCard title="Pedidos em produção" value={db.orders.filter((o)=>o.status==='Em produção').length} description="Pedidos vivos" icon="🧾" toneClass="blue" /><StatCard title="Leads abertos" value={db.leads.filter((l)=>!['Perdido','Fechado'].includes(l.stage)).length} description="Pipeline aberto" icon="🎯" toneClass="orange" /><StatCard title="Clientes ativos" value={db.customers.filter((c)=>c.status==='Ativo').length} description="Base comercial" icon="👥" toneClass="red" /></section><section className="section split-even"><BarPanel title="Status dos pedidos" subtitle="Leitura rápida da carteira" data={pedidos} /><BarPanel title="Pipeline" subtitle="Fases de prospecção" data={pipeline} /></section></AppShell>; }
