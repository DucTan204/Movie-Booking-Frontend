import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { movieApi, genreApi, bookingApi } from '../../api/axiosConfig';
import type { Movie, Genre, Booking } from '../../types';
import MovieCard from '../../components/user/MovieCard';
import './Home.css';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, genresRes, bookingsRes] = await Promise.all([
          movieApi.getAll(),
          genreApi.getAll(),
          bookingApi.getAll().catch(() => ({ data: [] })) 
        ]);

        const movieArr = moviesRes.data?.content || moviesRes.data || [];
        const genreArr = genresRes.data?.content || genresRes.data || [];
        const bookingArr = bookingsRes.data?.content || bookingsRes.data || [];

        setMovies(Array.isArray(movieArr) ? movieArr : []);
        setGenres(Array.isArray(genreArr) ? genreArr : []);
        setBookings(Array.isArray(bookingArr) ? bookingArr : []);
      } catch (err) {
        console.error("Lỗi khi fetch dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 1. Logic tính toán Top 6 phim bán chạy nhất (Trending)
  const featuredMovies = useMemo(() => {
    const ticketCountMap: Record<number, number> = {};

    bookings.forEach((b) => {
      // Chỉ đếm các đơn hàng đã thanh toán
      if (b.status === 'PAID') {
        // Lấy ID phim (ưu tiên movieId trực tiếp, nếu không lấy từ showtime)
        const mid = b.movieId || b.showtime?.movieId || b.showtimeId;
        if (mid) {
          const count = b.tickets?.length || 1;
          ticketCountMap[mid] = (ticketCountMap[mid] || 0) + count;
        }
      }
    });

    return [...movies]
      .sort((a, b) => (ticketCountMap[b.id] || 0) - (ticketCountMap[a.id] || 0))
      .slice(0, 6);
  }, [movies, bookings]);

  // 2. Lấy bộ phim Hot nhất làm Banner
  const topHotMovie = featuredMovies[0];

  // 3. Logic lọc phim cho danh sách khám phá
  const filteredMovies = activeGenre
    ? movies.filter((m) => 
        m.genreIds?.includes(activeGenre) || 
        m.genres?.some((g) => g.id === activeGenre)
      )
    : movies;

  return (
    <div className="home-container">
      {/* SECTION 1: HERO BANNER */}
      <section className="hero">
        <div 
          className="hero-bg" 
          style={{ 
            backgroundImage: topHotMovie ? `url(${topHotMovie.posterUrl})` : 'none' 
          }} 
        />
        <div className="container hero-wrapper">
          <div className="hero-content slide-up">
            {topHotMovie && (
              <div className="hero-eyebrow">
                <span>●</span> Đang cực hot: {topHotMovie.title}
              </div>
            )}
            <h1 className="hero-title">
              XEM PHIM<br /><span>ĐỈNH CAO</span>
            </h1>
            <p className="hero-desc">
              Trải nghiệm điện ảnh tuyệt vời nhất với hệ thống âm thanh Dolby Atmos và màn hình IMAX hiện đại.
            </p>
            <div className="hero-cta">
              <Link 
                to={topHotMovie ? `/movie/${topHotMovie.id}` : "/movies"} 
                className="btn btn-primary"
              >
                Đặt vé phim hot ngay
              </Link>
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-value">24/7</div>
                  <div className="stat-label">Phục vụ</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">10+</div>
                  <div className="stat-label">Rạp chiếu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRENDING MOVIES */}
      {!loading && featuredMovies.length > 0 && (
        <section className="home-section featured-section">
          <div className="container">
            <div className="home-section-header">
              <h2 className="section-title">Phim Hot Nhất</h2>
              <span className="badge-trending">Trending</span>
            </div>
            <div className="movie-grid fade-in">
              {featuredMovies.map((movie) => (
                <MovieCard key={`featured-${movie.id}`} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 3: ALL MOVIES + FILTER */}
      <section className="home-section">
        <div className="container">
          <div className="home-section-header separator">
            <h2 className="section-title">Khám phá tất cả phim</h2>
          </div>

          <div className="genre-filter">
            <button
              className={`genre-chip ${activeGenre === null ? 'active' : ''}`}
              onClick={() => setActiveGenre(null)}
            >
              Tất cả
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                className={`genre-chip ${activeGenre === g.id ? 'active' : ''}`}
                onClick={() => setActiveGenre(g.id)}
              >
                {g.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-center">
              <div className="spinner" />
            </div>
          ) : (
            <>
              {filteredMovies.length > 0 ? (
                <div className="movie-grid fade-in">
                  {filteredMovies.map((movie) => (
                    <MovieCard key={`all-${movie.id}`} movie={movie} />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>Không tìm thấy phim thuộc thể loại này.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}