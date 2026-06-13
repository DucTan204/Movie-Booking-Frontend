import { useEffect, useState } from 'react';
import { cinemaApi } from '../../api/axiosConfig';
import type { Cinema } from '../../types';
import AdminHeader from '../../components/admin/AdminHeader';
import CustomModal from '../../components/common/CustomModal';

const CINEMA_STATUSES = [
  { value: 'ACTIVE',      label: '✅ Hoạt động',   color: '#22c55e' },
  { value: 'MAINTENANCE', label: '🔧 Bảo trì',      color: '#f59e0b' },
  { value: 'CLOSED',      label: '🔴 Đóng cửa',     color: '#ef4444' },
];

const statusBadge = (status: string) => {
  const s = CINEMA_STATUSES.find(x => x.value === status);
  return s
    ? <span style={{ color: s.color, fontWeight: 600, fontSize: '0.85rem' }}>{s.label}</span>
    : <span>—</span>;
};

const EMPTY: Partial<Cinema> = { name: '', address: '', status: 'ACTIVE' };

export default function AdminCinemas() {
  const [cinemas, setCinemas]   = useState<Cinema[]>([]);
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState<Partial<Cinema>>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = async () => {
    try { const res = await cinemaApi.getAll(); setCinemas(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (editing.id) await cinemaApi.update(editing.id, editing);
      else await cinemaApi.create(editing);
      setModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa rạp này? Hành động không thể hoàn tác.')) return;
    try {
      await cinemaApi.delete(id);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data || 'Không thể xóa rạp (có thể đang có suất chiếu liên quan)');
    }
  };

  const filtered = cinemas.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <AdminHeader
        title="Quản lý Rạp chiếu"
        subtitle={`${cinemas.length} rạp`}
        action={<button className="btn btn-primary" onClick={() => { setEditing(EMPTY); setError(''); setModal(true); }}>+ Thêm rạp</button>}
      />
      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <input className="admin-search" placeholder="Tìm rạp..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <table className="admin-table">
            <thead>
              <tr><th>#</th><th>Tên rạp</th><th>Địa chỉ</th><th>Số phòng</th><th>Trạng thái</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td className="td-title">{c.name}</td>
                  <td>{c.address || '—'}</td>
                  <td>{c.rooms?.length ?? '—'}</td>
                  <td>{statusBadge(c.status)}</td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn action-btn-edit" onClick={() => { setEditing(c); setError(''); setModal(true); }}>Sửa</button>
                      <button className="action-btn action-btn-delete" onClick={() => handleDelete(c.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CustomModal isOpen={modal} onClose={() => setModal(false)} title={editing.id ? 'Sửa rạp' : 'Thêm rạp mới'}>
        <div className="admin-form">
          <div className="form-group">
            <label className="form-label">Tên rạp</label>
            <input className="form-input" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Địa chỉ</label>
            <input className="form-input" value={editing.address || ''} onChange={e => setEditing({ ...editing, address: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select className="form-select" value={editing.status || 'ACTIVE'} onChange={e => setEditing({ ...editing, status: e.target.value })}>
              {CINEMA_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {error && <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: 8 }}>{error}</div>}
          <div className="admin-form-actions">
            <button className="btn btn-outline" onClick={() => setModal(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}