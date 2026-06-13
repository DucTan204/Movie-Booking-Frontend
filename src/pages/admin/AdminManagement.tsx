import React, { useState, useEffect } from 'react';
import { voucherApi, seatMapApi } from '../../api/axiosConfig';

// ─── STYLES (Gộp từ AdminManagement.css) ──────────────────────────
const AdminStyles = () => (
  <style>{`
    :root {
      --primary: #e50914;
      --bg-dark: #141414;
      --bg-card: #1f1f1f;
      --bg-surface: #2f2f2f;
      --text-primary: #ffffff;
      --text-muted: #b3b3b3;
    }

    .admin-mgmt-page { padding: 32px 24px; max-width: 1000px; margin: 0 auto; color: var(--text-primary); }
    .admin-tabs { display: flex; gap: 8px; margin-bottom: 28px; }
    .tab-btn {
      background: var(--bg-surface); border: 1.5px solid rgba(255,255,255,0.1);
      color: var(--text-muted); border-radius: 10px;
      padding: 10px 22px; font-weight: 600; cursor: pointer;
      transition: all 0.18s;
    }
    .tab-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }

    .mgmt-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 20px;
    }
    .mgmt-title { font-size: 1.3rem; font-weight: 800; color: var(--primary); margin: 0; }
    .btn-add {
      background: var(--primary); color: #fff;
      border: none; border-radius: 8px;
      padding: 10px 20px; font-weight: 700; cursor: pointer;
    }

    .mgmt-form-card {
      background: var(--bg-card); border-radius: 14px;
      padding: 24px; margin-bottom: 24px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .mgmt-form-card h3 { margin-top: 0; margin-bottom: 18px; color: #fff; font-size: 1rem; }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px,1fr));
      gap: 14px; margin-bottom: 18px;
    }
    .form-grid label {
      display: flex; flex-direction: column;
      font-size: 0.8rem; color: var(--text-muted); gap: 6px;
    }
    .form-grid input, .form-grid select {
      background: var(--bg-dark);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; padding: 9px 12px;
      color: #fff; font-size: 0.88rem;
    }
    .form-grid input:focus, .form-grid select:focus {
      outline: none; border-color: var(--primary);
    }
    .form-error { color: var(--primary); font-size: 0.82rem; margin-bottom: 10px; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; }
    
    .btn-cancel {
      background: var(--bg-surface); color: var(--text-muted);
      border: none; border-radius: 8px; padding: 10px 20px;
      font-weight: 600; cursor: pointer;
    }
    .btn-save {
      background: var(--primary); color: #fff;
      border: none; border-radius: 8px; padding: 10px 24px;
      font-weight: 700; cursor: pointer;
    }
    .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

    .cinema-filter { display: flex; gap: 10px; margin-bottom: 20px; }
    .cinema-filter-input {
      flex: 1; background: var(--bg-dark);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; padding: 10px 14px;
      color: #fff; font-size: 0.9rem;
    }
    .btn-load {
      background: var(--bg-surface); color: #fff;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; padding: 10px 18px;
      font-weight: 600; cursor: pointer;
    }

    .mgmt-table-wrap { overflow-x: auto; }
    .mgmt-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    .mgmt-table th {
      background: var(--bg-surface);
      color: var(--text-muted); font-weight: 600;
      padding: 12px 14px; text-align: left;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .mgmt-table td {
      padding: 12px 14px; color: #fff;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .mgmt-table tr:hover td { background: rgba(255,255,255,0.03); }
    
    .voucher-code-cell {
      font-family: monospace;
      background: rgba(229,9,20,0.12); color: var(--primary);
      border-radius: 4px; padding: 2px 8px; font-size: 0.82rem; font-weight: 700;
    }
    .seat-tag { border-radius: 4px; padding: 2px 8px; font-size: 0.78rem; font-weight: 700; }
    .seat-tag-normal { background: #2a3a2a; color: #aaa; }
    .seat-tag-vip    { background: #3a2a00; color: #f5a623; }
    .seat-tag-couple { background: #1a2a3a; color: #4ab3f4; }
    
    .final-price { color: #1db954; font-weight: 700; }
    .btn-delete-row {
      background: rgba(229,9,20,0.1); color: var(--primary);
      border: 1px solid rgba(229,9,20,0.2);
      border-radius: 6px; padding: 5px 12px;
      font-size: 0.78rem; cursor: pointer;
    }
    .btn-delete-row:hover { background: rgba(229,9,20,0.25); }
    .empty-row { text-align: center; color: var(--text-muted); padding: 32px !important; }
  `}</style>
);

