import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateNotice from './CreateNotice';
import NoticeList from './NoticeList';
import NoticeAnalytics from './NoticeAnalytics';
import NoticeRequestList from './NoticeRequestList';
import './NoticeManagement.css';
import '../../Pages/NoticePage.css';

const NoticeManagementDashboard = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (!token || !userRaw) {
      navigate('/admin-login', { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(userRaw);
      if (!['admin', 'noticeManager'].includes(parsed.role)) {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      navigate('/admin-login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="notice-page notice-management-page" style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      <div className="page-header">
        <div className="header-left">
          <h1>Admin Notice Management</h1>
          <p>Create notices, manage all posts, and review notice analytics</p>
        </div>
      </div>

      <div className="page-nav">
        <button className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
          CreateNotice
        </button>
        <button className={`nav-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
          NoticeList
        </button>
        <button className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          NoticeAnalytics
        </button>
        <button className={`nav-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
    📋   Notice Requests
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'create' && <CreateNotice onCreated={() => setRefresh((r) => r + 1)} />}
        {activeTab === 'list' && <NoticeList refresh={refresh} />}
        {activeTab === 'analytics' && <NoticeAnalytics />}
        {activeTab === 'requests' && <NoticeRequestList />}

      </div>
    </div>
  );
};

export default NoticeManagementDashboard;
