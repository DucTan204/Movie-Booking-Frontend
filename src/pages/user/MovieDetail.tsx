import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieApi, showtimeApi } from '../../api/axiosConfig';
import type { Movie, Showtime } from '../../types';
import { formatDuration, formatCurrency, formatDate, formatTime } from '../../utils/format';
import './MovieDetail.css';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const [mRes, sRes] = await Promise.all([
          movieApi.getById(Number(id)),
          showtimeApi.getAll({ movieId: Number(id) }),
        ]);
        setMovie(mRes.data);
        setShowtimes(sRes.data);
        
        // Lấy ngày đầu tiên có suất chiếu để active mặc định
        const dates = Array.from(new Set(sRes.data.map((s: Showtime) => s.startTime.substring(0, 10)))).sort();
        if (dates.length > 0) setActiveDate(dates[0]);
      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  // Lấy danh sách các ngày có lịch chiếu (Unique Dates)
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(showtimes.map((s) => s.startTime.substring(0, 10)))).sort();
  }, [showtimes]);

  // Lọc suất chiếu theo ngày đang chọn và nhóm theo Rạp
  const cinemaGroups = useMemo(() => {
    const filtered = showtimes.filter((s) => s.startTime.substring(0, 10) === activeDate);
    const map: Record<string, Showtime[]> = {};
    filtered.forEach((s) => {
      if (!map[s.cinemaName]) map[s.cinemaName] = [];
      map[s.cinemaName].push(s);
    });
    return Object.entries(map);
  }, [showtimes, activeDate]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!movie) return <div className="loading-center"><p>Không tìm thấy phim.</p></div>;

  return (
    <div className="movie-ncc-layout fade-in">
      {/* PHẦN HERO: BACKDROP & THÔNG TIN CHÍNH */}
      <section className="ncc-hero">
        <div className="ncc-backdrop" style={{ backgroundImage: `url(${movie.posterUrl})` }} />
        <div className="ncc-hero-overlay" />
        
        <div className="ncc-container">
          <div className="ncc-hero-flex">
            <div className="ncc-poster">
              <img src={movie.posterUrl} alt={movie.title} />
            </div>
            <div className="ncc-info">
              <h1 className="ncc-title">{movie.title} <span className="ncc-age-badge">T16</span></h1>
              <div className="ncc-metadata">
                <p><strong>Thời lượng:</strong> {formatDuration(movie.duration)}</p>
                <p><strong>Khởi chiếu:</strong> {formatDate(movie.releaseDate)}</p>
                <p><strong>Thể loại:</strong> {movie.genres?.map(g => g.name).join(', ')}</p>
              </div>
              <p className="ncc-desc">{movie.description}</p>
              <div className="ncc-actions">
                <button className="ncc-btn-book" onClick={() => document.getElementById('booking-section')?.scrollIntoView({behavior: 'smooth'})}>
                  Đặt vé ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN LỊCH CHIẾU */}
      <section className="ncc-showtime-section" id="booking-section">
        <div className="ncc-container">
          <h2 className="ncc-section-title">Lịch chiếu phim</h2>
          
          {/* Tabs chọn ngày */}
          <div className="ncc-date-tabs">
            {uniqueDates.map((date) => {
              const d = new Date(date);
              return (
                <div 
                  key={date} 
                  className={`ncc-date-item ${activeDate === date ? 'active' : ''}`}
                  onClick={() => setActiveDate(date)}
                >
                  <span className="ncc-date-month">Tháng {d.getMonth() + 1}</span>
                  <span className="ncc-date-day">{d.getDate()}</span>
                  <span className="ncc-date-weekday">
                    {d.getDay() === 0 ? 'Chủ Nhật' : `Thứ ${d.getDay() + 1}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Danh sách suất chiếu theo rạp */}
          <div className="ncc-cinema-list">
            {cinemaGroups.length === 0 ? (
              <p className="ncc-empty">Hôm nay hiện chưa có suất chiếu.</p>
            ) : (
              cinemaGroups.map(([cinemaName, times]) => (
                <div key={cinemaName} className="ncc-cinema-card">
                  <h3 className="ncc-cinema-name">🏛 {cinemaName}</h3>
                  <div className="ncc-time-group">
                    {times.map((s) => (
                      <Link key={s.id} to={`/booking?showtimeId=${s.id}`} className="ncc-time-btn">
                        <span className="ncc-time-value">{formatTime(s.startTime)}</span>
                        <span className="ncc-time-sub">{formatCurrency(s.basePrice)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}