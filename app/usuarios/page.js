'use client';

import { useEffect, useState } from 'react';
import {
  createCompanyInvite,
  listMyCompanyInvites,
  cancelCompanyInvite
} from '@/lib/service';
import { getCurrentCompany } from '@/lib/company';
import { useRouter } from 'next/navigation';

const ROLE_OPTIONS = [
  { value: 'comercial', label: 'Comercial' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'financeiro', label: 'Financeiro' }
];

export default function UsuariosPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('comercial');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadData() {
    try {
      setLoading(true);

      const company = await getCurrentCompany();

      // Só owner pode acessar
      if (company.role !== 'owner') {
        router.replace('/inicio');
        return;
      }

      const data = await listMyCompanyInvites();
      setInvites(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreateInvite(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await createCompanyInvite(email, name, role);

      setSuccess('Convite criado com sucesso!');
      setEmail('');
      setName('');
      setRole('comercial');

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCancel(id) {
    try {
      await cancelCompanyInvite(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Usuários da empresa</h1>

      <div style={styles.card}>
        <h3>Novo funcionário</h3>

        <form onSubmit={handleCreateInvite} style={styles.form}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <button style={styles.button}>Criar convite</button>
        </form>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
      </div>

      <div style={styles.card}>
        <h3>Convites pendentes</h3>

        {invites.length === 0 && <p>Nenhum convite ainda.</p>}

        {invites.map((inv) => (
          <div key={inv.id} style={styles.inviteRow}>
            <div>
              <strong>{inv.email}</strong> ({inv.role})
            </div>

            {inv.status === 'pending' && (
              <button onClick={() => handleCancel(inv.id)} style={styles.cancel}>
                Cancelar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 24
  },
  title: {
    fontSize: 28,
    marginBottom: 20
  },
  card: {
    background: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  input: {
    height: 40,
    padding: '0 10px',
    borderRadius: 8,
    border: '1px solid #ccc'
  },
  button: {
    height: 42,
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer'
  },
  inviteRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10
  },
  cancel: {
    background: 'red',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '4px 10px'
  },
  error: {
    color: 'red'
  },
  success: {
    color: 'green'
  }
};
