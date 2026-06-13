import { useEffect, useState } from 'react';
import { movieApi, genreApi } from '../../api/axiosConfig';
import type { Movie, Genre } from '../../types';
import AdminHeader from '../../components/admin/AdminHeader';
import CustomModal from '../../components/common/CustomModal';
import { formatDate } from '../../utils/format';

// 1. Loại bỏ trailerUrl khỏi object EMPTY
const EMPTY: Partial<Movie> = { 
  title: '', 
  description: '', 
  duration: 0, 
  releaseDate: '', 
  posterUrl: '', 
  genreIds: [] 
};

export default function AdminMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Movie>>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [mRes, gRes] = await Promise.all([movieApi.getAll(), genreApi.getAll()]);
      setMovies(mRes.data); 
      setGenres(gRes.data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(EMPTY); setModal(true); };
  const openEdit = (m: Movie) => { 
    setEditing({ 
      ...m, 
      genreIds: m.genres?.map((g) => g.id),
      releaseDate: m.releaseDate ? m.releaseDate.split('T')[0] : '' 
    }); 
    setModal(true); 
  };

  const handleSave = async () => {
    if (!editing.title || !editing.duration || editing.duration <= 0) {
      alert("Vui lòng nhập tên phim và thời lượng hợp lệ!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...editing,
        releaseDate: editing.releaseDate === '' ? null : editing.releaseDate
      };

      if (editing.id) {
        await movieApi.update(editing.id, payload);
      } else {
        await movieApi.create(payload);
      }
      
      setModal(false);
      load();
      alert("Lưu thành công!");
    } catch (err: any) {
      console.error("Lỗi API:", err.response?.data);
      alert("Lỗi: " + (err.response?.data?.message || "Không thể lưu phim"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa phim này?')) return;
    try {
      await movieApi.delete(id); 
      load();
    } catch (err) {
      alert("Không thể xóa phim này (có thể đã có lịch chiếu)");
    }
  };

  const toggleGenre = (gId: number) => {
    const ids = editing.genreIds || [];
    setEditing((prev) => ({ ...prev, genreIds: ids.includes(gId) ? ids.filter((x) => x !== gId) : [...ids, gId] }));
  };

  const filtered = movies.filter((m) => !search || m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <AdminHeader title="Quản lý Phim" subtitle={`${movies.length} phim`} action={<button className="btn btn-primary" onClick={openCreate}>+ Thêm phim</button>} />
      
      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <input className="admin-search" placeholder="Tìm kiếm phim..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Poster</th>
                <th>Tên phim</th>
                <th>Thể loại</th>
                <th>Thời lượng</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    {m.posterUrl ? <img src={m.posterUrl} alt={m.title} className="poster-thumb" /> : <div className="poster-thumb" style={{ background: 'var(--bg-surface)' }} />}
                  </td>
                  <td className="td-title">
                    <div style={{ fontWeight: 600 }}>{m.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.releaseDate ? formatDate(m.releaseDate) : '—'}</div>
                  </td>
                  <td>{m.genres?.map((g) => g.name).join(', ') || '—'}</td>
                  <td>{m.duration} phút</td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn action-btn-edit" onClick={() => openEdit(m)}>Sửa</button>
                      <button className="action-btn action-btn-delete" onClick={() => handleDelete(m.id)}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CustomModal isOpen={modal} onClose={() => setModal(false)} title={editing.id ? 'Sửa phim' : 'Thêm phim mới'} size="lg">
        <div className="admin-form">
          <div className="form-group">
            <label className="form-label">Tên phim</label>
            <input className="form-input" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea className="form-textarea" rows={3} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>

          <div className="admin-form-row">
            <div className="form-group">
              <label className="form-label">Thời lượng (phút)</label>
              <input type="number" className="form-input" value={editing.duration || ''} onChange={(e) => setEditing({ ...editing, duration: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày khởi chiếu</label>
              <input type="date" className="form-input" value={editing.releaseDate || ''} onChange={(e) => setEditing({ ...editing, releaseDate: e.target.value })} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">URL Poster</label>
            <input className="form-input" value={editing.posterUrl || ''} onChange={(e) => setEditing({ ...editing, posterUrl: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Thể loại</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {genres.map((g) => (
                <button 
                  key={g.id} 
                  type="button" 
                  className={`genre-chip${(editing.genreIds || []).includes(g.id) ? ' active' : ''}`} 
                  onClick={() => toggleGenre(g.id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-form-actions">
            <button className="btn btn-outline" onClick={() => setModal(false)}>Hủy</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu phim'}
            </button>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}