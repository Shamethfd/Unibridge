import React, { useState } from 'react';
import { FiUsers, FiCheck, FiX, FiClock, FiCheckCircle, FiXCircle, FiFilter } from 'react-icons/fi';
import StatusBadge from '../Components/StatusBadge';
import { mockApplications, getCoordinatorStats } from '../data/mockData';

export default function CoordinatorDashboard() {
  const initialStats = getCoordinatorStats();
  const [applications, setApplications] = useState(mockApplications);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(initialStats);

  const filteredApps = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter);

  const handleAction = (id, action) => {
    setApplications(prev =>
      prev.map(app =>
        app._id === id
          ? { ...app, status: action, decisionBy: 'Coordinator', decisionAt: new Date().toISOString() }
          : app
      )
    );
    // Update stats
    const updated = applications.map(app =>
      app._id === id ? { ...app, status: action } : app
    );
    setStats({
      total: updated.length,
      pending: updated.filter(a => a.status === 'pending').length,
      approved: updated.filter(a => a.status === 'approved').length,
      rejected: updated.filter(a => a.status === 'rejected').length,
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: <FiUsers />, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: 'Pending', value: stats.pending, icon: <FiClock />, color: 'text-warning-500', bg: 'bg-warning-50' },
    { label: 'Approved', value: stats.approved, icon: <FiCheckCircle />, color: 'text-accent-500', bg: 'bg-accent-50' },
    { label: 'Rejected', value: stats.rejected, icon: <FiXCircle />, color: 'text-danger-500', bg: 'bg-danger-50' },
  ];

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">Coordinator Dashboard</h1>
        <p className="page-subtitle">Review and manage tutor applications.</p>
      </div>

      {/* Stats */}
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <FiFilter className="text-neutral-400" />
        <div className="flex items-center bg-neutral-100 rounded-lg p-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-gilroyMedium transition-all
                ${filter === tab.key
                  ? 'bg-white text-primary-500 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-neutral-400 font-gilroyRegular ml-2">
          {filteredApps.length} application{filteredApps.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <div className="card text-center py-12">
          <FiUsers className="text-neutral-300 mx-auto mb-3" size={40} />
          <p className="text-neutral-400 font-gilroyRegular">No applications found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div key={app._id} className="card animate-fade-in-up">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-gilroyBold text-sm">
                      {app.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-gilroyBold text-neutral-800">{app.studentName}</p>
                      <p className="text-xs text-neutral-400 font-gilroyRegular">{app.studentId} • {app.email}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="ml-13 pl-13">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <div>
                        <span className="text-xs text-neutral-400 font-gilroyMedium">Subject:</span>
                        <p className="text-sm text-neutral-700 font-gilroyMedium">{app.subject}</p>
                      </div>
                      <div>
                        <span className="text-xs text-neutral-400 font-gilroyMedium">Applied:</span>
                        <p className="text-sm text-neutral-700 font-gilroyMedium">{formatDate(app.createdAt)}</p>
                      </div>
                    </div>
                    {app.experience && (
                      <div className="mb-2">
                        <span className="text-xs text-neutral-400 font-gilroyMedium">Experience:</span>
                        <p className="text-sm text-neutral-600 font-gilroyRegular">{app.experience}</p>
                      </div>
                    )}
                    {app.description && (
                      <div>
                        <span className="text-xs text-neutral-400 font-gilroyMedium">Description:</span>
                        <p className="text-sm text-neutral-600 font-gilroyRegular">{app.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {app.status === 'pending' && (
                  <div className="flex items-center gap-2 md:flex-col">
                    <button
                      onClick={() => handleAction(app._id, 'approved')}
                      className="btn-success inline-flex items-center gap-1.5 text-sm px-4 py-2"
                    >
                      <FiCheck size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(app._id, 'rejected')}
                      className="btn-danger inline-flex items-center gap-1.5 text-sm px-4 py-2"
                    >
                      <FiX size={16} />
                      Reject
                    </button>
                  </div>
                )}

                {app.status !== 'pending' && app.decisionBy && (
                  <div className="text-right text-xs text-neutral-400">
                    <p>Decision by: <span className="font-gilroyMedium">{app.decisionBy}</span></p>
                    {app.decisionAt && <p>{formatDate(app.decisionAt)}</p>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
