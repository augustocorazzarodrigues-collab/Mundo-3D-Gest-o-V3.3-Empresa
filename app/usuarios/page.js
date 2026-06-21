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

const ROLE_COLORS = {
  comercial: {
    background: '#E8F1FF',
    color: '#1D4ED8',
    border: '#BFDBFE'
  },
  operacional: {
    background: '#ECFDF3',
    color: '#027A48',
    border: '#ABEFC6'
  },
  financeiro: {
    background: '#FFF7ED',
    color: '#C2410C',
    border: '#FED7AA'
  },
  owner: {
    background: '#F5F3FF',
    color: '#6D28D9',
    border: '#DDD6FE'
  }
};

export default function UsuariosPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);
  const [invites, setInvites] = useState([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('comercial');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const company = await getCurrentCompany();

      // Só owner pode acessar
      if (company.role !== 'owner') {
        router.replace('/inicio');
        return;
      }

      const data = await listMyCompanyInvites();
      setInvites(data || []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados.');
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
      setSubmitting(true);

      await createCompanyInvite(email, name, role);

      setSuccess('Convite criado com sucesso!');
      setEmail('');
      setName('');
      setRole('comercial');

      await loadData();
    } catch (err) {
      setError(err.message || 'Erro ao criar convite.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    try {
      setError('');
      setSuccess('');
      setCancelingId(id);

      await cancelCompanyInvite(id);

      setSuccess('Convite cancelado com sucesso!');
      await loadData();
    } catch (err) {
      setError(err.message || 'Erro ao cancelar convite.');
    } finally {
      setCancelingId(null);
    }
  }

  function getRoleStyle(roleValue) {
    return ROLE_COLORS[roleValue] || {
      background: '#F3F4F6',
      color: '#374151',
      border: '#D1D5DB'
    };
  }

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <span style={styles.kicker}>Gestão de acessos</span>
          <h1 style={styles.title}>Usuários da empresa</h1>
          <p style={styles.subtitle}>
            Convide novos usuários, acompanhe convites pendentes e mantenha o controle de acesso da sua operação.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/inicio')}
          style={styles.backButton}
        >
          ← Voltar ao início
        </button>
      </div>

      {error && (
        <div style={styles.alertError}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      {success && (
        <div style={styles.alertSuccess}>
          <strong>Sucesso:</strong> {success}
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.leftColumn}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Convidar novo usuário</h2>
                <p style={styles.cardDescription}>
                  Envie um convite para adicionar um colaborador à sua empresa.
                </p>
              </div>

              <div style={styles.iconBadge}>+</div>
            </div>

            <form onSubmit={handleCreateInvite} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome</label>
                <input
                  type="text"
                  placeholder="Ex.: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>E-mail</label>
                <input
                  type="email"
                  placeholder="Ex.: joao@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Perfil de acesso</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.select}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" style={styles.primaryButton} disabled={submitting}>
                {submitting ? 'Criando convite...' : 'Criar convite'}
              </button>
            </form>
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Convites pendentes</h2>
                <p style={styles.cardDescription}>
                  Convites enviados que ainda não foram aceitos.
                </p>
              </div>

              <div style={styles.counterBadge}>{invites.length}</div>
            </div>

            {invites.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>✉</div>
                <h3 style={styles.emptyTitle}>Nenhum convite pendente</h3>
                <p style={styles.emptyText}>
                  Quando você enviar convites, eles aparecerão aqui.
                </p>
              </div>
            ) : (
              <div style={styles.invitesList}>
                {invites.map((inv) => {
                  const roleStyle = getRoleStyle(inv.role);

                  return (
                    <div key={inv.id} style={styles.inviteCard}>
                      <div style={styles.inviteMain}>
                        <div style={styles.avatarCircle}>
                          {(inv.name || inv.email || '?').charAt(0).toUpperCase()}
                        </div>

                        <div style={styles.inviteInfo}>
                          <div style={styles.inviteTopLine}>
                            <strong style={styles.inviteEmail}>{inv.email}</strong>
                            <span
                              style={{
                                ...styles.roleBadge,
                                background: roleStyle.background,
                                color: roleStyle.color,
                                borderColor: roleStyle.border
                              }}
                            >
                              {inv.role}
                            </span>
                          </div>

                          {inv.name ? (
                            <div style={styles.inviteName}>{inv.name}</div>
                          ) : (
                            <div style={styles.inviteNameMuted}>Nome não informado</div>
                          )}

                          <div style={styles.statusLine}>
                            Status:{' '}
                            <span style={styles.pendingStatus}>
                              {inv.status === 'pending' ? 'Pendente' : inv.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {inv.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleCancel(inv.id)}
                          style={styles.cancelButton}
                          disabled={cancelingId === inv.id}
                        >
                          {cancelingId === inv.id ? 'Cancelando...' : 'Cancelar convite'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 100%)',
    padding: '32px 24px 40px'
  },
  loadingWrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2F7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingCard: {
    background: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    minWidth: 280,
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
    border: '1px solid #E5E7EB',
    textAlign: 'center'
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '3px solid #E5E7EB',
    borderTopColor: '#111827',
    margin: '0 auto 16px'
  },
  loadingText: {
    margin: 0,
    fontSize: 15,
    color: '#475467'
  },
  hero: {
    maxWidth: 1280,
    margin: '0 auto 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap'
  },
  kicker: {
    display: 'inline-block',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#667085',
    marginBottom: 8
  },
  title: {
    margin: 0,
    fontSize: 36,
    lineHeight: 1.1,
    color: '#101828',
    fontWeight: 800
  },
  subtitle: {
    marginTop: 12,
    maxWidth: 760,
    fontSize: 16,
    lineHeight: 1.6,
    color: '#667085'
  },
  backButton: {
    height: 46,
    padding: '0 18px',
    borderRadius: 12,
    border: '1px solid #D0D5DD',
    background: '#FFFFFF',
    color: '#101828',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(16, 24, 40, 0.06)'
  },
  alertError: {
    maxWidth: 1280,
    margin: '0 auto 16px',
    background: '#FEF3F2',
    color: '#B42318',
    border: '1px solid #FECDCA',
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 14
  },
  alertSuccess: {
    maxWidth: 1280,
    margin: '0 auto 16px',
    background: '#ECFDF3',
    color: '#027A48',
    border: '1px solid #ABEFC6',
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 14
  },
  grid: {
    maxWidth: 1280,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.05fr 0.95fr',
    gap: 24
  },
  leftColumn: {
    minWidth: 0
  },
  rightColumn: {
    minWidth: 0
  },
  card: {
    background: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 16px 40px rgba(2, 6, 23, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.9)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 22
  },
  cardTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: '#101828'
  },
  cardDescription: {
    margin: '8px 0 0',
    fontSize: 14,
    lineHeight: 1.6,
    color: '#667085'
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: '#111827',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 700,
    flexShrink: 0
  },
  counterBadge: {
    minWidth: 42,
    height: 42,
    borderRadius: 14,
    background: '#F3F4F6',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 16,
    padding: '0 12px',
    flexShrink: 0
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: '#344054'
  },
  input: {
    height: 48,
    padding: '0 14px',
    borderRadius: 14,
    border: '1px solid #D0D5DD',
    background: '#FFFFFF',
    color: '#101828',
    fontSize: 15,
    outline: 'none'
  },
  select: {
    height: 48,
    padding: '0 14px',
    borderRadius: 14,
    border: '1px solid #D0D5DD',
    background: '#FFFFFF',
    color: '#101828',
    fontSize: 15,
    outline: 'none'
  },
  primaryButton: {
    height: 50,
    marginTop: 4,
    border: 'none',
    borderRadius: 14,
    background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 12px 24px rgba(17, 24, 39, 0.18)'
  },
  invitesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  inviteCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 18,
    border: '1px solid #EAECF0',
    background: '#FCFCFD'
  },
  inviteMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    minWidth: 0
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: '#111827',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 16,
    flexShrink: 0
  },
  inviteInfo: {
    minWidth: 0
  },
  inviteTopLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },
  inviteEmail: {
    color: '#101828',
    fontSize: 15
  },
  inviteName: {
    marginTop: 6,
    color: '#475467',
    fontSize: 14
  },
  inviteNameMuted: {
    marginTop: 6,
    color: '#98A2B3',
    fontSize: 14
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 28,
    padding: '0 10px',
    borderRadius: 999,
    border: '1px solid transparent',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'capitalize'
  },
  statusLine: {
    marginTop: 6,
    fontSize: 13,
    color: '#667085'
  },
  pendingStatus: {
    color: '#B54708',
    fontWeight: 700
  },
  cancelButton: {
    height: 40,
    padding: '0 14px',
    borderRadius: 12,
    border: '1px solid #FDA29B',
    background: '#FEF3F2',
    color: '#B42318',
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  emptyState: {
    border: '1px dashed #D0D5DD',
    borderRadius: 18,
    background: '#F9FAFB',
    padding: 28,
    textAlign: 'center'
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: '50%',
    background: '#F3F4F6',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
    fontSize: 24,
    fontWeight: 700
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: 18,
    color: '#101828'
  },
  emptyText: {
    margin: 0,
    color: '#667085',
    fontSize: 14,
    lineHeight: 1.6
  }
};
