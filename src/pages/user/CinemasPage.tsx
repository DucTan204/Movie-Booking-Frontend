import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { cinemaApi } from '../../api/axiosConfig';
import type { Cinema } from '../../types';
import './CinemasPage.css';

export default function CinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cinemaApi.getAll()
      .then((res) => setCinemas(Array.isArray(res.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = cinemas.filter((c) => 
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cinemas-list-page fade-in">
      <div className="cinemas-hero-section">
        <div className="container">
          <h1 className="hero-title">Hệ Thống Rạp Chiếu</h1>
          <p className="hero-subtitle">Tìm kiếm rạp gần bạn và tận hưởng trải nghiệm điện ảnh đỉnh cao</p>
          <div className="search-wrapper">
            <input 
              className="cinema-search-input" 
              placeholder="Nhập tên rạp hoặc địa chỉ để tìm nhanh..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="container cinemas-grid-body">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="cinemas-layout-grid">
            {filtered.map((cinema) => (
              <Link key={cinema.id} to={`/cinemas/${cinema.id}`} className="premium-cinema-card">
                <div className="card-image-placeholder">🏛</div>
                <div className="card-content">
                  <h3 className="c-name">{cinema.name}</h3>
                  <p className="c-address">📍 {cinema.address}</p>
                  <div className="card-footer">
                    <span className="badge-info">{cinema.rooms?.length || 0} Phòng chiếu</span>
                    <span className="go-detail">Xem lịch chiếu →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}