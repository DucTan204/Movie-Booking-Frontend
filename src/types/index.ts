export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  roleName: string;
  createdAt?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  token: string;
  role: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  releaseDate: string;
  posterUrl: string;
  genres: Genre[];
  genreIds?: number[];
}

export interface Cinema {
  id: number;
  name: string;
  address: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED'; // [CẬP NHẬT] Trạng thái cụm rạp
  rooms?: Room[];
}

export interface Room {
  id: number;
  cinemaId: number;
  name: string;
  capacity: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'; // [CẬP NHẬT] Trạng thái phòng chiếu
  seats?: Seat[];
}

export interface Seat {
  id: number;
  roomId: number;
  seatNumber: string;
  seatRow: string;
  type: 'NORMAL' | 'VIP' | 'COUPLE';
  // Trạng thái ghế cho suất chiếu cụ thể: true = đã có người đặt, false = còn trống
  booked?: boolean;
}

export interface Showtime {
  id: number;
  movieId: number;
  movieTitle: string;
  roomId: number;
  roomName: string;
  cinemaName: string;
  startTime: string;
  endTime: string;
  basePrice: number;
}

export interface SeatLockRequest {
  showtimeId: number;
  seatIds: number[];
}

export interface BookingRequest {
  showtimeId: number;
  totalPrice: number;
  seatIds: number[];
}

export interface Ticket {
  id: number;
  bookingId: number;
  seatId: number;
  seatNumber: string;
  price: number;
}

export interface Booking {
  id: number;
  bookingCode: string;
  userId: number;
  showtimeId: number;
  totalPrice: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  seatIds?: number[];
  tickets?: Ticket[];
}

export interface PaymentRequest {
  booking: { id: number };
  method: 'MOMO' | 'PAYOS';
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  method: 'MOMO' | 'PAYOS';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionCode?: string;
  createdAt: string;
}