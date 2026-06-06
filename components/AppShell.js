import Sidebar from './Sidebar';
export default function AppShell({ children }){
  return <div className="app-shell"><Sidebar /><main className="main-area">{children}</main></div>;
}
