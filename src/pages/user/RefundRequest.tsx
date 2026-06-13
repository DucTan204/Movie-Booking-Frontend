import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bookingApi, ticketTransferApi } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { formatDateTime } from '../../utils/format';
import './RefundRequest.css';

export default function RefundRequest() {
  const [searchParams] = useSearchParams();
  const bookingId = Number(searchParams.get('bookingId'));
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
  });

  useEffect(() => {
    if (bookingId) {
      bookingApi.getById(bookingId)
        .then(res => setBooking(res.data))
        .catch(() => toast.error("Không thể tải thông tin vé"));
    }
  }, [bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      setLoading(true);
      await ticketTransferApi.request(bookingId, user.id, formData);
      toast.success('Gửi yêu cầu hoàn tiền thành công!');
      navigate('/my-tickets');
    } catch (error: any) {
      toast.error(error.response?.data || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return <div className="loading-center">Đang tải dữ liệu...</div>;

  const refundAmount = booking.totalPrice * 0.9;

  return (
    <div className="refund-page-wrapper">
      <h1 className="page-title">✨ YÊU CẦU HOÀN VÉ</h1>

      <div className="refund-ticket-card">
        {/* Phần bên trái: Thông tin vé */}
        <div className="ticket-main-info">
          <div className="ticket-header-code">MÃ ĐẶT VÉ: #{booking.bookingCode || booking.id}</div>
          <h2 className="movie-name">{booking.showtime?.movieTitle}</h2>
          
          <div className="info-grid-refund">
            <div className="info-item">
              <span className="label">📍 RẠP CHIẾU:</span>
              <span className="value">{booking.showtime?.cinemaName}</span>
            </div>
            <div className="info-item">
              <span className="label">🚪 PHÒNG:</span>
              <span className="value">{booking.showtime?.roomName}</span>
            </div>
            <div className="info-item full">
              <span className="label">📅 SUẤT CHIẾU:</span>
              <span className="value">{formatDateTime(booking.showtime?.startTime)}</span>
            </div>
          </div>
        </div>

        {/* Đường kẻ đứt quãng đặc trưng */}
        <div className="ticket-divider"></div>

        {/* Phần bên phải: Tiền bạc */}
        <div className="ticket-pricing-side">
          <div className="pricing-box">
            <div className="price-row">
              <span>Tổng thanh toán:</span>
              <span>{booking.totalPrice.toLocaleString()}đ</span>
            </div>
            <div className="price-row fee">
              <span>Phí hoàn vé (10%):</span>
              <span>-{(booking.totalPrice * 0.1).toLocaleString()}đ</span>
            </div>
            <div className="price-row final-refund">
              <span>TIỀN HOÀN LẠI:</span>
              <span className="gold-text">{refundAmount.toLocaleString()}đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form nhập thông tin ngân hàng */}
      <form className="refund-banking-form" onSubmit={handleSubmit}>
        <h3 className="form-heading">Thông tin nhận tiền</h3>
        
        <div className="form-group">
          <label>Lý do hoàn vé</label>
          <textarea 
            required 
            placeholder="Tại sao bạn muốn hoàn vé này?"
            value={formData.reason}
            onChange={e => setFormData({...formData, reason: e.target.value})}
          />
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label>Ngân hàng</label>
            <input 
              type="text" required placeholder="VD: Vietcombank"
              value={formData.bankName}
              onChange={e => setFormData({...formData, bankName: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Số tài khoản</label>
            <input 
              type="text" required placeholder="Nhập STK của bạn"
              value={formData.bankAccountNumber}
              onChange={e => setFormData({...formData, bankAccountNumber: e.target.value})}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tên chủ tài khoản</label>
          <input 
            type="text" required placeholder="NGUYEN VAN A"
            value={formData.bankAccountName}
            onChange={e => setFormData({...formData, bankAccountName: e.target.value.toUpperCase()})}
          />
        </div>

        <div className="action-buttons">
          <button type="button" className="btn-back" onClick={() => navigate(-1)}>QUAY LẠI</button>
          <button type="submit" className="btn-submit-refund" disabled={loading}>
            {loading ? 'ĐANG GỬI...' : 'XÁC NHẬN HOÀN TIỀN'}
          </button>
        </div>
      </form>
    </div>
  );
}