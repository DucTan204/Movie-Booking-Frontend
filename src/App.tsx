import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// ─── USER PAGES ─────────────────────────────────────────────
import Home from './pages/user/Home';
import MovieDetail from './pages/user/MovieDetail';
import MoviesPage from './pages/user/MoviesPage';
import CinemasPage from './pages/user/CinemasPage';
import CinemaDetail from './pages/user/CinemaDetail';
import Booking from './pages/user/Booking';
import Payment from './pages/user/Payment';
import Profile from './pages/user/Profile';
import MyTickets from './pages/user/MyTickets';
import RefundRequest from './pages/user/RefundRequest'; // Tính năng mới

// Support pages
import { BookingGuide, TermsOfUse, RefundPolicy, Contact } from './pages/user/SupportPages';

// ─── AUTH PAGES ─────────────────────────────────────────────
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// ─── STAFF PAGES ────────────────────────────────────────────
import QRScanner from './pages/staff/QRScanner';

// ─── ADMIN PAGES ────────────────────────────────────────────
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMovies from './pages/admin/AdminMovies';
import AdminCinemas from './pages/admin/AdminCinemas';
import AdminRooms from './pages/admin/AdminRooms';
import AdminShowtimes from './pages/admin/AdminShowtimes';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import VoucherManagement from './pages/admin/VoucherManagement';
import PricingRuleManagement from './pages/admin/PricingRuleManagement';
import RefundManagement from './pages/admin/RefundManagement'; // Tính năng mới

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 1. AUTH ROUTES (Login/Register) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 2. USER ROUTES (Giao diện khách hàng) */}
          <Route element={<UserLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/cinemas" element={<CinemasPage />} />
            <Route path="/cinemas/:id" element={<CinemaDetail />} />
            
            {/* Support/Info Routes */}
            <Route path="/support/guide" element={<BookingGuide />} />
            <Route path="/support/terms" element={<TermsOfUse />} />
            <Route path="/support/refund" element={<RefundPolicy />} />
            <Route path="/support/contact" element={<Contact />} />

            {/* Protected Routes (Yêu cầu đăng nhập) */}
            <Route path="/booking" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
            <Route path="/refund-request" element={<ProtectedRoute><RefundRequest /></ProtectedRoute>} />
          </Route>

          {/* 3. STAFF ROUTES (Dành cho nhân viên kiểm soát vé) */}
          <Route
            path="/staff/scanner"
            element={
              <ProtectedRoute requireStaff>
                <QRScanner />
              </ProtectedRoute>
            }
          />

          {/* 4. ADMIN ROUTES (Giao diện quản lý) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* Admin Sub-routes */}
            <Route index element={<AdminDashboard />} />
            <Route path="movies" element={<AdminMovies />} />
            <Route path="cinemas" element={<AdminCinemas />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="showtimes" element={<AdminShowtimes />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="vouchers" element={<VoucherManagement />} />
            <Route path="pricing" element={<PricingRuleManagement />} />
            <Route path="refunds" element={<RefundManagement />} />
          </Route>

          {/* 5. FALLBACK (404 Not Found -> Về Home) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}