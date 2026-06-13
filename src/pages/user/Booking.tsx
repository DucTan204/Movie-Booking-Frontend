import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { showtimeApi, bookingApi, movieApi, seatLockApi } from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import type { Movie } from '../../types';
import { formatDateTime } from '../../utils/format';
import './Booking.css';

import SeatMapGrid from '../../components/user/SeatMapGrid';
import { AudienceSelector, VoucherInput } from '../../components/user/VoucherInput';
import type { AudienceType } from '../../components/user/VoucherInput';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const showtimeId = Number(searchParams.get('showtimeId'));
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showtime, setShowtime] = useState<any>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<{ id: number; price: number }[]>([]);
  const [audienceType, setAudienceType] = useState<AudienceType>('ADULT');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherResult, setVoucherResult] = useState<{ discountAmount: number; finalAmount: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (!showtimeId) return;
    const fetchAll = async () => {
      try {
        const stRes = await showtimeApi.getById(showtimeId);
        setShowtime(stRes.data);
        const movieRes = await movieApi.getById(stRes.data.movieId);
        setMovie(movieRes.data);
      } catch (err) { 
        setError('Không thể tải dữ liệu.'); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchAll();
  }, [showtimeId]);

  useEffect(() => {
    if (selectedSeats.length === 0) { setTimeLeft(600); return; }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setSelectedSeats([]); alert("Hết thời gian giữ ghế!"); return 600; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedSeats.length]);

  const subTotal = useMemo(() => selectedSeats.reduce((sum, s) => sum + s.price, 0), [selectedSeats]);

  const handleConfirm = async () => {
    if (!showtime || selectedSeats.length === 0) return;
    setConfirming(true); setError('');
    try {
      const seatIds = selectedSeats.map(s => s.id);
      await seatLockApi.lock({ showtimeId: showtime.id, seatIds });

      const finalCode = voucherCode?.trim() || undefined;

      const res = await bookingApi.create({
        showtimeId: showtime.id,
        seatIds,
        totalPrice: voucherResult ? voucherResult.finalAmount : subTotal,
        voucherCode: finalCode,
        appliedVoucherCode: finalCode,
        audienceTypes: selectedSeats.map(() => audienceType),
      });

      navigate(`/payment?bookingId=${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally { setConfirming(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="booking-scope fade-in">
      <div className="container">
        <div className="booking-layout">
          <div className="seat-selection-section">
            <div className="booking-movie-card">
              {movie && <img src={movie.posterUrl} className="movie-card-poster" alt={movie.title} />}
              <div className="movie-card-info">
                <h2 className="movie-title">{showtime?.movieTitle}</h2>
                <div className="movie-meta">
                   <span>🏛 {showtime?.cinemaName} | 🚪 {showtime?.roomName} | 📅 {formatDateTime(showtime?.startTime || '')}</span>
                </div>
              </div>
            </div>

            {/* ĐÃ XÓA: screen-container tại đây để không bị trùng với SeatMapGrid */}

            <div className="booking-controls">
              <AudienceSelector selected={audienceType} onChange={(t) => { setAudienceType(t); setSelectedSeats([]); }} />
            </div>

            {showtime && (
              <SeatMapGrid
                showtimeId={showtimeId} 
                cinemaId={showtime.cinemaId}
                // ✅ ĐÃ THÊM: prop basePrice lấy từ showtime
                basePrice={showtime.basePrice} 
                selectedSeatIds={selectedSeats.map(s => s.id)}
                audienceType={audienceType}
                onSeatToggle={(id, price) => 
                  setSelectedSeats(p => p.find(s => s.id === id) 
                    ? p.filter(s => s.id !== id) 
                    : [...p, { id, price }]
                  )
                }
              />
            )}
          </div>

          <aside className="booking-summary">
            <h3 className="summary-title">THÔNG TIN ĐẶT VÉ</h3>
            <div className="summary-info-group">
                <div className="summary-row"><span className="summary-label">Ghế:</span><span className="summary-value">{selectedSeats.map(s => s.id).join(', ') || 'Chưa chọn'}</span></div>
                <div className="summary-row"><span className="summary-label">Loại:</span><span className="summary-value">{audienceType}</span></div>
            </div>
            <VoucherInput orderAmount={subTotal} userId={user?.id} onApply={(res, code) => { setVoucherResult(res); setVoucherCode(code); }} />
            <div className="summary-total-box">
              <div className="total-row"><span>Tạm tính</span><span>{subTotal.toLocaleString()}đ</span></div>
              {voucherResult && <div className="total-row"><span>Giảm giá</span><span className="discount-value">-{voucherResult.discountAmount.toLocaleString()}đ</span></div>}
              <div className="total-row final-total"><span>Tổng cộng</span><span className="total-price">{(voucherResult ? voucherResult.finalAmount : subTotal).toLocaleString()}đ</span></div>
            </div>
            {error && <div className="booking-error">⚠️ {error}</div>}
            <button className={`booking-confirm-btn ${selectedSeats.length > 0 ? 'active' : ''}`} disabled={selectedSeats.length === 0 || confirming} onClick={handleConfirm}>
              {confirming ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐẶT VÉ'}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}