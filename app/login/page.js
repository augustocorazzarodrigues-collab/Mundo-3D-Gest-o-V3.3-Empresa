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
    <>
      <div className="login-shell">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-grid" />

        <div className="login-frame">
          {/* PAINEL ESQUERDO */}
          <section className="brand-side">
            <div className="brand-top">
              <div className="brand-pill">
                <span className="brand-pill-dot" />
                Plataforma SaaS de gestão
              </div>

              <h1>Mundo 3D Gestão</h1>

              <p className="brand-lead">
                Controle total da operação de impressão 3D com produção,
                estoque, precificação, pedidos e financeiro em uma única
                plataforma online.
              </p>

              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <div>
                    <strong>Ordens de produção inteligentes</strong>
                    <span>Baixa automática de materiais e fluxo operacional integrado.</span>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <div>
                    <strong>Precificação com custo real</strong>
                    <span>Material, máquina, margem e preço sugerido no mesmo fluxo.</span>
                  </div>
                </div>

                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <div>
                    <strong>Uso colaborativo em tempo real</strong>
                    <span>Você e seu sócio trabalham na mesma base online.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* MOCKUP / DASH VISUAL */}
            <div className="mockup-wrap">
              <div className="floating-card float-1">
                <div className="floating-card-title">Receita prevista</div>
                <div className="floating-card-value">R$ 18.450</div>
                <div className="floating-card-sub">Atualizado em tempo real</div>
              </div>

              <div className="floating-card float-2">
                <div className="floating-card-title">Ordens em aberto</div>
                <div className="floating-card-value">12</div>
                <div className="floating-card-sub">Produção + comercial integrados</div>
              </div>

              <div className="mockup-screen">
                <div className="mockup-topbar">
                  <div className="mockup-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="mockup-top-title">Painel Executivo</div>
                </div>

                <div className="mockup-body">
                  <aside className="mockup-sidebar">
                    <div className="mockup-logo" />
                    <div className="mockup-nav-item active" />
                    <div className="mockup-nav-item" />
                    <div className="mockup-nav-item" />
                    <div className="mockup-nav-item" />
                  </aside>

                  <div className="mockup-content">
                    <div className="mockup-content-top">
                      <div className="mockup-kpi">
                        <span>Receita</span>
                        <strong>R$ 18,4k</strong>
                      </div>
                      <div className="mockup-kpi">
                        <span>Lucro</span>
                        <strong>R$ 6,2k</strong>
                      </div>
                      <div className="mockup-kpi">
                        <span>O.P.</span>
                        <strong>12</strong>
                      </div>
                    </div>

                    <div className="mockup-chart">
                      <div className="bar b1" />
                      <div className="bar b2" />
                      <div className="bar b3" />
                      <div className="bar b4" />
                      <div className="bar b5" />
                      <div className="bar b6" />
                    </div>

                    <div className="mockup-table">
                      <div className="row row-head" />
                      <div className="row" />
                      <div className="row" />
                      <div className="row" />
                      <div className="row" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* PAINEL DIREITO */}
          <section className="form-side">
            <div className="form-card">
              <div className="form-badge">ACESSO DA PLATAFORMA</div>

              <h2>{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</h2>

              <p className="form-subtitle">
                {mode === 'login'
                  ? 'Acesse o sistema com seu e-mail e senha para continuar sua operação.'
                  : 'Crie seu acesso para começar a usar a plataforma.'}
              </p>

              {message ? <div className="form-alert success">{message}</div> : null}
              {error ? <div className="form-alert error">{error}</div> : null}

              <form onSubmit={handleSubmit} className="form-grid">
                <div className="field">
                  <label>E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seunome@empresa.com"
                  />
                </div>

                <div className="field">
                  <label>Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Digite sua senha"
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading
                    ? 'Aguarde...'
                    : mode === 'login'
                    ? 'Entrar no sistema'
                    : 'Criar minha conta'}
                </button>
              </form>

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

              <div className="trust-box">
                <div className="trust-title">Plataforma profissional em evolução contínua</div>
                <div className="trust-text">
                  Estrutura online, banco em nuvem, operação multiusuário e experiência visual preparada para escalar.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .login-shell {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at top left, #2563eb 0%, #0f172a 36%, #020617 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image:
            linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: radial-gradient(circle at center, black 30%, transparent 90%);
          pointer-events: none;
        }

        .bg-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(60px);
          opacity: 0.25;
          pointer-events: none;
        }

        .orb-1 {
          width: 340px;
          height: 340px;
          background: #60a5fa;
          top: -60px;
          left: -40px;
          animation: drift1 10s ease-in-out infinite;
        }

        .orb-2 {
          width: 280px;
          height: 280px;
          background: #38bdf8;
          bottom: -40px;
          right: -20px;
          animation: drift2 12s ease-in-out infinite;
        }

        .login-frame {
          position: relative;
          z-index: 2;
          width: min(1340px, 100%);
          min-height: 760px;
          display: grid;
          grid-template-columns: 1.12fr 0.88fr;
          border-radius: 30px;
          overflow: hidden;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(14px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.30);
        }

        .brand-side {
          position: relative;
          padding: 54px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background:
            linear-gradient(160deg, rgba(37,99,235,0.92), rgba(15,23,42,0.88));
        }

        .brand-side::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 18% 16%, rgba(255,255,255,0.14), transparent 28%),
            radial-gradient(circle at 82% 22%, rgba(255,255,255,0.10), transparent 24%),
            radial-gradient(circle at 48% 84%, rgba(255,255,255,0.08), transparent 28%);
          pointer-events: none;
        }

        .brand-top {
          position: relative;
          z-index: 2;
        }

        .brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.14);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        .brand-pill-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #93c5fd;
          box-shadow: 0 0 14px #93c5fd;
        }

        .brand-top h1 {
          margin: 26px 0 0;
          font-size: 60px;
          line-height: 1.02;
          font-weight: 800;
          letter-spacing: -0.04em;
          max-width: 620px;
        }

        .brand-lead {
          margin-top: 22px;
          max-width: 640px;
          font-size: 21px;
          line-height: 1.65;
          color: rgba(255,255,255,0.93);
        }

        .feature-list {
          display: grid;
          gap: 16px;
          margin-top: 34px;
          max-width: 620px;
        }

        .feature-item {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 18px;
          border-radius: 20px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .feature-icon {
          width: 36px;
          height: 36px;
          border-radius: 14px;
          background: rgba(255,255,255,0.16);
          display: grid;
          place-items: center;
          font-weight: 800;
          flex-shrink: 0;
        }

        .feature-item strong {
          display: block;
          font-size: 15px;
        }

        .feature-item span {
          display: block;
          margin-top: 5px;
          font-size: 14px;
          line-height: 1.55;
          color: rgba(255,255,255,0.82);
        }

        .mockup-wrap {
          position: relative;
          z-index: 2;
          margin-top: 40px;
          min-height: 300px;
        }

        .floating-card {
          position: absolute;
          padding: 18px 20px;
          border-radius: 20px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(10px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.18);
          width: 220px;
          z-index: 3;
        }

        .float-1 {
          top: -8px;
          right: 20px;
          animation: floatY 6s ease-in-out infinite;
        }

        .float-2 {
          bottom: 24px;
          left: 10px;
          animation: floatY 7s ease-in-out infinite reverse;
        }

        .floating-card-title {
          font-size: 13px;
          color: rgba(255,255,255,0.78);
        }

        .floating-card-value {
          margin-top: 8px;
          font-size: 30px;
          font-weight: 800;
        }

        .floating-card-sub {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(255,255,255,0.76);
        }

        .mockup-screen {
          position: relative;
          width: 100%;
          max-width: 620px;
          min-height: 330px;
          border-radius: 26px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(255,255,255,0.97), rgba(240,247,255,0.94));
          box-shadow: 0 20px 50px rgba(0,0,0,0.24);
          border: 1px solid rgba(255,255,255,0.30);
        }

        .mockup-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-bottom: 1px solid #e4ecf8;
          background: rgba(255,255,255,0.85);
        }

        .mockup-dots {
          display: flex;
          gap: 7px;
        }

        .mockup-dots span {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #d7e4f8;
        }

        .mockup-dots span:nth-child(1) { background: #fda4af; }
        .mockup-dots span:nth-child(2) { background: #fde68a; }
        .mockup-dots span:nth-child(3) { background: #86efac; }

        .mockup-top-title {
          font-size: 13px;
          color: #334155;
          font-weight: 700;
        }

        .mockup-body {
          display: grid;
          grid-template-columns: 90px 1fr;
          min-height: 282px;
        }

        .mockup-sidebar {
          background: linear-gradient(180deg, #133866, #0b2648);
          padding: 16px;
          display: grid;
          align-content: start;
          gap: 16px;
        }

        .mockup-logo {
          height: 38px;
          border-radius: 14px;
          background: linear-gradient(135deg, #8ec5ff, #dbeeff);
          margin-bottom: 4px;
        }

        .mockup-nav-item {
          height: 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
        }

        .mockup-nav-item.active {
          background: #f8d58d;
        }

        .mockup-content {
          padding: 18px;
          display: grid;
          gap: 16px;
        }

        .mockup-content-top {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .mockup-kpi {
          padding: 14px;
          border-radius: 18px;
          background: white;
          border: 1px solid #e8eff8;
          box-shadow: 0 8px 20px rgba(15,23,42,0.05);
        }

        .mockup-kpi span {
          display: block;
          font-size: 12px;
          color: #64748b;
        }

        .mockup-kpi strong {
          display: block;
          margin-top: 8px;
          font-size: 22px;
          color: #0f172a;
        }

        .mockup-chart {
          height: 120px;
          padding: 12px;
          border-radius: 20px;
          background: white;
          border: 1px solid #e8eff8;
          display: flex;
          align-items: flex-end;
          gap: 12px;
          box-shadow: 0 8px 20px rgba(15,23,42,0.05);
        }

        .bar {
          flex: 1;
          border-radius: 12px 12px 6px 6px;
          background: linear-gradient(180deg, #60a5fa, #1d4ed8);
          animation: pulseBars 4s ease-in-out infinite;
        }

        .b1 { height: 38%; animation-delay: 0s; }
        .b2 { height: 64%; animation-delay: 0.2s; }
        .b3 { height: 52%; animation-delay: 0.4s; }
        .b4 { height: 78%; animation-delay: 0.6s; }
        .b5 { height: 58%; animation-delay: 0.8s; }
        .b6 { height: 88%; animation-delay: 1s; }

        .mockup-table {
          display: grid;
          gap: 10px;
          padding: 16px;
          border-radius: 20px;
          background: white;
          border: 1px solid #e8eff8;
          box-shadow: 0 8px 20px rgba(15,23,42,0.05);
        }

        .row {
          height: 12px;
          border-radius: 999px;
          background: #e9f0f8;
        }

        .row-head {
          width: 68%;
          background: #d8e6f8;
        }

        .form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 42px;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
        }

        .form-card {
          width: 100%;
          max-width: 470px;
          background: rgba(255,255,255,0.98);
          border-radius: 30px;
          padding: 38px;
          border: 1px solid #e8eef7;
          box-shadow: 0 24px 60px rgba(15,23,42,0.10);
        }

        .form-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          background: #eef4ff;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .form-card h2 {
          margin-top: 18px;
          font-size: 40px;
          line-height: 1.08;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #0f172a;
        }

        .form-subtitle {
          margin-top: 12px;
          color: #64748b;
          font-size: 16px;
          line-height: 1.6;
        }

        .form-alert {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.5;
        }

        .form-alert.success {
          background: #ecfdf3;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .form-alert.error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
        }

        .form-grid {
          margin-top: 26px;
          display: grid;
          gap: 18px;
        }

        .field label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #334155;
        }

        .field input {
          width: 100%;
          padding: 15px 16px;
          border-radius: 16px;
          border: 1px solid #dbe4f0;
          background: #fbfdff;
          outline: none;
          font-size: 16px;
          transition: 0.2s ease;
        }

        .field input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(96,165,250,0.14);
        }

        .btn-primary {
          margin-top: 6px;
          width: 100%;
          padding: 16px 18px;
          border: none;
          border-radius: 18px;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: white;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(37,99,235,0.28);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 34px rgba(37,99,235,0.34);
        }

        .btn-secondary {
          margin-top: 16px;
          width: 100%;
          padding: 15px 18px;
          border-radius: 18px;
          border: 1px solid #d8e3f1;
          background: #f8fbff;
          color: #1d4ed8;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .btn-secondary:hover {
          background: #eef5ff;
        }

        .trust-box {
          margin-top: 24px;
          padding-top: 22px;
          border-top: 1px solid #e7edf6;
        }

        .trust-title {
          font-size: 14px;
          font-weight: 800;
          color: #0f172a;
        }

        .trust-text {
          margin-top: 8px;
          font-size: 13px;
          line-height: 1.7;
          color: #64748b;
        }

        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulseBars {
          0%, 100% { opacity: 0.92; }
          50% { opacity: 1; }
        }

        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 16px); }
        }

        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-18px, -14px); }
        }

        @media (max-width: 1180px) {
          .login-frame {
            grid-template-columns: 1fr;
          }

          .brand-side {
            padding: 38px;
          }

          .mockup-wrap {
            margin-top: 28px;
          }

          .form-side {
            padding: 26px;
          }
        }

        @media (max-width: 760px) {
          .login-shell {
            padding: 18px;
          }

          .brand-side {
            padding: 28px;
          }

          .brand-top h1 {
            font-size: 42px;
          }

          .brand-lead {
            font-size: 18px;
          }

          .form-card {
            padding: 26px;
            border-radius: 24px;
          }

          .form-card h2 {
            font-size: 32px;
          }

          .mockup-content-top {
            grid-template-columns: 1fr;
          }

          .floating-card {
            position: relative;
            width: 100%;
            top: auto;
            right: auto;
            left: auto;
            bottom: auto;
            margin-bottom: 12px;
          }
        }
      `}</style>
    </>
  );
}
