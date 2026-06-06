'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Hero from '@/components/Hero';
import { getProductCostTotal } from '@/lib/business';
import { moneyBR, pctBR } from '@/lib/format';
import { loadAllDb } from '@/lib/loadAll';

export default function RentabilidadePage() {
  const [db, setDb] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllDb()
      .then(setDb)
      .catch((e) => setError(e.message || 'Erro ao carregar dados'));
  }, []);

  const rows = useMemo(() => {
    if (!db) return [];

    const customers = db.customers || [];
    const orders = db.orders || [];
    const productionOrders = db.productionOrders || [];

    return customers
      .map((client) => {
        const pedidos = orders.filter(
          (o) =>
            (o.client_id || o.clientId) === client.id &&
            (o.status || '') !== 'Cancelado'
        );

        const receita = pedidos.reduce(
          (acc, row) => acc + Number(row.total || 0),
          0
        );

        const custo = pedidos.reduce((acc, row) => {
          const productId = row.product_id || row.productId;
          const quantity = Number(row.quantity || 0);

          const op = productionOrders.find(
            (p) =>
              (p.client_id || p.clientId) === client.id &&
              (p.product_id || p.productId) === productId
          );

          const machineId = op?.machine_id || op?.machineId || null;

          return acc + getProductCostTotal(db, productId, machineId) * quantity;
        }, 0);

        const lucro = receita - custo;
        const margem = receita > 0 ? (lucro / receita) * 100 : 0;

        return {
          client,
          pedidos: pedidos.length,
          receita,
          custo,
          lucro,
          margem,
        };
      })
      .filter((row) => row.pedidos > 0);
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

  return (
    <AppShell>
      <Hero
        kicker="Comercial"
        title="Rentabilidade por cliente"
        description="Resumo por cliente com receita, custo estimado, lucro e margem."
      />

      <section className="section surface">
        <div className="panel-header">
          <div>
            <div className="panel-title">Resumo por cliente</div>
            <div className="panel-subtitle">
              Baseado nos pedidos e custos estimados por produto/máquina
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Pedidos</th>
                <th>Receita</th>
                <th>Custo estimado</th>
                <th>Lucro</th>
                <th>Margem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.client.id}>
                  <td>{row.client.name}</td>
                  <td>{row.pedidos}</td>
                  <td>{moneyBR(row.receita)}</td>
                  <td>{moneyBR(row.custo)}</td>
                  <td>{moneyBR(row.lucro)}</td>
                  <td>{pctBR(row.margem)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!rows.length ? (
          <div className="empty">
            Ainda não existem pedidos suficientes para consolidar rentabilidade por cliente.
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
