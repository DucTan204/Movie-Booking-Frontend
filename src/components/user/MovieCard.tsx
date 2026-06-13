import { Link } from 'react-router-dom';
import type { Movie } from '../../types';
import { formatDuration } from '../../utils/format';
import './MovieCard.css';

interface Props {
  movie: Movie;
}

export default function MovieCard({ movie }: Props) {
  
  // HÀM XỬ LÝ ĐƯỜNG DẪN ẢNH THÔNG MINH
  const getPosterUrl = (url?: string) => {
    if (!url) return '/placeholder-poster.jpg'; // Nếu không có ảnh, dùng placeholder
    
    // Nếu là link web (bắt đầu bằng http) hoặc đã có sẵn dấu / ở đầu thì giữ nguyên
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    
    // Ngược lại, coi nó là tên file trong folder public/images/
    return `/images/${url}`;
  };

  return (
    <Link to={`/movies/${movie.id}`} className="movie-card">
      <div className="movie-card-poster">
        <img
          src={getPosterUrl(movie.posterUrl)} // Sử dụng hàm xử lý ở đây
          alt={movie.title}
          loading="lazy"
        />
        <div className="movie-card-overlay">
          <button className="movie-card-btn">Đặt vé ngay</button>
        </div>
        {movie.genres?.[0] && (
          <span className="movie-card-genre badge badge-red">
            {movie.genres[0].name}
          </span>
        )}
      </div>
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="movie-card-meta">
          <span className="movie-card-duration">
            ⏱ {formatDuration(movie.duration)}
          </span>
          {movie.genres?.slice(1, 3).map((g) => (
            <span key={g.id} className="movie-card-tag">{g.name}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}