import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ticketQRApi } from '../../api/axiosConfig';
import './QRScanner.css';

interface VerifyResult {
  movieTitle: string;
  cinemaName: string;
  roomName: string;
  startTime: string;
  seatCount: number;
  seats: string[];
  customerName: string;
  bookingCode: string;
  verifiedAt?: string;
}

export default function QRScanner() {
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [isCameraMode, setIsCameraMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const loadingRef = useRef(false);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Failed to clear scanner", err);
      }
    }
  }, []);

  const handleVerify = async (code: string) => {
    if (!code.trim() || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError('');

    await stopScanner();

    try {
      const res = await ticketQRApi.verifyQR(code);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã vé không hợp lệ hoặc đã sử dụng');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const handleVerifyRef = useRef(handleVerify);
  useEffect(() => {
    handleVerifyRef.current = handleVerify;
  });

  useEffect(() => {
    if (isCameraMode && !result && !error) {
      if (!scannerRef.current) {
        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
          false
        );
        scannerRef.current.render(
          (decodedText) => handleVerifyRef.current(decodedText),
          () => {}
        );
      }
    }

    return () => {
      if (result || error || !isCameraMode) {
        stopScanner();
      }
    };
  }, [isCameraMode, result, error, stopScanner]);

  const resetScanner = () => {
    setResult(null);
    setError('');
    setManualCode('');
  };

  return (
    <div className="scanner-page-wrapper">
      <div className="scanner-container">
        <header className="scanner-header">
          <h1 className="page-title">HỆ THỐNG SOÁT VÉ</h1>
          <div className="scanner-tabs">
            <button
              className={isCameraMode ? 'active' : ''}
              onClick={() => { setIsCameraMode(true); resetScanner(); }}
            >
              📷 Quét Camera
            </button>
            <button
              className={!isCameraMode ? 'active' : ''}
              onClick={() => { setIsCameraMode(false); resetScanner(); }}
            >
              ⌨️ Nhập mã tay
            </button>
          </div>
        </header>

        <main className="scanner-main-area">
          {/* CAMERA MODE */}
          {isCameraMode && !result && !error && (
            <div className="camera-box slide-up">
              <div id="reader"></div>
              <p className="hint">Đưa mã QR vào khung hình để tự động quét</p>
            </div>
          )}

          {/* MANUAL MODE */}
          {!isCameraMode && !result && !error && (
            <div className="manual-box card slide-up">
              <input
                type="text"
                className="manual-input"
                placeholder="NHẬP MÃ ĐẶT VÉ (VD: BK123...)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                autoFocus
              />
              <button
                className="btn-submit"
                onClick={() => handleVerify(manualCode)}
                disabled={loading}
              >
                {loading ? <span className="loader"></span> : 'XÁC THỰC NGAY'}
              </button>
            </div>
          )}

          {/* LOADING */}
          {loading && (
            <div className="loading-box slide-up">
              <span className="loader"></span>
              <p>Đang xác thực vé...</p>
            </div>
          )}

          {/* ERROR DISPLAY */}
          {error && (
            <div className="error-card slide-up">
              <div className="error-icon">⚠️</div>
              <h3>Xác thực thất bại</h3>
              <p>{error}</p>
              <button className="btn-retry" onClick={() => { setError(''); }}>
                THỬ LẠI
              </button>
            </div>
          )}

          {/* SUCCESS RESULT */}
          {result && (
            <div className="result-overlay">
              <div className="ticket-card slide-up">
                <div className="ticket-header">
                  <div className="status-badge">✅ VÉ HỢP LỆ</div>
                  <p className="verify-time">
                    Soát lúc: {result.verifiedAt
                      ? new Date(result.verifiedAt).toLocaleTimeString()
                      : new Date().toLocaleTimeString()}
                  </p>
                </div>

                <div className="ticket-body">
                  <h2 className="movie-title">{result.movieTitle}</h2>

                  <div className="info-grid">
                    <div className="info-item">
                      <label>Khách hàng</label>
                      <p>{result.customerName}</p>
                    </div>
                    <div className="info-item">
                      <label>Mã vé</label>
                      <p className="code-highlight">{result.bookingCode}</p>
                    </div>
                    <div className="info-item">
                      <label>Suất chiếu</label>
                      <p>{new Date(result.startTime).toLocaleString('vi-VN', {
                        hour: '2-digit', minute: '2-digit',
                        day: '2-digit', month: '2-digit'
                      })}</p>
                    </div>
                    <div className="info-item">
                      <label>Phòng</label>
                      <p>{result.roomName}</p>
                    </div>
                  </div>

                  <div className="seat-section">
                    <label>Ghế ngồi ({result.seatCount})</label>
                    <div className="seat-tags">
                      {result.seats.map(s => (
                        <span key={s} className="seat-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="ticket-footer">
                  <button className="btn-done" onClick={resetScanner}>
                    XÁC NHẬN & TIẾP TỤC
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}