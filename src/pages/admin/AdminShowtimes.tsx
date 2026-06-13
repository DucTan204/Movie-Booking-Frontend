import { useEffect, useState } from 'react';
import { showtimeApi, movieApi, roomApi, cinemaApi } from '../../api/axiosConfig';
import type { Movie, Cinema } from '../../types';
import AdminHeader from '../../components/admin/AdminHeader';
import CustomModal from '../../components/common/CustomModal';
import { formatDateTime, formatCurrency } from '../../utils/format';

interface Room { id: number; name: string; cinemaId: number; capacity: number; }

const EMPTY = { movieId: 0, roomId: 0, startTime: '', endTime: '', basePrice: 0 };

export default function AdminShowtimes() {
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ SEARCH
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);

  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const load = async () => {
    try {
      const [stRes, mRes, rRes, cRes] = await Promise.all([
        showtimeApi.getAll(),
        movieApi.getAll(),
        roomApi.getAll(),
        cinemaApi.getAll()
      ]);
      setShowtimes(stRes.data);
      setMovies(mRes.data);
      setRooms(rRes.data);
      setCinemas(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ✅ FILTER (không phá data gốc)
  const filteredShowtimes = showtimes.filter((s) => {
    const keyword = search.toLowerCase();
    return (
      s.movieTitle?.toLowerCase().includes(keyword) ||
      s.cinemaName?.toLowerCase().includes(keyword) ||
      s.roomName?.toLowerCase().includes(keyword)
    );
  });

  // --- AUTO TIME ---
  const calculateAndSetTimes = (startTimeStr: string, movieId: number) => {
    if (!startTimeStr) return;

    const start = new Date(startTimeStr);
    const now = new Date();

    if (start < now) {
      alert("Cảnh báo: Giờ chiếu không được ở trong quá khứ!");
      setEditing((prev: any) => ({ ...prev, startTime: '', endTime: '' }));
      return;
    }

    const movie = movies.find(m => m.id === movieId);
    if (movie && movie.duration) {
      const end = new Date(start.getTime() + movie.duration * 60000);
      setEditing((prev: any) => ({
        ...prev,
        startTime: startTimeStr,
        endTime: formatDateTimeLocal(end),
        movieId
      }));
    } else {
      setEditing((prev: any) => ({ ...prev, startTime: startTimeStr, movieId }));
    }
  };

  const handleSave = async () => {
    if (!editing.movieId || !editing.roomId || !editing.startTime || !editing.endTime) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        movieId: editing.movieId,
        roomId: editing.roomId,
        startTime: editing.startTime,
        endTime: editing.endTime,
        basePrice: editing.basePrice
      };

      if (editing.id) {
        await showtimeApi.update(editing.id, payload);
      } else {
        await showtimeApi.create(payload);
      }

      setModal(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || "Không thể lưu!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await showtimeApi.delete(id);
      load();
    } catch {
      alert("Không thể xóa!");
    }
  };

  return (
    <div className="fade-in">
      <AdminHeader
        title="Quản lý Suất chiếu"
        subtitle={`${filteredShowtimes.length} suất chiếu trong hệ thống`}
        action={
          <button
            className="btn btn-primary"
            onClick={() => { setEditing(EMPTY); setModal(true); }}
          >
            + Thêm suất chiếu
          </button>
        }
      />

      {/* ✅ SEARCH - giữ nguyên style */}
      <div className="admin-table-actions">
        <input
          type="text"
          className="form-input"
          placeholder="Tìm theo phim, rạp, phòng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Phim</th>
                <th>Rạp / Phòng</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Giá vé</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredShowtimes.map((s) => (
                <tr key={s.id}>
                  <td className="td-title">{s.movieTitle}</td>
                  <td>{s.cinemaName} / {s.roomName}</td>
                  <td>{formatDateTime(s.startTime)}</td>
                  <td>{formatDateTime(s.endTime)}</td>
                  <td style={{ color: '#ef4444', fontWeight: 'bold' }}>
                    {formatCurrency(s.basePrice)}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="action-btn action-btn-edit"
                        onClick={() => {
                          setEditing({ ...s, movieId: s.movieId, roomId: s.roomId });
                          setModal(true);
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        className="action-btn action-btn-delete"
                        onClick={() => handleDelete(s.id)}
                      >
                        Xóa
                      </button>
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
        title={editing.id ? 'Sửa suất chiếu' : 'Thêm suất chiếu'}
        size="lg"
      >
        <div className="admin-form">
          <div className="form-group">
            <label className="form-label">Chọn Phim</label>
            <select
              className="form-select"
              value={editing.movieId || ''}
              onChange={(e) => {
                const mid = Number(e.target.value);
                setEditing({ ...editing, movieId: mid });
                if (editing.startTime) calculateAndSetTimes(editing.startTime, mid);
              }}
            >
              <option value="">-- Chọn phim --</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.duration} phút)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phòng chiếu</label>
            <select
              className="form-select"
              value={editing.roomId || ''}
              onChange={(e) => setEditing({ ...editing, roomId: Number(e.target.value) })}
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((r) => {
                const c = cinemas.find((ci) => ci.id === r.cinemaId);
                return (
                  <option key={r.id} value={r.id}>
                    {c?.name} - {r.name} (Sức chứa: {r.capacity})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="admin-form-row">
            <div className="form-group">
              <label className="form-label">Giờ bắt đầu</label>
              <input
                type="datetime-local"
                className="form-input"
                value={editing.startTime || ''}
                onChange={(e) => calculateAndSetTimes(e.target.value, editing.movieId)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giờ kết thúc</label>
              <input
                type="datetime-local"
                className="form-input"
                value={editing.endTime || ''}
                readOnly
                style={{ backgroundColor: '#27272a', cursor: 'not-allowed', color: '#a1a1aa' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Giá vé</label>
            <input
              type="number"
              className="form-input"
              value={editing.basePrice || ''}
              onChange={(e) => setEditing({ ...editing, basePrice: Number(e.target.value) })}
            />
          </div>

          <div className="admin-form-actions">
            <button className="btn btn-outline" onClick={() => setModal(false)}>
              Hủy
            </button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang xử lý...' : 'Lưu'}
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}