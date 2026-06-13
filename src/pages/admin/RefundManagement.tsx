// FILE: src/pages/admin/RefundManagement.tsx
import { useEffect, useState, useCallback } from 'react';
import { ticketTransferApi } from '../../api/axiosConfig';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) => n?.toLocaleString('vi-VN') + 'đ';
const fmtDateTime = (d: string) => (d ? new Date(d).toLocaleString('vi-VN') : '—');

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Chờ duyệt',  cls: 'status-pending'  },
  APPROVED: { label: 'Đã duyệt',   cls: 'status-approved' },
  REJECTED: { label: 'Từ chối',    cls: 'status-rejected' },
  EXPIRED:  { label: 'Hết hạn',    cls: 'status-expired'  },
};

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
  .am-btn-danger { background:#7f1d1d; color:#fca5a5; border:1px solid #ef4444; padding:11px 22px; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; transition:background 0.2s; }
  .am-btn-danger:hover:not(:disabled) { background:#991b1b; }
  .am-btn-danger:disabled { opacity:0.55; cursor:not-allowed; }
  .am-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
  .am-stat-card { background:#141414; border:1px solid #222; border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:6px; transition:border-color 0.2s; }
  .am-stat-card:hover { border-color:#444; }
  .am-stat-card.stat-warn     { border-color:#92400e; }
  .am-stat-card.stat-success  { border-color:#166534; }
  .am-stat-card.stat-danger   { border-color:#7f1d1d; }
  .am-stat-card.stat-highlight { border-color:#1e3a5f; }
  .am-stat-num { font-size:28px; font-weight:800; color:#fff; }
  .am-stat-label { font-size:12px; color:#666; }
  .am-process-guide { display:flex; align-items:center; gap:12px; background:#0d1a2d; border:1px solid #1e3a5f; border-radius:12px; padding:16px 24px; margin-bottom:24px; flex-wrap:wrap; }
  .am-process-step { display:flex; align-items:center; gap:10px; flex:1; min-width:130px; }
  .am-process-step strong { color:#fff; font-size:13px; display:block; }
  .am-process-step small { color:#555; font-size:11px; }
  .am-process-icon { font-size:22px; flex-shrink:0; }
  .am-process-arrow { color:#1e3a5f; font-size:20px; flex-shrink:0; }
  .am-filter-tabs { display:flex; gap:6px; margin-bottom:20px; flex-wrap:wrap; }
  .am-filter-tab { padding:8px 18px; background:#111; border:1px solid #222; border-radius:8px; color:#666; font-size:13px; font-weight:600; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:6px; }
  .am-filter-tab:hover { border-color:#444; color:#ccc; }
  .am-filter-tab.active { background:#e50914; border-color:#e50914; color:#fff; }
  .am-tab-count { background:rgba(255,255,255,0.15); padding:1px 7px; border-radius:20px; font-size:11px; }
  .am-table-wrap { background:#0f0f0f; border:1px solid #1e1e1e; border-radius:12px; overflow:hidden; position:relative; }
  .am-loading { text-align:center; padding:20px; color:#555; font-size:13px; }
  .am-table { width:100%; border-collapse:collapse; font-size:13.5px; }
  .am-table thead tr { background:#161616; border-bottom:1px solid #2a2a2a; }
  .am-table th { padding:13px 14px; text-align:left; font-size:11px; font-weight:700; color:#555; text-transform:uppercase; letter-spacing:0.8px; white-space:nowrap; }
  .am-table td { padding:14px; border-bottom:1px solid #161616; vertical-align:middle; color:#ccc; }
  .am-table tbody tr:hover { background:#141414; }
  .am-table tbody tr:last-child td { border-bottom:none; }
  .am-row-highlight { background:rgba(234,179,8,0.03) !important; }
  .am-empty { text-align:center; padding:48px; color:#444; font-style:italic; }
  .am-code-badge { background:#1a1a1a; border:1px solid #2a2a2a; color:#e50914; font-family:'Courier New',monospace; font-size:12px; font-weight:700; padding:4px 10px; border-radius:6px; letter-spacing:1px; white-space:nowrap; }
  .am-type-tag { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .type-refund { background:#2d1a1a; color:#f87171; }
  .type-transfer { background:#1a1a2d; color:#a78bfa; }
  .am-status-badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; white-space:nowrap; }
  .status-pending  { background:#3a2e00; color:#fbbf24; border:1px solid #92400e; }
  .status-approved { background:#052e16; color:#4ade80; border:1px solid #166534; }
  .status-rejected { background:#2d0e0e; color:#f87171; border:1px solid #7f1d1d; }
  .status-expired  { background:#1c1c1c; color:#6b7280; border:1px solid #374151; }
  .am-user-cell { display:flex; flex-direction:column; gap:2px; }
  .am-user-name { color:#ddd; font-weight:600; font-size:13px; }
  .am-user-email { color:#555; font-size:11px; }
  .am-fee-cell { color:#f87171; font-size:13px; }
  .am-refund-cell strong { color:#4ade80; }
  .am-td-dates { font-size:12px; white-space:nowrap; }
  .am-overdue { color:#f87171 !important; }
  .am-overdue-tag { background:#7f1d1d; color:#fca5a5; font-size:10px; padding:1px 6px; border-radius:4px; margin-left:4px; }
  .am-reject-reason { font-size:11px; color:#6b7280; margin-top:4px; max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .am-processed-note { font-size:12px; color:#666; }
  .am-row-actions { display:flex; gap:6px; align-items:center; flex-wrap:wrap; }
  .am-btn-approve { background:#052e16; color:#4ade80; border:1px solid #166534; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:700; transition:background 0.2s; white-space:nowrap; }
  .am-btn-approve:hover:not(:disabled) { background:#166534; }
  .am-btn-approve:disabled { opacity:0.5; cursor:not-allowed; }
  .am-btn-reject { background:#2d0e0e; color:#f87171; border:1px solid #7f1d1d; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; font-weight:700; transition:background 0.2s; white-space:nowrap; }
  .am-btn-reject:hover:not(:disabled) { background:#7f1d1d; }
  .am-btn-reject:disabled { opacity:0.5; cursor:not-allowed; }
  .am-form-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; backdrop-filter:blur(4px); animation:am-fadein 0.15s ease; }
  .am-form-modal { background:#111; border:1px solid #2a2a2a; border-radius:16px; width:100%; max-width:640px; max-height:90vh; overflow-y:auto; padding:0 0 24px; }
  .am-form-header { display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid #1e1e1e; position:sticky; top:0; background:#111; z-index:1; }
  .am-form-header h3 { margin:0; font-size:16px; font-weight:700; color:#fff; }
  .am-close-btn { background:none; border:none; color:#555; font-size:18px; cursor:pointer; padding:4px 8px; border-radius:4px; transition:color 0.2s; }
  .am-close-btn:hover { color:#fff; }
  .am-label { display:flex; flex-direction:column; gap:6px; font-size:12px; font-weight:600; color:#666; text-transform:uppercase; letter-spacing:0.5px; margin:20px 24px; }
  .am-textarea { background:#0d0d0d; border:1px solid #2a2a2a; border-radius:8px; padding:10px 12px; font-size:14px; color:#fff; outline:none; transition:border-color 0.2s; width:100%; box-sizing:border-box; resize:vertical; font-family:inherit; }
  .am-textarea:focus { border-color:#e50914; }
  .am-form-actions { display:flex; justify-content:flex-end; gap:10px; padding:16px 24px 0; }
  @media (max-width:1024px) { .am-page { padding:20px; } .am-stats-row { grid-template-columns:repeat(2,1fr); } }
  @media (max-width:640px) { .am-stats-row { grid-template-columns:1fr 1fr; } .am-header { flex-direction:column; } .am-process-guide { flex-direction:column; align-items:flex-start; } .am-process-arrow { transform:rotate(90deg); } }
`;

const FILTER_TABS = ['', 'PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'];
const FILTER_LABELS: Record<string, string> = {
  '': 'Tất cả', PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối', EXPIRED: 'Hết hạn',
};

export default function RefundManagement() {
  const [transfers, setTransfers]     = useState<any[]>([]);
  const [filter, setFilter]           = useState<string>('PENDING');
  const [loading, setLoading]         = useState(true);
  const [processing, setProcessing]   = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: number; code: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    ticketTransferApi.getAll(filter || undefined)
      .then((r: any) => setTransfers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter]);
  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    if (!confirm('Xác nhận DUYỆT yêu cầu hoàn vé này?')) return;
    setProcessing(id);
    try {
      await ticketTransferApi.approve(id);
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Lỗi khi duyệt');
    } finally { setProcessing(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessing(rejectModal.id);
    try {
      await ticketTransferApi.reject(rejectModal.id, rejectReason);
      setRejectModal(null); setRejectReason(''); load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Lỗi khi từ chối');
    } finally { setProcessing(null); }
  };

  const counts: Record<string, number> = { '': transfers.length };
  transfers.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });

  const totalRefundPending = transfers
    .filter(t => t.status === 'PENDING')
    .reduce((s, t) => s + (t.refundAmount || 0), 0);

  return (
    <>
      <style>{CSS}</style>
      <div className="am-page">
        {/* Header */}
        <div className="am-header">
          <div>
            <h1 className="am-title">↩️ Quản lý Hoàn Vé</h1>
            <p className="am-subtitle">Duyệt / từ chối yêu cầu hoàn &amp; chuyển vé từ khách hàng</p>
          </div>
          <button className="am-btn-ghost" onClick={load}>🔄 Làm mới</button>
        </div>

        {/* Stats */}
        <div className="am-stats-row">
          <div className="am-stat-card stat-warn">
            <span className="am-stat-num">{transfers.filter(t => t.status === 'PENDING').length}</span>
            <span className="am-stat-label">⏳ Chờ duyệt</span>
          </div>
          <div className="am-stat-card stat-success">
            <span className="am-stat-num">{transfers.filter(t => t.status === 'APPROVED').length}</span>
            <span className="am-stat-label">✅ Đã duyệt</span>
          </div>
          <div className="am-stat-card stat-danger">
            <span className="am-stat-num">{transfers.filter(t => t.status === 'REJECTED').length}</span>
            <span className="am-stat-label">❌ Từ chối</span>
          </div>
          <div className="am-stat-card stat-highlight">
            <span className="am-stat-num">{fmt(totalRefundPending)}</span>
            <span className="am-stat-label">💸 Cần hoàn trả</span>
          </div>
        </div>

        {/* Process guide */}
        <div className="am-process-guide">
          <div className="am-process-step">
            <span className="am-process-icon">1️⃣</span>
            <div><strong>Khách gửi yêu cầu</strong><small>Qua trang "Vé của tôi"</small></div>
          </div>
          <span className="am-process-arrow">→</span>
          <div className="am-process-step">
            <span className="am-process-icon">2️⃣</span>
            <div><strong>Admin xét duyệt</strong><small>Kiểm tra điều kiện hoàn</small></div>
          </div>
          <span className="am-process-arrow">→</span>
          <div className="am-process-step">
            <span className="am-process-icon">3️⃣</span>
            <div><strong>Bộ phận kế toán</strong><small>Chuyển khoản thực tế</small></div>
          </div>
          <span className="am-process-arrow">→</span>
          <div className="am-process-step">
            <span className="am-process-icon">4️⃣</span>
            <div><strong>Hoàn tất</strong><small>Khách nhận tiền</small></div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="am-filter-tabs">
          {FILTER_TABS.map(f => (
            <button
              key={f}
              className={`am-filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {FILTER_LABELS[f]}
              {counts[f] ? <span className="am-tab-count">{counts[f]}</span> : null}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="am-table-wrap">
          {loading && <div className="am-loading">Đang tải...</div>}
          <table className="am-table">
            <thead>
              <tr>
                <th>Mã đặt vé</th><th>Khách hàng</th><th>Loại</th>
                <th>Số tiền gốc</th><th>Phí (10%)</th><th>Hoàn lại</th>
                <th>Yêu cầu lúc</th><th>Deadline</th>
                <th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 && !loading && (
                <tr><td colSpan={10} className="am-empty">Không có yêu cầu nào</td></tr>
              )}
              {transfers.map(t => {
                const cfg = STATUS_CONFIG[t.status] || { label: t.status, cls: '' };
                const isOverDeadline = t.deadline && new Date(t.deadline) < new Date();
                return (
                  <tr key={t.id} className={t.status === 'PENDING' ? 'am-row-highlight' : ''}>
                    <td><span className="am-code-badge">{t.bookingCode || `#${t.bookingId}`}</span></td>
                    <td>
                      <div className="am-user-cell">
                        <span className="am-user-name">{t.fromUserName || `User #${t.fromUserId}`}</span>
                        <small className="am-user-email">{t.fromUserEmail}</small>
                      </div>
                    </td>
                    <td>
                      <span className="am-type-tag type-refund">💰 Hoàn tiền</span>
                    </td>
                    <td>{fmt(t.totalPrice)}</td>
                    <td className="am-fee-cell">−{fmt(t.feeAmount)}</td>
                    <td className="am-refund-cell"><strong>{fmt(t.refundAmount)}</strong></td>
                    <td className="am-td-dates">{fmtDateTime(t.requestedAt)}</td>
                    <td className={isOverDeadline && t.status === 'PENDING' ? 'am-overdue' : ''}>
                      {fmtDateTime(t.deadline)}
                      {isOverDeadline && t.status === 'PENDING' && <span className="am-overdue-tag">QUÁ HẠN</span>}
                    </td>
                    <td>
                      <span className={`am-status-badge ${cfg.cls}`}>{cfg.label}</span>
                      {t.rejectReason && (
                        <div className="am-reject-reason" title={t.rejectReason}>
                          💬 {t.rejectReason.length > 30 ? t.rejectReason.substring(0, 30) + '...' : t.rejectReason}
                        </div>
                      )}
                    </td>
                    <td>
                      {t.status === 'PENDING' && (
                        <div className="am-row-actions">
                          <button className="am-btn-approve" disabled={processing === t.id}
                            onClick={() => handleApprove(t.id)}>
                            {processing === t.id ? '⏳' : '✅ Duyệt'}
                          </button>
                          <button className="am-btn-reject" disabled={processing === t.id}
                            onClick={() => { 
                                setRejectModal({ 
                                    id: t.id, 
                                    code: t.bookingCode || String(t.id) 
                                }); 
                                setRejectReason(''); 
                            }}>
                            ❌ Từ chối
                          </button>
                        </div>
                      )}
                      {t.status === 'APPROVED' && (
                        <span className="am-processed-note">✅ Đã duyệt<br /><small>{fmtDateTime(t.processedAt)}</small></span>
                      )}
                      {t.status === 'REJECTED' && (
                        <span className="am-processed-note">❌ Từ chối<br /><small>{fmtDateTime(t.processedAt)}</small></span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Reject Modal */}
        {rejectModal && (
          <div className="am-form-overlay" onClick={e => e.target === e.currentTarget && setRejectModal(null)}>
            <div className="am-form-modal" style={{ maxWidth: 420 }}>
              <div className="am-form-header">
                <h3>❌ Từ chối yêu cầu <span className="am-code-badge">{rejectModal.code}</span></h3>
                <button className="am-close-btn" onClick={() => setRejectModal(null)}>✕</button>
              </div>
              <label className="am-label">
                Lý do từ chối (hiển thị cho khách hàng)
                <textarea
                  className="am-textarea"
                  rows={4}
                  placeholder="VD: Yêu cầu vượt quá thời hạn hoàn vé 24h trước suất chiếu..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                />
              </label>
              <div className="am-form-actions">
                <button className="am-btn-ghost" onClick={() => setRejectModal(null)}>Huỷ</button>
                <button className="am-btn-danger" onClick={handleReject} disabled={processing === rejectModal.id}>
                  {processing === rejectModal.id ? '⏳ Đang xử lý...' : '❌ Xác nhận từ chối'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}