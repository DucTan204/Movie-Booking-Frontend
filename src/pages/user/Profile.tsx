import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingApi, userApi } from '../../api/axiosConfig';
import type { Booking } from '../../types';
import { formatCurrency, formatDateTime, formatBookingStatus } from '../../utils/format';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState<'info' | 'history'>('info');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // ── Trạng thái Chỉnh sửa thông tin ──
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Trạng thái Đổi mật khẩu ──
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const renderRole = (role: any) => {
    if (typeof role === 'object') return role.name || 'USER';
    return role || 'USER';
  };

  // ✅ Lưu thông tin cá nhân
  const handleSaveProfile = async () => {
    if (!editForm.name.trim()) {
      setSaveError('Họ tên không được để trống');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const res = await userApi.updateProfile({ 
        name: editForm.name.trim(),
        phone: editForm.phone.trim() 
      });
      updateUser(res.data); 
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Cập nhật thất bại');
    } finally { setSaving(false); }
  };

  // ✅ Đổi mật khẩu
  const handleChangePassword = async () => {
    setPassError('');
    if (!passForm.oldPassword || !passForm.newPassword) {
      setPassError('Vui lòng nhập đầy đủ mật khẩu.');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassError('Mật khẩu mới phải từ 6 ký tự.');
      return;
    }

    setSaving(true);
    try {
      await userApi.changePassword({
        oldPassword: passForm.oldPassword,
        newPassword: passForm.newPassword
      });
      setPassSuccess(true);
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Mật khẩu cũ không chính xác.');
    } finally { setSaving(false); }
  };

  // ✅ Tải lịch sử đặt vé
  useEffect(() => {
    if (tab === 'history' && user) {
      setLoadingBookings(true);
      bookingApi.getMyBookings()
        .then(res => setBookings(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoadingBookings(false));
    }
  }, [tab, user]);

  return (
    <div className="profile-page fade-in">
      <div className="container">
        <h1 className="page-title">Tài khoản của tôi</h1>

        <div className="profile-grid">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="profile-avatar-name">{user?.name}</div>
              <div className="profile-avatar-email">{user?.email}</div>
              <span className="role-badge">{renderRole(user?.role)}</span>
            </div>
            <nav className="profile-tabs">
              <button 
                className={`profile-tab-btn ${tab === 'info' ? 'active' : ''}`} 
                onClick={() => setTab('info')}
              >
                <i className="fa-regular fa-user"></i> Thông tin cá nhân
              </button>
              <button 
                className={`profile-tab-btn ${tab === 'history' ? 'active' : ''}`} 
                onClick={() => setTab('history')}
              >
                <i className="fa-solid fa-ticket"></i> Lịch sử đặt vé
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="profile-main">
            {tab === 'info' && (
              <div className="profile-content-wrapper">
                {/* Section: Thông tin cá nhân */}
                <section className="profile-section card">
                  <div className="profile-section-header">
                    <h2 className="profile-section-title">Thông tin chung</h2>
                    {!isEditing && (
                      <button className="btn-edit" onClick={() => { 
                        setIsEditing(true); 
                        setEditForm({ name: user?.name || '', phone: user?.phone || '' }); 
                      }}>Sửa thông tin</button>
                    )}
                  </div>

                  {saveSuccess && <div className="profile-alert profile-alert-success">Cập nhật thành công!</div>}

                  {!isEditing ? (
                    <div className="profile-info-grid">
                      <div className="profile-info-item">
                        <span className="profile-info-label">Họ và tên</span>
                        <span className="profile-info-value">{user?.name}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-label">Số điện thoại</span>
                        <span className="profile-info-value">{user?.phone || <span className="text-muted">Chưa cập nhật</span>}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-label">Email đăng ký</span>
                        <span className="profile-info-value">{user?.email}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-edit-form">
                      <div className="profile-field">
                        <label className="profile-field-label">Họ và tên</label>
                        <input type="text" className="profile-field-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      </div>
                      <div className="profile-field">
                        <label className="profile-field-label">Số điện thoại</label>
                        <input type="text" className="profile-field-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                      </div>
                      {saveError && <div className="profile-alert profile-alert-error">{saveError}</div>}
                      <div className="profile-edit-actions">
                        <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>Lưu thay đổi</button>
                        <button className="btn btn-outline" onClick={() => setIsEditing(false)}>Hủy</button>
                      </div>
                    </div>
                  )}
                </section>

                {/* Section: Bảo mật */}
                <section className="profile-section card mt-4">
                  <div className="profile-section-header">
                    <h2 className="profile-section-title">Bảo mật & Mật khẩu</h2>
                    {!isChangingPassword && <button className="btn-edit" onClick={() => setIsChangingPassword(true)}>Đổi mật khẩu</button>}
                  </div>

                  {passSuccess && <div className="profile-alert profile-alert-success">Đổi mật khẩu thành công!</div>}

                  {isChangingPassword && (
                    <div className="profile-edit-form">
                      <div className="profile-field">
                        <label className="profile-field-label">Mật khẩu hiện tại</label>
                        <input type="password" placeholder="••••••••" className="profile-field-input" value={passForm.oldPassword} onChange={e => setPassForm({...passForm, oldPassword: e.target.value})} />
                      </div>
                      <div className="profile-field">
                        <label className="profile-field-label">Mật khẩu mới</label>
                        <input type="password" placeholder="Tối thiểu 6 ký tự" className="profile-field-input" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} />
                      </div>
                      <div className="profile-field">
                        <label className="profile-field-label">Xác nhận mật khẩu mới</label>
                        <input type="password" placeholder="Nhập lại mật khẩu mới" className="profile-field-input" value={passForm.confirmPassword} onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} />
                      </div>
                      {passError && <div className="profile-alert profile-alert-error">{passError}</div>}
                      <div className="profile-edit-actions">
                        <button className="btn btn-primary" onClick={handleChangePassword} disabled={saving}>Cập nhật mật khẩu</button>
                        <button className="btn btn-outline" onClick={() => { setIsChangingPassword(false); setPassError(''); }}>Hủy</button>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}

            {tab === 'history' && (
              <div className="profile-section card">
                <div className="profile-section-header">
                  <h2 className="profile-section-title">Lịch sử đặt vé</h2>
                </div>

                {loadingBookings ? (
                  <div className="loading-wrapper">
                    <div className="spinner-sm"></div>
                    <span>Đang tải lịch sử...</span>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="empty-history">
                    <div className="empty-icon">🎟️</div>
                    <p>Bạn chưa có giao dịch đặt vé nào.</p>
                  </div>
                ) : (
                  <div className="booking-history-list">
                    {bookings.map((b) => (
                      <div key={b.id} className="booking-history-item">
                        <div className="booking-history-header">
                          <span className="booking-history-code">MÃ VÉ: #{b.id.toString().slice(-6).toUpperCase()}</span>
                          <span className={`status-badge status-${b.status.toLowerCase()}`}>
                            {formatBookingStatus(b.status)}
                          </span>
                        </div>
                        
                        <div className="booking-history-main">
                          <div className="booking-history-info">
                            <h3 className="booking-history-movie">{b.showtime.movieTitle}</h3>
                            <div className="booking-history-meta">
                              <span>📅 {formatDateTime(b.showtime.startTime)}</span>
                              <span>📍 {b.showtime.roomName || 'Phòng chiếu số 1'}</span>
                            </div>
                            <div className="booking-history-seats">
                              Ghế: <strong>{b.tickets.map((t) => t.seatNumber).join(', ')}</strong>
                            </div>
                          </div>
                          
                          <div className="booking-history-right">
                            <div className="booking-history-price">
                              {formatCurrency(b.totalPrice)}
                            </div>
                            <div className="booking-date">
                              Ngày đặt: {new Date(b.createdAt || '').toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}