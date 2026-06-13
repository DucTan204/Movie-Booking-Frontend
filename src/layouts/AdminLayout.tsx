import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import './AdminLayout.css';

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-layout-main">
        <div className="admin-layout-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}