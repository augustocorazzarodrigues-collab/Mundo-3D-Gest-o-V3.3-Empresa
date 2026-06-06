'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Hero from '@/components/Hero';
import { getMachineName, getOPNumber, nameById, sortCreated, newId } from '@/lib/format';
import { listRows, insertRow, updateRow, deleteRow } from '@/lib/service';

const emptyForm = {
  id: '',
  order_id: '',
  product_id: '',
  project_id: '',
  client_id: '',
  machine_id: '',
  quantity: '',
  due_date: '',
  status: 'Planejada',
  material_stock_id: '',
  consumo_kg: '',
};

export default function OrdensPage() {
  const [ops, setOps] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [machines, setMachines] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const [o, ord, p, c, pr, m, s] = await Promise.all([
        listRows('production_orders'),
        listRows('orders'),
        listRows('products'),
        listRows('customers'),
        listRows('projects'),
        listRows('machines'),
        listRows('stock_items'),
      ]);
      setOps(sortCreated(o));
      setOrders(ord);
      setProducts(p);
      setCustomers(c);
      setProjects(pr);
      setMachines(m);
      setStockItems(s);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function number() {
    return form.id ? ops.find((o) => o.id === form.id)?.number || '' : getOPNumber(ops.length);
  }

  async function adjustStock(materialStockId, deltaKg) {
    if (!materialStockId || !deltaKg) return;
    const stockItem = stockItems.find((s) => s.id === materialStockId);
    if (!stockItem) return;

    const newBalance = Number(stockItem.saldo_atual || 0) + Number(deltaKg || 0);
    await updateRow('stock_items', stockItem.id, {
      ...stockItem,
      saldo_atual: newBalance,
    });
  }

  async function saveItem(e) {
    e.preventDefault();

    try {
      const existingOp = form.id ? ops.find((o) => o.id === form.id) : null;
      const nextStatus = form.status;
      const nextConsumo = Number(form.consumo_kg || 0);
      const nextStockId = form.material_stock_id || null;

      let materialDebited = existingOp?.material_debited || false;

      // CENÁRIO 1: ainda não debitou e está virando Concluída => debita estoque
      if (!materialDebited && nextStatus === 'Concluída' && nextStockId && nextConsumo > 0) {
        await adjustStock(nextStockId, -nextConsumo);
        materialDebited = true;
      }

      // CENÁRIO 2: já tinha debitado e saiu de Concluída => devolve estoque
      if (materialDebited && existingOp?.status === 'Concluída' && nextStatus !== 'Concluída' && existingOp?.material_stock_id && Number(existingOp?.consumo_kg || 0) > 0) {
        await adjustStock(existingOp.material_stock_id, Number(existingOp.consumo_kg || 0));
        materialDebited = false;
      }

      // CENÁRIO 3: já estava concluída e o usuário trocou material ou consumo => recalcula diferença
      if (
        materialDebited &&
        existingOp?.status === 'Concluída' &&
        nextStatus === 'Concluída' &&
        (
          existingOp?.material_stock_id !== nextStockId ||
          Number(existingOp?.consumo_kg || 0) !== nextConsumo
        )
      ) {
        // devolve o antigo
        if (existingOp?.material_stock_id && Number(existingOp?.consumo_kg || 0) > 0) {
          await adjustStock(existingOp.material_stock_id, Number(existingOp.consumo_kg || 0));
        }
        // debita o novo
        if (nextStockId && nextConsumo > 0) {
          await adjustStock(nextStockId, -nextConsumo);
        }
        materialDebited = true;
      }

      const payload = {
        id: form.id || newId('op'),
        number: number(),
        order_id: form.order_id || null,
        product_id: form.product_id,
        project_id: form.project_id || null,
        client_id: form.client_id || null,
        machine_id: form.machine_id || null,
        quantity: Number(form.quantity || 0),
        due_date: form.due_date || null,
        status: nextStatus,
        material_stock_id: nextStockId,
        consumo_kg: nextConsumo,
        material_debited: materialDebited,
      };

      if (form.id) await updateRow('production_orders', form.id, payload);
      else await insertRow('production_orders', payload);

      await load();
      setForm(emptyForm);
    } catch (e) {
      setError(e.message);
    }
  }

  async function cascadeDelete(op) {
    // se a O.P. já tinha debitado material e for excluída, devolve pro estoque
    if (op.material_debited && op.material_stock_id && Number(op.consumo_kg || 0) > 0) {
      await adjustStock(op.material_stock_id, Number(op.consumo_kg || 0));
    }

    const allMovements = await listRows('movement_items');
    const relatedMovements = allMovements.filter((mov) => mov.document === op.number);
    for (const mov of relatedMovements) {
      await deleteRow('movement_items', mov.id);
    }

    if (op.order_id) {
      const allFinancial = await listRows('financial_entries');
      const relatedFinancial = allFinancial.filter((fin) => fin.order_id === op.order_id);
      for (const fin of relatedFinancial) {
        await deleteRow('financial_entries', fin.id);
      }
      await deleteRow('orders', op.order_id);
    }

    await deleteRow('production_orders', op.id);
  }

  async function handleDelete(id) {
    try {
      const op = ops.find((x) => x.id === id);
      if (!op) return;
      await cascadeDelete(op);
      await load();
      if (form.id === id) setForm(emptyForm);
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = useMemo(() => {
    return ops.filter((op) =>
      [op.number, nameById(products, op.product_id), nameById(customers, op.client_id), op.status]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [ops, products, customers, search]);

  return (
    <AppShell>
      <Hero
        kicker="Operacional"
        title="Ordens de Produção"
        description="Cada ordem recebe número automático e pode ser usada como documento na saída do estoque. Ao concluir, o material é debitado do estoque automaticamente."
      />

      {error ? (
        <section className="section">
          <div className="alert-box">{error}</div>
        </section>
      ) : null}

      <section className="section surface">
        <div className="panel-header">
          <div>
            <div className="panel-title">Gerenciamento</div>
            <div className="panel-subtitle">Planejamento e controle das O.P.</div>
          </div>
          <button className="btn" onClick={() => setForm(emptyForm)}>Novo registro</button>
        </div>

        <div className="panel">
          <form onSubmit={saveItem}>
            <div className="row">
              <div className="field col-2"><label>Nº O.P.</label><input disabled value={number()} /></div>
              <div className="field col-3">
                <label>Pedido origem</label>
                <select value={form.order_id} onChange={(e) => setForm({ ...form, order_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {orders.map((o) => <option key={o.id} value={o.id}>{o.number}</option>)}
                </select>
              </div>
              <div className="field col-3">
                <label>Produto</label>
                <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
                  <option value="">Selecione...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="field col-3">
                <label>Cliente</label>
                <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="field col-3">
                <label>Projeto</label>
                <select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                </select>
              </div>
              <div className="field col-3">
                <label>Máquina</label>
                <select value={form.machine_id} onChange={(e) => setForm({ ...form, machine_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {machines.map((m, index) => <option key={m.id} value={m.id}>{getMachineName(index)}</option>)}
                </select>
              </div>
              <div className="field col-3">
                <label>Item de estoque</label>
                <select value={form.material_stock_id} onChange={(e) => setForm({ ...form, material_stock_id: e.target.value })}>
                  <option value="">Selecione...</option>
                  {stockItems.map((i) => <option key={i.id} value={i.id}>{i.item_name}</option>)}
                </select>
              </div>
              <div className="field col-2"><label>Qtd</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></div>
              <div className="field col-2"><label>Consumo (Kg)</label><input type="number" step="0.01" value={form.consumo_kg} onChange={(e) => setForm({ ...form, consumo_kg: e.target.value })} required /></div>
              <div className="field col-2"><label>Prazo</label><input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              <div className="field col-3">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Planejada</option>
                  <option>Em andamento</option>
                  <option>Aguardando</option>
                  <option>Concluída</option>
                  <option>Cancelada</option>
                </select>
              </div>
            </div>
            <div className="actions-row">
              <button className="btn">Salvar</button>
              <button className="btn-secondary" type="button" onClick={() => setForm(emptyForm)}>Cancelar</button>
            </div>
          </form>
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
                <th>Nº O.P.</th>
                <th>Pedido</th>
                <th>Produto</th>
                <th>Cliente</th>
                <th>Projeto</th>
                <th>Máquina</th>
                <th>Item estoque</th>
                <th>Qtd</th>
                <th>Consumo</th>
                <th>Prazo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const mIdx = machines.findIndex((m) => m.id === item.machine_id);
                return (
                  <tr key={item.id}>
                    <td>{item.number}</td>
                    <td>{item.order_id ? nameById(orders, item.order_id, 'number') : '-'}</td>
                    <td>{nameById(products, item.product_id)}</td>
                    <td>{nameById(customers, item.client_id)}</td>
                    <td>{item.project_id ? `${nameById(projects, item.project_id, 'code')} - ${nameById(projects, item.project_id)}` : '-'}</td>
                    <td>{mIdx >= 0 ? getMachineName(mIdx) : '-'}</td>
                    <td>{nameById(stockItems, item.material_stock_id, 'item_name')}</td>
                    <td>{item.quantity}</td>
                    <td>{item.consumo_kg}</td>
                    <td>{item.due_date || '-'}</td>
                    <td><span className={`badge ${item.status === 'Concluída' ? 'success' : item.status === 'Cancelada' ? 'danger' : 'info'}`}>{item.status}</span></td>
                    <td>
                      <div className="inline-actions">
                        <button className="btn-secondary" onClick={() => setForm({ ...item, quantity: item.quantity ?? '', consumo_kg: item.consumo_kg ?? '' })}>Editar</button>
                        <button className="btn-danger" onClick={() => handleDelete(item.id)}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
