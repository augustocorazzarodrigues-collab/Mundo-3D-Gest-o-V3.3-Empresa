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
      <div className="cin-shell">
        <div className="cin-particle p1" />
        <div className="cin-particle p2" />
        <div className="cin-particle p3" />
        <div className="cin-particle p4" />
        <div className="cin-vignette" />
        <div className="cin-grid" />
        <div className="cin-spotlight" />

        <div className="cin-frame">
          {/* LADO ESQUERDO */}
          <section className="cin-brand">
            <div className="cin-brand-top">
              <div className="cin-pill">
                <span className="cin-pill-dot" />
                Plataforma premium de gestão 3D
              </div>

              <h1>Mundo 3D Gestão</h1>

              <p className="cin-lead">
                Transforme produção, estoque, precificação, pedidos e financeiro
                em uma operação visualmente elegante, integrada e pronta para escalar.
              </p>

              <div className="cin-quote-box">
                <div className="cin-quote-line" />
                <div>
                  <div className="cin-quote-title">Visão de produto</div>
                  <div className="cin-quote-text">
                    Uma plataforma com cara de SaaS real, construída para controlar a operação e também impressionar futuros usuários.
                  </div>
                </div>
              </div>
            </div>

            <div className="cin-mockup-zone">
              <div className="glass-card gc-1">
                <div className="gc-title">Receita prevista</div>
                <div className="gc-value">R$ 38.420</div>
                <div className="gc-foot">Inteligência comercial e operacional</div>
              </div>

              <div className="glass-card gc-2">
                <div className="gc-title">Ordens em andamento</div>
                <div className="gc-value">24</div>
                <div className="gc-foot">Controle de estoque e produção ao vivo</div>
              </div>

              <div className="cin-screen">
                <div className="cin-screen-head">
                  <div className="cin-dots"><span /><span /><span /></div>
                  <div className="cin-head-title">Executive Workspace</div>
                </div>

                <div className="cin-screen-body">
                  <aside className="cin-side-mini">
                    <div className="mini-logo" />
                    <div className="mini-nav active" />
                    <div className="mini-nav" />
                    <div className="mini-nav" />
                    <div className="mini-nav" />
                    <div className="mini-nav" />
                  </aside>

                  <div className="cin-main-mini">
                    <div className="mini-top-cards">
                      <div className="mini-kpi">
                        <span>Receita</span>
                        <strong>R$ 38k</strong>
                      </div>
                      <div className="mini-kpi">
                        <span>Margem</span>
                        <strong>61%</strong>
                      </div>
                      <div className="mini-kpi">
                        <span>O.P.</span>
                        <strong>24</strong>
                      </div>
                    </div>

                    <div className="mini-chart-wrap">
                      <div className="mini-chart-bar mb1" />
                      <div className="mini-chart-bar mb2" />
                      <div className="mini-chart-bar mb3" />
                      <div className="mini-chart-bar mb4" />
                      <div className="mini-chart-bar mb5" />
                      <div className="mini-chart-bar mb6" />
                    </div>

                    <div className="mini-bottom-grid">
                      <div className="mini-card big">
                        <div className="mini-row head" />
                        <div className="mini-row" />
                        <div className="mini-row" />
                        <div className="mini-row" />
                      </div>
                      <div className="mini-card small">
                        <div className="mini-donut" />
                        <div className="mini-legend" />
                        <div className="mini-legend short" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* LADO DIREITO */}
          <section className="cin-form-side">
            <div className="cin-form-card">
              <div className="cin-form-badge">CINEMATIC ACCESS</div>

              <h2>{mode === 'login' ? 'Acesse sua operação' : 'Crie seu acesso'}</h2>
              <p className="cin-form-subtitle">
                {mode === 'login'
                  ? 'Entre com seu e-mail e senha para retomar sua gestão online com experiência premium.'
                  : 'Crie sua conta para começar a usar a plataforma.'}
              </p>

              {message ? <div className="cin-alert success">{message}</div> : null}
              {error ? <div className="cin-alert error">{error}</div> : null}

              <form onSubmit={handleSubmit} className="cin-form-grid">
                <div className="cin-field">
                  <label>E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seunome@empresa.com"
                  />
                </div>

                <div className="cin-field">
                  <label>Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Digite sua senha"
                  />
                </div>

                <button type="submit" className="cin-btn-primary" disabled={loading}>
                  {loading
                    ? 'Aguarde...'
                    : mode === 'login'
                    ? 'Entrar no sistema'
                    : 'Criar minha conta'}
                </button>
              </form>

              <button
                type="button"
                className="cin-btn-secondary"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setMessage('');
                }}
              >
                {mode === 'login' ? 'Criar conta' : 'Voltar para login'}
              </button>

              <div className="cin-trust-box">
                <div className="cin-trust-title">Design voltado para confiança e conversão</div>
                <div className="cin-trust-text">
                  Esta experiência foi desenhada para comunicar valor, elevar a percepção do produto e preparar sua plataforma para atrair usuários futuros.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .cin-shell {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          padding: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at 10% 10%, #1e40af 0%, transparent 20%),
            radial-gradient(circle at 90% 15%, #0ea5e9 0%, transparent 18%),
            radial-gradient(circle at 80% 85%, #2563eb 0%, transparent 14%),
            linear-gradient(135deg, #020617 0%, #0f172a 45%, #111827 100%);
        }

        .cin-grid {
          position: absolute;
          inset: 0;
          opacity: 0.08;
          background-image:
            linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px);
          background-size: 34px 34px;
          mask-image: radial-gradient(circle at center, black 26%, transparent 85%);
          pointer-events: none;
        }

        .cin-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.45) 100%);
          pointer-events: none;
        }

        .cin-spotlight {
          position: absolute;
          width: 900px;
          height: 900px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 65%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: breathe 8s ease-in-out infinite;
        }

        .cin-particle {
          position: absolute;
          border-radius: 999px;
          filter: blur(40px);
          opacity: 0.22;
          pointer-events: none;
        }

        .p1 { width: 280px; height: 280px; top: 60px; left: 80px; background: #60a5fa; animation: floatA 11s ease-in-out infinite; }
        .p2 { width: 220px; height: 220px; top: 120px; right: 90px; background: #38bdf8; animation: floatB 9s ease-in-out infinite; }
        .p3 { width: 260px; height: 260px; bottom: 80px; left: 18%; background: #2563eb; animation: floatC 12s ease-in-out infinite; }
        .p4 { width: 180px; height: 180px; bottom: 120px; right: 14%; background: #7dd3fc; animation: floatD 10s ease-in-out infinite; }

        .cin-frame {
          position: relative;
          z-index: 2;
          width: min(1380px, 100%);
          min-height: 790px;
          display: grid;
          grid-template-columns: 1.16fr 0.84fr;
          border-radius: 34px;
          overflow: hidden;
          background: rgba(255,255,255,0.045);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(16px);
          box-shadow: 0 40px 100px rgba(0,0,0,0.40);
        }

        .cin-brand {
          position: relative;
          padding: 56px;
          color: white;
          background:
            linear-gradient(160deg, rgba(30,64,175,0.92), rgba(15,23,42,0.92) 55%, rgba(2,6,23,0.90));
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .cin-brand::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 20% 16%, rgba(255,255,255,0.12), transparent 24%),
            radial-gradient(circle at 84% 18%, rgba(255,255,255,0.08), transparent 20%),
            radial-gradient(circle at 52% 86%, rgba(255,255,255,0.08), transparent 24%);
          pointer-events: none;
        }

        .cin-brand-top { position: relative; z-index: 2; }

        .cin-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.14);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .cin-pill-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #93c5fd;
          box-shadow: 0 0 16px #93c5fd;
        }

        .cin-brand h1 {
          margin: 28px 0 0;
          font-size: 68px;
          line-height: 0.98;
          letter-spacing: -0.05em;
          font-weight: 900;
          max-width: 680px;
          text-shadow: 0 8px 24px rgba(0,0,0,0.18);
        }

        .cin-lead {
          margin-top: 24px;
          max-width: 650px;
          font-size: 22px;
          line-height: 1.7;
          color: rgba(255,255,255,0.93);
        }

        .cin-quote-box {
          margin-top: 34px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          max-width: 620px;
          padding: 20px 22px;
          border-radius: 22px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(8px);
        }

        .cin-quote-line {
          width: 4px;
          min-height: 64px;
          border-radius: 999px;
          background: linear-gradient(180deg, #93c5fd, #38bdf8);
          box-shadow: 0 0 12px rgba(147,197,253,0.5);
        }

        .cin-quote-title {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.78);
        }

        .cin-quote-text {
          margin-top: 8px;
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255,255,255,0.90);
        }

        .cin-mockup-zone {
          position: relative;
          z-index: 2;
          margin-top: 42px;
          min-height: 340px;
        }

        .glass-card {
          position: absolute;
          width: 230px;
          padding: 18px 20px;
          border-radius: 22px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(10px);
          box-shadow: 0 14px 38px rgba(0,0,0,0.20);
          z-index: 3;
        }

        .gc-1 { top: -6px; right: 18px; animation: floatSlow 7s ease-in-out infinite; }
        .gc-2 { bottom: 20px; left: 10px; animation: floatSlow 8s ease-in-out infinite reverse; }

        .gc-title {
          font-size: 13px;
          color: rgba(255,255,255,0.78);
        }

        .gc-value {
          margin-top: 8px;
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .gc-foot {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(255,255,255,0.74);
        }

        .cin-screen {
          position: relative;
          width: 100%;
          max-width: 650px;
          min-height: 360px;
          border-radius: 30px;
          overflow: hidden;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(242,247,255,0.96));
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
          border: 1px solid rgba(255,255,255,0.35);
        }

        .cin-screen-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 18px;
          border-bottom: 1px solid #e5edf8;
          background: rgba(255,255,255,0.9);
        }

        .cin-dots {
          display: flex;
          gap: 7px;
        }

        .cin-dots span {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #d8e5f6;
        }

        .cin-dots span:nth-child(1) { background: #fda4af; }
        .cin-dots span:nth-child(2) { background: #fde68a; }
        .cin-dots span:nth-child(3) { background: #86efac; }

        .cin-head-title {
          font-size: 13px;
          font-weight: 800;
          color: #334155;
          letter-spacing: 0.03em;
        }

        .cin-screen-body {
          display: grid;
          grid-template-columns: 96px 1fr;
          min-height: 310px;
        }

        .cin-side-mini {
          background: linear-gradient(180deg, #133866, #0a2546);
          padding: 16px;
          display: grid;
          align-content: start;
          gap: 14px;
        }

        .mini-logo {
          height: 40px;
          border-radius: 14px;
          background: linear-gradient(135deg, #93c5fd, #dbeeff);
          margin-bottom: 6px;
        }

        .mini-nav {
          height: 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.18);
        }

        .mini-nav.active {
          background: #f8d58d;
        }

        .cin-main-mini {
          padding: 18px;
          display: grid;
          gap: 16px;
        }

        .mini-top-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .mini-kpi {
          padding: 14px;
          border-radius: 20px;
          border: 1px solid #e7eef8;
          background: white;
          box-shadow: 0 8px 22px rgba(15,23,42,0.05);
        }

        .mini-kpi span {
          display: block;
          font-size: 12px;
          color: #64748b;
        }

        .mini-kpi strong {
          display: block;
          margin-top: 8px;
          font-size: 24px;
          font-weight: 900;
          color: #0f172a;
        }

        .mini-chart-wrap {
          height: 125px;
          padding: 14px;
          border-radius: 22px;
          border: 1px solid #e7eef8;
          background: white;
          display: flex;
          align-items: flex-end;
          gap: 12px;
          box-shadow: 0 8px 22px rgba(15,23,42,0.05);
        }

        .mini-chart-bar {
          flex: 1;
          border-radius: 14px 14px 8px 8px;
          background: linear-gradient(180deg, #60a5fa, #1d4ed8);
          animation: chartPulse 4.5s ease-in-out infinite;
        }

        .mb1 { height: 36%; animation-delay: 0s; }
        .mb2 { height: 68%; animation-delay: 0.2s; }
        .mb3 { height: 52%; animation-delay: 0.4s; }
        .mb4 { height: 80%; animation-delay: 0.6s; }
        .mb5 { height: 60%; animation-delay: 0.8s; }
        .mb6 { height: 92%; animation-delay: 1s; }

        .mini-bottom-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 14px;
        }

        .mini-card {
          border-radius: 22px;
          border: 1px solid #e7eef8;
          background: white;
          box-shadow: 0 8px 22px rgba(15,23,42,0.05);
          padding: 16px;
        }

        .mini-card.big {
          display: grid;
          gap: 10px;
        }

        .mini-row {
          height: 12px;
          border-radius: 999px;
          background: #e9f0f8;
        }

        .mini-row.head {
          width: 70%;
          background: #dbe8f8;
        }

        .mini-card.small {
          display: grid;
          align-content: center;
          justify-items: center;
          gap: 12px;
        }

        .mini-donut {
          width: 82px;
          height: 82px;
          border-radius: 999px;
          background: conic-gradient(#2563eb 0 62%, #dbeafe 62% 100%);
          position: relative;
        }

        .mini-donut::after {
          content: '';
          position: absolute;
          inset: 14px;
          border-radius: 999px;
          background: white;
        }

        .mini-legend {
          height: 10px;
          width: 88%;
          border-radius: 999px;
          background: #dbeafe;
        }

        .mini-legend.short {
          width: 64%;
        }

        .cin-form-side {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 42px;
          background: linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
        }

        .cin-form-card {
          width: 100%;
          max-width: 490px;
          background: rgba(255,255,255,0.985);
          border-radius: 32px;
          padding: 40px;
          border: 1px solid #e7edf7;
          box-shadow: 0 24px 60px rgba(15,23,42,0.10);
        }

        .cin-form-badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          background: #eef4ff;
          color: #1d4ed8;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .cin-form-card h2 {
          margin-top: 18px;
          font-size: 42px;
          line-height: 1.04;
          letter-spacing: -0.04em;
          font-weight: 900;
          color: #0f172a;
        }

        .cin-form-subtitle {
          margin-top: 12px;
          color: #64748b;
          font-size: 16px;
          line-height: 1.65;
        }

        .cin-alert {
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.5;
        }

        .cin-alert.success {
          background: #ecfdf3;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .cin-alert.error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
        }

        .cin-form-grid {
          margin-top: 26px;
          display: grid;
          gap: 18px;
        }

        .cin-field label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 800;
          color: #334155;
        }

        .cin-field input {
          width: 100%;
          padding: 16px 16px;
          border-radius: 18px;
          border: 1px solid #dbe4f0;
          background: #fbfdff;
          outline: none;
          font-size: 16px;
          transition: 0.2s ease;
        }

        .cin-field input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(96,165,250,0.14);
        }

        .cin-btn-primary {
          margin-top: 6px;
          width: 100%;
          padding: 16px 18px;
          border: none;
          border-radius: 20px;
          background: linear-gradient(135deg, #1d4ed8, #2563eb);
          color: white;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 18px 36px rgba(37,99,235,0.28);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .cin-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 22px 42px rgba(37,99,235,0.34);
        }

        .cin-btn-secondary {
          margin-top: 16px;
          width: 100%;
          padding: 15px 18px;
          border-radius: 20px;
          border: 1px solid #d8e3f1;
          background: #f8fbff;
          color: #1d4ed8;
          font-size: 15px;
          font-weight: 900;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .cin-btn-secondary:hover {
          background: #eef5ff;
        }

        .cin-trust-box {
          margin-top: 24px;
          padding-top: 22px;
          border-top: 1px solid #e8eef7;
        }

        .cin-trust-title {
          font-size: 14px;
          font-weight: 900;
          color: #0f172a;
        }

        .cin-trust-text {
          margin-top: 8px;
          font-size: 13px;
          line-height: 1.7;
          color: #64748b;
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes chartPulse {
          0%, 100% { opacity: 0.92; }
          50% { opacity: 1; }
        }

        @keyframes breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.06); opacity: 0.68; }
        }

        @keyframes floatA {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(24px, 14px); }
        }

        @keyframes floatB {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-22px, 16px); }
        }

        @keyframes floatC {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(16px, -16px); }
        }

        @keyframes floatD {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-16px, -14px); }
        }

        @media (max-width: 1220px) {
          .cin-frame {
            grid-template-columns: 1fr;
          }

          .cin-brand {
            padding: 38px;
          }

          .cin-form-side {
            padding: 28px;
          }
        }

        @media (max-width: 760px) {
          .cin-shell {
            padding: 18px;
          }

          .cin-brand {
            padding: 28px;
          }

          .cin-brand h1 {
            font-size: 46px;
          }

          .cin-lead {
            font-size: 18px;
          }

          .cin-form-card {
            padding: 28px;
            border-radius: 24px;
          }

          .cin-form-card h2 {
            font-size: 34px;
          }

          .mini-top-cards,
          .mini-bottom-grid {
            grid-template-columns: 1fr;
          }

          .glass-card {
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
