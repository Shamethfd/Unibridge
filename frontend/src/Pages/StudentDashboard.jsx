import React from 'react';
import { Link } from 'react-router-dom';
import { FiClipboard, FiBookOpen, FiMessageSquare, FiCalendar, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { getStudentStats, mockSessions, mockNotices } from '../data/mockData';

export default function StudentDashboard() {
  const stats = getStudentStats();

  const quickLinks = [
    { to: '/student/apply', label: 'Apply as Tutor', icon: <FiClipboard />, color: 'bg-primary-500' },
    { to: '/student/noticeboard', label: 'Notice Board', icon: <FiBookOpen />, color: 'bg-secondary-500' },
    { to: '/student/feedback', label: 'Give Feedback', icon: <FiMessageSquare />, color: 'bg-accent-500' },
  ];

  const statCards = [
    { label: 'My Applications', value: stats.totalApplications, icon: <FiClipboard />, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: 'Available Sessions', value: stats.activeSessions, icon: <FiCalendar />, color: 'text-secondary-500', bg: 'bg-secondary-50' },
    { label: 'Feedback Given', value: stats.feedbackGiven, icon: <FiMessageSquare />, color: 'text-accent-500', bg: 'bg-accent-50' },
    { label: 'Upcoming Sessions', value: stats.upcomingSessions, icon: <FiTrendingUp />, color: 'text-warning-500', bg: 'bg-warning-50' },
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Student Dashboard</h1>
        <p className="page-subtitle">Welcome back! Here's an overview of your tutoring activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
      <div className="mb-8">
        <h2 className="section-title">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickLinks.map((link, i) => (
            <Link
              key={i}
              to={link.to}
              className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-neutral-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className={`w-12 h-12 ${link.color} text-white rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                {link.icon}
              </div>
              <div className="flex-1">
                <p className="font-gilroyBold text-neutral-800">{link.label}</p>
                <p className="text-xs text-neutral-400 font-gilroyRegular">Click to go</p>
              </div>
              <FiArrowRight className="text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-gilroyBold text-neutral-800">Upcoming Sessions</h3>
            <Link to="/student/noticeboard" className="text-sm text-secondary-500 font-gilroyMedium hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {mockSessions.slice(0, 3).map((session) => (
              <div key={session._id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 hover:bg-primary-50/50 transition-colors">
                <div className="w-10 h-10 bg-secondary-100 text-secondary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiCalendar />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-gilroyMedium text-neutral-800 text-sm truncate">{session.title}</p>
                  <p className="text-xs text-neutral-400 font-gilroyRegular">
                    {session.tutorName} • {session.date} at {session.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-gilroyBold text-neutral-800">Recent Notices</h3>
            <Link to="/student/noticeboard" className="text-sm text-secondary-500 font-gilroyMedium hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {mockNotices.slice(0, 3).map((notice) => (
              <div key={notice._id} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 hover:bg-primary-50/50 transition-colors">
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiBookOpen />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-gilroyMedium text-neutral-800 text-sm truncate">{notice.title}</p>
                  <p className="text-xs text-neutral-400 font-gilroyRegular line-clamp-2">
                    {notice.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
