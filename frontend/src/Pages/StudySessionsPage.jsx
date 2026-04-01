import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiCalendar, FiClock, FiExternalLink, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import FormInput from '../Components/FormInput';
import { api, getApiErrorMessage } from '../services/api';
import { getStoredTutorStudentId, setStoredTutorStudentId } from '../utils/tutorStorage';

const studentIdRegex = /^IT\d{8}$/i;

const parseSessionDate = (session) => {
  const dateValue = String(session?.date || '').trim();
  const timeValue = String(session?.time || '').trim();
  if (!dateValue || !timeValue) return null;

  const [year, month, day] = dateValue.split('-').map(Number);
  const [hour, minute] = timeValue.split(':').map(Number);
  if ([year, month, day, hour, minute].some(Number.isNaN)) return null;

  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const getSessionStatus = (session) => {
  const start = parseSessionDate(session);
  if (!start) return 'upcoming';

  const now = new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'previous';
};

export default function StudySessionsPage() {
  const location = useLocation();
  const stateStudentId = (location.state?.studentId || '').trim();

  const [studentIdInput, setStudentIdInput] = useState(() => stateStudentId || getStoredTutorStudentId());
  const [studentId, setStudentId] = useState(() => stateStudentId || getStoredTutorStudentId());
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (stateStudentId && studentIdRegex.test(stateStudentId)) {
      setStoredTutorStudentId(stateStudentId);
      setStudentIdInput(stateStudentId);
      setStudentId(stateStudentId);
    }
  }, [stateStudentId]);

  useEffect(() => {
    const loadSessions = async () => {
      const clean = (studentId || '').trim();
      if (!studentIdRegex.test(clean)) {
        setSessions([]);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const res = await api.get(`/api/sessions/tutor/${clean}`);
        setSessions(res.data?.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err));
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [studentId]);

  const applyStudentId = () => {
    const clean = studentIdInput.trim();
    if (!studentIdRegex.test(clean)) {
      setError('Enter a valid student ID (e.g. IT21504832).');
      return;
    }
    setStoredTutorStudentId(clean);
    setStudentId(clean);
    setError('');
  };

  const grouped = useMemo(() => {
    const buckets = { previous: [], ongoing: [], upcoming: [] };

    sessions.forEach((session) => {
      const status = getSessionStatus(session);
      buckets[status].push(session);
    });

    const sorter = (a, b) => {
      const da = parseSessionDate(a)?.getTime() || 0;
      const db = parseSessionDate(b)?.getTime() || 0;
      return da - db;
    };

    buckets.upcoming.sort(sorter);
    buckets.ongoing.sort(sorter);
    buckets.previous.sort((a, b) => sorter(b, a));

    return buckets;
  }, [sessions]);

  const SessionCard = ({ session }) => (
    <div className="p-4 rounded-xl border border-neutral-100 bg-white shadow-card hover:shadow-card-hover transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="font-gilroyBold text-neutral-800">{session.title}</p>
          <p className="text-sm text-neutral-500">{session.subject}</p>
        </div>
        {session.meetingLink ? (
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-gilroyMedium"
          >
            Join
            <FiExternalLink />
          </a>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <FiCalendar />
          {session.date}
        </span>
        <span className="inline-flex items-center gap-1">
          <FiClock />
          {session.time}
        </span>
      </div>

      {session.description ? (
        <p className="mt-2 text-sm text-neutral-600 line-clamp-2">{session.description}</p>
      ) : null}
    </div>
  );

  const SessionSection = ({ title, sessionsList, emptyText, accent }) => (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-gilroyBold text-neutral-800">{title}</h2>
        <span className={`text-xs px-2 py-1 rounded-full ${accent}`}>{sessionsList.length}</span>
      </div>

      {sessionsList.length === 0 ? (
        <p className="text-sm text-neutral-400 py-6 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {sessionsList.map((session) => (
            <SessionCard key={session._id} session={session} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="page-title">Study Sessions</h1>
          <p className="page-subtitle">Track your Previous, Ongoing, and Upcoming study sessions.</p>
        </div>
        <Link to="/dashboard" className="btn-secondary inline-flex items-center gap-2">
          <FiArrowLeft />
          Back to Dashboard
        </Link>
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
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
          <button type="button" className="btn-primary px-6 h-[42px]" onClick={applyStudentId}>
            Load Sessions
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger-50 text-danger-600 rounded-lg text-sm font-gilroyMedium mb-4">
          <FiAlertCircle />
          {error}
        </div>
      )}

      {loading ? (
        <div className="card text-center py-10 text-neutral-500">Loading sessions...</div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <SessionSection
            title="Upcoming Sessions"
            sessionsList={grouped.upcoming}
            emptyText="No upcoming sessions."
            accent="bg-primary-50 text-primary-600"
          />
          <SessionSection
            title="Ongoing Sessions"
            sessionsList={grouped.ongoing}
            emptyText="No sessions running right now."
            accent="bg-accent-50 text-accent-600"
          />
          <SessionSection
            title="Previous Sessions"
            sessionsList={grouped.previous}
            emptyText="No previous sessions yet."
            accent="bg-neutral-100 text-neutral-600"
          />
        </div>
      )}
    </div>
  );
}
