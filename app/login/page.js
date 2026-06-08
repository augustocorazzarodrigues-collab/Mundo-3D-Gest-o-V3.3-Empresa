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
  const [error, setError] = useState('');

  useEffect(() => {
    getSession().then((s) => {
      if (s) router.replace('/inicio');
    });
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await signIn(email, password);
        router.replace('/inicio');
      } else {
        await signUp(email, password);
        alert('Conta criada com sucesso!');
        setMode('login');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      background: '#f4f7fb'
    }}>

      {/* LADO ESQUERDO (BRANDING) */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
        color: 'white',
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: 42, fontWeight: 700 }}>
          Mundo 3D Gestão
        </h1>

        <p style={{ marginTop: 20, fontSize: 18, opacity: 0.9 }}>
          Controle total do seu negócio de impressão 3D.
        </p>

        <p style={{ marginTop: 20, fontSize: 15, opacity: 0.8 }}>
          Produção, estoque, precificação e financeiro,
          tudo em um único sistema online.
        </p>

        <div style={{ marginTop: 40 }}>
          <div>✔ Gestão de ordens de produção</div>
          <div>✔ Controle de estoque automático</div>
          <div>✔ Precificação inteligente</div>
          <div>✔ Dashboard em tempo real</div>
        </div>
      </div>

      {/* LADO DIREITO (LOGIN) */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          width: 350,
          background: 'white',
          padding: 30,
          borderRadius: 16,
          boxShadow: '0px 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: 24, marginBottom: 10 }}>
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>

          {error && (
            <div style={{
              background: '#fee2e2',
              padding: 10,
              borderRadius: 8,
              marginBottom: 15,
              color: '#991b1b'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 15 }}>
              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
                style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid #ccc' }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
                style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid #ccc' }}
              />
            </div>

            <button style={{
              width:'100%',
              padding:12,
              borderRadius:10,
              background:'#1d4ed8',
              color:'white',
              border:'none',
              fontWeight:600,
              cursor:'pointer'
            }}>
              {loading ? 'Aguarde...' : (mode === 'login' ? 'Entrar' : 'Criar conta')}
            </button>

          </form>

          <button
            onClick={()=>setMode(mode === 'login' ? 'signup' : 'login')}
            style={{
              marginTop:15,
              width:'100%',
              background:'transparent',
              border:'none',
              color:'#2563eb',
              cursor:'pointer'
            }}
          >
            {mode === 'login' ? 'Criar conta' : 'Voltar para login'}
          </button>

        </div>
      </div>
    </div>
  );
}
