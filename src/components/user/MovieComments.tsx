import { useState, useEffect } from 'react';
import { commentApi } from '../../api/axiosConfig';
import './MovieComments.css';

interface Comment {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  user: { name: string };
}

interface Props { movieId: number; }

const STARS = [1,2,3,4,5];

export default function MovieComments({ movieId }: Props) {
  const [comments, setComments]         = useState<Comment[]>([]);
  const [avgRating, setAvgRating]       = useState(0);
  const [content, setContent]           = useState('');
  const [rating, setRating]             = useState(5);
  const [hoverRating, setHoverRating]   = useState(0);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  const load = () => {
    commentApi.getByMovie(movieId).then(res => {
      setComments(res.data.comments || []);
      setAvgRating(res.data.averageRating || 0);
    });
  };

  useEffect(() => { load(); }, [movieId]);

  const handleSubmit = async () => {
    if (!content.trim()) { setError('Vui lòng nhập nội dung bình luận'); return; }
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await commentApi.add(movieId, { content, rating });
      setContent(''); setRating(5);
      setSuccess('Bình luận của bạn đã được gửi!');
      load();
    } catch {
      setError('Không thể gửi bình luận. Vui lòng đăng nhập và thử lại.');
    } finally { setSubmitting(false); }
  };

  return (
    <section className="comments-section">
      <div className="comments-header">
        <h3 className="comments-title">💬 Đánh giá & Bình luận</h3>
        <div className="avg-rating">
          <span className="avg-number">{avgRating.toFixed(1)}</span>
          <span className="avg-stars">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
          <span className="avg-count">({comments.length} đánh giá)</span>
        </div>
      </div>

      {/* Form viết bình luận */}
      <div className="comment-form">
        <div className="star-picker">
          {STARS.map(s => (
            <button
              key={s}
              className={`star-btn ${s <= (hoverRating || rating) ? 'star-active' : ''}`}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(s)}
            >★</button>
          ))}
          <span className="star-label">{rating}/5</span>
        </div>
        <textarea
          className="comment-input"
          placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={3}
          maxLength={1000}
        />
        <div className="comment-form-footer">
          <span className="char-count">{content.length}/1000</span>
          <button
            className="btn-submit-comment"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
          </button>
        </div>
        {error   && <div className="comment-error">{error}</div>}
        {success && <div className="comment-success">{success}</div>}
      </div>

      {/* Danh sách bình luận */}
      <div className="comment-list">
        {comments.length === 0
          ? <p className="no-comment">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          : comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-meta">
                <span className="comment-author">{c.user?.name ?? 'Ẩn danh'}</span>
                <span className="comment-stars">
                  {'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}
                </span>
                <span className="comment-date">
                  {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="comment-content">{c.content}</p>
            </div>
          ))
        }
      </div>
    </section>
  );
}