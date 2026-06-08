'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, signIn, signUp } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getSession().then((session) => {
      if (session) router.replace('/inicio');
    });
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'login') {
        await signIn(email, password);
        router.replace('/inicio');
      } else {
        const result = await signUp(email, password);
        if (result?.user) {
          setMessage(
            'Conta criada com sucesso. Se o Supabase exigir confirmação por e-mail, confirme e depois faça login.'
          );
          setMode('login');
        }
      }
    } catch (e) {
      setError(e.message || 'Erro ao entrar/criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, #1d4ed8 0%, #0f172a 40%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
      }}
    >
      <div
        style={{
          width: 'min(1240px, 100%)',
          minHeight: '720px',
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* LADO ESQUERDO - BRANDING */}
        <div
          style={{
            position: 'relative',
            padding: '56px',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background:
              'linear-gradient(145deg, rgba(37,99,235,0.95), rgba(15,23,42,0.88))',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.14), transparent 35%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.09), transparent 30%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.08), transparent 30%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.14)',
                padding: '10px 16px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: '#93c5fd',
                  boxShadow: '0 0 12px #93c5fd',
                }}
              />
              Plataforma de gestão inteligente
            </div>

            <h1
              style={{
                marginTop: 28,
                fontSize: '56px',
                lineHeight: 1.05,
                fontWeight: 800,
                maxWidth: 580,
                letterSpacing: '-0.03em',
              }}
            >
              Mundo 3D Gestão
            </h1>

            <p
              style={{
                marginTop: 22,
                fontSize: '22px',
                lineHeight: 1.55,
                maxWidth: 620,
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              Um sistema online para controlar produção, estoque, precificação,
              pedidos e financeiro com aparência profissional e operação
              colaborativa em tempo real.
            </p>

            <div
              style={{
                marginTop: 38,
                display: 'grid',
                gap: 18,
                maxWidth: 560,
              }}
            >
              {[
                'Ordens de produção com baixa automática de materiais',
                'Precificação inteligente com custo real do produto',
                'Estoque centralizado e compartilhado com múltiplos usuários',
                'Dashboards operacionais e comerciais em tempo real',
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px',
                    padding: '16px 18px',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '12px',
                      display: 'grid',
                      placeItems: 'center',
                      background: 'rgba(255,255,255,0.14)',
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </div>
                  <div style={{ fontSize: '15px', lineHeight: 1.5 }}>{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              marginTop: 36,
            }}
          >
            {[
              { label: 'Módulos', value: '10+' },
              { label: 'Operação', value: 'Online' },
              { label: 'Base', value: 'Supabase' },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '18px',
                  padding: '18px',
                }}
              >
                <div style={{ fontSize: '13px', opacity: 0.8 }}>{item.label}</div>
                <div style={{ fontSize: '28px', fontWeight: 800, marginTop: 8 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LADO DIREITO - LOGIN */}
        <div
          style={{
            background: 'linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 460,
              background: 'white',
              borderRadius: '28px',
              padding: '36px',
              boxShadow: '0 20px 60px rgba(15,23,42,0.10)',
              border: '1px solid #e6edf7',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                padding: '8px 14px',
                borderRadius: '999px',
                background: '#eef4ff',
                color: '#1d4ed8',
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '0.03em',
              }}
            >
              ACESSO DA PLATAFORMA
            </div>

            <h2
              style={{
                marginTop: 18,
                fontSize: '38px',
                lineHeight: 1.1,
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.03em',
              }}
            >
              {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}
            </h2>

            <p
              style={{
                marginTop: 12,
                color: '#64748b',
                fontSize: '16px',
                lineHeight: 1.6,
              }}
            >
              {mode === 'login'
                ? 'Acesse o sistema com seu e-mail e senha para continuar a sua operação.'
                : 'Crie seu acesso para começar a usar a plataforma.'}
            </p>

            {message ? (
              <div
                style={{
                  marginTop: 18,
                  background: '#ecfdf3',
                  border: '1px solid #bbf7d0',
                  color: '#166534',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  fontSize: '14px',
                }}
              >
                {message}
              </div>
            ) : null}

            {error ? (
              <div
                style={{
                  marginTop: 18,
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#be123c',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} style={{ marginTop: 26 }}>
              <div style={{ display: 'grid', gap: 18 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#334155',
                    }}
                  >
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seuemail@empresa.com"
                    style={{
                      width: '100%',
                      padding: '15px 16px',
                      borderRadius: '14px',
                      border: '1px solid #dbe4f0',
                      background: '#fbfdff',
                      outline: 'none',
                      fontSize: '16px',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: 8,
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#334155',
                    }}
                  >
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Digite sua senha"
                    style={{
                      width: '100%',
                      padding: '15px 16px',
                      borderRadius: '14px',
                      border: '1px solid #dbe4f0',
                      background: '#fbfdff',
                      outline: 'none',
                      fontSize: '16px',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  marginTop: 24,
                  padding: '15px 18px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 12px 24px rgba(37,99,235,0.28)',
                }}
              >
                {loading
                  ? 'Aguarde...'
                  : mode === 'login'
                  ? 'Entrar no sistema'
                  : 'Criar minha conta'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setMessage('');
              }}
              style={{
                marginTop: 18,
                width: '100%',
                padding: '14px 18px',
                borderRadius: '16px',
                background: '#f8fbff',
                border: '1px solid #d9e4f2',
                color: '#1d4ed8',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {mode === 'login' ? 'Criar conta' : 'Voltar para login'}
            </button>

            <div
              style={{
                marginTop: 24,
                paddingTop: 22,
                borderTop: '1px solid #e9eef6',
                fontSize: '13px',
                color: '#64748b',
                lineHeight: 1.6,
              }}
            >
              Sistema profissional para gestão de impressão 3D com operação
              online, compartilhada e escalável.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
