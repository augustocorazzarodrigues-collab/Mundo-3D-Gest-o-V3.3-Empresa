'use client';

import Sidebar from './Sidebar';
import AuthGate from './AuthGate';

export default function AppShell({ children }) {
  return (
    <AuthGate>
      <div className="app-shell">
        <Sidebar />
        <main className="main-area">{children}</main>
      </div>
    </AuthGate>
  );
}
