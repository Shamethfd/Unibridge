import React, { useEffect, useMemo, useState } from 'react';
import { FiUsers, FiCheck, FiX, FiClock, FiCheckCircle, FiXCircle, FiFilter } from 'react-icons/fi';
import StatusBadge from '../Components/StatusBadge';
import { api, getApiErrorMessage } from '../services/api';

export default function CoordinatorDashboard() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decisionBy, setDecisionBy] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/api/tutor-applications');
        setApplications(res.data?.data || []);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApps = useMemo(() => {
    return filter === 'all' ? applications : applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  const stats = useMemo(() => {
    const total = applications.length;
    return {
      total,
      pending: applications.filter((a) => a.status === 'pending').length,
      approved: applications.filter((a) => a.status === 'approved').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
    };
  }, [applications]);

  const handleAction = (id, action) => {
    (async () => {
      try {
        setError('');
        const decisionByTrimmed = decisionBy.trim();
        const payload = decisionByTrimmed ? { decisionBy: decisionByTrimmed } : {};

        const endpoint = action === 'approved' ? 'approve' : 'reject';
        const res = await api.patch(`/api/tutor-applications/${id}/${endpoint}`, payload);

        const updatedApplication =
          action === 'approved' ? res.data?.data?.application : res.data?.data;

        setApplications((prev) =>
          prev.map((app) => (app._id === id ? updatedApplication : app))
        );
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    })();
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
        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1">
            <label className="text-sm font-gilroyMedium text-neutral-600">
              Decision by (optional)
            </label>
            <input
              value={decisionBy}
              onChange={(e) => setDecisionBy(e.target.value)}
              placeholder="e.g., Dr. Silva"
              className="input-field"
            />
          </div>
        </div>
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
      {loading ? (
        <div className="card text-center py-12">Loading applications...</div>
      ) : error ? (
        <div className="card text-center py-12 text-danger-600 font-gilroyMedium">{error}</div>
      ) : filteredApps.length === 0 ? (
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
