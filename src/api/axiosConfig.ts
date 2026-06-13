import axios from 'axios';

// ─── CẤU HÌNH AXIOS INSTANCE ───────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://moviebooking-2-5yfi.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── REQUEST INTERCEPTOR (Gắn Token JWT) ───────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR (Xử lý lỗi tập trung) ────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ──────────────────────────────────────────────────────
// ───────────────── CÁC MODULE API ─────────────────────
// ──────────────────────────────────────────────────────

// 1. AUTHENTICATION
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// 2. MOVIES
export const movieApi = {
  getAll: () => api.get('/movies'),
  getById: (id: number) => api.get(`/movies/${id}`),
  create: (data: object) => api.post('/movies', data),
  update: (id: number, data: object) => api.put(`/movies/${id}`, data),
  delete: (id: number) => api.delete(`/movies/${id}`),
};

// 3. GENRES
export const genreApi = {
  getAll: () => api.get('/genres'),
  create: (data: object) => api.post('/genres', data),
  update: (id: number, data: object) => api.put(`/genres/${id}`, data),
  delete: (id: number) => api.delete(`/genres/${id}`),
};

// 4. CINEMAS
export const cinemaApi = {
  getAll: () => api.get('/cinemas'),
  getById: (id: number) => api.get(`/cinemas/${id}`),
  create: (data: object) => api.post('/cinemas', data),
  update: (id: number, data: object) => api.put(`/cinemas/${id}`, data),
  delete: (id: number) => api.delete(`/cinemas/${id}`),
};

// 5. ROOMS
export const roomApi = {
  getAll: () => api.get('/rooms'),
  getById: (id: number) => api.get(`/rooms/${id}`),
  create: (data: object) => api.post('/rooms', data),
  update: (id: number, data: object) => api.put(`/rooms/${id}`, data),
  delete: (id: number) => api.delete(`/rooms/${id}`),
};

// 6. SEATS
export const seatApi = {
  getByRoom: (roomId: number) => api.get(`/seats/room/${roomId}`),
  getByShowtime: (showtimeId: number) => api.get(`/seats/showtime/${showtimeId}`),
  create: (data: object) => api.post('/seats', data),
  update: (id: number, data: object) => api.put(`/seats/${id}`, data),
  delete: (id: number) => api.delete(`/seats/${id}`),
};

// 7. SHOWTIMES
export const showtimeApi = {
  getAll: (params?: { movieId?: number; roomId?: number; date?: string }) =>
    api.get('/showtimes', { params }),
  getById: (id: number) => api.get(`/showtimes/${id}`),
  create: (data: object) => api.post('/showtimes', data),
  update: (id: number, data: object) => api.put(`/showtimes/${id}`, data),
  delete: (id: number) => api.delete(`/showtimes/${id}`),
};

// 8. SEAT LOCKS
export const seatLockApi = {
  lock: (data: { showtimeId: number; seatIds: number[] }) =>
    api.post('/seat-locks', data),
  unlock: (id: number) => api.delete(`/seat-locks/${id}`),
  unlockMultiple: (showtimeId: number, seatIds: number[]) =>
    api.delete('/seat-locks', { params: { showtimeId, seatIds } }),
};

// 9. BOOKINGS
export const bookingApi = {
  create: (data: {
    showtimeId: number;
    totalPrice: number;
    seatIds: number[];
    audienceType?: string;
    audienceTypes?: string[];
    voucherCode?: string;
    appliedVoucherCode?: string;
  }) => api.post('/bookings', data),
  getById: (id: number) => api.get(`/bookings/${id}`),
  getAll: () => api.get('/bookings'),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookedSeatIds: (showtimeId: number) =>
    api.get('/bookings/booked-seats', { params: { showtimeId } }),
};

// 10. PAYMENTS
export const paymentApi = {
  process: (data: { bookingId: number; method: string }) =>
    api.post('/payments', data),
  getById: (id: number) => api.get(`/payments/${id}`),
  createPayOSLink: (bookingId: number) =>
    api.post('/payments/payos/create', { bookingId }),
  checkStatus: (bookingId: number) =>
    api.get(`/payments/status/${bookingId}`),
};

// 11. USERS
export const userApi = {
  getAll: () => api.get('/users'),
  delete: (id: number) => api.delete(`/users/${id}`),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { name: string; phone?: string }) =>
    api.put('/users/profile', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post('/users/profile/change-password', data),
};

// 12. TICKET QR CODES
export const ticketQRApi = {
  getByBookingId: (bookingId: number) =>
    api.get(`/tickets/qr/booking/${bookingId}`),
  verifyQR: (qrCode: string) =>
    api.post('/tickets/qr/verify', { qrCode }),
};

// 13. SEAT MAP & PRICING RULES
export const seatMapApi = {
  getPricingByCinema: (cinemaId: number) =>
    api.get(`/seat-map/pricing/${cinemaId}`),
  getSeatMapByRoom: (roomId: number) =>
    api.get(`/seat-map/room/${roomId}`),
  createPricingRule: (data: object) =>
    api.post('/seat-map/pricing', data),
  updatePricingRule: (id: number, data: object) =>
    api.put(`/seat-map/pricing/${id}`, data),
  deletePricingRule: (id: number) =>
    api.delete(`/seat-map/pricing/${id}`),
};

// 14. COMMENTS & RATINGS
export const commentApi = {
  getByMovie: (movieId: number) =>
    api.get(`/movies/${movieId}/comments`),
  add: (movieId: number, data: { content: string; rating: number }) =>
    api.post(`/movies/${movieId}/comments`, data),
};

// 15. VOUCHERS
export const voucherApi = {
  getAll: () => api.get('/vouchers'),
  create: (data: object) => api.post('/vouchers', data),
  update: (id: number, data: object) => api.put(`/vouchers/${id}`, data),
  delete: (id: number) => api.delete(`/vouchers/${id}`),
  apply: (userId: number, code: string, orderAmount: number) =>
    api.post('/vouchers/apply', { code, orderAmount }, { params: { userId } }),
};

// 16. TICKET TRANSFER (Hoàn & Chuyển vé)
export const ticketTransferApi = {
  /** Gửi yêu cầu hoàn vé kèm thông tin ngân hàng */
  request: (bookingId: number, info: {
    reason: string;
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
  }) => api.post('/ticket-transfers', {
    bookingId,
    ...info  // Trải phẳng object info gửi trực tiếp lên Body
  }),

  /** Lấy danh sách hoàn vé của tôi (Backend tự lấy UserID từ Token) */
  getMy: () =>
    api.get('/ticket-transfers/my'),

  /** Admin: Lấy tất cả yêu cầu (Có thể lọc theo status) */
  getAll: (status?: string) =>
    api.get('/ticket-transfers', { params: status ? { status } : {} }),

  /** Admin: Phê duyệt */
  approve: (transferId: number) =>
    api.put(`/ticket-transfers/${transferId}/approve`),

  /** Admin: Từ chối kèm lý do */
  reject: (transferId: number, reason: string) =>
    api.put(`/ticket-transfers/${transferId}/reject`, { reason }),
};