import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminSidebar.css';

const menuItems = [
  { icon: '◼', label: 'Dashboard',          to: '/admin' },
  { icon: '🎬', label: 'Phim',              to: '/admin/movies' },
  { icon: '🏛',  label: 'Rạp chiếu',        to: '/admin/cinemas' },
  { icon: '🚪', label: 'Phòng chiếu',       to: '/admin/rooms' },
  { icon: '📅', label: 'Suất chiếu',        to: '/admin/showtimes' },
  { icon: '🎟', label: 'Đặt vé',            to: '/admin/bookings' },
  { icon: '👥', label: 'Người dùng',        to: '/admin/users' },
  { icon: '🎫', label: 'Quản lý Voucher',   to: '/admin/vouchers' },
  { icon: '💰', label: 'Bảng giá',          to: '/admin/pricing' },
  { icon: '↩️', label: 'Hoàn & Chuyển vé', to: '/admin/refunds' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase()
    : 'A';

  return (
    <aside className="sidebar">
      <NavLink to="/admin" className="sidebar-logo">
        <div className="sidebar-logo-mark">C</div>
        <span className="sidebar-logo-text">CINE<span>MAX</span></span>
      </NavLink>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Quản lý</div>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-divider" />
        <NavLink to="/staff/scanner" className="sidebar-link staff-link">
          <span className="sidebar-icon">📷</span>
          Quét QR vé
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">ADMIN</div>
          </div>
        </div>
        <NavLink to="/" className="sidebar-link" style={{ marginBottom: 4 }}>
          <span className="sidebar-icon">🏠</span>
          Về trang chủ
        </NavLink>
        <button
          className="sidebar-link"
          style={{ color: 'var(--primary)' }}
          onClick={() => { logout(); navigate('/login'); }}
        >
          <span className="sidebar-icon">↩</span>
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}