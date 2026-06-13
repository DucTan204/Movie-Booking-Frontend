import { useEffect, useState } from 'react';
import { movieApi, genreApi } from '../../api/axiosConfig';
import type { Movie, Genre } from '../../types';
import MovieCard from '../../components/user/MovieCard';
import './MoviesPage.css';
 
export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, genresRes] = await Promise.all([movieApi.getAll(), genreApi.getAll()]);
        setMovies(moviesRes.data);
        setGenres(genresRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);
 
  const filtered = movies.filter((m) => {
    const matchGenre = !activeGenre || m.genres?.some((g) => g.id === activeGenre);
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });
 
  return (
    <div className="movies-page fade-in">
      <div className="movies-hero">
        <div className="container">
          <h1 className="page-title">Phim đang chiếu</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            {movies.length} bộ phim đang có mặt tại CineMax
          </p>
        </div>
      </div>
      <div className="container movies-body">
        <div className="movies-toolbar">
          <input
            className="form-input movies-search"
            placeholder="🔍  Tìm kiếm phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="genre-filter">
            <button className={`genre-chip${activeGenre === null ? ' active' : ''}`} onClick={() => setActiveGenre(null)}>
              Tất cả
            </button>
            {genres.map((g) => (
              <button key={g.id} className={`genre-chip${activeGenre === g.id ? ' active' : ''}`} onClick={() => setActiveGenre(g.id)}>
                {g.name}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎬</div>
            <h3>Không tìm thấy phim nào</h3>
          </div>
        ) : (
          <div className="movie-grid fade-in">
            {filtered.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        )}
      </div>
    </div>
  );
}

