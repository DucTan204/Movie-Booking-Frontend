import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // Yêu cầu quyền Admin
  requireStaff?: boolean; // Yêu cầu quyền Nhân viên (Staff hoặc Admin)
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireStaff = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Lấy thông tin user từ localStorage để kiểm tra Role chi tiết
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // 1. Nếu đang trong quá trình xác thực (Loading)
  if (isLoading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  }

  // 2. Nếu chưa đăng nhập (hoặc không có thông tin user)
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Kiểm tra quyền Admin (Nếu requireAdmin = true)
  if (requireAdmin) {
    const isAdmin = ['ROLE_ADMIN', 'ADMIN'].includes(user.role);
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  // 4. Kiểm tra quyền Staff (Nếu requireStaff = true)
  // Staff thường bao gồm cả Admin
  if (requireStaff) {
    const isStaffOrAdmin = ['ROLE_STAFF', 'STAFF', 'ROLE_ADMIN', 'ADMIN'].includes(user.role);
    if (!isStaffOrAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  // 5. Nếu vượt qua tất cả các kiểm tra, hiển thị nội dung bên trong
  return <>{children}</>;
}