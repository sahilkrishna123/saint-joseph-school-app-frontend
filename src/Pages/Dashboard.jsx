import Sidebar from "../Components/layout/Sidebar";
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh'}}>
      <Sidebar />
      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}