import { Link } from 'react-router-dom';
import './UserFooter.css';

export default function UserFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        
        {/* Phần 1: Thương hiệu & Slogan */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="footer-logo-mark">C</span>
            <span className="footer-logo-text">CINE<span>MAX</span></span>
          </div>
          <p className="footer-tagline">Trải nghiệm điện ảnh đỉnh cao tại hệ thống rạp hiện đại nhất Việt Nam.</p>
          <div className="footer-socials">
            <a href="#fb" title="Facebook"><i className="fab fa-facebook"></i></a>
            <a href="#yt" title="Youtube"><i className="fab fa-youtube"></i></a>
          </div>
        </div>

        {/* Phần 2: Các cột liên kết */}
        <div className="footer-links">
          <div className="footer-col">
            <h4>Khám phá</h4>
            <Link to="/movies">Phim đang chiếu</Link>
            <Link to="/cinemas">Hệ thống rạp</Link>
          </div>

          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            {/* Sử dụng Link thay vì <a href="#"> để không bị load lại trang */}
            <Link to="/support/guide">Hướng dẫn đặt vé</Link>
            <Link to="/support/terms">Điều khoản sử dụng</Link>
            <Link to="/support/refund">Chính sách hoàn vé</Link>
            <Link to="/support/contact">Liên hệ</Link>
          </div>

          <div className="footer-col">
            <h4>Thông tin</h4>
            <p>Email: support@cinemax.vn</p>
            <p>Hotline: 1900 1234</p>
            <p>Giờ làm việc: 8:00 - 23:00</p>
          </div>
        </div>
      </div>

      {/* Phần 3: Bản quyền (Bottom Bar) */}
      <div className="footer-bottom">
        <div className="container">
          <span>© 2026 CineMax. Tất cả quyền được bảo lưu.</span>
          <div className="footer-bottom-links">
            <Link to="/privacy">Chính sách bảo mật</Link>
            <span> | </span>
            <Link to="/sitemap">Sơ đồ trang web</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}