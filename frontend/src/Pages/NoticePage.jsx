import { useState } from 'react';
import CreateNotice from '../Components/NoticeManagement/CreateNotice';
import NoticeList from '../Components/NoticeManagement/NoticeList';
import NoticeAnalutics from '../Components/NoticeManagement/NoticeAnalutics';
import SearchFilter from '../Components/Search/SearchFilter';
import './NoticePage.css';

const NoticePage = () => {
  const [refresh, setRefresh] = useState(0);
  const [activeSection, setActiveSection] = useState('notices');

  const sections = [
    { id: 'notices',   label: '📢 Notices',   icon: '📢' },
    { id: 'search',    label: '🔍 Search',    icon: '🔍' },
    { id: 'analytics', label: '📊 Analytics', icon: '📊' },
  ];

  return (
    <div className="notice-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Notice & Analytics Management</h1>
          <p>Create, manage and track notices for students and tutors</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="page-nav">
        {sections.map(s => (
          <button
            key={s.id}
            className={`nav-btn ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="page-content">
        {activeSection === 'notices' && (
          <>
            <CreateNotice onCreated={() => setRefresh(r => r + 1)} />
            <NoticeList refresh={refresh} />
          </>
        )}
        {activeSection === 'search' && <SearchFilter />}
        {activeSection === 'analytics' && <NoticeAnalutics />}
      </div>
    </div>
  );
};

export default NoticePage;