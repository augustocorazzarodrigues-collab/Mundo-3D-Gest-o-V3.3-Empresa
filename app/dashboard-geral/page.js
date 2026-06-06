'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Hero from '@/components/Hero';
import StatCard from '@/components/StatCard';
import BarPanel from '@/components/BarPanel';
import { dashboardMetrics, getFinancialSummary } from '@/lib/business';
import { moneyBR } from '@/lib/format';
import { loadAllDb } from '@/lib/loadAll';

export default function DashboardGeralPage() {
  const [db, setDb] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllDb()
      .then(setDb)
      .catch((e) => setError(e.message || 'Erro ao carregar dashboard'));
  }, []);

  const pedidos = useMemo(() => {
    if (!db) return {};
    return {
      Aprovado: (db.orders || []).filter((o) => o.status === 'Aprovado').length,
      'Em produção': (db.orders || []).filter((o) => o.status === 'Em produção').length,
      Entregue: (db.orders || []).filter((o) => o.status === 'Entregue').length,
      Cancelado: (db.orders || []).filter((o) => o.status === 'Cancelado').length,
    };
  }, [db]);

  const pipeline = useMemo(() => {
    if (!db) return {};
    return {
      'Novo contato': (db.leads || []).filter((l) => l.stage === 'Novo contato').length,
      Qualificado: (db.leads || []).filter((l) => l.stage === 'Qualificado').length,
      'Orçamento enviado': (db.leads || []).filter((l) => l.stage === 'Orçamento enviado').length,
      Negociação: (db.leads || []).filter((l) => l.stage === 'Negociação').length,
      Perdidas: (db.leads || []).filter((l) => l.stage === 'Perdido').length,
    };
  }, [db]);

  const operacao = useMemo(() => {
    if (!db) return {};
    return {
      Planejada: (db.productionOrders || []).filter((o) => o.status === 'Planejada').length,
      'Em andamento': (db.productionOrders || []).filter((o) => o.status === 'Em andamento').length,
      Aguardando: (db.productionOrders || []).filter((o) => o.status === 'Aguardando').length,
      Concluída: (db.productionOrders || []).filter((o) => o.status === 'Concluída').length,
    };
  }, [db]);

  if (error) {
    return (
      <AppShell>
        <section className="section">
          <div className="alert-box">{error}</div>
        </section>
      </AppShell>
    );
  }

  if (!db) return null;

  const metrics = dashboardMetrics(db);
  const fin = getFinancialSummary(db);

  return (
    <AppShell>
      <Hero
        kicker="Executivo"
        title="Dashboard Geral"
        description="Resumo cruzado da operação e do comercial usando a mesma base online no Supabase."
      />

      <section className="section cards-grid">
        <StatCard
          title="Receita prevista"
          value={moneyBR(metrics.receita)}
          description="Financeiro previsto"
          icon="💵"
          toneClass="green"
        />
        <StatCard
          title="Saldo real"
          value={moneyBR(fin.saldoReal)}
          description="Receitas reais menos despesas"
          icon="🏦"
          toneClass="blue"
        />
        <StatCard
          title="Clientes ativos"
          value={(db.customers || []).filter((c) => c.status === 'Ativo').length}
          description="Base comercial"
          icon="👥"
          toneClass="orange"
        />
        <StatCard
          title="Projetos ativos"
          value={(db.projects || []).filter((p) => p.status !== 'Arquivado').length}
          description="Portfólio em andamento"
          icon="🧩"
          toneClass="red"
        />
      </section>

      <section className="section split-even">
        <BarPanel title="Pedidos" subtitle="Situação comercial dos pedidos" data={pedidos} />
        <BarPanel title="Pipeline comercial" subtitle="Evolução dos leads por etapa" data={pipeline} />
      </section>

      <section className="section split-even">
        <BarPanel title="Operação" subtitle="Status das ordens de produção" data={operacao} />

        <div className="surface panel">
          <h3 className="section-title">Resumo cruzado</h3>
          <div className="kpi-list">
            <div className="kpi-item">
              <span>Lançamentos financeiros</span>
              <strong>{(fin.entries || []).length}</strong>
            </div>
            <div className="kpi-item">
              <span>Receitas previstas</span>
              <strong>{moneyBR(fin.receitasPrevistas)}</strong>
            </div>
            <div className="kpi-item">
              <span>Receitas reais</span>
              <strong>{moneyBR(fin.receitasReais)}</strong>
            </div>
            <div className="kpi-item">
              <span>Despesas</span>
              <strong>{moneyBR(fin.despesas)}</strong>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
