import { useEffect, useState } from 'react';
import axios from 'axios';
import './NoticeManagement.css';

const NoticeAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('all');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notices/analytics/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const filteredStats = stats?.viewStats?.filter(n => {
    if (reportType === 'all') return true;
    return n.target === reportType;
  });

  if (loading) return (
    <div className="analytics-container">
      <p className="loading-text">⏳ Loading analytics...</p>
    </div>
  );

  if (!stats) return (
    <div className="analytics-container">
      <p>No analytics data available.</p>
    </div>
  );

  return (
    <div className="analytics-container">
      <div className="section-header">
        <h3>📊 Analytics Dashboard</h3>
        <select
          className="filter-select"
          value={reportType}
          onChange={e => setReportType(e.target.value)}
        >
          <option value="all">All Reports</option>
          <option value="students">Students</option>
          <option value="tutors">Tutors</option>
          <option value="coordinators">📋 Coordinators</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="stat-card blue">
          <div className="stat-icon">📋</div>
          <h4>Total Notices</h4>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <h4>Published</h4>
          <p>{stats.published}</p>
        </div>
        <div className="stat-card secondary">
          <div className="stat-icon">🔔</div>
          <h4>Active</h4>
          <p>{stats.active}</p>
        </div>
        <div className="stat-card gray">
          <div className="stat-icon">🗂</div>
          <h4>Archived</h4>
          <p>{stats.archived}</p>
        </div>
      </div>

      {/* View Stats Table */}
      <div className="table-header">
        <h4>📋 Notice View Statistics</h4>
        <span className="table-count">{filteredStats?.length} notices</span>
      </div>

      {filteredStats?.length === 0 ? (
        <p className="no-notices">No data for this filter.</p>
      ) : (
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Notice Title</th>
                <th>Target Audience</th>
                <th>Total Views</th>
                <th>Date Created</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats?.map((n, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><strong>{n.title}</strong></td>
                  <td>
                    <span className={`table-badge ${n.target}`}>
                      {n.target === 'all' ? '🌐 All' :
                       n.target === 'students' ? '🎓 Students' : 
                       n.target === 'tutors' ? '👨‍🏫 Tutors' :
                       '📋 Coordinators'}

                    </span>
                  </td>
                  <td>
                    <span className="views-count">👁 {n.views}</span>
                  </td>
                  <td>{new Date(n.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}</td>
                  <td>
                    <span className="status-active">● Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NoticeAnalytics;