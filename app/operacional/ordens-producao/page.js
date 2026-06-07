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
  material_mode: 'Monocromático',
  material_stock_id_1: '',
  consumo_kg_1: '',
  material_stock_id_2: '',
  consumo_kg_2: '',
  material_stock_id_3: '',
  consumo_kg_3: '',
  material_stock_id_4: '',
  consumo_kg_4: '',
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

  function buildMaterialsFromForm(currentForm) {
    const slots = [1, 2, 3, 4].map((n) => ({
      stock_id: currentForm[`material_stock_id_${n}`] || '',
      qty: Number(currentForm[`consumo_kg_${n}`] || 0),
      index: n,
    }));

    if ((currentForm.material_mode || 'Monocromático') === 'Monocromático') {
      return slots.slice(0, 1).filter((x) => x.stock_id && x.qty > 0);
    }

    return slots.filter((x) => x.stock_id && x.qty > 0);
  }

  function buildMaterialsFromOp(op) {
    if (!op) return [];

    const hasNewStructure = op.material_stock_id_1 || op.material_stock_id_2 || op.material_stock_id_3 || op.material_stock_id_4;

    if (hasNewStructure) {
      return [1, 2, 3, 4]
        .map((n) => ({
          stock_id: op[`material_stock_id_${n}`] || '',
          qty: Number(op[`consumo_kg_${n}`] || 0),
          index: n,
        }))
        .filter((x) => x.stock_id && x.qty > 0);
    }

    // compatibilidade com registros antigos
    if (op.material_stock_id && Number(op.consumo_kg || 0) > 0) {
      return [{ stock_id: op.material_stock_id, qty: Number(op.consumo_kg || 0), index: 1 }];
    }

    return [];
  }

  function getTotalConsumption(materials) {
    return materials.reduce((acc, item) => acc + Number(item.qty || 0), 0);
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

  async function getAutoMovements(opNumber) {
    const allMovements = await listRows('movement_items');
    return allMovements.filter(
      (mov) => String(mov.document || '').startsWith(`${opNumber}::AUTO::`) && mov.type === 'Saída'
    );
  }

  async function createAutoMovements(opNumber, materials) {
    for (const item of materials) {
      const stockItem = stockItems.find((s) => s.id === item.stock_id);
      await insertRow('movement_items', {
        id: newId('mov'),
        date: new Date().toISOString().slice(0, 10),
        type: 'Saída',
        stock_item_id: item.stock_id,
        document: `${opNumber}::AUTO::${item.index}`,
        qty_kg: Number(item.qty || 0),
        cost_unit: Number(stockItem?.custo_unit || 0),
        value: Number(item.qty || 0) * Number(stockItem?.custo_unit || 0),
      });
      await adjustStock(item.stock_id, -Number(item.qty || 0));
    }
  }

  async function revertAndDeleteAutoMovements(opNumber) {
    const oldMovements = await getAutoMovements(opNumber);
    for (const mov of oldMovements) {
      const qty = Number(mov.qty_kg || 0);
      if (mov.stock_item_id && qty > 0) {
        await adjustStock(mov.stock_item_id, qty);
      }
      await deleteRow('movement_items', mov.id);
    }
  }

  async function saveItem(e) {
    e.preventDefault();

    try {
      const opNumber = number();
      const existingOp = form.id ? ops.find((o) => o.id === form.id) : null;
      const nextStatus = form.status;
      const materials = buildMaterialsFromForm(form);
      const totalConsumo = getTotalConsumption(materials);

      // Se está concluída, recria as movimentações automáticas com base no estado atual.
      if (nextStatus === 'Concluída') {
        await revertAndDeleteAutoMovements(opNumber);
        if (materials.length) {
          await createAutoMovements(opNumber, materials);
        }
      }

      // Se antes estava concluída e agora não está mais, devolve estoque e remove movimentos automáticos.
      if (existingOp?.status === 'Concluída' && nextStatus !== 'Concluída') {
        await revertAndDeleteAutoMovements(opNumber);
      }

      const payload = {
        id: form.id || newId('op'),
        number: opNumber,
        order_id: form.order_id || null,
        product_id: form.product_id,
        project_id: form.project_id || null,
        client_id: form.client_id || null,
        machine_id: form.machine_id || null,
        quantity: Number(form.quantity || 0),
        due_date: form.due_date || null,
        status: nextStatus,
        material_mode: form.material_mode || 'Monocromático',

        material_stock_id_1: form.material_stock_id_1 || null,
        consumo_kg_1: Number(form.consumo_kg_1 || 0),
        material_stock_id_2: form.material_stock_id_2 || null,
        consumo_kg_2: Number(form.consumo_kg_2 || 0),
        material_stock_id_3: form.material_stock_id_3 || null,
        consumo_kg_3: Number(form.consumo_kg_3 || 0),
        material_stock_id_4: form.material_stock_id_4 || null,
        consumo_kg_4: Number(form.consumo_kg_4 || 0),

        // compatibilidade com campos antigos
        material_stock_id: materials[0]?.stock_id || null,
        consumo_kg: totalConsumo,
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
    await revertAndDeleteAutoMovements(op.number);

    const allMovements = await listRows('movement_items');
    const relatedMovements = allMovements.filter((mov) => String(mov.document || '').startsWith(`${op.number}`));
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

  function materialSummary(op) {
    const mats = buildMaterialsFromOp(op);
    if (!mats.length) return '-';
    return mats.map((m) => `${nameById(stockItems, m.stock_id, 'item_name')} (${m.qty} kg)`).join(' | ');
  }

  function fillFormForEdit(item) {
    const materials = buildMaterialsFromOp(item);
    const mode = item.material_mode || (materials.length > 1 ? 'Colorido' : 'Monocromático');

    const next = {
      ...emptyForm,
      ...item,
      quantity: item.quantity ?? '',
      due_date: item.due_date || '',
      material_mode: mode,
    };

    [1, 2, 3, 4].forEach((n) => {
      next[`material_stock_id_${n}`] = '';
      next[`consumo_kg_${n}`] = '';
    });

    materials.forEach((m, idx) => {
      const slot = idx + 1;
      if (slot <= 4) {
        next[`material_stock_id_${slot}`] = m.stock_id;
        next[`consumo_kg_${slot}`] = m.qty;
      }
    });

    setForm(next);
  }

  return (
    <AppShell>
      <Hero
        kicker="Operacional"
        title="Ordens de Produção"
        description="Agora você pode definir se a O.P. é monocromática ou colorida, com até 4 itens de estoque opcionais. Ao concluir, o material é debitado automaticamente do estoque."
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
              <div className="field col-2"><label>Qtd</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required /></div>
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
              <div className="field col-3">
                <label>Tipo de material</label>
                <select value={form.material_mode} onChange={(e) => setForm({ ...form, material_mode: e.target.value })}>
                  <option>Monocromático</option>
                  <option>Colorido</option>
                </select>
              </div>

              {/* SLOT 1 - sempre aparece */}
              <div className="field col-4">
                <label>Item de estoque 1</label>
                <select value={form.material_stock_id_1} onChange={(e) => setForm({ ...form, material_stock_id_1: e.target.value })}>
                  <option value="">Selecione...</option>
                  {stockItems.map((i) => <option key={i.id} value={i.id}>{i.item_name}</option>)}
                </select>
              </div>
              <div className="field col-2">
                <label>Consumo 1 (Kg)</label>
                <input type="number" step="0.01" value={form.consumo_kg_1} onChange={(e) => setForm({ ...form, consumo_kg_1: e.target.value })} />
              </div>

              {form.material_mode === 'Colorido' ? (
                <>
                  <div className="field col-4">
                    <label>Item de estoque 2</label>
                    <select value={form.material_stock_id_2} onChange={(e) => setForm({ ...form, material_stock_id_2: e.target.value })}>
                      <option value="">Selecione...</option>
                      {stockItems.map((i) => <option key={i.id} value={i.id}>{i.item_name}</option>)}
                    </select>
                  </div>
                  <div className="field col-2">
                    <label>Consumo 2 (Kg)</label>
                    <input type="number" step="0.01" value={form.consumo_kg_2} onChange={(e) => setForm({ ...form, consumo_kg_2: e.target.value })} />
                  </div>

                  <div className="field col-4">
                    <label>Item de estoque 3</label>
                    <select value={form.material_stock_id_3} onChange={(e) => setForm({ ...form, material_stock_id_3: e.target.value })}>
                      <option value="">Selecione...</option>
                      {stockItems.map((i) => <option key={i.id} value={i.id}>{i.item_name}</option>)}
                    </select>
                  </div>
                  <div className="field col-2">
                    <label>Consumo 3 (Kg)</label>
                    <input type="number" step="0.01" value={form.consumo_kg_3} onChange={(e) => setForm({ ...form, consumo_kg_3: e.target.value })} />
                  </div>

                  <div className="field col-4">
                    <label>Item de estoque 4</label>
                    <select value={form.material_stock_id_4} onChange={(e) => setForm({ ...form, material_stock_id_4: e.target.value })}>
                      <option value="">Selecione...</option>
                      {stockItems.map((i) => <option key={i.id} value={i.id}>{i.item_name}</option>)}
                    </select>
                  </div>
                  <div className="field col-2">
                    <label>Consumo 4 (Kg)</label>
                    <input type="number" step="0.01" value={form.consumo_kg_4} onChange={(e) => setForm({ ...form, consumo_kg_4: e.target.value })} />
                  </div>
                </>
              ) : null}
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
                <th>Materiais</th>
                <th>Qtd</th>
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
                    <td>{materialSummary(item)}</td>
                    <td>{item.quantity}</td>
                    <td>{item.due_date || '-'}</td>
                    <td><span className={`badge ${item.status === 'Concluída' ? 'success' : item.status === 'Cancelada' ? 'danger' : 'info'}`}>{item.status}</span></td>
                    <td>
                      <div className="inline-actions">
                        <button className="btn-secondary" onClick={() => fillFormForEdit(item)}>Editar</button>
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
