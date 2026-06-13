import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cinemaApi, showtimeApi } from '../../api/axiosConfig';
import type { Cinema, Showtime } from '../../types';
import { formatCurrency, formatTime } from '../../utils/format';
import './CinemaDetail.css';

// ─── THÊM MỚI ───────────────────────────────────────
import MovieComments from '../../components/user/MovieComments';

export default function CinemaDetail() {
  const { id } = useParams<{ id: string }>();
  const [cinema, setCinema] = useState<Cinema | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [activeDate, setActiveDate] = useState('');
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [cinemaRes, stRes] = await Promise.all([
          cinemaApi.getById(Number(id)), 
          showtimeApi.getAll()
        ]);
        setCinema(cinemaRes.data);
        
        const roomIds = (cinemaRes.data.rooms || []).map((r: any) => r.id);
        const cinemaShowtimes = stRes.data.filter((s: Showtime) => roomIds.includes(s.roomId));
        setShowtimes(cinemaShowtimes);

        const dates = Array.from(new Set(cinemaShowtimes.map((s: any) => s.startTime.substring(0, 10)))).sort();
        if (dates.length) setActiveDate(dates[0]);
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetch();
  }, [id]);

  const filteredGroups = useMemo(() => {
    const filtered = showtimes.filter(s => 
      s.startTime.substring(0, 10) === activeDate && 
      (activeRoomId === null || s.roomId === activeRoomId)
    );

    const map: Record<string, Showtime[]> = {};
    filtered.forEach((s) => {
      if (!map[s.movieTitle]) map[s.movieTitle] = [];
      map[s.movieTitle].push(s);
    });
    return Object.entries(map);
  }, [showtimes, activeDate, activeRoomId]);

  const uniqueDates = useMemo(() => 
    Array.from(new Set(showtimes.map((s) => s.startTime.substring(0, 10)))).sort()
  , [showtimes]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!cinema) return <div className="loading-center"><p>Không tìm thấy rạp.</p></div>;

  return (
    <div className="cinema-detail-container fade-in">
      <div className="cinema-header-banner">
        <div className="container">
          <div className="breadcrumb"><Link to="/cinemas">Hệ thống rạp</Link> / {cinema.name}</div>
          <h1 className="cinema-name-title">{cinema.name}</h1>
          <p className="cinema-address-sub">📍 {cinema.address}</p>
        </div>
      </div>

      <div className="container cinema-content-grid">
        <section className="rooms-filter-section">
          <h2 className="section-title">Phòng chiếu <span>(Chọn phòng để xem lịch riêng)</span></h2>
          <div className="rooms-selection-grid">
            <div 
              className={`room-select-card ${activeRoomId === null ? 'active' : ''}`}
              onClick={() => setActiveRoomId(null)}
            >
              <div className="room-icon">📱</div>
              <div className="room-info">
                <div className="r-name">Tất cả phòng</div>
                <div className="r-cap">{cinema.rooms?.length} phòng</div>
              </div>
            </div>
            {cinema.rooms?.map((room) => (
              <div 
                key={room.id} 
                className={`room-select-card ${activeRoomId === room.id ? 'active' : ''}`}
                onClick={() => setActiveRoomId(room.id === activeRoomId ? null : room.id)}
              >
                <div className="room-icon">🚪</div>
                <div className="room-info">
                  <div className="r-name">{room.name}</div>
                  <div className="r-cap">{room.capacity} ghế</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="showtimes-display-section">
          <div className="showtimes-header">
            <h2 className="section-title">Lịch chiếu phim</h2>
            <div className="date-picker-tabs">
              {uniqueDates.map((date) => (
                <button 
                  key={date} 
                  className={`date-tab-item ${activeDate === date ? 'active' : ''}`}
                  onClick={() => setActiveDate(date)}
                >
                  <span className="d-day">{new Date(date).getDate()}</span>
                  <span className="d-month">Tháng {new Date(date).getMonth() + 1}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="movie-list-showtimes">
            {filteredGroups.length === 0 ? (
              <div className="empty-showtimes">
                <p>Chưa có suất chiếu nào cho lựa chọn này.</p>
              </div>
            ) : (
              filteredGroups.map(([title, times]) => (
                <div key={title} className="movie-showtime-row card">
                  <div className="m-info">
                    <h3>🎬 {title}</h3>
                    <span className="badge-room-type">2D PHỤ ĐỀ</span>
                  </div>
                  <div className="m-times">
                    {times.map((s) => (
                      <Link key={s.id} to={`/booking?showtimeId=${s.id}`} className="time-slot-btn">
                        <span className="t-start">{formatTime(s.startTime)}</span>
                        <span className="t-price">{formatCurrency(s.basePrice)}</span>
                        <span className="t-room">{s.roomName}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ─── THÊM MỚI: Bình luận phim ─── */}
        <section className="cinema-comments-section" style={{ marginTop: '40px' }}>
          {cinema && <MovieComments movieId={cinema.id} />}
        </section>
      </div>
    </div>
  );
}