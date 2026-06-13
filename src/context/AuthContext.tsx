import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/axiosConfig';
import type { AuthResponse } from '../types';

interface AuthContextType {
  user: any | null; // Hoặc User type cụ thể của bạn
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: any) => void; // Hàm quan trọng để cập nhật Profile mà không gây lỗi 400
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Khôi phục session & Kiểm tra tính hợp lệ của Token với Server
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Gọi API /auth/me để lấy thông tin user mới nhất từ Server
          const res = await authApi.getMe();
          setUser(res.data);
        } catch (error) {
          console.error("Phiên đăng nhập hết hạn hoặc Token lỗi");
          logout(); // Xóa sạch local storage nếu token không hợp lệ
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // 2. Hàm Đăng nhập (Chỉ dùng ở trang Login)
  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const data = res.data;
    
    // Lưu ý: data ở đây tùy thuộc vào Backend của bạn trả về 
    // Nếu Backend trả về { token: '...', user: {...} } thì dùng data.user
    const userData = data.user || data; 
    const token = data.token;

    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 3. Hàm Đăng ký
  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await authApi.register({ name, email, password, phone });
    const data = res.data;
    
    const userData = data.user || data;
    const token = data.token;

    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 4. HÀM MỚI: Cập nhật thông tin user trong State (Dùng cho trang Profile)
  // Giúp cập nhật UI ngay lập tức mà không cần gọi lại hàm login()
  const updateUser = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 5. Hàm Đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Có thể điều hướng về trang chủ nếu cần
    // window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN' || user?.role?.name === 'ADMIN',
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}