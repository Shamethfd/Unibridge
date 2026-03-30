import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiStar, FiMessageSquare, FiArrowRight, FiPlus } from 'react-icons/fi';
import { getTutorStats, mockSessions, mockFeedback } from '../data/mockData';
import StarRating from '../Components/StarRating';

export default function TutorDashboard() {
  const stats = getTutorStats('tutor001');
  const tutorSessions = mockSessions.filter(s => s.tutorId === 'tutor001');
  const tutorFeedback = mockFeedback.filter(f => f.tutorId === 'tutor001');

  const statCards = [
    { label: 'Sessions Created', value: stats.sessionsCreated, icon: <FiCalendar />, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: 'Average Rating', value: stats.averageRating, icon: <FiStar />, color: 'text-warning-500', bg: 'bg-warning-50' },
    { label: 'Total Feedback', value: stats.totalFeedback, icon: <FiMessageSquare />, color: 'text-accent-500', bg: 'bg-accent-50' },
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="page-title">Tutor Dashboard</h1>
          <p className="page-subtitle mb-0">Welcome back, Nimali! Manage your sessions and view feedback.</p>
        </div>
        <Link to="/tutor/create-session" className="btn-primary inline-flex items-center gap-2">
          <FiPlus />
          New Session
        </Link>
      </div>

      {/* Stats */}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          to="/tutor/create-session"
          className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-100 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <FiCalendar />
          </div>
          <div className="flex-1">
            <p className="font-gilroyBold text-neutral-800">Create Study Session</p>
            <p className="text-xs text-neutral-400">Schedule a new tutoring session</p>
          </div>
          <FiArrowRight className="text-neutral-300 group-hover:text-primary-500 transition-colors" />
        </Link>
        <Link
          to="/tutor/ratings"
          className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-100 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
        >
          <div className="w-12 h-12 bg-warning-500 text-white rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <FiStar />
          </div>
          <div className="flex-1">
            <p className="font-gilroyBold text-neutral-800">View My Ratings</p>
            <p className="text-xs text-neutral-400">See feedback from students</p>
          </div>
          <FiArrowRight className="text-neutral-300 group-hover:text-primary-500 transition-colors" />
        </Link>
      </div>

      {/* Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Sessions */}
        <div className="card">
          <h3 className="text-lg font-gilroyBold text-neutral-800 mb-4">My Sessions</h3>
          <div className="space-y-3">
            {tutorSessions.map((s) => (
              <div key={s._id} className="p-3 rounded-lg bg-neutral-50 hover:bg-primary-50/50 transition-colors">
                <p className="font-gilroyMedium text-neutral-800">{s.title}</p>
                <p className="text-sm text-neutral-500">{s.subject}</p>
                <p className="text-xs text-neutral-400 mt-1">{s.date} at {s.time}</p>
              </div>
            ))}
            {tutorSessions.length === 0 && (
              <p className="text-neutral-400 text-sm text-center py-4">No sessions created yet.</p>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-gilroyBold text-neutral-800">Recent Feedback</h3>
            <Link to="/tutor/ratings" className="text-sm text-secondary-500 font-gilroyMedium hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {tutorFeedback.slice(0, 3).map((fb) => (
              <div key={fb._id} className="p-3 rounded-lg bg-neutral-50">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-gilroyMedium text-neutral-800 text-sm">{fb.studentName}</p>
                  <StarRating value={fb.rating} readOnly size={14} />
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2">{fb.message}</p>
              </div>
            ))}
            {tutorFeedback.length === 0 && (
              <p className="text-neutral-400 text-sm text-center py-4">No feedback received yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
