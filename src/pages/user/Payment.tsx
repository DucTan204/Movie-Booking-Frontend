// ══════════════════════════════════════════════════════════════════════
// FILE: src/pages/user/Payment.tsx
// - MoMo và PayOS đều dùng VietQR auto-confirm (polling)
// - Bỏ hoàn toàn nút "Tôi đã chuyển tiền xong"
// - Tự động xác nhận khi webhook báo về
// ══════════════════════════════════════════════════════════════════════

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookingApi, paymentApi } from '../../api/axiosConfig';
import type { Booking } from '../../types';
import { formatCurrency } from '../../utils/format';
import './Payment.css';
import TicketQRModal from '../../components/user/TicketQRModal';

type PayMethod = 'PAYOS' | 'MOMO' | null;

export default function Payment() {
  const [params] = useSearchParams();
  const bookingId = Number(params.get('bookingId'));

  const [booking, setBooking]       = useState<Booking | null>(null);
  const [loading, setLoading]       = useState(true);
  const [success, setSuccess]       = useState(false);
  const [showQR, setShowQR]         = useState(false);

  // Bước chọn phương thức
  const [method, setMethod]         = useState<PayMethod>(null);
  // Trạng thái tạo link / đang chờ
  const [creating, setCreating]     = useState(false);
  const [polling, setPolling]       = useState(false);
  // URL checkout PayOS (mở tab mới)
  const [payosUrl, setPayosUrl]     = useState<string | null>(null);
  // QR tĩnh MoMo / VietQR
  const [showStaticQR, setShowStaticQR] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Load booking ─────────────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;
    bookingApi.getById(bookingId)
      .then(res => {
        setBooking(res.data);
        if (res.data.status === 'PAID') setSuccess(true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookingId]);

  // ─── Cleanup polling ──────────────────────────────────────────────
  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  // ─── Polling status mỗi 3s ────────────────────────────────────────
  const startPolling = () => {
    setPolling(true);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await paymentApi.checkStatus(bookingId);
        if (res.data.status === 'PAID') {
          clearInterval(pollingRef.current!);
          setPolling(false);
          setSuccess(true);
        }
      } catch { /* bỏ qua */ }
    }, 3000);
  };

  // ─── PayOS: tạo link → mở tab → polling ──────────────────────────
  const handlePayOS = async () => {
    if (!booking) return;
    setCreating(true);
    try {
      const res = await paymentApi.createPayOSLink(bookingId);
      if (res.data.status === 'PAID') { setSuccess(true); return; }
      setPayosUrl(res.data.checkoutUrl);
      window.open(res.data.checkoutUrl, '_blank');
      startPolling();
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Không thể tạo link thanh toán.');
    } finally {
      setCreating(false);
    }
  };

  // ─── MoMo / VietQR tĩnh: hiện QR → polling ───────────────────────
  const handleMoMo = async () => {
    if (!booking) return;
    setCreating(true);
    try {
      // Tạo bản ghi payment PENDING
      await paymentApi.process({ booking: { id: booking.id }, method: 'MOMO' });
      setShowStaticQR(true);
      startPolling(); // chờ webhook xác nhận
    } catch (err: any) {
      // Nếu đã tạo rồi thì vẫn hiện QR
      setShowStaticQR(true);
      startPolling();
    } finally {
      setCreating(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────
  const generateVietQR = () => {
    if (!booking) return '';
    return `https://img.vietqr.io/image/MB-0915658578-compact2.png`
      + `?amount=${booking.totalPrice}`
      + `&addInfo=${encodeURIComponent(booking.bookingCode)}`
      + `&accountName=TRAN%20DUC%20TAN`;
  };

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  // ─── Màn hình thành công ──────────────────────────────────────────
  if (success) return (
    <div className="payment-page fade-in">
      <div className="container">
        <div className="payment-success slide-up">
          <div className="payment-success-icon">✓</div>
          <h2>Thanh toán thành công!</h2>
          <p>Mã đặt vé: <strong>{booking?.bookingCode}</strong></p>
          <div className="payment-success-actions">
            <button className="btn-view-qr-payment" onClick={() => setShowQR(true)}>
              📱 Xem mã QR vé ngay
            </button>
            <div className="payment-blockchain-note">
              <span>⛓</span> Vé đã được xác thực và lưu trữ trên blockchain.
            </div>
            <div className="success-nav-links">
              <Link to="/" className="btn btn-primary">🏠 Về trang chủ</Link>
              <Link to="/my-tickets" className="btn btn-outline">🎟 Vé của tôi</Link>
            </div>
          </div>
          {showQR && bookingId && (
            <TicketQRModal bookingId={bookingId} onClose={() => setShowQR(false)} />
          )}
        </div>
      </div>
    </div>
  );

  if (!booking) return <div className="loading-center"><p>Không tìm thấy đơn hàng.</p></div>;

  // ─── Màn hình chờ xác nhận (sau khi chọn phương thức) ─────────────
  if (polling) return (
    <div className="payment-page fade-in">
      <div className="container">
        <div className="payment-waiting slide-up">

          {/* Header */}
          <div className="waiting-icon">⏳</div>
          <h2>Đang chờ thanh toán...</h2>
          <p className="waiting-sub">
            Hệ thống tự động xác nhận sau khi nhận được tiền
          </p>

          {/* QR hiển thị khi dùng MoMo */}
          {showStaticQR && (
            <div className="waiting-qr-block">
              <img
                src={generateVietQR()}
                alt="QR chuyển khoản"
                className="waiting-qr-img"
              />
              <div className="waiting-qr-info">
                <p>🏦 <strong>MB Bank</strong> — 0915 6585 78</p>
                <p>👤 <strong>TRAN DUC TAN</strong></p>
                <p>💰 <strong>{formatCurrency(booking.totalPrice)}</strong></p>
                <p>📝 Nội dung: <strong className="booking-code-highlight">{booking.bookingCode}</strong></p>
              </div>
            </div>
          )}

          {/* Link PayOS nếu cần mở lại */}
          {payosUrl && (
            <a href={payosUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline reopen-btn">
              🔗 Mở lại trang thanh toán PayOS
            </a>
          )}

          {/* Spinner + trạng thái */}
          <div className="polling-indicator">
            <span className="spinner-sm" />
            <span>Đang kiểm tra giao dịch...</span>
          </div>

          <p className="waiting-note">
            ⚠️ Vui lòng <strong>không đóng trang</strong> này cho đến khi xác nhận thành công.
          </p>
        </div>
      </div>
    </div>
  );

  // ─── Màn hình chọn phương thức ────────────────────────────────────
  return (
    <div className="payment-page fade-in">
      <div className="container">
        <h1 className="page-title">Thanh toán</h1>

        <div className="payment-layout">

          {/* ── Cột trái: chọn phương thức ── */}
          <div className="payment-methods-section">

            {/* PayOS */}
            <div
              className={`pay-method-card ${method === 'PAYOS' ? 'selected' : ''}`}
              onClick={() => setMethod('PAYOS')}
            >
              <div className="pay-method-header">
                <img
                  src="https://payos.vn/wp-content/uploads/sites/13/2023/07/payos-logo.svg"
                  alt="PayOS"
                  className="pay-method-logo"
                />
                <span className="pay-badge-green">Tự động ✨</span>
              </div>
              <p className="pay-method-desc">
                Cổng thanh toán PayOS — hỗ trợ 40+ ngân hàng và ví điện tử.
                Tự động xác nhận ngay khi tiền về.
              </p>
            </div>

            {/* MoMo / Chuyển khoản */}
            <div
              className={`pay-method-card ${method === 'MOMO' ? 'selected' : ''}`}
              onClick={() => setMethod('MOMO')}
            >
              <div className="pay-method-header">
                <span className="pay-method-title">🏦 Chuyển khoản MB Bank</span>
                <span className="pay-badge-green">Tự động ✨</span>
              </div>
              <p className="pay-method-desc">
                Quét mã QR để chuyển khoản. Hệ thống tự động xác nhận sau khi nhận tiền.
              </p>
            </div>

            {/* Nút thanh toán */}
            <button
              className={`btn btn-primary pay-confirm-btn ${!method ? 'disabled' : ''}`}
              disabled={!method || creating}
              onClick={method === 'PAYOS' ? handlePayOS : handleMoMo}
            >
              {creating
                ? <><span className="spinner-sm" /> Đang xử lý...</>
                : method === 'PAYOS'
                ? '💳 Thanh toán qua PayOS'
                : method === 'MOMO'
                ? '📱 Lấy mã QR chuyển khoản'
                : 'Chọn phương thức thanh toán'}
            </button>

            {!method && (
              <p className="pay-hint">↑ Chọn một phương thức để tiếp tục</p>
            )}
          </div>

          {/* ── Cột phải: tóm tắt đơn hàng ── */}
          <div className="order-summary">
            <div className="order-summary-title">Tóm tắt đơn hàng</div>
            <div className="order-row">
              <span className="order-row-label">Mã đơn hàng</span>
              <span className="order-row-value mono">{booking.bookingCode}</span>
            </div>
            <div className="order-row">
              <span className="order-row-label">Tổng tiền</span>
              <span className="order-total-amount">{formatCurrency(booking.totalPrice)}</span>
            </div>
            <div className="divider" />
            <p className="payment-note">
              * Đơn hàng sẽ được <strong>tự động xác nhận</strong> sau khi nhận tiền.
              Không cần thao tác thêm.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
