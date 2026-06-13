import { useState, useEffect } from 'react';
import { ticketQRApi } from '../../api/axiosConfig';
import './TicketQRModal.css';

interface Props {
  bookingId: number;
  onClose: () => void;
}

interface QRData {
  qrCode: string;
  qrImageBase64: string;
  blockchainTxHash: string;
  status: string;
  createdAt: string;
}

export default function TicketQRModal({ bookingId, onClose }: Props) {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    ticketQRApi.getByBookingId(bookingId)
      .then(res => setQrData(res.data))
      .catch(() => setError('Không thể tải QR vé. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  return (
    <div className="qr-overlay" onClick={onClose}>
      <div className="qr-modal" onClick={e => e.stopPropagation()}>
        <button className="qr-close" onClick={onClose}>✕</button>

        <h2 className="qr-title">🎟 Vé Của Bạn</h2>

        {loading && <div className="qr-loading">Đang tải mã QR...</div>}

        {error && <div className="qr-error">{error}</div>}

        {qrData && (
          <>
            <div className="qr-image-wrap">
              <img
                src={`data:image/png;base64,${qrData.qrImageBase64}`}
                alt="QR Code vé"
                className="qr-image"
              />
            </div>

            <div className="qr-code-text">{qrData.qrCode}</div>

            <div className="qr-status">
              Trạng thái: <span className={`status-badge status-${qrData.status.toLowerCase()}`}>
                {qrData.status === 'VALID' ? '✅ Hợp lệ'
                  : qrData.status === 'USED' ? '🔴 Đã dùng'
                  : qrData.status === 'EXPIRED' ? '⏰ Hết hạn'
                  : '❌ Đã huỷ'}
              </span>
            </div>

         
            <p className="qr-note">
              Xuất trình mã QR này tại quầy để nhân viên kiểm tra vé.
            </p>
          </>
        )}
      </div>
    </div>
  );
}