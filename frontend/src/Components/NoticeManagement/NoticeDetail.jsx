import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NoticeManagement.css';

const NoticeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/notices/${id}`);
        setNotice(res.data);
      } catch (err) {
        console.error('Error fetching notice:', err);
      }
      setLoading(false);
    };
    fetchNotice();
  }, [id]);

  if (loading) return (
    <div className="notice-detail-container">
      <p>⏳ Loading notice...</p>
    </div>
  );

  if (!notice) return (
    <div className="notice-detail-container">
      <p>❌ Notice not found.</p>
      <button className="btn-back" onClick={() => navigate('/notices')}>
        ← Back to Notices
      </button>
    </div>
  );

  const badgeColor = {
    all: '#094886',
    students: '#2563eb',
    tutors: '#059669',
    coordinators: '#7c3aed'
  };

  return (
    <div className="notice-detail-container">
      <button className="btn-back" onClick={() => navigate('/notices')}>
        ← Back to Notices
      </button>

      <div className="notice-detail-card">
        <div className="notice-detail-header">
          <h2>📢 {notice.title}</h2>
          <span className="audience-badge"
            style={{ backgroundColor: badgeColor[notice.targetAudience] }}>
            {notice.targetAudience === 'all' ? '🌐 All' :
             notice.targetAudience === 'students' ? '🎓 Students' :
             notice.targetAudience === 'tutors' ? '👨‍🏫 Tutors' :
             '📋 Coordinators'}
          </span>
        </div>

        <div className="notice-detail-meta">
          <span>📅 {new Date(notice.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}</span>
          {notice.module && <span>📚 {notice.module}</span>}
          <span>👁 {notice.viewedBy?.length || 0} views</span>
          {notice.scheduledAt && (
            <span>⏰ Scheduled: {new Date(notice.scheduledAt).toLocaleDateString()}</span>
          )}
        </div>

        <div className="notice-detail-content">
          <p>{notice.content}</p>
        </div>

        <div className="notice-detail-footer">
          <span className={notice.isArchived ? 'status-archived' : 'status-active'}>
            {notice.isArchived ? '🗂 Archived' : '● Active'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;