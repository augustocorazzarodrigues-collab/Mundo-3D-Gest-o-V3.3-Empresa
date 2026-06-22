'use client';

import Sidebar from './Sidebar';
import AuthGate from './AuthGate';
import AccessModeBanner from './AccessModeBanner';

export default function AppShell({ children }) {
  return (
    <AuthGate>
      <div className="app-shell">
        <Sidebar />
        <main className="main-area">
          <AccessModeBanner />
          {children}
        </main>
      </div>
    </AuthGate>
  );
}
