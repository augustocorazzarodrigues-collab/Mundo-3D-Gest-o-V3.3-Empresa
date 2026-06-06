'use client';
import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Hero from '@/components/Hero';
import { getProductCostTotal } from '@/lib/business';
import { moneyBR, pctBR } from '@/lib/format';
import { loadAllDb } from '@/lib/loadAll';

export default function RentabilidadePage(){
  const [db,setDb]=useState(null); const [error,setError]=useState('');
  useEffect(()=>{ loadAllDb().then(setDb).catch((e)=>setError(e.message)); },[]);
  if(error) return <AppShell><section className="section alert-box">{error}</section></AppShell>;
  if(!db) return null;
  const rows=useMemo(()=>db.customers.map((client)=>{ const pedidos=db.orders.filter((o)=>o.client_id===client.id && o.status!=='Cancelado'); const receita=pedidos.reduce((acc,row)=>acc+Number(row.total||0),0); const custo=pedidos.reduce((acc,row)=>{ const op=db.productionOrders.find((p)=>p.client_id===client.id && p.product_id===row.product_id); return acc + (getProductCostTotal({ ...db, machineModels: db.machineModels },row.product_id,op?.machine_id) * Number(row.quantity||0)); },0); const lucro=receita-custo; const margem=receita>0 ? (lucro/receita)*100 : 0; return { client, pedidos:pedidos.length, receita, custo, lucro, margem }; }).filter((row)=>row.pedidos>0), [db]);
  return <AppShell><Hero kicker="Comercial" title="Rentabilidade por cliente" description="Resumo por cliente com receita, custo estimado, lucro e margem." /><section className="section surface"><div className="panel-header"><div><div className="panel-title">Resumo por cliente</div></div></div><div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Pedidos</th><th>Receita</th><th>Custo estimado</th><th>Lucro</th><th>Margem</th></tr></thead><tbody>{rows.map((row)=><tr key={row.client.id}><td>{row.client.name}</td><td>{row.pedidos}</td><td>{moneyBR(row.receita)}</td><td>{moneyBR(row.custo)}</td><td>{moneyBR(row.lucro)}</td><td>{pctBR(row.margem)}</td></tr>)}</tbody></table></div>{!rows.length ? <div className="empty">Ainda não existem pedidos suficientes para consolidar rentabilidade por cliente.</div> : null}</section></AppShell>;
}