// ─── VOUCHER MANAGEMENT ───────────────────────────────────────────
export function VoucherManagement() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', description: '',
    discountType: 'PERCENT', discountValue: '',
    minOrderAmount: '', maxDiscountAmount: '',
    usageLimit: '', startDate: '', endDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const load = () => voucherApi.getAll().then(r => setVouchers(r.data));
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.discountValue) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc'); return;
    }
    setSaving(true); setError('');
    try {
      await voucherApi.create({
        ...form,
        discountValue:      parseFloat(form.discountValue),
        minOrderAmount:     parseFloat(form.minOrderAmount  || '0'),
        maxDiscountAmount:  form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
        usageLimit:         form.usageLimit ? parseInt(form.usageLimit) : null,
        startDate:          form.startDate  || null,
        endDate:            form.endDate    || null,
        isActive: true,
      });
      setShowForm(false);
      setForm({ code:'', description:'', discountType:'PERCENT', discountValue:'',
                minOrderAmount:'', maxDiscountAmount:'', usageLimit:'',
                startDate:'', endDate:'' });
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Lỗi khi tạo voucher');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xoá voucher này?')) return;
    await voucherApi.delete(id);
    load();
  };

  return (
    <div className="admin-management">
      <div className="mgmt-header">
        <h2 className="mgmt-title">🎟 Quản lý Voucher</h2>
        <button className="btn-add" onClick={() => setShowForm(true)}>+ Tạo Voucher</button>
      </div>

      {showForm && (
        <div className="mgmt-form-card">
          <h3>Tạo voucher mới</h3>
          <div className="form-grid">
            <label>Mã voucher *
              <input value={form.code}
                onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))}
                placeholder="VD: SUMMER30" />
            </label>
            <label>Mô tả *
              <input value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}))}
                placeholder="Mô tả ngắn" />
            </label>
            <label>Loại giảm giá *
              <select value={form.discountType}
                onChange={e => setForm(f => ({...f, discountType: e.target.value}))}>
                <option value="PERCENT">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định (đ)</option>
              </select>
            </label>
            <label>Giá trị giảm *
              <input type="number" value={form.discountValue}
                onChange={e => setForm(f => ({...f, discountValue: e.target.value}))}
                placeholder={form.discountType === 'PERCENT' ? '10 (= 10%)' : '50000 (= 50k)'} />
            </label>
            <label>Đơn tối thiểu (đ)
              <input type="number" value={form.minOrderAmount}
                onChange={e => setForm(f => ({...f, minOrderAmount: e.target.value}))}
                placeholder="0" />
            </label>
            <label>Giảm tối đa (đ)
              <input type="number" value={form.maxDiscountAmount}
                onChange={e => setForm(f => ({...f, maxDiscountAmount: e.target.value}))}
                placeholder="Không giới hạn" />
            </label>
            <label>Giới hạn số lượt
              <input type="number" value={form.usageLimit}
                onChange={e => setForm(f => ({...f, usageLimit: e.target.value}))}
                placeholder="Không giới hạn" />
            </label>
            <label>Ngày bắt đầu
              <input type="datetime-local" value={form.startDate}
                onChange={e => setForm(f => ({...f, startDate: e.target.value}))} />
            </label>
            <label>Ngày kết thúc
              <input type="datetime-local" value={form.endDate}
                onChange={e => setForm(f => ({...f, endDate: e.target.value}))} />
            </label>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Huỷ</button>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Tạo Voucher'}
            </button>
          </div>
        </div>
      )}

      <div className="mgmt-table-wrap">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Mã</th><th>Mô tả</th><th>Loại</th>
              <th>Giá trị</th><th>Đã dùng</th><th>Hết hạn</th><th></th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map(v => (
              <tr key={v.id}>
                <td><span className="voucher-code-cell">{v.code}</span></td>
                <td>{v.description}</td>
                <td>{v.discountType === 'PERCENT' ? '%' : 'Cố định'}</td>
                <td>
                  {v.discountType === 'PERCENT'
                    ? `${v.discountValue}%`
                    : `${Number(v.discountValue).toLocaleString()}đ`}
                </td>
                <td>{v.usedCount ?? 0}{v.usageLimit ? `/${v.usageLimit}` : ''}</td>
                <td style={{fontSize:'0.78rem', color:'var(--text-muted)'}}>
                  {v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td>
                  <button className="btn-delete-row" onClick={() => handleDelete(v.id)}>Xoá</button>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr><td colSpan={7} className="empty-row">Chưa có voucher nào</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PRICING RULE MANAGEMENT ──────────────────────────────────────
export function PricingRuleManagement() {
  const [rules, setRules]       = useState<any[]>([]);
  const [cinemaId, setCinemaId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    cinemaId: '', seatType: 'NORMAL',
    audienceType: 'ADULT', basePrice: '', discountPercent: '0',
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!cinemaId) return;
    seatMapApi.getPricingByCinema(Number(cinemaId))
      .then(r => setRules(r.data));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await seatMapApi.createPricingRule({
        ...form,
        cinemaId:       form.cinemaId ? Number(form.cinemaId) : null,
        basePrice:      Number(form.basePrice),
        discountPercent: Number(form.discountPercent),
      });
      setShowForm(false); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xoá rule này?')) return;
    await seatMapApi.deletePricingRule(id); load();
  };

  return (
    <div className="admin-management">
      <div className="mgmt-header">
        <h2 className="mgmt-title">💰 Quản lý Bảng Giá</h2>
        <button className="btn-add" onClick={() => setShowForm(true)}>+ Thêm Rule</button>
      </div>

      <div className="cinema-filter">
        <input
          type="number"
          className="cinema-filter-input"
          placeholder="Nhập Cinema ID để xem bảng giá..."
          value={cinemaId}
          onChange={e => setCinemaId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
        />
        <button className="btn-load" onClick={load}>Xem</button>
      </div>

      {showForm && (
        <div className="mgmt-form-card">
          <h3>Thêm rule giá mới</h3>
          <div className="form-grid">
            <label>Cinema ID (để trống = toàn hệ thống)
              <input type="number" value={form.cinemaId}
                onChange={e => setForm(f => ({...f, cinemaId: e.target.value}))}
                placeholder="Để trống = áp dụng chung" />
            </label>
            <label>Loại ghế *
              <select value={form.seatType}
                onChange={e => setForm(f => ({...f, seatType: e.target.value}))}>
                <option value="NORMAL">Thường</option>
                <option value="VIP">VIP</option>
                <option value="COUPLE">Đôi</option>
              </select>
            </label>
            <label>Loại khán giả *
              <select value={form.audienceType}
                onChange={e => setForm(f => ({...f, audienceType: e.target.value}))}>
                <option value="ADULT">Người lớn</option>
                <option value="CHILD">Trẻ em</option>
                <option value="STUDENT">Học sinh/SV</option>
                <option value="SENIOR">Người cao tuổi</option>
              </select>
            </label>
            <label>Giá gốc (đ) *
              <input type="number" value={form.basePrice}
                onChange={e => setForm(f => ({...f, basePrice: e.target.value}))}
                placeholder="90000" />
            </label>
            <label>Giảm giá (%)
              <input type="number" value={form.discountPercent}
                onChange={e => setForm(f => ({...f, discountPercent: e.target.value}))}
                placeholder="0" min="0" max="100" />
            </label>
          </div>
          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Huỷ</button>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm Rule'}
            </button>
          </div>
        </div>
      )}

      <div className="mgmt-table-wrap">
        <table className="mgmt-table">
          <thead>
            <tr>
              <th>Loại ghế</th><th>Khán giả</th>
              <th>Giá gốc</th><th>Giảm (%)</th><th>Giá sau giảm</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rules.map(r => {
              const final = Math.round(r.basePrice * (1 - (r.discountPercent || 0) / 100));
              return (
                <tr key={r.id}>
                  <td><span className={`seat-tag seat-tag-${r.seatType?.toLowerCase()}`}>{r.seatType}</span></td>
                  <td>{r.audienceType}</td>
                  <td>{Number(r.basePrice).toLocaleString()}đ</td>
                  <td>{r.discountPercent ?? 0}%</td>
                  <td className="final-price">{final.toLocaleString()}đ</td>
                  <td>
                    <button className="btn-delete-row" onClick={() => handleDelete(r.id)}>Xoá</button>
                  </td>
                </tr>
              );
            })}
            {rules.length === 0 && (
              <tr><td colSpan={6} className="empty-row">Nhập Cinema ID và nhấn Xem</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── DEFAULT EXPORT ──────────────────────────────────────────────
export default function AdminManagement() {
  const [tab, setTab] = useState<'voucher' | 'pricing'>('voucher');

  return (
    <div className="admin-mgmt-page">
      <AdminStyles />
      <div className="admin-tabs">
        <button className={`tab-btn ${tab === 'voucher'  ? 'active' : ''}`}
          onClick={() => setTab('voucher')}>🎟 Voucher</button>
        <button className={`tab-btn ${tab === 'pricing'  ? 'active' : ''}`}
          onClick={() => setTab('pricing')}>💰 Bảng giá</button>
      </div>
      
      {tab === 'voucher' && <VoucherManagement />}
      {tab === 'pricing' && <PricingRuleManagement />}
    </div>
  );
}