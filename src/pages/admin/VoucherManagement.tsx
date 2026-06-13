// FILE: src/pages/admin/VoucherManagement.tsx
import { useEffect, useState, useCallback } from 'react';
import { voucherApi } from '../../api/axiosConfig';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => n?.toLocaleString('vi-VN') + 'đ';
const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString('vi-VN') : '—');

// ─── Inline styles ──────────────────────────────────────────────────────────
const CSS = `
  @keyframes am-fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  .am-page { padding: 32px 40px 80px; max-width: 1400px; animation: am-fadein 0.3s ease; }
  .am-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; flex-wrap:wrap; gap:16px; }
  .am-title { font-size:26px; font-weight:800; color:#fff; margin:0 0 4px; }
  .am-subtitle { font-size:14px; color:#666; margin:0; }
  .am-btn-primary { background:#e50914; color:#fff; border:none; padding:11px 22px; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; transition:background 0.2s,transform 0.15s; white-space:nowrap; }
  .am-btn-primary:hover:not(:disabled) { background:#c0070f; transform:translateY(-1px); }
  .am-btn-primary:disabled { opacity:0.55; cursor:not-allowed; }
  .am-btn-ghost { background:transparent; color:#aaa; border:1px solid #333; padding:10px 20px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:border-color 0.2s,color 0.2s; }
  .am-btn-ghost:hover { border-color:#777; color:#fff; }
  .am-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .am-stat-card { background:#141414; border:1px solid #222; border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:6px; transition:border-color 0.2s; }
  .am-stat-card:hover { border-color:#444; }
  .am-stat-num { font-size:28px; font-weight:800; color:#fff; }
  .am-stat-label { font-size:12px; color:#666; }
  .am-toolbar { margin-bottom:20px; }
  .am-search { width:100%; max-width:400px; background:#141414; border:1px solid #2a2a2a; border-radius:8px; padding:10px 16px; font-size:14px; color:#fff; outline:none; transition:border-color 0.2s; }
  .am-search:focus { border-color:#e50914; }
  .am-form-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; backdrop-filter:blur(4px); animation:am-fadein 0.15s ease; }
  .am-form-modal { background:#111; border:1px solid #2a2a2a; border-radius:16px; width:100%; max-width:640px; max-height:90vh; overflow-y:auto; padding:0 0 24px; }
  .am-form-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid #1e1e1e; position:sticky; top:0; background:#111; z-index:1; }
  .am-form-header h3 { margin:0; font-size:16px; font-weight:700; color:#fff; }
  .am-close-btn { background:none; border:none; color:#555; font-size:18px; cursor:pointer; padding:4px 8px; border-radius:4px; transition:color 0.2s; }
  .am-close-btn:hover { color:#fff; }
  .am-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:20px 24px; }
  .am-label { display:flex; flex-direction:column; gap:6px; font-size:12px; font-weight:600; color:#666; text-transform:uppercase; letter-spacing:0.5px; }
  .am-input,.am-select { background:#0d0d0d; border:1px solid #2a2a2a; border-radius:8px; padding:10px 12px; font-size:14px; color:#fff; outline:none; transition:border-color 0.2s; width:100%; box-sizing:border-box; }
  .am-input:focus,.am-select:focus { border-color:#e50914; }
  .am-input:disabled { opacity:0.5; cursor:not-allowed; }
  .am-select option { background:#1a1a1a; }
  .am-error { margin:0 24px; padding:10px 14px; background:#2d0e0e; border:1px solid #7f1d1d; border-radius:8px; color:#f87171; font-size:13px; }
  .am-form-actions { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px 0; }
  .am-table-wrap { background:#0f0f0f; border:1px solid #1e1e1e; border-radius:12px; overflow:hidden; }
  .am-table { width:100%; border-collapse:collapse; font-size:13.5px; }
  .am-table thead tr { background:#161616; border-bottom:1px solid #2a2a2a; }
  .am-table th { padding:13px 14px; text-align:left; font-size:11px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:0.8px; white-space:nowrap; }
  .am-table td { padding:14px; border-bottom:1px solid #161616; vertical-align:middle; color:#ccc; }
  .am-table tbody tr:hover { background:#141414; }
  .am-table tbody tr:last-child td { border-bottom:none; }
  .am-row-dim { opacity:0.55; }
  .am-empty { text-align:center; padding:48px; color:#444; font-style:italic; }
  .am-code-badge { background:#1a1a1a; border:1px solid #2a2a2a; color:#e50914; font-family:'Courier New',monospace; font-size:12px; font-weight:700; padding:4px 10px; border-radius:6px; letter-spacing:1px; white-space:nowrap; }
  .am-type-tag { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .type-percent { background:#1e3a5f; color:#60a5fa; }
  .type-fixed { background:#1a2e1a; color:#4ade80; }
  .am-target-tag { background:#1e1e1e; color:#888; font-size:11px; padding:3px 9px; border-radius:20px; }
  .am-toggle-btn { padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; border:none; cursor:pointer; transition:opacity 0.2s; }
  .toggle-on { background:#052e16; color:#4ade80; }
  .toggle-off { background:#1c1c1c; color:#6b7280; }
  .am-toggle-btn:hover { opacity:0.75; }
  .am-usage-bar-wrap { display:flex; flex-direction:column; gap:4px; min-width:80px; }
  .am-usage-bar { height:4px; background:#222; border-radius:2px; width:80px; }
  .am-usage-fill { height:100%; background:#e50914; border-radius:2px; transition:width 0.3s; }
  .am-td-dates { font-size:12px; white-space:nowrap; }
  .am-td-dates .am-arrow { color:#444; margin:0 4px; }
  .am-expired { color:#ef4444 !important; }
  .am-td-value strong { color:#fff; }
  .am-td-value small { color:#666; display:block; font-size:11px; margin-top:2px; }
  .am-td-desc { max-width:200px; }
  .am-row-actions { display:flex; gap:6px; align-items:center; }
  .am-btn-edit { background:#1a2e1a; color:#4ade80; border:1px solid #166534; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:13px; transition:background 0.2s; }
  .am-btn-edit:hover { background:#166534; }
  .am-btn-del { background:#2d0e0e; color:#f87171; border:1px solid #7f1d1d; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:13px; transition:background 0.2s; }
  .am-btn-del:hover { background:#7f1d1d; }
  @media (max-width:1024px) { .am-page { padding:20px; } .am-stats-row { grid-template-columns:repeat(2,1fr); } .am-form-grid { grid-template-columns:1fr; } }
  @media (max-width:640px) { .am-stats-row { grid-template-columns:1fr 1fr; } .am-header { flex-direction:column; } }
`;

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');

  const emptyForm = {
    code: '', description: '',
    discountType: 'PERCENT', discountValue: '',
    maxDiscount: '', minOrderValue: '',
    totalQuantity: '', startDate: '', endDate: '',
    targetGroup: 'ALL', isActive: true,
  };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() =>
    voucherApi.getAll().then((r: any) => setVouchers(r.data)).catch(console.error),
  []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowForm(true); setError(''); };
  const openEdit = (v: any) => {
    setEditItem(v);
    setForm({
      code: v.code, description: v.description,
      discountType: v.discountType, discountValue: String(v.discountValue),
      maxDiscount: v.maxDiscount ? String(v.maxDiscount) : '',
      minOrderValue: v.minOrderValue ? String(v.minOrderValue) : '',
      totalQuantity: v.totalQuantity ? String(v.totalQuantity) : '',
      startDate: v.startDate ? v.startDate.substring(0, 16) : '',
      endDate: v.endDate ? v.endDate.substring(0, 16) : '',
      targetGroup: v.targetGroup || 'ALL',
      isActive: v.isActive,
    });
    setShowForm(true); setError('');
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.discountValue) {
      setError('Vui lòng điền mã voucher và giá trị giảm'); return;
    }
    setSaving(true); setError('');
    const payload = {
      ...form,
      discountValue:  parseFloat(form.discountValue),
      maxDiscount:    form.maxDiscount    ? parseFloat(form.maxDiscount)   : null,
      minOrderValue:  form.minOrderValue  ? parseFloat(form.minOrderValue) : 0,
      totalQuantity:  form.totalQuantity  ? parseInt(form.totalQuantity)   : null,
      startDate:      form.startDate || null,
      endDate:        form.endDate   || null,
    };
    try {
      editItem ? await voucherApi.update(editItem.id, payload) : await voucherApi.create(payload);
      setShowForm(false); load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Lỗi khi lưu voucher');
    } finally { setSaving(false); }
  };

  const handleToggle = async (v: any) => {
    await voucherApi.update(v.id, { ...v, isActive: !v.isActive });
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xoá voucher này?')) return;
    await voucherApi.delete(id); load();
  };

  const filtered = vouchers.filter(v =>
    v.code?.toLowerCase().includes(search.toLowerCase()) ||
    v.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="am-page">
        {/* Header */}
        <div className="am-header">
          <div>
            <h1 className="am-title">🎟 Quản lý Voucher</h1>
            <p className="am-subtitle">Tạo và quản lý mã giảm giá cho khách hàng</p>
          </div>
          <button className="am-btn-primary" onClick={openCreate}>＋ Tạo Voucher</button>
        </div>

        {/* Stats */}
        <div className="am-stats-row">
          <div className="am-stat-card">
            <span className="am-stat-num">{vouchers.length}</span>
            <span className="am-stat-label">Tổng voucher</span>
          </div>
          <div className="am-stat-card">
            <span className="am-stat-num">{vouchers.filter(v => v.isActive).length}</span>
            <span className="am-stat-label">Đang hoạt động</span>
          </div>
          <div className="am-stat-card">
            <span className="am-stat-num">{vouchers.reduce((s, v) => s + (v.usedCount || 0), 0)}</span>
            <span className="am-stat-label">Lượt đã dùng</span>
          </div>
          <div className="am-stat-card">
            <span className="am-stat-num">{vouchers.filter(v => v.endDate && new Date(v.endDate) < new Date()).length}</span>
            <span className="am-stat-label">Đã hết hạn</span>
          </div>
        </div>

        {/* Search */}
        <div className="am-toolbar">
          <input
            className="am-search"
            placeholder="🔍 Tìm mã voucher hoặc mô tả..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="am-form-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="am-form-modal">
              <div className="am-form-header">
                <h3>{editItem ? '✏️ Chỉnh sửa Voucher' : '➕ Tạo Voucher mới'}</h3>
                <button className="am-close-btn" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <div className="am-form-grid">
                <label className="am-label">
                  Mã voucher *
                  <input className="am-input" value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="VD: SUMMER30" disabled={!!editItem} />
                </label>
                <label className="am-label">
                  Mô tả *
                  <input className="am-input" value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Mô tả ngắn gọn..." />
                </label>
                <label className="am-label">
                  Loại giảm
                  <select className="am-select" value={form.discountType}
                    onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                  </select>
                </label>
                <label className="am-label">
                  Giá trị giảm *
                  <input className="am-input" type="number" value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    placeholder={form.discountType === 'PERCENT' ? '20 (= 20%)' : '50000 (= 50k)'} />
                </label>
                <label className="am-label">
                  Giảm tối đa (đ)
                  <input className="am-input" type="number" value={form.maxDiscount}
                    onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))}
                    placeholder="Không giới hạn" />
                </label>
                <label className="am-label">
                  Đơn tối thiểu (đ)
                  <input className="am-input" type="number" value={form.minOrderValue}
                    onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))}
                    placeholder="0" />
                </label>
                <label className="am-label">
                  Giới hạn lượt dùng
                  <input className="am-input" type="number" value={form.totalQuantity}
                    onChange={e => setForm(f => ({ ...f, totalQuantity: e.target.value }))}
                    placeholder="Không giới hạn" />
                </label>
                <label className="am-label">
                  Đối tượng
                  <select className="am-select" value={form.targetGroup}
                    onChange={e => setForm(f => ({ ...f, targetGroup: e.target.value }))}>
                    <option value="ALL">Tất cả</option>
                    <option value="NEW_USER">Khách mới</option>
                    <option value="VIP">VIP</option>
                    <option value="CHILD">Trẻ em</option>
                  </select>
                </label>
                <label className="am-label">
                  Từ ngày
                  <input className="am-input" type="datetime-local" value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </label>
                <label className="am-label">
                  Đến ngày
                  <input className="am-input" type="datetime-local" value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                </label>
              </div>
              {error && <div className="am-error">⚠️ {error}</div>}
              <div className="am-form-actions">
                <button className="am-btn-ghost" onClick={() => setShowForm(false)}>Huỷ</button>
                <button className="am-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Đang lưu...' : editItem ? '💾 Cập nhật' : '✅ Tạo Voucher'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="am-table-wrap">
          <table className="am-table">
            <thead>
              <tr>
                <th>Mã voucher</th><th>Mô tả</th><th>Loại</th><th>Giá trị</th>
                <th>Đối tượng</th><th>Đã dùng</th><th>Hiệu lực</th>
                <th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} className="am-empty">Chưa có voucher nào</td></tr>
              )}
              {filtered.map(v => {
                const isExpired = v.endDate && new Date(v.endDate) < new Date();
                return (
                  <tr key={v.id} className={!v.isActive || isExpired ? 'am-row-dim' : ''}>
                    <td><span className="am-code-badge">{v.code}</span></td>
                    <td className="am-td-desc">{v.description}</td>
                    <td>
                      <span className={`am-type-tag ${v.discountType === 'PERCENT' ? 'type-percent' : 'type-fixed'}`}>
                        {v.discountType === 'PERCENT' ? '%' : 'Cố định'}
                      </span>
                    </td>
                    <td className="am-td-value">
                      <strong>
                        {v.discountType === 'PERCENT'
                          ? `−${v.discountValue}%`
                          : `−${Number(v.discountValue).toLocaleString()}đ`}
                      </strong>
                      {v.maxDiscount && <small>(tối đa {Number(v.maxDiscount).toLocaleString()}đ)</small>}
                    </td>
                    <td><span className="am-target-tag">{v.targetGroup || 'ALL'}</span></td>
                    <td>
                      <div className="am-usage-bar-wrap">
                        <span>{v.usedCount ?? 0}{v.totalQuantity ? `/${v.totalQuantity}` : ''}</span>
                        {v.totalQuantity && (
                          <div className="am-usage-bar">
                            <div className="am-usage-fill"
                              style={{ width: `${Math.min(100, ((v.usedCount || 0) / v.totalQuantity) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="am-td-dates">
                      <span>{v.startDate ? fmtDate(v.startDate) : '∞'}</span>
                      <span className="am-arrow">→</span>
                      <span className={isExpired ? 'am-expired' : ''}>{v.endDate ? fmtDate(v.endDate) : '∞'}</span>
                    </td>
                    <td>
                      <button
                        className={`am-toggle-btn ${v.isActive && !isExpired ? 'toggle-on' : 'toggle-off'}`}
                        onClick={() => handleToggle(v)}
                      >
                        {v.isActive && !isExpired ? '● Hoạt động' : '○ Tắt'}
                      </button>
                    </td>
                    <td>
                      <div className="am-row-actions">
                        <button className="am-btn-edit" onClick={() => openEdit(v)}>✏️</button>
                        <button className="am-btn-del" onClick={() => handleDelete(v.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}