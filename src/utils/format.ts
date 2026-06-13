// ─── Tiền tệ VND ─────────────────────────────────
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// ─── Ngày giờ ────────────────────────────────────
export const formatDateTime = (dateStr: string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

export const formatDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
};

export const formatTime = (dateStr: string): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
};

// ─── Thời lượng phim ─────────────────────────────
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
};

// ─── Ngày tháng thân thiện ────────────────────────
export const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Ngày mai';
  if (diffDays === -1) return 'Hôm qua';
  if (diffDays > 0) return `${diffDays} ngày nữa`;
  return formatDate(dateStr);
};

// ─── Tên ngày trong tuần ─────────────────────────
export const formatDayOfWeek = (dateStr: string): string => {
  return new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(new Date(dateStr));
};

// ─── Viết tắt tên ghế ─────────────────────────────
export const formatSeatLabel = (seatNumber: string, type: 'NORMAL' | 'VIP'): string => {
  return type === 'VIP' ? `★ ${seatNumber}` : seatNumber;
};

// ─── Trạng thái booking ───────────────────────────
export const formatBookingStatus = (status: string): string => {
  const map: Record<string, string> = {
    PENDING: 'Chờ thanh toán',
    PAID: 'Đã thanh toán',
    CANCELLED: 'Đã hủy',
  };
  return map[status] ?? status;
};

// ─── Trạng thái thanh toán ────────────────────────
export const formatPaymentStatus = (status: string): string => {
  const map: Record<string, string> = {
    PENDING: 'Đang xử lý',
    SUCCESS: 'Thành công',
    FAILED: 'Thất bại',
  };
  return map[status] ?? status;
};

// ─── Phương thức thanh toán ───────────────────────
export const formatPaymentMethod = (method: string): string => {
  const map: Record<string, string> = {
    MOMO: 'Ví MoMo',
    PAYOS: 'PayOS (Banking)',
  };
  return map[method] ?? method;
};