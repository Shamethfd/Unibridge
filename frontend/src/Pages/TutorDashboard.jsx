import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiStar, FiMessageSquare, FiArrowRight, FiPlus, FiBell, FiAlertCircle } from 'react-icons/fi';
import StarRating from '../Components/StarRating';
import FormInput from '../Components/FormInput';
import { api, getApiErrorMessage, getTotalUnreadCount } from '../services/api';
import { getStoredTutorStudentId, setStoredTutorStudentId } from '../utils/tutorStorage';

const studentIdRegex = /^IT\d{8}$/i;

export default function TutorDashboard() {
  const [studentIdInput, setStudentIdInput] = useState(() => getStoredTutorStudentId());
  const [studentId, setStudentId] = useState(() => getStoredTutorStudentId());

  const [tutorName, setTutorName] = useState('');
  const [sessions, setSessions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadChatUnread = useCallback(async () => {
    try {
      const res = await getTotalUnreadCount();
      setChatUnreadCount(res?.data?.totalUnread ?? 0);
    } catch {
      setChatUnreadCount(0);
    }
  }, []);

  const loadData = useCallback(async (sid) => {
    const clean = (sid || '').trim();
    if (!studentIdRegex.test(clean)) return;

    try {
      setLoading(true);
      setError('');

      const [tutorRes, notifRes, sessRes] = await Promise.all([
        api.get(`/api/tutors/by-student-id/${clean}`).catch(() => ({ data: null })),
        api.get(`/api/tutor-notifications/student/${clean}`).catch(() => ({ data: { data: [], unreadCount: 0 } })),
        api.get(`/api/sessions/tutor/${clean}`).catch(() => ({ data: { data: [] } })),
      ]);

      const tutor = tutorRes?.data?.data;
      setTutorName(tutor?.studentName || '');
      setSessions(sessRes?.data?.data || []);
      setUnreadMessages(notifRes?.data?.unreadCount ?? 0);

      if (tutor?._id) {
        const fbRes = await api.get(`/api/feedback/tutor/${tutor._id}`).catch(() => ({ data: {} }));
        const list = fbRes?.data?.feedbacks || [];
        setFeedbacks(list.slice(0, 5));
        setAvgRating(fbRes?.data?.averageRating ?? 0);
        setFeedbackCount(fbRes?.data?.count ?? list.length);
      } else {
        setFeedbacks([]);
        setAvgRating(0);
        setFeedbackCount(0);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (studentIdRegex.test(studentId)) {
      loadData(studentId);
    }
  }, [studentId, loadData]);

  useEffect(() => {
    loadChatUnread();
    const timer = setInterval(loadChatUnread, 10000);
    return () => clearInterval(timer);
  }, [loadChatUnread]);

  const applyId = () => {
    const clean = studentIdInput.trim();
    if (!studentIdRegex.test(clean)) {
      setError('Enter a valid student ID (e.g. IT21504832).');
      return;
    }
    setStoredTutorStudentId(clean);
    setStudentId(clean);
    setError('');
  };

  const statCards = [
    { label: 'Sessions created', value: sessions.length, icon: <FiCalendar />, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: 'Average rating', value: avgRating ? avgRating.toFixed(1) : '—', icon: <FiStar />, color: 'text-warning-500', bg: 'bg-warning-50' },
    { label: 'Total feedback', value: feedbackCount, icon: <FiMessageSquare />, color: 'text-accent-500', bg: 'bg-accent-50' },
  ];

  return (
    <div className="page-container animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="page-title">Tutor dashboard</h1>
          <p className="page-subtitle mb-0">
            {tutorName ? (
              <>Welcome back, <strong>{tutorName}</strong>. Manage sessions and messages.</>
            ) : (
              <>Enter your student ID to load your tutor profile and messages.</>
            )}
          </p>
        </div>
        <Link to="/tutor/create-session" className="btn-primary inline-flex items-center gap-2">
          <FiPlus />
          New session
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <FormInput
              label="Your student ID"
              name="studentId"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              placeholder="e.g., IT21504832"
              inputFilter="studentId"
              maxLength={10}
            />
          </div>
          <button type="button" className="btn-primary px-6 h-[42px]" onClick={applyId}>
            Load my data
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger-50 text-danger-600 rounded-lg text-sm font-gilroyMedium mb-4">
          <FiAlertCircle />
          {error}
        </div>
      )}

      {studentIdRegex.test(studentId) && unreadMessages > 0 && (
        <Link
          to="/tutor/messages"
          className="block mb-6 p-4 rounded-xl border border-primary-200 bg-primary-50/80 hover:bg-primary-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center">
              <FiBell />
            </div>
            <div className="flex-1">
              <p className="font-gilroyBold text-neutral-800">You have {unreadMessages} new message{unreadMessages !== 1 ? 's' : ''}</p>
              <p className="text-sm text-neutral-500">Open Messages to read &quot;You are now a tutor&quot; and other updates.</p>
            </div>
            <FiArrowRight className="text-primary-500" />
          </div>
        </Link>
      )}

      {loading && <p className="text-neutral-400 text-sm mb-4">Loading…</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="card animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-gilroyMedium text-neutral-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <p className={`text-3xl font-gilroyHeavy ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/student/messages"
          className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-100 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
        >
          <div className="relative w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <FiBell />
            {chatUnreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 rounded-full bg-danger-500 text-white text-[11px] leading-5 text-center font-gilroyBold">
                {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="font-gilroyBold text-neutral-800">Student chats</p>
            <p className="text-xs text-neutral-400">
              {chatUnreadCount > 0
                ? `${chatUnreadCount} unread message${chatUnreadCount !== 1 ? 's' : ''}`
                : 'No unread student messages'}
            </p>
          </div>
          <FiArrowRight className="text-neutral-300 group-hover:text-primary-500 transition-colors" />
        </Link>
        <Link
          to="/tutor/create-session"
          className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-100 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 bg-secondary-500 text-white rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <FiCalendar />
          </div>
          <div className="flex-1">
            <p className="font-gilroyBold text-neutral-800">Create study session</p>
            <p className="text-xs text-neutral-400">After approval, schedule sessions here</p>
          </div>
          <FiArrowRight className="text-neutral-300 group-hover:text-secondary-500 transition-colors" />
        </Link>
        <Link
          to="/tutor/ratings"
          className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-100 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 sm:col-span-2"
        >
          <div className="w-12 h-12 bg-warning-500 text-white rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <FiStar />
          </div>
          <div className="flex-1">
            <p className="font-gilroyBold text-neutral-800">My ratings</p>
            <p className="text-xs text-neutral-400">Feedback from students</p>
          </div>
          <FiArrowRight className="text-neutral-300 group-hover:text-warning-500 transition-colors" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-gilroyBold text-neutral-800 mb-4">My sessions</h3>
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s._id} className="p-3 rounded-lg bg-neutral-50 hover:bg-primary-50/50 transition-colors">
                <p className="font-gilroyMedium text-neutral-800">{s.title}</p>
                <p className="text-sm text-neutral-500">{s.subject}</p>
                <p className="text-xs text-neutral-400 mt-1">
                  {s.date} at {s.time}
                </p>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-neutral-400 text-sm text-center py-4">No sessions yet. Create one after you are approved.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-gilroyBold text-neutral-800">Recent feedback</h3>
            <Link to="/tutor/ratings" className="text-sm text-secondary-500 font-gilroyMedium hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <div key={fb._id} className="p-3 rounded-lg bg-neutral-50">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-gilroyMedium text-neutral-800 text-sm">{fb.studentName}</p>
                  <StarRating value={fb.rating} readOnly size={14} />
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2">{fb.message}</p>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <p className="text-neutral-400 text-sm text-center py-4">No feedback yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
