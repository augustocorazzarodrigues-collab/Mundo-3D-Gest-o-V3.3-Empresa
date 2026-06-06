'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Hero from '@/components/Hero';
import StatCard from '@/components/StatCard';
import { getFinancialSummary } from '@/lib/business';
import { moneyBR, nameById, sortCreated, getFinanceCode, newId } from '@/lib/format';
import { listRows, insertRow, updateRow, deleteRow } from '@/lib/service';

const emptyForm = {
  id: '',
  date: new Date().toISOString().slice(0, 10),
  type: 'Receita',
  category: '',
  client_id: '',
  order_id: '',
  description: '',
  value: '',
  status: 'Previsto',
  source: 'manual',
};

export default function FinanceiroPage() {
  const [entries, setEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const [f, c, o] = await Promise.all([
        listRows('financial_entries'),
        listRows('customers'),
        listRows('orders'),
      ]);
      setEntries(sortCreated(f));
      setCustomers(c);
      setOrders(o);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const summary = getFinancialSummary({ financialEntries: entries });

  function code() {
    return form.id
      ? entries.find((i) => i.id === form.id)?.code || ''
      : getFinanceCode(entries.length);
  }

  async function saveItem(e) {
    e.preventDefault();
    const payload = {
      id: form.id || newId('fin'),
      code: form.id ? form.code || code() : code(),
      source: form.source || 'manual',
      date: form.date,
      type: form.type,
      category: form.category,
      client_id: form.client_id || null,
      order_id: form.order_id || null,
      description: form.description,
      value: Number(form.value || 0),
      status: form.status,
    };

    try {
      if (form.id) await updateRow('financial_entries', form.id, payload);
      else await insertRow('financial_entries', payload);
      await load();
      setForm(emptyForm);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteRow('financial_entries', id);
      await load();
      if (form.id === id) setForm(emptyForm);
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = useMemo(() => {
    return entries.filter((row) =>
      [
        row.code,
        row.type,
        row.category,
        row.description,
        nameById(customers, row.client_id),
        row.status,
        row.source,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [entries, customers, search]);

  const manualCount = entries.filter((e) => e.source !== 'order').length;

  return (
    <AppShell>
      <Hero
        kicker="Comercial"
        title="Financeiro"
        description="Pedidos atualizam o financeiro automaticamente. Agora lançamentos manuais e automáticos também podem ser editados e excluídos."
      />

      {error ? (
        <section className="section">
          <div className="alert-box">{error}</div>
        </section>
      ) : null}

      <section className="section cards-grid">
        <StatCard title="Receitas previstas" value={moneyBR(summary.receitasPrevistas)} description="Pedidos e títulos previstos" icon="💸" toneClass="green" />
        <StatCard title="Receitas reais" value={moneyBR(summary.receitasReais)} description="Entradas recebidas" icon="🏦" toneClass="blue" />
        <StatCard title="Despesas" value={moneyBR(summary.despesas)} description="Saídas registradas" icon="📉" toneClass="orange" />
        <StatCard title="Saldo previsto" value={moneyBR(summary.saldoPrevisto)} description="Receita prevista menos despesas" icon="🧮" toneClass="red" />
      </section>

      <section className="section split-grid">
        <div className="surface panel">
          <h3 className="section-title">Gerenciamento</h3>
          <form onSubmit={saveItem}>
            <div className="row">
              <div className="field col-2">
                <label>Código</label>
                <input disabled value={form.id ? form.code || code() : code()} />
              </div>
              <div className="field col-2">
                <label>Data</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
              <div className="field col-2">
                <label>Tipo</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option>Receita</option>
                  <option>Despesa</option>
                </select>
              </div>
              <div className="field col-3">
                <label>Categoria</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="field col-3">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Previsto</option>
                  <option>Pago</option>
                  <option>Recebido</option>
                  <option>Atrasado</option>
                  <option>Cancelado</option>
                </select>
              </div>
              <div className="field col-4">
                <label>Cliente</label>
                <select value={form.client_id || ''} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field col-4">
                <label>Pedido</label>
                <select value={form.order_id || ''} onChange={(e) => setForm({ ...form, order_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>{o.number}</option>
                  ))}
                </select>
              </div>
              <div className="field col-4">
                <label>Valor</label>
                <input type="number" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
              </div>
              <div className="field col-12">
                <label>Descrição</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
              </div>
            </div>
            <div className="actions-row">
              <button className="btn">Salvar</button>
              <button className="btn-secondary" type="button" onClick={() => setForm(emptyForm)}>Cancelar</button>
            </div>
          </form>
        </div>

        <div className="surface panel">
          <h3 className="section-title">Notas</h3>
          <p className="note">
            Nesta versão, tanto lançamentos manuais quanto automáticos podem ser editados e excluídos.
            Use com atenção quando o lançamento tiver origem em pedido/O.P.
          </p>
          <div className="divider" />
          <div className="kpi-item"><span>Lançamentos manuais</span><strong>{manualCount}</strong></div>
          <div className="kpi-item"><span>Total de lançamentos</span><strong>{entries.length}</strong></div>
        </div>
      </section>

      <section className="section surface">
        <div className="table-tools">
          <input placeholder="Buscar na tabela..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="subtle">{filtered.length} registro(s)</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Data</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Cliente</th>
                <th>Pedido</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Fonte</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>{item.code || '-'}</td>
                  <td>{item.date}</td>
                  <td>{item.type}</td>
                  <td>{item.category}</td>
                  <td>{nameById(customers, item.client_id)}</td>
                  <td>{item.order_id ? nameById(orders, item.order_id, 'number') : '-'}</td>
                  <td>{item.description}</td>
                  <td>{moneyBR(item.value)}</td>
                  <td>{item.status}</td>
                  <td>{item.source === 'order' ? 'Automático' : 'Manual'}</td>
                  <td>
                    <div className="inline-actions">
                      <button className="btn-secondary" onClick={() => setForm({ ...item, value: item.value ?? '' })}>Editar</button>
                      <button className="btn-danger" onClick={() => handleDelete(item.id)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
