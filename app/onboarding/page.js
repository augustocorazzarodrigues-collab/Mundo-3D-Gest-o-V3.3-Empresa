'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getMyCompanyMembership, createCompanyOnboarding } from '@/lib/service';

export default function OnboardingPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!active) return;

        if (!session) {
          router.replace('/login');
          return;
        }

        const membership = await getMyCompanyMembership();

        if (!active) return;

        if (membership?.company_id) {
          router.replace('/inicio');
          return;
        }

        setChecking(false);
      } catch (error) {
        if (!active) return;
        console.error('Erro ao verificar onboarding:', error);
        setErrorMsg(error.message || 'Erro ao validar acesso ao onboarding.');
        setChecking(false);
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');

    if (!companyName.trim()) {
      setErrorMsg('Digite o nome da empresa.');
      return;
    }

    try {
      setLoading(true);

      const result = await createCompanyOnboarding(companyName.trim());

      if (result?.success) {
        router.replace('/inicio');
        return;
      }

      setErrorMsg('Não foi possível criar a empresa.');
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || 'Erro ao criar empresa.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Preparando seu ambiente</h1>
          <p style={styles.subtitle}>Estamos validando seu acesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>V4.2 ONBOARDING</div>

        <h1 style={styles.title}>Criar empresa</h1>
        <p style={styles.subtitle}>
          Este é o primeiro passo para ativar sua estrutura dentro do sistema.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Nome da empresa</label>

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Ex: Mundo 3D Studio"
            style={styles.input}
          />

          {errorMsg ? <div style={styles.error}>{errorMsg}</div> : null}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Criando empresa...' : 'Criar minha empresa'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #e0f2fe 100%)'
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    background: '#ffffff',
    borderRadius: '24px',
    padding: '36px',
    boxShadow: '0 20px 60px rgba(15, 23, 42, 0.12)',
    border: '1px solid rgba(226, 232, 240, 0.9)'
  },
  badge: {
    display: 'inline-block',
    marginBottom: '16px',
    padding: '6px 12px',
    borderRadius: '999px',
    background: '#111827',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em'
  },
  title: {
    margin: 0,
    marginBottom: '10px',
    fontSize: '30px',
    fontWeight: 800,
    color: '#0f172a'
  },
  subtitle: {
    marginTop: 0,
    marginBottom: '28px',
    color: '#64748b',
    lineHeight: 1.5
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#334155'
  },
  input: {
    height: '48px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    padding: '0 14px',
    fontSize: '14px',
    outline: 'none'
  },
  button: {
    marginTop: '10px',
    height: '50px',
    border: 'none',
    borderRadius: '12px',
    background: '#111827',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer'
  },
  error: {
    marginTop: '4px',
    color: '#dc2626',
    fontSize: '14px'
  }
};
