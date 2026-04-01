import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getModules } from '../services/api';

const getDemandLevel = (count) => {
  if (count >= 5) return { level: 'high', label: '🔥 High Demand', cls: 'high' };
  if (count >= 2) return { level: 'medium', label: '⚡ Medium', cls: 'medium' };
  return { level: 'low', label: '❄️ Low', cls: 'low' };
};

const MODULE_ICONS = ['📡', '🗄️', '⚙️', '🔐', '🌐', '📊', '🤖', '🖥️', '📱', '🔬'];

const demandBadgeClass = (cls) => {
  if (cls === 'high') return 'bg-danger-50 text-danger-600 border-danger-200';
  if (cls === 'medium') return 'bg-warning-50 text-warning-700 border-warning-200';
  return 'bg-neutral-100 text-neutral-600 border-neutral-200';
};

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
    <div className="page-container animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
            <Link to="/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <Link to="/hpage" className="hover:text-primary-600 transition-colors">Faculties</Link>
            <span>/</span>
            <span className="text-neutral-700">{decoded}</span>
          </div>
          <h1 className="page-title">{decoded} - Modules</h1>
          <p className="page-subtitle">Select a module to submit or view study requests.</p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-3">
          <input
            className="input-field md:flex-1"
            placeholder="Search modules..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
            <div className="flex gap-2">
              <button className={`px-3 py-2 rounded-lg text-sm ${sortBy === 'default' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600'}`} onClick={() => setSortBy('default')}>Default</button>
              <button className={`px-3 py-2 rounded-lg text-sm ${sortBy === 'popularity' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600'}`} onClick={() => setSortBy('popularity')}>Most Popular</button>
              <button className={`px-3 py-2 rounded-lg text-sm ${sortBy === 'name' ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-600'}`} onClick={() => setSortBy('name')}>A-Z</button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card text-center py-10 text-neutral-500">Loading modules...</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-neutral-500">{search ? 'No modules match your search.' : 'No modules configured yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((mod, i) => {
              const demand = getDemandLevel(mod.requestCount);
              return (
                <div
                  key={mod._id}
                  className="card cursor-pointer hover:-translate-y-0.5"
                  onClick={() => navigate(`/request/${mod._id}/${encodeURIComponent(mod.name)}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{MODULE_ICONS[i % MODULE_ICONS.length]}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${demandBadgeClass(demand.cls)}`}>{demand.label}</span>
                  </div>
                  <p className="text-lg font-gilroyBold text-neutral-800 mb-1">{mod.name}</p>
                  {mod.description && <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{mod.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">{mod.requestCount} request{mod.requestCount !== 1 ? 's' : ''}</span>
                    <span className="text-sm text-primary-600 font-gilroyMedium">Open</span>
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
