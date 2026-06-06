import './globals.css';

export const metadata = {
  title: 'Mundo 3D Gestão — V3.3 FULL Banco',
  description: 'Gestão operacional e comercial compartilhada entre múltiplos usuários via Supabase.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
