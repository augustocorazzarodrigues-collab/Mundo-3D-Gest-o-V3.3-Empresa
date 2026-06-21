'use client';

import { useEffect, useState } from 'react';
import {
  createCompanyInvite,
  listMyCompanyInvites,
  cancelCompanyInvite,
  listMyCompanyActiveUsers
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
    background: '#EAF2FF',
    color: '#1D4ED8',
    border: '#BFD7FF'
  },
  operacional: {
    background: '#E8FBF3',
    color: '#0F766E',
    border: '#99F6E4'
  },
  financeiro: {
    background: '#EEF4FF',
    color: '#1E40AF',
    border: '#C7D7FE'
  },
  owner: {
    background: '#DBEAFE',
    color: '#1D4ED8',
    border: '#93C5FD'
  }
};

const APP_TABS = [
  'Início',
  'Dashboard Geral',
  'Comercial',
  'Operacional',
  'Financeiro',
  'Usuários',
  'Configurações'
];

export default function UsuariosPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState(null);

  const [invites, setInvites] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [accessControl, setAccessControl] = useState({});

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

      if (company.role !== 'owner') {
        router.replace('/inicio');
        return;
      }

      const [allInvites, users] = await Promise.all([
        listMyCompanyInvites(),
        listMyCompanyActiveUsers()
      ]);

      const pendingInvites = (allInvites || []).filter(
        (inv) => inv.status === 'pending'
      );

      setInvites(pendingInvites);
      setActiveUsers(users || []);
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

  function updateAccess(userId, tabName, permission) {
    setAccessControl((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [tabName]: permission
      }
    }));
  }

  if (loading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Carregando gestão de usuários...</p>
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
            Convide novos usuários, acompanhe convites pendentes e gerencie os acessos da sua empresa com mais controle.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/inicio')}
          style={styles.backButton}
        >
          ← Voltar ao Início
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

      <div style={styles.mainGrid}>
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

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Convites pendentes</h2>
                <p style={styles.cardDescription}>
                  Aqui aparecem apenas os convites enviados que ainda aguardam resposta.
                </p>
              </div>

              <div style={styles.counterBadge}>{invites.length}</div>
            </div>

            {invites.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>✉</div>
                <h3 style={styles.emptyTitle}>Nenhum convite pendente</h3>
                <p style={styles.emptyText}>
                  Quando você criar novos convites, eles aparecerão aqui com a opção de cancelar.
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
                            Status: <span style={styles.pendingStatus}>Pendente</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCancel(inv.id)}
                        style={styles.cancelButton}
                        disabled={cancelingId === inv.id}
                      >
                        {cancelingId === inv.id ? 'Cancelando...' : 'Cancelar convite'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={styles.rightColumn}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h2 style={styles.cardTitle}>Painel de controle de usuários</h2>
                <p style={styles.cardDescription}>
                  Exibe apenas usuários ativos da empresa. Convites rejeitados, cancelados ou pendentes não aparecem aqui.
                </p>
              </div>

              <div style={styles.counterBadgeBlue}>{activeUsers.length}</div>
            </div>

            {activeUsers.length === 0 ? (
              <div style={styles.emptyStateBlue}>
                <div style={styles.emptyIconBlue}>👤</div>
                <h3 style={styles.emptyTitle}>Nenhum usuário ativo adicional</h3>
                <p style={styles.emptyText}>
                  No momento, não há usuários ativos além do owner da empresa.
                </p>
              </div>
            ) : (
              <div style={styles.userControlList}>
                {activeUsers.map((user) => {
                  const roleStyle = getRoleStyle(user.role);
                  const userKey = user.company_user_id || user.user_id || user.id;

                  return (
                    <div key={userKey} style={styles.userControlCard}>
                      <div style={styles.userHeader}>
                        <div style={styles.avatarCircleBlue}>
                          {(user.name || user.email || '?').charAt(0).toUpperCase()}
                        </div>

                        <div style={styles.userHeaderInfo}>
                          <div style={styles.inviteTopLine}>
                            <strong style={styles.inviteEmail}>{user.email}</strong>
                            <span
                              style={{
                                ...styles.roleBadge,
                                background: roleStyle.background,
                                color: roleStyle.color,
                                borderColor: roleStyle.border
                              }}
                            >
                              {user.role}
                            </span>
                          </div>

                          <div style={styles.inviteName}>
                            {user.name || 'Nome não informado'}
                          </div>
                        </div>
                      </div>

                      <div style={styles.permissionsBox}>
                        <div style={styles.permissionsTitle}>Permissões por aba</div>

                        {APP_TABS.map((tab) => {
                          const currentPermission =
                            accessControl[userKey]?.[tab] || 'view';

                          return (
                            <div key={tab} style={styles.permissionRow}>
                              <div style={styles.permissionTabName}>{tab}</div>

                              <div style={styles.permissionOptions}>
                                <button
                                  type="button"
                                  onClick={() => updateAccess(userKey, tab, 'none')}
                                  style={{
                                    ...styles.permissionButton,
                                    ...(currentPermission === 'none'
                                      ? styles.permissionButtonActiveLight
                                      : {})
                                  }}
                                >
                                  Não visualiza
                                </button>

                                <button
                                  type="button"
                                  onClick={() => updateAccess(userKey, tab, 'view')}
                                  style={{
                                    ...styles.permissionButton,
                                    ...(currentPermission === 'view'
                                      ? styles.permissionButtonActiveBlue
                                      : {})
                                  }}
                                >
                                  Visualiza
                                </button>

                                <button
                                  type="button"
                                  onClick={() => updateAccess(userKey, tab, 'edit')}
                                  style={{
                                    ...styles.permissionButton,
                                    ...(currentPermission === 'edit'
                                      ? styles.permissionButtonActiveDark
                                      : {})
                                  }}
                                >
                                  Visualiza e altera
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
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
    background: 'linear-gradient(180deg, #F4F8FF 0%, #EAF2FF 100%)',
    padding: '32px 24px 40px'
  },
  loadingWrapper: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F4F8FF 0%, #EAF2FF 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingCard: {
    background: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    minWidth: 300,
    border: '1px solid #D7E6FF',
    boxShadow: '0 20px 40px rgba(30, 64, 175, 0.08)',
    textAlign: 'center'
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '3px solid #D7E6FF',
    borderTopColor: '#2563EB',
    margin: '0 auto 16px'
  },
  loadingText: {
    margin: 0,
    fontSize: 15,
    color: '#4B5563'
  },
  hero: {
    maxWidth: 1400,
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
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#2563EB',
    marginBottom: 8
  },
  title: {
    margin: 0,
    fontSize: 36,
    lineHeight: 1.1,
    color: '#0F172A',
    fontWeight: 900
  },
  subtitle: {
    marginTop: 12,
    maxWidth: 800,
    fontSize: 16,
    lineHeight: 1.7,
    color: '#475569'
  },
  backButton: {
    height: 48,
    padding: '0 18px',
    borderRadius: 14,
    border: '1px solid #BFDBFE',
    background: '#FFFFFF',
    color: '#1D4ED8',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(37, 99, 235, 0.08)'
  },
  alertError: {
    maxWidth: 1400,
    margin: '0 auto 16px',
    background: '#FEF2F2',
    color: '#B91C1C',
    border: '1px solid #FECACA',
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 14
  },
  alertSuccess: {
    maxWidth: 1400,
    margin: '0 auto 16px',
    background: '#EFF6FF',
    color: '#1D4ED8',
    border: '1px solid #BFDBFE',
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 14
  },
  mainGrid: {
    maxWidth: 1400,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '0.95fr 1.05fr',
    gap: 24
  },
  leftColumn: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  },
  rightColumn: {
    minWidth: 0
  },
  card: {
    background: 'rgba(255, 255, 255, 0.94)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: 26,
    padding: 24,
    boxShadow: '0 20px 40px rgba(37, 99, 235, 0.08)',
    border: '1px solid #D7E6FF'
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
    fontSize: 24,
    fontWeight: 900,
    color: '#0F172A'
  },
  cardDescription: {
    margin: '8px 0 0',
    fontSize: 14,
    lineHeight: 1.6,
    color: '#64748B'
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    fontWeight: 800,
    flexShrink: 0,
    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.18)'
  },
  counterBadge: {
    minWidth: 44,
    height: 44,
    borderRadius: 14,
    background: '#EFF6FF',
    color: '#1D4ED8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 16,
    padding: '0 12px',
    flexShrink: 0,
    border: '1px solid #BFDBFE'
  },
  counterBadgeBlue: {
    minWidth: 44,
    height: 44,
    borderRadius: 14,
    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 16,
    padding: '0 12px',
    flexShrink: 0,
    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.18)'
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
    fontWeight: 800,
    color: '#334155'
  },
  input: {
    height: 50,
    padding: '0 16px',
    borderRadius: 14,
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#0F172A',
    fontSize: 15,
    outline: 'none'
  },
  select: {
    height: 50,
    padding: '0 16px',
    borderRadius: 14,
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#0F172A',
    fontSize: 15,
    outline: 'none'
  },
  primaryButton: {
    height: 52,
    marginTop: 4,
    border: 'none',
    borderRadius: 16,
    background: 'linear-gradient(90deg, #0F172A 0%, #1D4ED8 100%)',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 14px 24px rgba(37, 99, 235, 0.18)'
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
    border: '1px solid #D7E6FF',
    background: '#F8FBFF'
  },
  inviteMain: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    minWidth: 0
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
    fontSize: 16,
    flexShrink: 0
  },
  avatarCircleBlue: {
    width: 46,
    height: 46,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 900,
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
    color: '#0F172A',
    fontSize: 15
  },
  inviteName: {
    marginTop: 6,
    color: '#475569',
    fontSize: 14
  },
  inviteNameMuted: {
    marginTop: 6,
    color: '#94A3B8',
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
    fontWeight: 800,
    textTransform: 'capitalize'
  },
  statusLine: {
    marginTop: 6,
    fontSize: 13,
    color: '#64748B'
  },
  pendingStatus: {
    color: '#1D4ED8',
    fontWeight: 800
  },
  cancelButton: {
    height: 40,
    padding: '0 14px',
    borderRadius: 12,
    border: '1px solid #93C5FD',
    background: '#EFF6FF',
    color: '#1D4ED8',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  emptyState: {
    border: '1px dashed #BFDBFE',
    borderRadius: 18,
    background: '#F8FBFF',
    padding: 28,
    textAlign: 'center'
  },
  emptyStateBlue: {
    border: '1px dashed #93C5FD',
    borderRadius: 18,
    background: 'linear-gradient(180deg, #F8FBFF 0%, #EEF4FF 100%)',
    padding: 28,
    textAlign: 'center'
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#EFF6FF',
    color: '#1D4ED8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
    fontSize: 24,
    fontWeight: 800,
    border: '1px solid #BFDBFE'
  },
  emptyIconBlue: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
    fontSize: 24,
    fontWeight: 800,
    boxShadow: '0 12px 24px rgba(37, 99, 235, 0.16)'
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: 18,
    color: '#0F172A',
    fontWeight: 900
  },
  emptyText: {
    margin: 0,
    color: '#64748B',
    fontSize: 14,
    lineHeight: 1.7
  },
  userControlList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  userControlCard: {
    padding: 18,
    borderRadius: 20,
    border: '1px solid #D7E6FF',
    background: '#F8FBFF'
  },
  userHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18
  },
  userHeaderInfo: {
    minWidth: 0
  },
  permissionsBox: {
    marginTop: 6,
    borderTop: '1px solid #D7E6FF',
    paddingTop: 16
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: '#1D4ED8',
    marginBottom: 14
  },
  permissionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    padding: '12px 0',
    borderBottom: '1px solid #E5EEFF'
  },
  permissionTabName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#334155',
    minWidth: 140
  },
  permissionOptions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  permissionButton: {
    height: 34,
    padding: '0 12px',
    borderRadius: 999,
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#475569',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer'
  },
  permissionButtonActiveLight: {
    background: '#F8FAFC',
    color: '#334155',
    border: '1px solid #94A3B8'
  },
  permissionButtonActiveBlue: {
    background: '#EFF6FF',
    color: '#1D4ED8',
    border: '1px solid #93C5FD'
  },
  permissionButtonActiveDark: {
    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
    color: '#FFFFFF',
    border: '1px solid #2563EB'
  }
};
