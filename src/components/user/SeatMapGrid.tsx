// ═══════════════════════════════════════════════════════════════
// FILE: src/components/user/SeatMapGrid.tsx
// Fix:
//   1. Bỏ <seatmap-screen> (MÀN HÌNH đã có trong Booking.tsx)
//   2. getPrice() dùng showtime.basePrice × hệ số × discount%
//   3. Props thêm basePrice
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { seatApi, seatMapApi } from '../../api/axiosConfig';
import './SeatMapGrid.css';

type SeatStatus = 'AVAILABLE' | 'BOOKED' | 'LOCKED' | 'SELECTED';

interface Seat {
  id: number;
  seatRow: string;
  seatNumber: number;
  type: 'NORMAL' | 'VIP' | 'COUPLE';
  status: SeatStatus;
  price: number;
}

interface PricingRule {
  seatType: string;
  audienceType: string;
  discountPercent: number;   // chỉ dùng discount%, base_price bỏ qua
}

interface Props {
  showtimeId:      number;
  cinemaId:        number;
  basePrice:       number;   // ✅ THÊM: lấy từ showtime.basePrice
  selectedSeatIds: number[];
  audienceType:    string;
  onSeatToggle:    (seatId: number, price: number) => void;
}

const SEAT_TYPE_LABEL: Record<string, string> = {
  NORMAL: 'Thường', VIP: 'VIP', COUPLE: 'Đôi',
};

// Hệ số nhân giá theo loại ghế
const SEAT_MULTIPLIER: Record<string, number> = {
  NORMAL: 1.0, VIP: 1.3, COUPLE: 1.6,
};

// Discount mặc định nếu không có trong DB
const DEFAULT_DISCOUNT: Record<string, number> = {
  ADULT: 0, CHILD: 50, STUDENT: 20, SENIOR: 30,
};

export default function SeatMapGrid({
  showtimeId, cinemaId, basePrice, selectedSeatIds, audienceType, onSeatToggle
}: Props) {

  const [seats, setSeats]             = useState<Seat[]>([]);
  const [discountMap, setDiscountMap] = useState<Record<string, number>>({});
  const [loading, setLoading]         = useState(true);
  const [loadError, setLoadError]     = useState('');

  useEffect(() => {
    if (!cinemaId || !showtimeId) return;
    setLoading(true);
    setLoadError('');

    Promise.all([
      seatApi.getByShowtime(showtimeId),
      seatMapApi.getPricingByCinema(cinemaId),
    ]).then(([seatRes, priceRes]) => {
      setSeats(seatRes.data);

      // Lưu discount% theo key "SEATTYPE_AUDIENCETYPE"
      const map: Record<string, number> = {};
      (priceRes.data as PricingRule[]).forEach(rule => {
        map[`${rule.seatType}_${rule.audienceType}`] = rule.discountPercent ?? 0;
      });
      setDiscountMap(map);
    }).catch(err => {
      console.error('Lỗi tải sơ đồ ghế:', err);
      setLoadError('Không thể tải sơ đồ ghế. Vui lòng tải lại trang.');
    }).finally(() => setLoading(false));

  }, [showtimeId, cinemaId]);

  // ── Tính giá: basePrice × hệ số ghế × (1 - discount%) ──────────
  const getPrice = (seatType: string): number => {
    const multiplier = SEAT_MULTIPLIER[seatType] ?? 1.0;
    const afterMult  = Math.round(basePrice * multiplier);

    const key        = `${seatType}_${audienceType}`;
    const discountPct = discountMap[key] ?? DEFAULT_DISCOUNT[audienceType] ?? 0;

    return discountPct > 0
      ? Math.round(afterMult * (1 - discountPct / 100))
      : afterMult;
  };

  // Nhóm ghế theo hàng
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.seatRow]) acc[seat.seatRow] = [];
    acc[seat.seatRow].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  if (loading) return <div className="seatmap-loading">Đang tải sơ đồ ghế...</div>;
  if (loadError) return <div className="seatmap-error">{loadError}</div>;

  return (
    <div className="seatmap-wrap">

      {/* ✅ FIX 1: KHÔNG render màn hình ở đây nữa
          Booking.tsx đã render rồi → bỏ đoạn này để hết duplicate */}

      {/* Lưới ghế */}
      <div className="seatmap-grid">
        {Object.entries(rows).sort().map(([row, rowSeats]) => (
          <div key={row} className="seatmap-row">
            <span className="row-label">{row}</span>
            <div className="row-seats">
              {rowSeats
                .sort((a, b) => a.seatNumber - b.seatNumber)
                .map(seat => {
                  const isSelected = selectedSeatIds.includes(seat.id);
                  const isBooked   = seat.status === 'BOOKED' || seat.status === 'LOCKED';
                  const price      = getPrice(seat.type);

                  return (
                    <button
                      key={seat.id}
                      className={[
                        'seat',
                        `seat-${seat.type.toLowerCase()}`,
                        isSelected ? 'seat-selected' : '',
                        isBooked   ? 'seat-booked'   : '',
                      ].filter(Boolean).join(' ')}
                      disabled={isBooked}
                      title={`${row}${seat.seatNumber} – ${SEAT_TYPE_LABEL[seat.type]} – ${price.toLocaleString()}đ`}
                      onClick={() => !isBooked && onSeatToggle(seat.id, price)}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Chú thích */}
      <div className="seatmap-legend">
        <span className="legend-item"><span className="dot dot-normal" />Thường</span>
        <span className="legend-item"><span className="dot dot-vip" />VIP</span>
        <span className="legend-item"><span className="dot dot-couple" />Đôi</span>
        <span className="legend-item"><span className="dot dot-selected" />Đang chọn</span>
        <span className="legend-item"><span className="dot dot-booked" />Đã đặt</span>
      </div>

    </div>
  );
}
