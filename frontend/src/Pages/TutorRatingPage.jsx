import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiStar, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import StarRating from '../Components/StarRating';
import FormInput from '../Components/FormInput';
import { api, getApiErrorMessage } from '../services/api';
import { getStoredTutorStudentId, setStoredTutorStudentId } from '../utils/tutorStorage';

export default function TutorRatingPage() {
  const studentIdRegex = /^IT\d{8}$/i;
  const location = useLocation();
  const stateStudentId = (location.state?.studentId || '').trim();

  const [studentIdInput, setStudentIdInput] = useState(() => stateStudentId || getStoredTutorStudentId());
  const [studentId, setStudentId] = useState(() => stateStudentId || getStoredTutorStudentId());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [averageRating, setAverageRating] = useState(0);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [sessionsCreated, setSessionsCreated] = useState(0);
  const [tutorFeedback, setTutorFeedback] = useState([]);

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

  const loadAll = useCallback(async (sid) => {
    const clean = (sid || '').trim();
    if (!studentIdRegex.test(clean)) return;

    try {
      setLoading(true);
      setError('');

      const tutorRes = await api.get(`/api/tutors/by-student-id/${clean}`);
      const tutor = tutorRes.data?.data;

      const [sessionsRes, feedbackRes] = await Promise.all([
        api.get(`/api/sessions/tutor/${clean}`),
        api.get(`/api/feedback/tutor/${tutor._id}`),
      ]);

      const list = feedbackRes.data?.feedbacks || feedbackRes.data?.data?.feedbacks || [];
      setTutorFeedback(list);
      setAverageRating(feedbackRes.data?.averageRating ?? 0);
      setTotalFeedback(feedbackRes.data?.count ?? list.length);
      setSessionsCreated(sessionsRes.data?.data?.length ?? sessionsRes.data?.data?.length ?? 0);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setTutorFeedback([]);
      setAverageRating(0);
      setTotalFeedback(0);
      setSessionsCreated(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (stateStudentId && studentIdRegex.test(stateStudentId)) {
      setStoredTutorStudentId(stateStudentId);
      setStudentIdInput(stateStudentId);
      setStudentId(stateStudentId);
    }
  }, [stateStudentId]);

  useEffect(() => {
    if (studentIdRegex.test(studentId)) {
      loadAll(studentId);
    }
  }, [studentId, loadAll]);

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

  const starRounded = Math.round(averageRating);

  const distribution = useMemo(() => {
    const counts = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: tutorFeedback.filter((f) => f.rating === star).length,
    }));
    const total = tutorFeedback.length || 1;
    return counts.map((c) => ({ ...c, pct: (c.count / total) * 100 }));
  }, [tutorFeedback]);

  return (
    <div className="page-container animate-fade-in">
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
            Load my ratings
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">My Ratings & Feedback</h1>
        <p className="page-subtitle">View all feedback received from students.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger-50 text-danger-600 rounded-lg text-sm font-gilroyMedium mb-4">
          <FiAlertCircle />
          {error}
        </div>
      )}

      {/* Rating Summary */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="text-center">
            <p className="text-5xl font-gilroyHeavy text-primary-500 mb-1">{averageRating}</p>
            <StarRating value={starRounded} readOnly size={20} />
            <p className="text-sm text-neutral-400 font-gilroyRegular mt-2">Average Rating</p>
          </div>
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-xl text-center">
                <p className="text-2xl font-gilroyBold text-neutral-800">{totalFeedback}</p>
                <p className="text-xs text-neutral-400 font-gilroyMedium uppercase">Total Feedback</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl text-center">
                <p className="text-2xl font-gilroyBold text-neutral-800">{sessionsCreated}</p>
                <p className="text-xs text-neutral-400 font-gilroyMedium uppercase">Sessions</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="mt-4 space-y-2">
              {distribution.map((d) => {
                return (
                  <div key={d.star} className="flex items-center gap-2">
                    <span className="text-xs font-gilroyMedium text-neutral-500 w-4">{d.star}</span>
                    <FiStar size={12} className="text-warning-400" />
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning-400 rounded-full transition-all duration-500"
                        style={{ width: `${d.pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 w-6 text-right">{d.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <h2 className="section-title flex items-center gap-2">
        <FiMessageSquare className="text-primary-500" />
        All Feedback ({tutorFeedback.length})
      </h2>

      {loading ? (
        <div className="card text-center py-12 text-neutral-500">Loading…</div>
      ) : tutorFeedback.length === 0 ? (
        <div className="card text-center py-12">
          <FiMessageSquare className="text-neutral-300 mx-auto mb-3" size={40} />
          <p className="text-neutral-400 font-gilroyRegular">No feedback received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tutorFeedback.map((fb) => (
            <div key={fb._id} className="card animate-fade-in-up">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-gilroyBold text-neutral-800">{fb.studentName}</p>
                  <p className="text-xs text-neutral-400 font-gilroyRegular">
                    {fb.sessionId?.title || 'Session'} • {formatDate(fb.createdAt)}
                  </p>
                </div>
                <StarRating value={fb.rating} readOnly size={16} />
              </div>
              <p className="text-sm text-neutral-600 font-gilroyRegular leading-relaxed">
                {fb.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
