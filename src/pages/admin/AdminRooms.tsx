import { useEffect, useState } from 'react';
import { roomApi, cinemaApi } from '../../api/axiosConfig';
import type { Cinema } from '../../types';
import AdminHeader from '../../components/admin/AdminHeader';
import CustomModal from '../../components/common/CustomModal';

const ROOM_STATUSES = [
  { value: 'ACTIVE',      label: '✅ Hoạt động', color: '#22c55e' },
  { value: 'MAINTENANCE', label: '🔧 Bảo trì',    color: '#f59e0b' },
  { value: 'INACTIVE',    label: '⛔ Ngừng dùng', color: '#6b7280' },
];

const statusBadge = (status: string) => {
  const s = ROOM_STATUSES.find(x => x.value === status);
  return s
    ? <span style={{ color: s.color, fontWeight: 600, fontSize: '0.85rem' }}>{s.label}</span>
    : <span>—</span>;
};

interface Room {
  id: number;
  cinemaId: number;
  cinemaName?: string;
  name: string;
  capacity: number;
  status: string;
}

const EMPTY: Partial<Room> = { name: '', capacity: 0, cinemaId: 0, status: 'ACTIVE' };

export default function AdminRooms() {
  const [rooms, setRooms]     = useState<Room[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState<Partial<Room>>(EMPTY);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = async () => {
    try {
      const [rRes, cRes] = await Promise.all([roomApi.getAll(), cinemaApi.getAll()]);
      setRooms(rRes.data);
      setCinemas(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = {
        name: editing.name,
        capacity: editing.capacity,
        status: editing.status || 'ACTIVE',
        cinema: { id: editing.cinemaId },
      };
      if (editing.id) await roomApi.update(editing.id, payload);
      else await roomApi.create(payload);
      setModal(false); load();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  // Ưu tiên cinemaName từ BE, fallback sang tìm trong list cinemas
  const getCinemaName = (room: Room) =>
    room.cinemaName || cinemas.find(c => c.id === room.cinemaId)?.name || '—';

  const filtered = rooms.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <AdminHeader
        title="Quản lý Phòng chiếu"
        subtitle={`${rooms.length} phòng`}
        action={
          <button className="btn btn-primary" onClick={() => { setEditing(EMPTY); setError(''); setModal(true); }}>
            + Thêm phòng
          </button>
        }
      />
      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <input
            className="admin-search"
            placeholder="Tìm phòng..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên phòng</th>
                <th>Rạp</th>
                <th>Sức chứa</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#555', padding: 32 }}>Không có phòng nào</td></tr>
              )}
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td className="td-title">{r.name}</td>
                  <td>{getCinemaName(r)}</td>
                  <td>{r.capacity} ghế</td>
                  <td>{statusBadge(r.status)}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="action-btn action-btn-edit"
                        onClick={() => { setEditing(r); setError(''); setModal(true); }}
                      >
                        Sửa / Đổi trạng thái
                      </button>
                      {/* ĐÃ BỎ NÚT XÓA Ở ĐÂY */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CustomModal
        isOpen={modal}
        onClose={() => setModal(false)}
        title={editing.id ? 'Sửa phòng' : 'Thêm phòng mới'}
      >
        <div className="admin-form">
          {/* ... (phần form giữ nguyên) ... */}
          <div className="form-group">
            <label className="form-label">Rạp chiếu</label>
            <select
              className="form-select"
              value={editing.cinemaId || ''}
              onChange={e => setEditing({ ...editing, cinemaId: Number(e.target.value) })}
            >
              <option value="">-- Chọn rạp --</option>
              {cinemas.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-form-row">
            <div className="form-group">
              <label className="form-label">Tên phòng</label>
              <input
                className="form-input"
                value={editing.name || ''}
                onChange={e => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sức chứa (ghế)</label>
              <input
                type="number"
                className="form-input"
                value={editing.capacity || ''}
                onChange={e => setEditing({ ...editing, capacity: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-select"
              value={editing.status || 'ACTIVE'}
              onChange={e => setEditing({ ...editing, status: e.target.value })}
            >
              {ROOM_STATUSES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: 8 }}>{error}</div>
          )}

          <div className="admin-form-actions">
            <button className="btn btn-outline" onClick={() => setModal(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}