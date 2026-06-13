import { useEffect, useState } from 'react';
import { userApi } from '../../api/axiosConfig';
import type { User } from '../../types';
import AdminHeader from '../../components/admin/AdminHeader';
import { formatDateTime } from '../../utils/format';
 
export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
 
  const load = async () => { try { const res = await userApi.getAll(); setUsers(res.data); } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
 
  const handleDelete = async (id: number) => { if (!window.confirm('Xóa người dùng này?')) return; await userApi.delete(id); load(); };
  const filtered = users.filter((u) => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
 
  return (
    <div className="fade-in">
      <AdminHeader title="Quản lý Người dùng" subtitle={`${users.length} tài khoản`} />
      <div className="admin-table-wrap">
        <div className="admin-table-toolbar"><input className="admin-search" placeholder="Tìm tên hoặc email..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <table className="admin-table">
            <thead><tr><th>#</th><th>Họ tên</th><th>Email</th><th>Số điện thoại</th><th>Vai trò</th><th>Ngày tạo</th><th>Hành động</th></tr></thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td><td className="td-title">{u.name}</td><td>{u.email}</td><td>{u.phone || '—'}</td>
                  <td><span className={u.roleName === 'ADMIN' ? 'badge badge-gold' : 'badge badge-green'}>{u.roleName}</span></td>
                  <td>{u.createdAt ? formatDateTime(u.createdAt) : '—'}</td>
                  <td><div className="action-btns">
                    <button className="action-btn action-btn-delete" onClick={() => handleDelete(u.id)} disabled={u.roleName === 'ADMIN'}>Xóa</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

