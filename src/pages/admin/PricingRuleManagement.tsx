// FILE: src/pages/admin/PricingRuleManagement.tsx
import { useEffect, useState, useCallback } from 'react';
import { seatMapApi, cinemaApi } from '../../api/axiosConfig';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => n?.toLocaleString('vi-VN') + 'đ';

const SEAT_LABELS: Record<string, string> = { NORMAL: 'Thường', VIP: 'VIP', COUPLE: 'Đôi' };
const AUD_LABELS:  Record<string, string> = { ADULT: 'Người lớn', CHILD: 'Trẻ em', STUDENT: 'Học sinh/SV', SENIOR: 'Cao tuổi' };
const SEAT_TYPES = ['NORMAL', 'VIP', 'COUPLE'];
const AUD_TYPES  = ['ADULT', 'CHILD', 'STUDENT', 'SENIOR'];
const SEAT_MULT: Record<string, number> = { NORMAL: 1.0, VIP: 1.3, COUPLE: 1.6 };
const EXAMPLE_BASE = 100000;

// ─── Inline styles ──────────────────────────────────────────────────────────
const CSS = `
  @keyframes am-fadein { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  .am-page { padding:32px 40px 80px; max-width:1400px; animation:am-fadein 0.3s ease; }
  .am-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; flex-wrap:wrap; gap:16px; }
  .am-title { font-size:26px; font-weight:800; color:#fff; margin:0 0 4px; }
  .am-subtitle { font-size:14px; color:#666; margin:0; }
  .am-btn-primary { background:#e50914; color:#fff; border:none; padding:11px 22px; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; transition:background 0.2s,transform 0.15s; white-space:nowrap; }
  .am-btn-primary:hover:not(:disabled) { background:#c0070f; transform:translateY(-1px); }
  .am-btn-primary:disabled { opacity:0.55; cursor:not-allowed; }
  .am-btn-ghost { background:transparent; color:#aaa; border:1px solid #333; padding:10px 20px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:border-color 0.2s,color 0.2s; }
  .am-btn-ghost:hover { border-color:#777; color:#fff; }
  .am-formula-box { background:#0d1a0d; border:1px solid #1a3a1a; border-radius:10px; padding:14px 20px; margin-bottom:24px; display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
  .am-formula-title { font-size:13px; font-weight:700; color:#4ade80; white-space:nowrap; }
  .am-formula { background:#0a2a0a; color:#86efac; font-family:'Courier New',monospace; font-size:13px; padding:6px 14px; border-radius:6px; }
  .am-formula-note { font-size:12px; color:#555; }
  .am-cinema-filter { margin-bottom:24px; }
  .am-label { display:flex; flex-direction:column; gap:6px; font-size:12px; font-weight:600; color:#666; text-transform:uppercase; letter-spacing:0.5px; }
  .am-input,.am-select { background:#0d0d0d; border:1px solid #2a2a2a; border-radius:8px; padding:10px 12px; font-size:14px; color:#fff; outline:none; transition:border-color 0.2s; width:100%; box-sizing:border-box; }
  .am-input:focus,.am-select:focus { border-color:#e50914; }
  .am-select option { background:#1a1a1a; }
  .am-form-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; backdrop-filter:blur(4px); animation:am-fadein 0.15s ease; }
  .am-form-modal { background:#111; border:1px solid #2a2a2a; border-radius:16px; width:100%; max-width:640px; max-height:90vh; overflow-y:auto; padding:0 0 24px; }
  .am-form-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid #1e1e1e; position:sticky; top:0; background:#111; z-index:1; }
  .am-form-header h3 { margin:0; font-size:16px; font-weight:700; color:#fff; }
  .am-close-btn { background:none; border:none; color:#555; font-size:18px; cursor:pointer; padding:4px 8px; border-radius:4px; transition:color 0.2s; }
  .am-close-btn:hover { color:#fff; }
  .am-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:20px 24px; }
  .am-form-actions { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px 0; }
  .am-discount-input-wrap { display:flex; flex-direction:column; gap:6px; }
  .am-pct-preview { font-size:12px; color:#4ade80; font-family:'Courier New',monospace; }
  .am-pricing-matrix { margin-top:28px; }
  .am-matrix-title { font-size:16px; font-weight:700; color:#fff; margin-bottom:4px; }
  .am-matrix-note { font-size:12px; color:#555; margin-bottom:16px; }
  .am-matrix-wrap { overflow-x:auto; }
  .am-matrix-table { width:100%; border-collapse:collapse; }
  .am-matrix-table th { background:#141414; padding:12px 16px; font-size:12px; font-weight:700; color:#666; text-align:center; border:1px solid #1e1e1e; }
  .am-matrix-corner { text-align:left !important; min-width:140px; }
  .am-matrix-seat-label { background:#0f0f0f; padding:14px 16px; border:1px solid #1e1e1e; display:flex; flex-direction:column; gap:4px; }
  .am-matrix-seat-label small { color:#555; font-size:11px; }
  .am-matrix-cell { background:#0d0d0d; padding:12px 16px; border:1px solid #1a1a1a; text-align:center; min-width:110px; vertical-align:top; transition:background 0.15s; }
  .am-matrix-cell:hover { background:#141414; }
  .am-cell-price { font-size:14px; font-weight:700; color:#fff; }
  .am-cell-disc { font-size:11px; color:#4ade80; margin-top:2px; }
  .am-cell-actions { display:flex; gap:4px; justify-content:center; margin-top:8px; opacity:0; transition:opacity 0.15s; }
  .am-matrix-cell:hover .am-cell-actions { opacity:1; }
  .am-cell-actions button { background:none; border:none; cursor:pointer; font-size:14px; padding:2px 4px; border-radius:4px; transition:background 0.15s; }
  .am-cell-actions button:hover { background:#222; }
  .seat-tag-sm { display:inline-block; padding:3px 10px; border-radius:5px; font-size:11px; font-weight:700; margin-bottom:2px; }
  .seat-tag-normal { background:#2a3540; color:#8bacc4; }
  .seat-tag-vip { background:#3d2e00; color:#f5a623; }
  .seat-tag-couple { background:#1a1a3d; color:#7b8fff; }
  .am-empty-state { text-align:center; padding:48px; color:#555; background:#0d0d0d; border:1px dashed #222; border-radius:12px; margin-top:24px; }
  @media (max-width:1024px) { .am-page { padding:20px; } .am-form-grid { grid-template-columns:1fr; } }
`;

