import React, { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiCalendar, FiExternalLink, FiBookOpen, FiBell } from 'react-icons/fi';
import { api, getApiErrorMessage } from '../services/api';

export default function NoticeBoardPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notices, setNotices] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [noticesRes, sessionsRes] = await Promise.all([
          api.get('/api/notices'),
          api.get('/api/sessions'),
        ]);
        setNotices(noticesRes.data?.data || []);
        setSessions(sessionsRes.data?.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tabs = [
    { key: 'all', label: 'All', icon: <FiBookOpen /> },
    { key: 'notices', label: 'Notices', icon: <FiBell /> },
    { key: 'sessions', label: 'Sessions', icon: <FiCalendar /> },
  ];

  const filteredNotices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return notices.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        (n.type || '').toLowerCase().includes(q)
    );
  }, [notices, searchQuery]);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.tutorName.toLowerCase().includes(q)
    );
  }, [sessions, searchQuery]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Notice Board</h1>
        <p className="page-subtitle">Stay updated with announcements and available study sessions.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notices, sessions, tutors..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center bg-neutral-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-gilroyMedium transition-all
                  ${activeTab === tab.key
                    ? 'bg-white text-primary-500 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-12">Loading notices and sessions...</div>
      ) : error ? (
        <div className="card text-center py-12 text-danger-600 font-gilroyMedium">{error}</div>
      ) : (
        <>
          {/* Notices Section */}
          {(activeTab === 'all' || activeTab === 'notices') && (
            <div className="mb-8">
              <h2 className="section-title flex items-center gap-2">
                <FiBell className="text-primary-500" />
                Announcements
                <span className="text-sm font-gilroyRegular text-neutral-400">({filteredNotices.length})</span>
              </h2>
              {filteredNotices.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-neutral-400 font-gilroyRegular">No notices match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNotices.map((notice) => (
                    <div key={notice._id} className="card group hover:-translate-y-0.5">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notice.type === 'tutor'
                              ? 'bg-primary-100 text-primary-500'
                              : 'bg-secondary-100 text-secondary-500'
                          }`}
                        >
                          {notice.type === 'tutor' ? <FiBookOpen /> : <FiCalendar />}
                        </div>
                        <div className="flex-1">
                          <p className="font-gilroyBold text-neutral-800 mb-1">{notice.title}</p>
                          <p className="text-sm text-neutral-500 font-gilroyRegular leading-relaxed mb-2">
                            {notice.message}
                          </p>
                          <p className="text-xs text-neutral-400 font-gilroyRegular">
                            {formatDate(notice.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sessions Section */}
          {(activeTab === 'all' || activeTab === 'sessions') && (
            <div>
              <h2 className="section-title flex items-center gap-2">
                <FiCalendar className="text-secondary-500" />
                Available Study Sessions
                <span className="text-sm font-gilroyRegular text-neutral-400">({filteredSessions.length})</span>
              </h2>
              {filteredSessions.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-neutral-400 font-gilroyRegular">No sessions match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSessions.map((session) => (
                    <div key={session._id} className="card group hover:-translate-y-0.5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-gilroyBold text-neutral-800 text-lg">{session.title}</h3>
                          <p className="text-sm text-secondary-500 font-gilroyMedium">{session.subject}</p>
                        </div>
                        <span className="badge bg-secondary-50 text-secondary-600">
                          <FiCalendar className="mr-1" size={12} />
                          {session.date}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-500 font-gilroyRegular mb-4 leading-relaxed">
                        {session.description}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <div className="text-sm">
                          <span className="text-neutral-400 font-gilroyRegular">Tutor: </span>
                          <span className="text-neutral-700 font-gilroyMedium">{session.tutorName}</span>
                          <span className="text-neutral-300 mx-2">•</span>
                          <span className="text-neutral-400 font-gilroyRegular">{session.time}</span>
                        </div>
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-white bg-secondary-500 hover:bg-secondary-600 px-4 py-1.5 rounded-lg font-gilroyMedium transition-colors"
                        >
                          <FiExternalLink size={14} />
                          Join
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
