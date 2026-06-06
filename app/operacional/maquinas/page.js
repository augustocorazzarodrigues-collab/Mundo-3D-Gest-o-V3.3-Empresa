'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import Hero from '@/components/Hero';
import { byId, getMachineName, getMaintenanceStatus, moneyBR, newId, sortCreated } from '@/lib/format';
import { listRows, insertRow, updateRow, deleteRow } from '@/lib/service';

const emptyForm = {
  id: '',
  model_choice: '',
  model_id: '',
  new_model_name: '',
  area_util: '',
  material_compativel: '',
  potencia_w: '',
  custo_hora: '',
  status: 'Disponível',
  horas_uso: '',
  prox_manutencao: '',
  ultima_manutencao: '',
  observacao: '',
};

export default function MaquinasPage() {
  const [models, setModels] = useState([]);
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const [mdl, maq] = await Promise.all([listRows('machine_models'), listRows('machines')]);
      setModels(mdl);
      setMachines(sortCreated(maq));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleModelChoice(value) {
    if (value === '__novo__') {
      setForm({
        ...form,
        model_choice: value,
        model_id: '',
        new_model_name: '',
        area_util: '',
        material_compativel: '',
        potencia_w: '',
        custo_hora: '',
      });
      return;
    }

    const model = byId(models, value);
    setForm({
      ...form,
      model_choice: value,
      model_id: value,
      new_model_name: '',
      area_util: model?.area_util || '',
      material_compativel: model?.material_compativel || '',
      potencia_w: model?.potencia_w || '',
      custo_hora: model?.custo_hora || '',
    });
  }

  async function saveItem(e) {
    e.preventDefault();
    try {
      let modelId = form.model_id;

      if (form.model_choice === '__novo__') {
        const modelPayload = {
          id: newId('mdl'),
          name: form.new_model_name,
          area_util: form.area_util,
          material_compativel: form.material_compativel,
          potencia_w: Number(form.potencia_w || 0),
          custo_hora: Number(form.custo_hora || 0),
        };
        const model = await insertRow('machine_models', modelPayload);
        modelId = model.id;
      } else if (form.model_id) {
        // CORREÇÃO: se o usuário alterar custo/hora, potência etc. de um modelo existente,
        // atualiza o machine_model ao salvar.
        const existingModel = byId(models, form.model_id);
        if (existingModel) {
          await updateRow('machine_models', form.model_id, {
            ...existingModel,
            name: existingModel.name,
            area_util: form.area_util,
            material_compativel: form.material_compativel,
            potencia_w: Number(form.potencia_w || 0),
            custo_hora: Number(form.custo_hora || 0),
          });
        }
      }

      const payload = {
        id: form.id || newId('maq'),
        model_id: modelId,
        status: form.status,
        horas_uso: Number(form.horas_uso || 0),
        prox_manutencao: Number(form.prox_manutencao || 0),
        ultima_manutencao: form.ultima_manutencao || null,
        observacao: form.observacao || '',
      };

      if (form.id) await updateRow('machines', form.id, payload);
      else await insertRow('machines', payload);

      await load();
      setForm(emptyForm);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteRow('machines', id);
      await load();
      if (form.id === id) setForm(emptyForm);
    } catch (e) {
      setError(e.message);
    }
  }

  async function registerMaintenance(machine) {
    try {
      await updateRow('machines', machine.id, {
        ...machine,
        horas_uso: 0,
        ultima_manutencao: new Date().toISOString().slice(0, 10),
        status: 'Disponível',
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  const filtered = useMemo(() => {
    return machines.filter((item) =>
      [
        getMachineName(machines.findIndex((m) => m.id === item.id)),
        byId(models, item.model_id)?.name || '',
        item.status,
      ]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [machines, models, search]);

  return (
    <AppShell>
      <Hero
        kicker="Operacional"
        title="Máquinas"
        description="Escolha um modelo existente para preencher automaticamente ou adicione um novo. O custo/hora agora atualiza corretamente ao salvar."
      />

      {error ? (
        <section className="section">
          <div className="alert-box">{error}</div>
        </section>
      ) : null}

      <section className="section split-grid">
        <div className="surface">
          <div className="panel-header">
            <div>
              <div className="panel-title">Gerenciamento</div>
              <div className="panel-subtitle">Cadastre máquinas e acompanhe o painel de manutenção.</div>
            </div>
            <button className="btn" onClick={() => setForm(emptyForm)}>Novo registro</button>
          </div>
          <div className="panel">
            <form onSubmit={saveItem}>
              <div className="row">
                <div className="field col-3">
                  <label>Máquina</label>
                  <input disabled value={form.id ? getMachineName(machines.findIndex((m) => m.id === form.id)) : getMachineName(machines.length)} />
                </div>
                <div className="field col-4">
                  <label>Modelo</label>
                  <select value={form.model_choice} onChange={(e) => handleModelChoice(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {models.map((model) => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                    <option value="__novo__">+ Adicionar novo modelo</option>
                  </select>
                </div>

                {form.model_choice === '__novo__' ? (
                  <div className="field col-5">
                    <label>Novo nome do modelo</label>
                    <input value={form.new_model_name} onChange={(e) => setForm({ ...form, new_model_name: e.target.value })} required />
                  </div>
                ) : null}

                <div className="field col-3">
                  <label>Área útil</label>
                  <input value={form.area_util} onChange={(e) => setForm({ ...form, area_util: e.target.value })} required />
                </div>
                <div className="field col-3">
                  <label>Material compatível</label>
                  <input value={form.material_compativel} onChange={(e) => setForm({ ...form, material_compativel: e.target.value })} required />
                </div>
                <div className="field col-2">
                  <label>Potência (W)</label>
                  <input type="number" value={form.potencia_w} onChange={(e) => setForm({ ...form, potencia_w: e.target.value })} required />
                </div>
                <div className="field col-2">
                  <label>Custo hora</label>
                  <input type="number" step="0.01" value={form.custo_hora} onChange={(e) => setForm({ ...form, custo_hora: e.target.value })} required />
                </div>
                <div className="field col-2">
                  <label>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option>Disponível</option>
                    <option>Em manutenção</option>
                    <option>Parada</option>
                  </select>
                </div>
                <div className="field col-2">
                  <label>Horas de uso</label>
                  <input type="number" value={form.horas_uso} onChange={(e) => setForm({ ...form, horas_uso: e.target.value })} required />
                </div>
                <div className="field col-2">
                  <label>Próx. manutenção (h)</label>
                  <input type="number" value={form.prox_manutencao} onChange={(e) => setForm({ ...form, prox_manutencao: e.target.value })} required />
                </div>
                <div className="field col-3">
                  <label>Última manutenção</label>
                  <input type="date" value={form.ultima_manutencao} onChange={(e) => setForm({ ...form, ultima_manutencao: e.target.value })} />
                </div>
                <div className="field col-3">
                  <label>Observação</label>
                  <input value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
                </div>
              </div>
              <div className="actions-row">
                <button className="btn">Salvar</button>
                <button className="btn-secondary" type="button" onClick={() => setForm(emptyForm)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>

        <div className="surface panel">
          <h3 className="section-title">Painel de manutenção</h3>
          {machines.map((machine, index) => {
            const model = byId(models, machine.model_id);
            const st = getMaintenanceStatus(machine);
            const colors = { success: '#17803d', warning: '#c57a08', danger: '#c03535', info: '#2563eb' };
            return (
              <div key={machine.id} className="maintenance-card">
                <div className="mini-row">
                  <strong style={{ flex: 1 }}>{getMachineName(index)}</strong>
                  <span className={`badge ${st.tone}`}>{st.label}</span>
                </div>
                <div className="note">{model?.name || '-'}</div>
                <div className="kpi-item"><span>Horas de uso</span><strong>{machine.horas_uso} h</strong></div>
                <div className="kpi-item"><span>Próx. manutenção</span><strong>{machine.prox_manutencao} h</strong></div>
                <div className="kpi-item"><span>Última manutenção</span><strong>{machine.ultima_manutencao || '-'}</strong></div>
                <div className="progress"><span style={{ width: `${st.progress || 0}%`, background: colors[st.tone] }} /></div>
                <div className="actions-row">
                  <button className="btn-secondary" onClick={() => setForm({
                    id: machine.id,
                    model_choice: machine.model_id,
                    model_id: machine.model_id,
                    new_model_name: '',
                    area_util: model?.area_util || '',
                    material_compativel: model?.material_compativel || '',
                    potencia_w: model?.potencia_w || '',
                    custo_hora: model?.custo_hora || '',
                    status: machine.status,
                    horas_uso: machine.horas_uso,
                    prox_manutencao: machine.prox_manutencao,
                    ultima_manutencao: machine.ultima_manutencao || '',
                    observacao: machine.observacao || '',
                  })}>Editar</button>
                  <button className="btn-secondary" onClick={() => registerMaintenance(machine)}>Registrar manutenção</button>
                </div>
              </div>
            );
          })}
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
                <th>Máquina</th>
                <th>Modelo</th>
                <th>Área útil</th>
                <th>Material compatível</th>
                <th>Status</th>
                <th>Horas</th>
                <th>Próx. manutenção</th>
                <th>Potência</th>
                <th>Custo hora</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((machine) => {
                const model = byId(models, machine.model_id);
                const idx = machines.findIndex((m) => m.id === machine.id);
                const st = getMaintenanceStatus(machine);
                return (
                  <tr key={machine.id}>
                    <td>{getMachineName(idx)}</td>
                    <td>{model?.name || '-'}</td>
                    <td>{model?.area_util || '-'}</td>
                    <td>{model?.material_compativel || '-'}</td>
                    <td><span className={`badge ${st.tone}`}>{st.label}</span></td>
                    <td>{machine.horas_uso} h</td>
                    <td>{machine.prox_manutencao} h</td>
                    <td>{model?.potencia_w || 0} W</td>
                    <td>{moneyBR(model?.custo_hora || 0)}</td>
                    <td>
                      <div className="inline-actions">
                        <button className="btn-secondary" onClick={() => setForm({
                          id: machine.id,
                          model_choice: machine.model_id,
                          model_id: machine.model_id,
                          new_model_name: '',
                          area_util: model?.area_util || '',
                          material_compativel: model?.material_compativel || '',
                          potencia_w: model?.potencia_w || '',
                          custo_hora: model?.custo_hora || '',
                          status: machine.status,
                          horas_uso: machine.horas_uso,
                          prox_manutencao: machine.prox_manutencao,
                          ultima_manutencao: machine.ultima_manutencao || '',
                          observacao: machine.observacao || '',
                        })}>Editar</button>
                        <button className="btn-danger" onClick={() => handleDelete(machine.id)}>Excluir</button>
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