export default function PricingRuleManagement() {
  const [cinemas, setCinemas]         = useState<any[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [rules, setRules]             = useState<any[]>([]);
  const [showForm, setShowForm]       = useState(false);
  const [editItem, setEditItem]       = useState<any>(null);
  const [saving, setSaving]           = useState(false);

  const emptyForm = { cinemaId: '', seatType: 'NORMAL', audienceType: 'ADULT', discountPercent: '0' };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    cinemaApi.getAll().then((r: any) => setCinemas(r.data)).catch(console.error);
  }, []);

  const load = useCallback(() => {
    if (selectedCinema === '') return;
    const id = selectedCinema === 'global' ? 0 : Number(selectedCinema);
    seatMapApi.getPricingByCinema(id).then((r: any) => setRules(r.data)).catch(console.error);
  }, [selectedCinema]);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        cinemaId:        form.cinemaId ? Number(form.cinemaId) : null,
        seatType:        form.seatType,
        audienceType:    form.audienceType,
        basePrice:       0,
        discountPercent: Number(form.discountPercent),
        isActive:        true,
      };
      editItem
        ? await seatMapApi.updatePricingRule(editItem.id, payload)
        : await seatMapApi.createPricingRule(payload);
      setShowForm(false); setEditItem(null); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xoá rule giá này?')) return;
    await seatMapApi.deletePricingRule(id); load();
  };

  const openEdit = (r: any) => {
    setEditItem(r);
    setForm({
      cinemaId:        r.cinemaId ? String(r.cinemaId) : '',
      seatType:        r.seatType,
      audienceType:    r.audienceType,
      discountPercent: String(r.discountPercent ?? 0),
    });
    setShowForm(true);
  };

  const getRule = (seatType: string, audType: string) =>
    rules.find(r => r.seatType === seatType && r.audienceType === audType);

  return (
    <>
      <style>{CSS}</style>
      <div className="am-page">
        <div className="am-header">
          <div>
            <h1 className="am-title">💰 Quản lý Bảng Giá</h1>
            <p className="am-subtitle">Cấu hình % giảm giá theo loại ghế và đối tượng khán giả</p>
          </div>
          <button className="am-btn-primary" onClick={() => { setEditItem(null); setForm(emptyForm); setShowForm(true); }}>
            ＋ Thêm Rule
          </button>
        </div>

        {/* Formula */}
        <div className="am-formula-box">
          <span className="am-formula-title">📐 Công thức tính giá:</span>
          <code className="am-formula">Giá vé = Giá suất chiếu × Hệ số ghế × (1 − Giảm%)</code>
          <span className="am-formula-note">Hệ số: Thường ×1.0 · VIP ×1.3 · Đôi ×1.6</span>
        </div>

        {/* Filter rạp */}
        <div className="am-cinema-filter">
          <label className="am-label" style={{ width: '100%', maxWidth: 360 }}>
            Chọn rạp để xem / chỉnh sửa bảng giá
            <select className="am-select" value={selectedCinema}
              onChange={e => setSelectedCinema(e.target.value)}>
              <option value="">— Chọn rạp —</option>
              <option value="global">🌐 Toàn hệ thống (Global)</option>
              {cinemas.map((c: any) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="am-form-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="am-form-modal" style={{ maxWidth: 480 }}>
              <div className="am-form-header">
                <h3>{editItem ? '✏️ Chỉnh sửa Rule' : '➕ Thêm Rule giá'}</h3>
                <button className="am-close-btn" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <div className="am-form-grid">
                <label className="am-label">
                  Rạp (để trống = toàn hệ thống)
                  <select className="am-select" value={form.cinemaId}
                    onChange={e => setForm(f => ({ ...f, cinemaId: e.target.value }))}>
                    <option value="">🌐 Toàn hệ thống</option>
                    {cinemas.map((c: any) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <label className="am-label">
                  Loại ghế
                  <select className="am-select" value={form.seatType}
                    onChange={e => setForm(f => ({ ...f, seatType: e.target.value }))}>
                    {SEAT_TYPES.map(s => <option key={s} value={s}>{SEAT_LABELS[s]}</option>)}
                  </select>
                </label>
                <label className="am-label">
                  Loại khán giả
                  <select className="am-select" value={form.audienceType}
                    onChange={e => setForm(f => ({ ...f, audienceType: e.target.value }))}>
                    {AUD_TYPES.map(a => <option key={a} value={a}>{AUD_LABELS[a]}</option>)}
                  </select>
                </label>
                <label className="am-label">
                  Giảm giá (%)
                  <div className="am-discount-input-wrap">
                    <input className="am-input" type="number" min="0" max="100"
                      value={form.discountPercent}
                      onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                      placeholder="0" />
                    <span className="am-pct-preview">
                      → Ví dụ với 100.000đ: {fmt(Math.round(
                        EXAMPLE_BASE * (SEAT_MULT[form.seatType] || 1)
                          * (1 - Number(form.discountPercent || 0) / 100)
                      ))}
                    </span>
                  </div>
                </label>
              </div>
              <div className="am-form-actions">
                <button className="am-btn-ghost" onClick={() => setShowForm(false)}>Huỷ</button>
                <button className="am-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? '⏳ Đang lưu...' : '✅ Lưu Rule'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Matrix */}
        {selectedCinema && rules.length > 0 && (
          <div className="am-pricing-matrix">
            <h3 className="am-matrix-title">
              📊 Bảng giá — {selectedCinema === 'global' ? 'Toàn hệ thống' : cinemas.find(c => String(c.id) === selectedCinema)?.name}
            </h3>
            <p className="am-matrix-note">Ví dụ với suất chiếu giá gốc 100.000đ</p>
            <div className="am-matrix-wrap">
              <table className="am-matrix-table">
                <thead>
                  <tr>
                    <th className="am-matrix-corner">Loại ghế ↓ / Khán giả →</th>
                    {AUD_TYPES.map(a => <th key={a}>{AUD_LABELS[a]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SEAT_TYPES.map(seat => (
                    <tr key={seat}>
                      <td className="am-matrix-seat-label">
                        <span className={`seat-tag-sm seat-tag-${seat.toLowerCase()}`}>{SEAT_LABELS[seat]}</span>
                        <small>×{SEAT_MULT[seat]}</small>
                      </td>
                      {AUD_TYPES.map(aud => {
                        const rule = getRule(seat, aud);
                        const base = Math.round(EXAMPLE_BASE * SEAT_MULT[seat]);
                        const disc = rule?.discountPercent ?? 0;
                        const final = Math.round(base * (1 - disc / 100));
                        return (
                          <td key={aud} className="am-matrix-cell">
                            <div className="am-cell-price">{fmt(final)}</div>
                            {disc > 0 && <div className="am-cell-disc">−{disc}%</div>}
                            {rule && (
                              <div className="am-cell-actions">
                                <button onClick={() => openEdit(rule)} title="Sửa">✏️</button>
                                <button onClick={() => handleDelete(rule.id)} title="Xoá">🗑</button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedCinema && rules.length === 0 && (
          <div className="am-empty-state">
            <p>Chưa có bảng giá cho rạp này. Nhấn <strong>+ Thêm Rule</strong> để bắt đầu.</p>
          </div>
        )}
      </div>
    </>
  );
}