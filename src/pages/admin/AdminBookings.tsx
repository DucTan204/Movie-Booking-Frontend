import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi, userApi, showtimeApi, movieApi } from '../../api/axiosConfig';
import AdminHeader from '../../components/admin/AdminHeader';
import { formatCurrency, formatDateTime, formatBookingStatus } from '../../utils/format';
import { X, CreditCard, MapPin, Monitor, Calendar, Users, QrCode, RefreshCcw, Search } from 'lucide-react';

// Import các Modal
import TicketQRModal from '../../components/user/TicketQRModal';
import TicketTransferModal from '../../components/user/TicketTransferModal';

export default function AdminBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<{ showtime?: any; movie?: any } | null>(null);

  const [qrBookingId, setQrBookingId] = useState<number | null>(null);
  const [transferBooking, setTransferBooking] = useState<any | null>(null);

  // ✅ SỬA LỖI 1: Hàm lấy nhãn đối tượng chuẩn xác theo Java DTO
  const getAudienceLabel = (ticket: any) => {
    const type = ticket.audienceType || "ADULT";
    const labels: Record<string, string> = {
      'ADULT': 'Người lớn',
      'STUDENT': 'Học sinh/SV',
      'CHILD': 'Trẻ em',
      'ELDERLY': 'Người cao tuổi'
    };
    return labels[type.toUpperCase()] || type;
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [bRes, uRes] = await Promise.all([
        bookingApi.getAll(),
        userApi.getAll(),
      ]);
      const data = Array.isArray(bRes.data) ? bRes.data : (bRes.data.content || []);
      setBookings([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setUsersList(uRes.data?.content || uRes.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const getUserName = (userId: any) => {
    const found = usersList.find((u) => u.id === userId);
    return found ? (found.fullName || found.name || found.username || `#${userId}`) : `#${userId}`;
  };

  const handleRowClick = async (booking: any) => {
    setSelectedBooking(booking);
    setDetailData(null);
    setDetailLoading(true);
    try {
      // ✅ Lấy chi tiết để đảm bảo có mảng "tickets" từ toDTO của Java
      const fullBookingRes = await bookingApi.getById(booking.id);
      const fullData = fullBookingRes.data;
      setSelectedBooking(fullData);

      // Lấy thông tin showtime & movie để hiện tiêu đề modal
      const stRes = await showtimeApi.getById(fullData.showtimeId);
      const movieRes = await movieApi.getById(stRes.data.movieId);
      setDetailData({ showtime: stRes.data, movie: movieRes.data });
    } catch (err) {
      console.error("Lỗi tải chi tiết:", err);
    } finally { setDetailLoading(false); }
  };

  return (
    <div className="fade-in">
      <AdminHeader title="Quản lý Đặt vé" subtitle={`${bookings.length} đơn hàng`} />

      <div className="admin-table-wrap">
        <div className="admin-table-toolbar">
          <input className="admin-search" placeholder="Tìm mã vé..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đặt vé</th>
                <th>Người đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {bookings.filter(b => !search || b.bookingCode?.includes(search.toUpperCase())).map((b) => (
                <tr key={b.id} onClick={() => handleRowClick(b)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'monospace' }}>{b.bookingCode}</td>
                  <td>{getUserName(b.userId)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(b.totalPrice)}</td>
                  <td>
                    <span className={`badge ${b.status === 'PAID' ? 'badge-green' : b.status === 'PENDING' ? 'badge-red' : ''}`}>
                      {formatBookingStatus(b.status)}
                    </span>
                  </td>
                  <td>{formatDateTime(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL CHI TIẾT */}
      {selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setSelectedBooking(null)}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, width: '100%', maxWidth: 800, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #222' }}>
              <span style={{ color: '#888' }}>Mã đơn: <span style={{ color: '#ef4444', fontWeight: 700 }}>#{selectedBooking.bookingCode}</span></span>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 280px' }}>
              {/* Cột trái */}
              <div style={{ padding: 28 }}>
                {detailLoading ? <div className="spinner" /> : (
                  <>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 20 }}>
                        {detailData?.movie?.title || selectedBooking.showtime?.movieTitle || '—'}
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <InfoItem icon={<MapPin size={14}/>} label="RẠP" value={selectedBooking.showtime?.cinemaName || '—'} />
                      <InfoItem icon={<Monitor size={14}/>} label="PHÒNG" value={selectedBooking.showtime?.roomName || '—'} />
                      <InfoItem icon={<Calendar size={14}/>} label="THỜI GIAN" value={formatDateTime(selectedBooking.showtime?.startTime || '')} fullWidth />
                    </div>

                    <div style={{ marginTop: 24 }}>
                      <p style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>💺 DANH SÁCH GHẾ & ĐỐI TƯỢNG:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {/* ✅ SỬA LỖI HIỂN THỊ GHẾ: Java trả về field "tickets" */}
                        {selectedBooking.tickets?.map((t: any, i: number) => (
                          <div key={i} style={{ background: '#222', border: '1px solid #333', padding: '6px 12px', borderRadius: 8, fontSize: 13 }}>
                            <span style={{ color: '#fff', fontWeight: 700 }}>{t.seatNumber}</span>
                            <span style={{ color: '#aaa' }}> - {getAudienceLabel(t)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ background: '#222' }} />

              {/* Cột phải */}
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, background: '#0d0d0d' }}>
                <div>
                  <p style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>TRẠNG THÁI</p>
                  <div style={{ background: selectedBooking.status === 'PAID' ? '#1a3a2a' : '#3a1a1a', color: selectedBooking.status === 'PAID' ? '#4ade80' : '#f87171', padding: '12px', borderRadius: 10, textAlign: 'center', fontWeight: 700 }}>
                    {formatBookingStatus(selectedBooking.status)}
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                    <span style={{ color: '#888' }}>Tổng cộng:</span>
                    <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: 24 }}>{formatCurrency(selectedBooking.totalPrice)}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {selectedBooking.status === 'PAID' && (
                      <>
                        {/* Nút Xem QR */}
                        <button onClick={() => setQrBookingId(selectedBooking.id)} style={{ width: '100%', padding: '12px', borderRadius: 10, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
                          <QrCode size={18} /> XEM MÃ QR
                        </button>
                        <button onClick={() => setTransferBooking(selectedBooking)} style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'transparent', color: '#f87171', border: '1px solid #ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600 }}>
                          <RefreshCcw size={18} /> HOÀN VÉ / ĐỔI VÉ
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#444' }}>Người đặt: {getUserName(selectedBooking.userId)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SỬA LỖI 2: Z-Index cho QR Modal */}
      {qrBookingId && (
        <div style={{ position: 'fixed', zIndex: 9999 }}>
          <TicketQRModal bookingId={qrBookingId} onClose={() => setQrBookingId(null)} />
        </div>
      )}

      {transferBooking && (
        <div style={{ position: 'fixed', zIndex: 9999 }}>
          <TicketTransferModal
            bookingId={transferBooking.id}
            userId={transferBooking.userId}
            movieTitle={detailData?.movie?.title || "Phim"}
            showtime={formatDateTime(selectedBooking.showtime?.startTime || '')}
            totalPrice={transferBooking.totalPrice}
            onClose={() => setTransferBooking(null)}
            onSuccess={() => { setTransferBooking(null); setSelectedBooking(null); fetchAll(); }}
          />
        </div>
      )}
    </div>
  );
}

function InfoItem({ icon, label, value, fullWidth }: any) {
  return (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : 'span 1' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', fontSize: 10, marginBottom: 4 }}>
        {icon} <span>{label}</span>
      </div>
      <div style={{ color: '#eee', fontWeight: 600, fontSize: 15 }}>{value}</div>
    </div>
  );
}