import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NoticeManagement.css';

const UserNoticeView = () => {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/notices', {
          params: {
            search,
            target: filter !== 'all' ? filter : '',
            archived: false,
          },
        });
        setNotices(res.data);
      } catch (err) {
        console.error('Error fetching notices:', err);
      }
      setLoading(false);
    };
    fetchNotices();
  }, [search, filter]);

  const badgeColor = {
    all: '#094886',
    students: '#2563eb',
    tutors: '#059669',
    coordinators: '#7c3aed'
  };

  return (
    <div className="user-notice-container">
      <div className="user-notice-header">
        <h2>📢 Notice Board</h2>
        <p>Stay updated with the latest notices</p>
      </div>

      {/* Search & Filter */}
      <div className="notice-filters">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search notices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">🌐 All Notices</option>
          <option value="students">🎓 Students</option>
          <option value="tutors">👨‍🏫 Tutors</option>
          <option value="coordinators">📋 Coordinators</option>
        </select>
      </div>

      {/* Notices */}
      {loading ? (
        <div className="loading-state">
          <p>⏳ Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="empty-state">
          <p>📭 No notices found.</p>
          <small>{search ? `No results for "${search}"` : 'No notices available.'}</small>
        </div>
      ) : (
        <div className="user-notices-grid">
          {notices.map((notice) => (
            <div
              key={notice._id}
              className="user-notice-card"
              onClick={() => navigate(`/notices/${notice._id}`)}
            >
              <div className="user-notice-card-header">
                <h4>{notice.title}</h4>
                <span
                  className="audience-badge"
                  style={{ backgroundColor: badgeColor[notice.targetAudience] }}
                >
                  {notice.targetAudience === 'all' ? '🌐 All' :
                   notice.targetAudience === 'students' ? '🎓 Students' :
                   notice.targetAudience === 'tutors' ? '👨‍🏫 Tutors' :
                   '📋 Coordinators'}
                </span>
              </div>

              <p className="user-notice-content">
                {notice.content.length > 100
                  ? notice.content.substring(0, 100) + '...'
                  : notice.content}
              </p>

              {notice.module && (
                <p className="notice-module">📚 {notice.module}</p>
              )}

              {notice.ctaLink && (
                <div style={{ marginTop: '0.5rem' }}>
                  <button
                    className="btn-add"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(notice.ctaLink);
                    }}
                  >
                    {notice.ctaText || 'Fill the form'}
                  </button>
                </div>
              )}

              <div className="user-notice-footer">
                <span>📅 {new Date(notice.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric'
                })}</span>
                <span>👁 {notice.viewedBy?.length || 0} views</span>
                <span className="read-more">Read More →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserNoticeView;