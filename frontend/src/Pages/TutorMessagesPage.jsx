import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiCheck, FiInbox, FiAlertCircle } from 'react-icons/fi';
import FormInput from '../Components/FormInput';
import { api, getApiErrorMessage } from '../services/api';
import { getStoredTutorStudentId, setStoredTutorStudentId } from '../utils/tutorStorage';

const studentIdRegex = /^IT\d{8}$/i;

export default function TutorMessagesPage() {
  const [studentId, setStudentId] = useState(() => getStoredTutorStudentId());
  const [inputId, setInputId] = useState(() => getStoredTutorStudentId());
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (sid) => {
    const clean = (sid || '').trim();
    if (!studentIdRegex.test(clean)) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/api/tutor-notifications/student/${clean}`);
      setItems(res.data?.data || []);
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(studentId);
  }, [studentId, load]);

  const applyStudentId = () => {
    const clean = inputId.trim();
    if (!studentIdRegex.test(clean)) {
      setError('Enter a valid student ID (e.g. IT21504832) to load your messages.');
      return;
    }
    setStoredTutorStudentId(clean);
    setStudentId(clean);
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/api/tutor-notifications/${id}/read`);
      setItems((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const markAllRead = async () => {
    const clean = studentId.trim();
    if (!clean) return;
    try {
      await api.patch(`/api/tutor-notifications/student/${clean}/read-all`);
      setItems((prev) => prev.map((n) => ({ ...n, read: true, readAt: n.readAt || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Tutor messages</h1>
          <p className="page-subtitle mb-0">
            When the coordinator approves your application, you will see &quot;You are now a tutor&quot; here.
          </p>
        </div>
        <Link to="/tutor" className="text-sm text-secondary-500 font-gilroyMedium hover:underline self-start">
          ← Back to tutor dashboard
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <FormInput
              label="Your student ID"
              name="studentId"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              placeholder="e.g., IT21504832"
              inputFilter="studentId"
              maxLength={10}
            />
            <p className="text-xs text-neutral-400 font-gilroyRegular -mt-2 mb-0">
              Same ID you used when applying. You can also enter it here if you applied on another device.
            </p>
          </div>
          <button type="button" className="btn-primary px-6 h-[42px]" onClick={applyStudentId}>
            Load messages
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger-50 text-danger-600 rounded-lg text-sm font-gilroyMedium mb-4">
          <FiAlertCircle />
          {error}
        </div>
      )}

      {studentIdRegex.test(studentId) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-neutral-600">
            <FiBell className="text-primary-500" />
            <span className="font-gilroyMedium">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </span>
          </div>
          {unreadCount > 0 && (
            <button type="button" onClick={markAllRead} className="text-sm text-secondary-600 font-gilroyMedium hover:underline inline-flex items-center gap-1">
              <FiCheck size={16} />
              Mark all read
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="card text-center py-12 text-neutral-500">Loading…</div>
      ) : !studentIdRegex.test(studentId) ? (
        <div className="card text-center py-12 text-neutral-500">
          Enter your student ID and tap Load messages.
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <FiInbox className="mx-auto text-neutral-300 mb-3" size={40} />
          <p className="text-neutral-500 font-gilroyRegular">No messages yet. After the coordinator acts on your application, you will see updates here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((n) => (
            <div
              key={n._id}
              className={`card border-l-4 ${n.read ? 'border-neutral-200 bg-white' : 'border-primary-500 bg-primary-50/40'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <p className="font-gilroyBold text-neutral-800">{n.title}</p>
                  <p className="text-xs text-neutral-400 font-gilroyRegular">
                    {formatDate(n.createdAt)}
                    {n.type === 'application_approved' && (
                      <span className="ml-2 text-accent-600">Approved</span>
                    )}
                    {n.type === 'application_rejected' && (
                      <span className="ml-2 text-danger-600">Not approved</span>
                    )}
                  </p>
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markRead(n._id)}
                    className="text-sm text-primary-600 font-gilroyMedium hover:underline self-start"
                  >
                    Mark read
                  </button>
                )}
              </div>
              <p className="text-sm text-neutral-600 font-gilroyRegular mt-3 leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
