import { useState } from 'react';
// Đảm bảo đường dẫn này đúng với file chứa các hàm gọi API của bạn
import { voucherApi } from '../../api/axiosConfig'; 
import './VoucherInput.css';

// ─── 1. PHẢI EXPORT TYPE ĐỂ FILE KHÁC DÙNG ĐƯỢC ──────────────────
export type AudienceType = 'ADULT' | 'CHILD' | 'STUDENT' | 'SENIOR';

// ─── 2. AUDIENCE SELECTOR ────────────────────────────────────────
const AUDIENCE_OPTIONS: { value: AudienceType; label: string; desc: string }[] = [
  { value: 'ADULT',   label: '👤 Người lớn',  desc: 'Giá gốc'  },
  { value: 'CHILD',   label: '👶 Trẻ em',     desc: 'Giảm 50%' },
  { value: 'STUDENT', label: '🎓 Học sinh/SV', desc: 'Giảm 20%' },
  { value: 'SENIOR',  label: '👴 Người cao tuổi', desc: 'Giảm 30%' },
];

interface AudienceSelectorProps {
  selected: AudienceType;
  onChange: (t: AudienceType) => void;
}

export function AudienceSelector({ selected, onChange }: AudienceSelectorProps) {
  return (
    <div className="audience-selector">
      <div className="audience-label">Loại khán giả</div>
      <div className="audience-options">
        {AUDIENCE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`audience-btn ${selected === opt.value ? 'audience-active' : ''}`}
            onClick={() => onChange(opt.value)}
            type="button"
          >
            <span className="audience-name">{opt.label}</span>
            <span className="audience-desc">{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 3. VOUCHER INPUT ─────────────────────────────────────────────
interface VoucherResult {
  discountAmount: number;
  finalAmount: number;
}

interface VoucherInputProps {
  orderAmount: number;
  userId?: number; // Thêm dấu ? vì user có thể chưa login
  // SỬA TẠI ĐÂY: onApply cần nhận thêm tham số 'code' để Booking.tsx lưu lại
  onApply: (result: VoucherResult | null, code: string) => void;
}

export function VoucherInput({ orderAmount, userId, onApply }: VoucherInputProps) {
  const [code, setCode]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<VoucherResult | null>(null);
  const [error, setError]       = useState('');

  const handleApply = async () => {
    if (!code.trim() || !userId) {
        if (!userId) setError('Vui lòng đăng nhập để dùng voucher');
        return;
    }
    setLoading(true); 
    setError(''); 
    setResult(null);

    try {
      // Gọi API: Truyền userId, mã code đã viết hoa, và tổng tiền
      const res = await voucherApi.apply(userId, code.trim().toUpperCase(), orderAmount);
      setResult(res.data);
      // Trả kết quả và mã code về cho Booking.tsx
      onApply(res.data, code.trim().toUpperCase());
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Mã voucher không hợp lệ';
      setError(msg);
      onApply(null, '');
    } finally { 
        setLoading(false); 
    }
  };

  const handleRemove = () => {
    setCode(''); 
    setResult(null); 
    setError('');
    onApply(null, '');
  };

  return (
    <div className="voucher-wrap">
      <div className="voucher-label">🎟 Mã giảm giá</div>
      {!result ? (
        <div className="voucher-input-row">
          <input
            className="voucher-input"
            placeholder="Nhập mã voucher (VD: WELCOME10)"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleApply()}
          />
          <button
            className="btn-apply-voucher"
            onClick={handleApply}
            disabled={loading || !code.trim()}
          >
            {loading ? '...' : 'Áp dụng'}
          </button>
        </div>
      ) : (
        <div className="voucher-applied">
          <div className="voucher-info">
            <span className="voucher-code-tag">{code}</span>
            <span className="voucher-discount-text">
                - {result.discountAmount.toLocaleString()}đ
            </span>
          </div>
          <button className="btn-remove-voucher" onClick={handleRemove}>✕ Bỏ</button>
        </div>
      )}
      {error && <div className="voucher-error">{error}</div>}
    </div>
  );
}