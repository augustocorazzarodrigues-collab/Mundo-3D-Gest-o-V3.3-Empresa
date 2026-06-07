'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero';
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
          setMessage('Conta criada com sucesso. Se o Supabase pedir confirmação por e-mail, confirme e depois faça login.');
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
    <div style={{ minHeight: '100vh', background: '#e9edf3', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div style={{ width: 'min(960px, 100%)' }}>
        <Hero
          kicker="Acesso"
          title="Login por usuário"
          description="Entre com e-mail e senha para usar o sistema. Se ainda não tiver conta, crie uma agora mesmo."
        />

        <section className="section surface panel" style={{ maxWidth: 520, margin: '22px auto 0' }}>
          <h3 className="section-title">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h3>
          <div className="note">
            {mode === 'login'
              ? 'Use o e-mail e a senha cadastrados no Supabase Auth.'
              : 'Crie o primeiro usuário por aqui usando e-mail e senha.'}
          </div>

          {message ? <div className="alert-box" style={{ marginTop: 14 }}>{message}</div> : null}
          {error ? <div className="alert-box" style={{ marginTop: 14, background:'#fff2f2', border:'1px solid #f0b1b1', color:'#8b1f1f' }}>{error}</div> : null}

          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            <div className="row">
              <div className="field col-12">
                <label>E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="field col-12">
                <label>Senha</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            <div className="actions-row">
              <button className="btn" disabled={loading}>{loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setMessage('');
                }}
              >
                {mode === 'login' ? 'Criar conta' : 'Voltar para login'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
