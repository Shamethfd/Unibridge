import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getModules } from '../services/api';
import './HomePage.css';

const getDemandLevel = (count) => {
  if (count >= 5) return { level: 'high', label: '🔥 High Demand', cls: 'high' };
  if (count >= 2) return { level: 'medium', label: '⚡ Medium', cls: 'medium' };
  return { level: 'low', label: '❄️ Low', cls: 'low' };
};

const MODULE_ICONS = ['📡', '🗄️', '⚙️', '🔐', '🌐', '📊', '🤖', '🖥️', '📱', '🔬'];

const ModulePage = () => {
  const navigate = useNavigate();
  const { semesterId, semesterName } = useParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => { fetchModules(); }, [semesterId]);

  const fetchModules = async () => {
    setLoading(true);
    try {
      const res = await getModules(semesterId);
      setModules(res.data);
    } catch {
      toast.error('Failed to load modules');
    } finally { setLoading(false); }
  };

  const decoded = decodeURIComponent(semesterName);

  const filtered = modules
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.requestCount - a.requestCount;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="nav-brand"><span className="brand-icon">🎓</span><span className="brand-name">UniConnect</span></div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <button className="nav-btn" onClick={() => navigate('/faculties')}>Courses</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div className="breadcrumb">
            <a href="/">Home</a><span>/</span>
            <a href="/faculties">Faculties</a><span>/</span>
            <span>{decoded}</span><span>/</span><span>Modules</span>
          </div>
          <h1 className="page-title">{decoded} — Modules</h1>
          <p className="page-subtitle">Select a module to submit or view study requests</p>
        </div>

        {/* Search & Filter */}
        <div className="search-bar">
          <input
            className="search-input"
            placeholder="🔍  Search modules..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className={`filter-btn ${sortBy === 'default' ? 'active' : ''}`} onClick={() => setSortBy('default')}>Default</button>
          <button className={`filter-btn ${sortBy === 'popularity' ? 'active' : ''}`} onClick={() => setSortBy('popularity')}>🔥 Most Popular</button>
          <button className={`filter-btn ${sortBy === 'name' ? 'active' : ''}`} onClick={() => setSortBy('name')}>A–Z</button>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /><span>Loading modules...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>{search ? 'No modules match your search.' : 'No modules configured. Ask admin to add modules.'}</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filtered.map((mod, i) => {
              const demand = getDemandLevel(mod.requestCount);
              return (
                <div
                  key={mod._id}
                  className="module-card"
                  onClick={() => navigate(`/request/${mod._id}/${encodeURIComponent(mod.name)}`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '2rem' }}>{MODULE_ICONS[i % MODULE_ICONS.length]}</span>
                    <span className={`demand-badge ${demand.cls}`}>{demand.label}</span>
                  </div>
                  <div className="module-name">{mod.name}</div>
                  {mod.description && <div className="module-desc">{mod.description}</div>}
                  <div className="module-footer">
                    <span className="module-requests">📋 {mod.requestCount} request{mod.requestCount !== 1 ? 's' : ''}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Request →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulePage;
