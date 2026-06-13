import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './UserNavbar.css';

export default function UserNavbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase()
    : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          <div className="navbar-logo-mark">C</div>
          <span className="navbar-logo-text">CINE<span>MAX</span></span>
        </NavLink>

        {/* Navigation */}
        <div className="navbar-nav">
          <NavLink to="/" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`} end>
            Trang chủ
          </NavLink>
          <NavLink to="/movies" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            Phim
          </NavLink>
          <NavLink to="/cinemas" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            Rạp chiếu
          </NavLink>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="navbar-user" ref={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
              <div className="navbar-avatar">{initials}</div>
              <span className="navbar-username">{user?.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>▾</span>

              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <NavLink to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    Tài khoản
                  </NavLink>

                  {/* ─── THÊM MỚI: Vé của tôi ─── */}
                  <NavLink to="/my-tickets" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    🎟 Vé của tôi
                  </NavLink>

                  {isAdmin && (
                    <NavLink to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      Quản trị
                    </NavLink>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost" style={{ fontSize: 14 }}>
                Đăng nhập
              </NavLink>
              <NavLink to="/register" className="btn btn-primary" style={{ fontSize: 14 }}>
                Đăng ký
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}