import { useState, useEffect } from 'react';
import axios from 'axios';
import NoticeCard from './NoticeCard';
import './NoticeManagement.css';

const NoticeList = ({ refresh }) => {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/notices', {
          params: {
            search,
            target: filter !== 'all' ? filter : '',
            archived: showArchived,
          },
        });
        setNotices(res.data);
      } catch (err) {
        console.error('Error fetching notices:', err);
      }
      setLoading(false);
    };
    fetchNotices();
  }, [refresh, search, filter, showArchived]);

  return (
    <div className="notice-list-container">
      <div className="section-header">
        <h3>📋 {showArchived ? 'Archived Notices' : 'Active Notices'}
          <span className="count-badge">{notices.length}</span>
        </h3>
        <button
          className={`btn-toggle ${showArchived ? 'active' : ''}`}
          onClick={() => setShowArchived(!showArchived)}
        >
          {showArchived ? '📂 Show Active' : '🗂 Show Archived'}
        </button>
      </div>

      <div className="notice-filters">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search notices by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          {search && (
            <button className="clear-search" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="all">🌐 All Audiences</option>
          <option value="students">🎓 Students</option>
          <option value="tutors">👨‍🏫 Tutors</option>
          <option value="coordinators">📋 Coordinators</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>⏳ Loading notices...</p>
        </div>
      ) : notices.length === 0 ? (
        <div className="empty-state">
          <p>📭 No notices found.</p>
          <small>
            {search ? `No results for "${search}"` : 'Create your first notice above!'}
          </small>
        </div>
      ) : (
        <div className="notices-grid">
          {notices.map((notice) => (
            <NoticeCard key={notice._id} notice={notice} onUpdate={() => {
              const fetchNotices = async () => {
                const res = await axios.get('http://localhost:5000/api/notices', {
                  params: { search, target: filter !== 'all' ? filter : '', archived: showArchived },
                });
                setNotices(res.data);
              };
              fetchNotices();
            }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeList;