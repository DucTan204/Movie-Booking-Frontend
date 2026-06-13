import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../api/axiosConfig';
import TicketQRModal from '../../components/user/TicketQRModal';
import { formatDateTime } from '../../utils/format';
import './MyTickets.css';

export default function MyTickets() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrBookingId, setQrBookingId] = useState<number | null>(null);

  // Lấy user từ localStorage để kiểm tra (nếu cần)
  // const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = () => {
    setLoading(true);
    bookingApi.getMyBookings()
      .then(res => {
        // Chỉ lấy những vé có trạng thái PAID hoặc PENDING để hiển thị (tùy nhu cầu)
        setBookings(res.data);
      })
      .catch(err => console.error("Lỗi tải vé:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Hàm lấy nhãn đối tượng
  const getAudienceLabel = (ticket: any, booking: any) => {
    const type = ticket.audienceType || booking.audienceType || "ADULT"; 
    const labels: Record<string, string> = {
      'ADULT': 'Người lớn',
      'STUDENT': 'Học sinh/Sinh viên',
      'CHILD': 'Trẻ em',
      'ELDERLY': 'Người cao tuổi'
    };
    return labels[type.toUpperCase()] || "Người lớn";
  };

  if (loading) return <div className="loading-center">Đang tải vé...</div>;

  return (
    <div className="my-tickets-page">
      <h1 className="my-tickets-title">🎟 VÉ CỦA TÔI</h1>

      {bookings.length === 0 ? (
        <div className="no-tickets">Bạn chưa có lịch sử đặt vé nào.</div>
      ) : (
        <div className="tickets-stack">
          {bookings.map(b => (
            <div key={b.id} className={`ticket-container status-${b.status.toLowerCase()}`}>
              
              <div className="ticket-info-left">
                <div className="ticket-code">MÃ ĐẶT VÉ: #{b.bookingCode || b.id}</div>
                <h2 className="movie-title-display">{b.showtime?.movieTitle}</h2>
                
                <div className="detail-grid">
                  <div className="detail-item">
                    <span>📍 RẠP CHIẾU:</span>
                    <strong>{b.showtime?.cinemaName || "CineMax Cinema"}</strong>
                  </div>
                  <div className="detail-item">
                    <span>🚪 PHÒNG CHIẾU:</span>
                    <strong>{b.showtime?.roomName}</strong>
                  </div>
                  <div className="detail-item full-width">
                    <span>📅 SUẤT CHIẾU:</span>
                    <strong>{formatDateTime(b.showtime?.startTime || '')}</strong>
                  </div>
                </div>

                <div className="seat-audience-list">
                  <p className="section-label">💺 Danh sách ghế & Đối tượng:</p>
                  <div className="tag-wrapper">
                    {b.tickets?.map((t: any) => (
                      <div key={t.id} className="audience-tag">
                        <span className="seat-no">{t.seatNumber}</span>
                        <span className="aud-type">- {getAudienceLabel(t, b)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ticket-info-right">
                <div className={`status-badge-boxed ${b.status.toLowerCase()}`}>
                  {b.status === 'PAID' ? '● ĐÃ THANH TOÁN' : 
                   b.status === 'CANCELLED' ? '● ĐÃ HỦY/HOÀN' : '● CHỜ THANH TOÁN'}
                </div>

                <div className="billing-info">
                  <div className="bill-row">
                    <span>Voucher:</span>
                    <strong className={b.appliedVoucherCode ? "text-green" : "text-muted"}>
                      {b.appliedVoucherCode ? b.appliedVoucherCode : "Không"}
                    </strong>
                  </div>
                  <div className="bill-row total-box">
                    <span>Tổng cộng:</span>
                    <span className="final-price">{b.totalPrice.toLocaleString()}đ</span>
                  </div>
                </div>

                <div className="ticket-actions-grid">
                  {/* TRƯỜNG HỢP VÉ ĐÃ THANH TOÁN */}
                  {b.status === 'PAID' && (
                    <>
                      <button className="square-action-btn" onClick={() => setQrBookingId(b.id)}>
                        <span className="btn-icon">📱</span>
                        <span className="btn-text">XEM MÃ QR</span>
                      </button>
                      
                      {/* NÚT HOÀN VÉ: Chuyển hướng sang trang Refund Request */}
                      <button 
                        className="square-action-btn refund-btn" 
                        onClick={() => navigate(`/refund-request?bookingId=${b.id}`)}
                      >
                        <span className="btn-icon">🔄</span>
                        <span className="btn-text">HOÀN VÉ</span>
                      </button>
                    </>
                  )}

                  {/* TRƯỜNG HỢP VÉ CHƯA THANH TOÁN */}
                  {b.status === 'PENDING' && (
                    <button 
                      className="square-action-btn pay-now-btn" 
                      onClick={() => navigate(`/payment?bookingId=${b.id}`)}
                    >
                      <span className="btn-icon">💳</span>
                      <span className="btn-text">THANH TOÁN NGAY</span>
                    </button>
                  )}
                </div>

                <div className="order-footer">
                  Đặt lúc: {new Date(b.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal hiển thị QR Code */}
      {qrBookingId && (
        <TicketQRModal 
          bookingId={qrBookingId} 
          onClose={() => setQrBookingId(null)} 
        />
      )}
    </div>
  );
}