import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieApi, cinemaApi, bookingApi, userApi } from '../../api/axiosConfig';
import AdminHeader from '../../components/admin/AdminHeader';
import { Film, Landmark, Ticket, Users, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ movies: 0, cinemas: 0, bookings: 0, users: 0 });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [mRes, cRes, bRes, uRes] = await Promise.all([
          movieApi.getAll(),
          cinemaApi.getAll(),
          bookingApi.getAll(),
          userApi.getAll()
        ]);

        const movies = mRes.data?.content || mRes.data || [];
        const cinemas = cRes.data?.content || cRes.data || [];
        const bookings = bRes.data?.content || bRes.data || [];
        const users = uRes.data?.content || uRes.data || [];

        setStats({
          movies: movies.length,
          cinemas: cinemas.length,
          bookings: bookings.length,
          users: users.length
        });

        setUsersList(users);

        if (Array.isArray(bookings)) {
          // ĐỒNG NHẤT HIỂN THỊ: Sắp xếp đơn hàng mới nhất lên trên cùng (Ngày giảm dần)
          const sorted = [...bookings].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentBookings(sorted.slice(0, 6));
        }
      } catch (err) {
        console.error("Lỗi Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Hàm tìm tên User dựa trên userId
  const getUserName = (userId: any) => {
    const foundUser = usersList.find(u => u.id === userId);
    return foundUser ? (foundUser.fullName || foundUser.name || foundUser.username) : `Khách lẻ (${userId})`;
  };

  const statCards = [
    { label: 'Phim', value: stats.movies, icon: <Film size={20} />, color: '#6366f1', path: '/admin/movies' },
    { label: 'Rạp chiếu', value: stats.cinemas, icon: <Landmark size={20} />, color: '#a855f7', path: '/admin/cinemas' },
    { label: 'Đặt vé', value: stats.bookings, icon: <Ticket size={20} />, color: '#ef4444', path: '/admin/bookings' },
    { label: 'Người dùng', value: stats.users, icon: <Users size={20} />, color: '#10b981', path: '/admin/users' },
  ];

  return (
    <div className="dashboard-wrapper">
      <style>{`
        .dashboard-wrapper { padding: 20px; color: #e4e4e7; }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
          gap: 20px; 
          margin-bottom: 30px; 
        }
        .stat-card {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .stat-card:hover { transform: translateY(-5px); border-color: #ef4444; background: #1c1c1f; }
        .stat-icon {
          width: 48px; height: 48px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-right: 15px;
        }
        .stat-label { font-size: 13px; color: #a1a1aa; display: block; }
        .stat-value { font-size: 26px; font-weight: 700; margin-top: 4px; }
        
        .recent-section {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 12px;
          overflow: hidden;
        }
        .section-header {
          padding: 20px;
          border-bottom: 1px solid #27272a;
          display: flex; justify-content: space-between; align-items: center;
        }
        .section-title { font-size: 16px; font-weight: 600; color: #fff; }
        
        .modern-table { width: 100%; border-collapse: collapse; }
        .modern-table th { 
          text-align: left; padding: 14px 20px; 
          font-size: 12px; color: #71717a; 
          text-transform: uppercase; background: #202023;
        }
        .modern-table td { padding: 16px 20px; border-bottom: 1px solid #27272a; font-size: 14px; }
        .modern-table tr:hover { background: #202023; }
        
        .customer-info { display: flex; align-items: center; gap: 10px; }
        .avatar-circle {
          width: 32px; height: 32px;
          background: #3f3f46;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 12px; font-weight: bold;
          border: 1px solid #52525b;
        }
        
        .code-text { font-family: monospace; color: #ef4444; font-weight: 600; font-size: 13px; }
        .status-pill { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .status-paid { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        
        .btn-view-all { 
          display: flex; align-items: center; gap: 5px;
          font-size: 13px; color: #ef4444; background: none; border: none; cursor: pointer;
        }
        .btn-view-all:hover { text-decoration: underline; }
      `}</style>

      <AdminHeader title="Dashboard" subtitle="Chào mừng trở lại, quản trị viên CineMax" />

      {/* Stats Section */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card" onClick={() => navigate(s.path)}>
            <div className="stat-icon" style={{ backgroundColor: `${s.color}20`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <span className="stat-label">{s.label}</span>
              <div className="stat-value">{s.value.toLocaleString()}</div>
            </div>
            <div style={{ marginLeft: 'auto', opacity: 0.2 }}>
               <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="recent-section">
        <div className="section-header">
          <h3 className="section-title">Đơn hàng mới nhất</h3>
          <button className="btn-view-all" onClick={() => navigate('/admin/bookings')}>
            Xem tất cả <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#71717a' }}>Đang tải dữ liệu hệ thống...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Mã đặt vé</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thời gian đặt</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => {
                  const userName = getUserName(b.userId);
                  return (
                    <tr key={b.id}>
                      <td className="code-text">{b.bookingCode}</td>
                      <td>
                        <div className="customer-info">
                          <div className="avatar-circle">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{userName}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(b.totalPrice)}
                      </td>
                      <td>
                        <span className={`status-pill ${
                          b.status === 'PAID' ? 'status-paid' : b.status === 'PENDING' ? 'status-pending' : 'status-cancelled'
                        }`}>
                          {b.status === 'PAID' ? 'Đã thanh toán' : b.status === 'PENDING' ? 'Chờ xử lý' : 'Đã hủy'}
                        </span>
                      </td>
                      <td style={{ color: '#71717a' }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}