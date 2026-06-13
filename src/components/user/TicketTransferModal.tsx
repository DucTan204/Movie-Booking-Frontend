import { useState } from 'react';
import { ticketTransferApi } from '../../api/axiosConfig';
import './TicketTransferModal.css';

interface Props {
  bookingId: number;
  userId: number;
  movieTitle: string;
  showtime: string;
  totalPrice: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TicketTransferModal({
  bookingId, userId, movieTitle, showtime, totalPrice, onClose, onSuccess
}: Props) {
  const [step, setStep]         = useState<'confirm' | 'success' | 'error'>('confirm');
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fee    = Math.round(totalPrice * 0.1);
  const refund = totalPrice - fee;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await ticketTransferApi.request(bookingId, userId);
      setStep('success');
      setTimeout(onSuccess, 2000);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.message || 'Không thể hoàn vé. Vui lòng thử lại.');
      setStep('error');
    } finally { setLoading(false); }
  };

  return (
    <div className="transfer-overlay" onClick={onClose}>
      <div className="transfer-modal" onClick={e => e.stopPropagation()}>
        <button className="transfer-close" onClick={onClose}>✕</button>

        {step === 'confirm' && (
          <>
            <h2 className="transfer-title">🔄 Yêu cầu hoàn vé</h2>
            <div className="transfer-movie-info">
              <div className="transfer-movie-name">{movieTitle}</div>
              <div className="transfer-showtime">{showtime}</div>
            </div>
            <div className="transfer-breakdown">
              <div className="breakdown-row">
                <span>Giá vé gốc</span>
                <span>{totalPrice.toLocaleString()}đ</span>
              </div>
              <div className="breakdown-row fee-row">
                <span>Phí hoàn vé (10%)</span>
                <span className="fee-amount">- {fee.toLocaleString()}đ</span>
              </div>
              <div className="breakdown-row refund-row">
                <span>Số tiền hoàn lại</span>
                <span className="refund-amount">{refund.toLocaleString()}đ</span>
              </div>
            </div>
            <div className="transfer-notice">
              ⚠️ Chỉ được hoàn vé trước <strong>24 giờ</strong> so với giờ chiếu.
              Sau khi xác nhận, vé sẽ bị huỷ và không thể khôi phục.
            </div>
            <div className="transfer-actions">
              <button className="btn-cancel-transfer" onClick={onClose}>Huỷ bỏ</button>
              <button className="btn-confirm-transfer"
                onClick={handleConfirm} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Xác nhận hoàn vé'}
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="transfer-result success">
            <div className="result-icon">✅</div>
            <h3>Yêu cầu hoàn vé thành công!</h3>
            <p>Chúng tôi sẽ hoàn <strong>{refund.toLocaleString()}đ</strong> trong vòng 3-5 ngày làm việc.</p>
          </div>
        )}

        {step === 'error' && (
          <div className="transfer-result error">
            <div className="result-icon">❌</div>
            <h3>Không thể hoàn vé</h3>
            <p>{errorMsg}</p>
            <button className="btn-cancel-transfer" onClick={onClose}>Đóng</button>
          </div>
        )}
      </div>
    </div>
  );
}