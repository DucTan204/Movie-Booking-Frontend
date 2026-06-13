import React from 'react';
import './SupportPages.css';

// 1. Component Hướng dẫn đặt vé
export const BookingGuide = () => (
  <div className="support-page container fade-in">
    <h1 className="page-title">Hướng dẫn đặt vé</h1>
    <div className="support-content card">
      <div className="guide-step">
        <div className="step-number">01</div>
        <div className="step-text">
          <h3>Chọn phim & Suất chiếu</h3>
          <p>Truy cập mục "Phim", chọn bộ phim bạn yêu thích. Nhấn vào suất chiếu phù hợp với thời gian của bạn tại rạp gần nhất.</p>
        </div>
      </div>
      <div className="guide-step">
        <div className="step-number">02</div>
        <div className="step-text">
          <h3>Chọn ghế ngồi</h3>
          <p>Sơ đồ phòng chiếu sẽ hiện ra. Ghế trống (màu xám), ghế VIP (màu vàng). Bạn có thể chọn tối đa 8 ghế cho mỗi lần đặt.</p>
        </div>
      </div>
      <div className="guide-step">
        <div className="step-number">03</div>
        <div className="step-text">
          <h3>Thanh toán</h3>
          <p>Chọn phương thức thanh toán (MoMo hoặc PayOS). Kiểm tra kỹ thông tin đơn hàng trước khi xác nhận.</p>
        </div>
      </div>
      <div className="guide-step">
        <div className="step-number">04</div>
        <div className="step-text">
          <h3>Nhận mã đặt vé</h3>
          <p>Sau khi thanh toán thành công, hệ thống sẽ gửi Mã đặt vé (Booking Code). Hãy lưu mã này để xuất vé tại quầy hoặc máy tự động tại rạp.</p>
        </div>
      </div>
    </div>
  </div>
);

// 2. Component Điều khoản sử dụng
export const TermsOfUse = () => (
  <div className="support-page container fade-in">
    <h1 className="page-title">Điều khoản sử dụng</h1>
    <div className="support-content card text-block">
      <h3>1. Quy định về tài khoản</h3>
      <p>Người dùng chịu trách nhiệm bảo mật mật khẩu và các thông tin cá nhân. CineMax không chịu trách nhiệm cho các tổn thất do việc lộ thông tin từ phía người dùng.</p>
      
      <h3>2. Quy định về vé</h3>
      <p>Vé đã mua chỉ có giá trị cho suất chiếu được in trên vé. Vui lòng đến rạp trước ít nhất 15 phút để đảm bảo quyền lợi.</p>
      
      <h3>3. Độ tuổi xem phim</h3>
      <p>Khách hàng cần tuân thủ đúng quy định về phân loại độ tuổi của phim (P, K, T13, T16, T18). Rạp có quyền từ chối phục vụ nếu khách hàng không chứng minh được độ tuổi hợp lệ.</p>
    </div>
  </div>
);

// 3. Component Chính sách hoàn vé
export const RefundPolicy = () => (
  <div className="support-page container fade-in">
    <h1 className="page-title">Chính sách đổi trả / hoàn vé</h1>
    <div className="support-content card text-block">
      <div className="highlight-box">
        <h4>Lưu ý quan trọng:</h4>
        <p>Hệ thống đặt vé trực tuyến hiện tại không hỗ trợ hủy vé sau khi đã thanh toán thành công để đảm bảo tính minh bạch của suất chiếu.</p>
      </div>
      <h3>Quy định đổi vé tại rạp:</h3>
      <ul>
        <li>Yêu cầu đổi suất chiếu phải được thực hiện trực tiếp tại quầy vé của rạp đã đặt.</li>
        <li>Thời gian yêu cầu đổi: Ít nhất 60 phút trước giờ phim bắt đầu chiếu.</li>
        <li>Phí đổi vé: 10.000đ / vé.</li>
        <li>Chỉ hỗ trợ đổi sang suất chiếu khác của cùng một bộ phim trong ngày.</li>
      </ul>
    </div>
  </div>
);

// 4. Component Liên hệ (Đã bỏ phần gửi tin nhắn)
export const Contact = () => (
  <div className="support-page container fade-in">
    <h1 className="page-title">Liên hệ với chúng tôi</h1>
    <div className="support-grid single-col">
      <div className="contact-info card">
        <h3>Thông tin liên hệ</h3>
        <p>📍 Trụ sở chính: Tầng 5, Vincom Bà Triệu, Hai Bà Trưng, Hà Nội</p>
        <p>📞 Tổng đài: 1900 1234 (8:00 - 22:00 hàng ngày)</p>
        <p>✉️ Email: support@cinemax.vn</p>
        <div className="social-links-large">
           <span className="social-tag">Facebook: facebook.com/CineMaxVN</span>
           <span className="social-tag">Youtube: CineMax Official</span>
        </div>
      </div>
    </div>
  </div>
);