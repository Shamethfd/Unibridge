# Modified Files:
- src/App.js
- src/Pages/HomePage.js
- src/Pages/ModulePage.js
- src/Pages/RequestFormPage.js
- src/Pages/SemesterPage.js
- src/Pages/YearPage.js
- src/Pages/CodeIgniterDashboard.js
- src/Components/MyCoursePanel.js

---

## src/App.js

```javascript
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from './Pages/HomePage';
import YearPage from './Pages/YearPage';
import SemesterPage from './Pages/SemesterPage';
import ModulePage from './Pages/ModulePage';
import RequestFormPage from './Pages/RequestFormPage';
import CodeIgniterDashboard from './Pages/CodeIgniterDashboard';
import MyCoursePanel from './Components/MyCoursePanel';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/years/:facultyId/:facultyName" element={<YearPage />} />
        <Route path="/semesters/:yearId/:yearName" element={<SemesterPage />} />
        <Route path="/modules/:semesterId/:semesterName" element={<ModulePage />} />
        <Route path="/request/:moduleId/:moduleName" element={<RequestFormPage />} />
        <Route path="/codeigniter-dashboard" element={<CodeIgniterDashboard />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={4000} theme="dark" />
      <MyCoursePanel />
    </>
  );
}

export default App;

```

---

## src/Pages/HomePage.js

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getFaculties } from '../services/api';
import './HomePage.css';

const FACULTY_ICONS = {
  Computing: '💻',
  Engineering: '⚙️',
  Business: '📈',
  Architecture: '🏗️',
};

const HomePage = () => {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFaculties(); }, []);

  const fetchFaculties = async () => {
    setLoading(true);
    try {
      const res = await getFaculties();
      setFaculties(res.data);
    } catch {
      toast.error('Failed to load faculties');
    } finally { setLoading(false); }
  };

  const getIcon = (name) => FACULTY_ICONS[name] || '🏛️';

  const scrollToCourses = () => {
    const section = document.getElementById('courses');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => window.scrollTo(0, 0)}>
          <span className="brand-icon">🎓</span>
          <span className="brand-name">LearnBridge</span>
        </div>
        <div className="nav-links">
          <button className="nav-btn" onClick={scrollToCourses}>
            Courses
          </button>
          <button className="nav-btn admin-btn" onClick={() => navigate('/codeigniter-dashboard')}>
            CodeIgniter Dashboard
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Module & Study Request
            <span className="gradient-text"> Management System</span>
          </h1>
          <p className="hero-subtitle">
            Easily request study sessions, track demand, and connect with fellow students.
            Our smart system prioritizes sessions based on urgency and demand.
          </p>
          <div className="hero-actions">
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card red">
            <div className="stat-icon">🔥</div>
            <div className="stat-label">High Demand</div>
            <div className="stat-desc">Sessions with many requests</div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-icon">⚡</div>
            <div className="stat-label">Medium Demand</div>
            <div className="stat-desc">Growing interest sessions</div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon">❄️</div>
            <div className="stat-label">Low Demand</div>
            <div className="stat-desc">Early stage requests</div>
          </div>
        </div>
      </div>

      {/* Embedded Courses Section */}
      <div id="courses" className="page-content" style={{ marginTop: '2rem', paddingTop: '2rem' }}>
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h2 className="page-title">Faculties & Courses</h2>
          <p className="page-subtitle">Choose your faculty to explore and request modules.</p>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /><span>Loading faculties...</span></div>
        ) : (
          <div className="cards-grid">
            {faculties.map(fac => (
              <div
                key={fac._id}
                className="nav-card"
                onClick={() => navigate(`/years/${fac._id}/${encodeURIComponent(fac.name)}`)}
              >
                <span className="card-icon">{fac.icon || getIcon(fac.name)}</span>
                <div className="card-title">{fac.name}</div>
                <div className="card-desc">Click to explore years →</div>
              </div>
            ))}

            {faculties.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <div className="empty-icon">🏛️</div>
                <p>No faculties yet. Please add faculties via the CodeIgniter Dashboard.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Why Use Our System?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">Duplicate Detection</h3>
            <p className="feature-desc">Automatically detects and groups similar requests</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">Group Requests</h3>
            <p className="feature-desc">Join existing requests and boost priority</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">Urgency Levels</h3>
            <p className="feature-desc">Normal, Urgent, or Exam Priority support</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Heat Score</h3>
            <p className="feature-desc">Smart demand scoring based on students & urgency</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3 className="feature-title">Smart Suggestions</h3>
            <p className="feature-desc">Related module suggestions as you browse</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3 className="feature-title">Notifications</h3>
            <p className="feature-desc">Get alerted when your request is accepted</p>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>© 2026 UniConnect — Module & Study Request Management System</p>
      </footer>
    </div>
  );
};

export default HomePage;

```

---

## src/Pages/ModulePage.js

```javascript
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
          <button className="nav-btn" onClick={() => navigate('/')}>Courses</button>
          <button className="nav-btn admin-btn" onClick={() => navigate('/codeigniter-dashboard')}>CodeIgniter Dashboard</button>
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
            <p>{search ? 'No modules match your search.' : 'No modules configured. Add modules via the CodeIgniter Dashboard.'}</p>
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

```

---

## src/Pages/RequestFormPage.js

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createRequest, joinRequest, getRequestsByModule, getModules } from '../services/api';
import './HomePage.css';

const TIME_SLOTS = [
  'Mon 8-10am', 'Mon 2-4pm', 'Tue 8-10am', 'Tue 2-4pm',
  'Wed 8-10am', 'Wed 2-4pm', 'Thu 8-10am', 'Thu 2-4pm',
  'Fri 8-10am', 'Fri 2-4pm', 'Weekend Morning', 'Weekend Afternoon',
];

const CATEGORIES = [
  'Lecture Discussion',
  'Mid Past Paper Discussion',
  'Final Past Paper Discussion',
  'Others',
];

const calcHeatScore = (students, urgency, slots) => {
  const u = urgency === 'Exam Priority' ? 30 : urgency === 'Urgent' ? 20 : 10;
  return (students * 10) + u + (slots.length > 0 ? 15 : 0);
};

const getDemand = (score) => {
  if (score >= 60) return { label: '🔥 High Demand', cls: 'high' };
  if (score >= 35) return { label: '⚡ Medium Demand', cls: 'medium' };
  return { label: '❄️ Low Demand', cls: 'low' };
};

const RequestFormPage = () => {
  const navigate = useNavigate();
  const { moduleId, moduleName } = useParams();
  const decoded = decodeURIComponent(moduleName);

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [existingReqs, setExistingReqs] = useState([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const heatScore = calcHeatScore(1, urgency, selectedSlots);
  const demand = getDemand(heatScore);

  useEffect(() => {
    fetchExistingRequests();
  }, [moduleId]);

  const fetchExistingRequests = async () => {
    try {
      const res = await getRequestsByModule(moduleId);
      setExistingReqs(res.data);
    } catch { }
  };

  const toggleSlot = (slot) => {
    setSelectedSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!category) newErrors.category = 'Please select a category.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (selectedSlots.length === 0) newErrors.slots = 'Please select at least one preferred time slot.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDescriptionBlur = () => {
    if (!description.trim()) {
      setErrors(prev => ({ ...prev, description: 'Description is required.' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setDuplicateData(null);
    try {
      const payload = {
        moduleId,
        moduleName: decoded,
        category,
        description,
        urgency,
        preferredTime: selectedSlots,
      };
      const res = await createRequest(payload);
      if (res.data.duplicate) {
        setDuplicateData(res.data);
        toast.info('This request already exists! You can join it.');
      } else {
        toast.success(`✅ Request submitted! ${demand.label}`);
        // simulate accepted notification after 3s
        setTimeout(() => {
          toast.info('🔔 Your request has been received in the CodeIgniter Dashboard!', { autoClose: 5000 });
        }, 3000);
        setTimeout(() => navigate('/faculties'), 2500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const handleJoin = async () => {
    if (!duplicateData?.request?._id) return;
    try {
      await joinRequest(duplicateData.request._id);
      toast.success('✅ You joined the existing request!');
      setTimeout(() => navigate('/faculties'), 2000);
    } catch {
      toast.error('Failed to join request');
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/request/${moduleId}/${moduleName}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    toast.success('🔗 Invite link copied!');
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const existingByCategory = existingReqs.filter(r => r.category === category);

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="nav-brand"><span className="brand-icon">🎓</span><span className="brand-name">UniConnect</span></div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate('/faculties')}>Courses</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div className="breadcrumb">
            <a href="/">Home</a><span>/</span>
            <a href="/faculties">Faculties</a><span>/</span>
            <span>Request</span>
          </div>
          <h1 className="page-title">📋 Study Request</h1>
        </div>

        <div className="request-form-card">
          {/* Module Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(19, 198, 214, 0.2), rgba(255,101,132,0.2))',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Selected Module</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>📚 {decoded}</div>
            </div>
            <span className={`demand-badge ${demand.cls}`} style={{ fontSize: '0.9rem' }}>{demand.label}</span>
          </div>

          {/* Duplicate Alert */}
          {duplicateData && (
            <div className="duplicate-alert">
              <h4>⚠️ Request Already Exists!</h4>
              <p>{duplicateData.message}</p>
              <p style={{ marginBottom: '1rem' }}>
                Urgency: <strong>{duplicateData.request.urgency}</strong> &nbsp;|&nbsp;
                Heat Score: <strong>{duplicateData.request.heatScore}</strong>
              </p>
              <button className="btn-join" onClick={handleJoin}>👥 Join This Request</button>
            </div>
          )}

          {/* Existing requests for selected category */}
          {category && existingByCategory.length > 0 && !duplicateData && (
            <div style={{
              background: 'rgba(46,213,115,0.08)',
              border: '1px solid rgba(46,213,115,0.3)',
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: 'var(--green)'
            }}>
              ℹ️ {existingByCategory.length} existing request(s) for this category — submitting will auto-check for duplicates.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Category *</label>
              <select value={category} onChange={e => { setCategory(e.target.value); setErrors(p => ({...p, category: ''})); }} required>
                <option value="">— Select category —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px' }}>{errors.category}</p>}
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Description <span style={{ color: '#da1e28' }}>*</span></label>
              <textarea
                value={description}
                onChange={e => {
                  setDescription(e.target.value);
                  if (e.target.value.trim()) setErrors(prev => ({ ...prev, description: '' }));
                }}
                onBlur={handleDescriptionBlur}
                placeholder="Describe what topics you need help with..."
                rows={4}
                style={errors.description ? {
                  border: '1.5px solid #da1e28',
                  boxShadow: '0 0 0 3px rgba(218,30,40,0.12)',
                  outline: 'none'
                } : {}}
              />
              {errors.description && (
                <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px', marginBottom: 0 }}>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Urgency */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Urgency Level</label>
              <div className="urgency-options">
                {['Normal', 'Urgent', 'Exam Priority'].map(u => (
                  <button
                    type="button"
                    key={u}
                    className={`urgency-btn ${u === 'Urgent' ? 'urgent' : u === 'Exam Priority' ? 'exam' : ''} ${urgency === u ? 'selected' : ''}`}
                    onClick={() => setUrgency(u)}
                  >
                    {u === 'Normal' ? '🟢' : u === 'Urgent' ? '🟡' : '🔴'} {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Preferred Time Slots (select all applicable)</label>
              <div className="time-slots">
                {TIME_SLOTS.map(slot => (
                  <button
                    type="button"
                    key={slot}
                    className={`time-slot ${selectedSlots.includes(slot) ? 'selected' : ''}`}
                    onClick={() => { toggleSlot(slot); setErrors(p => ({...p, slots: ''})); }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {errors.slots && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '6px' }}>{errors.slots}</p>}
            </div>

            {/* Heat Score Preview */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Request Heat Score (Preview)</label>
              <div className="heat-bar-wrap">
                <div className="heat-bar-bg">
                  <div className="heat-bar-fill" style={{ width: `${Math.min((heatScore / 100) * 100, 100)}%` }} />
                </div>
                <div className="heat-score-val">Score: {heatScore} / 100 &nbsp;— {demand.label}</div>
              </div>
            </div>

            {/* Invite Friends */}
            <div className="form-group" style={{ marginBottom: '1.8rem' }}>
              <label>👥 Invite Friends</label>
              <div className="invite-bar">
                <p>Share this link with classmates to boost demand for this session</p>
                <button type="button" className="btn-copy" onClick={handleCopyLink}>
                  {linkCopied ? '✅ Copied!' : '📋 Copy Link'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }} disabled={submitting}>
              {submitting ? '⏳ Submitting...' : '🚀 Submit Request'}
            </button>
          </form>

          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <div className="suggestions-section">
              <h4>💡 Related Modules You Might Also Need:</h4>
              <div className="suggestion-chips">
                {suggestions.map(s => (
                  <span
                    key={s._id}
                    className="suggestion-chip"
                    onClick={() => navigate(`/request/${s._id}/${encodeURIComponent(s.name)}`)}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Existing Requests Panel */}
        {existingReqs.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>📊 Current Requests for This Module</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Urgency</th>
                    <th>Students</th>
                    <th>Heat Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {existingReqs.map(r => (
                    <tr key={r._id}>
                      <td>{r.category}</td>
                      <td>{r.urgency}</td>
                      <td>👥 {r.studentsCount}</td>
                      <td>🔥 {r.heatScore}</td>
                      <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestFormPage;

```

---

## src/Pages/SemesterPage.js

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSemesters } from '../services/api';
import './HomePage.css';

const SEM_ICONS = ['📘', '📗'];

const SemesterPage = () => {
  const navigate = useNavigate();
  const { yearId, yearName } = useParams();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSemesters(); }, [yearId]);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await getSemesters(yearId);
      setSemesters(res.data);
    } catch {
      toast.error('Failed to load semesters');
    } finally { setLoading(false); }
  };

  const decoded = decodeURIComponent(yearName);

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="nav-brand"><span className="brand-icon">🎓</span><span className="brand-name">UniConnect</span></div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate('/')}>Courses</button>
          <button className="nav-btn admin-btn" onClick={() => navigate('/codeigniter-dashboard')}>CodeIgniter Dashboard</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div className="breadcrumb">
            <a href="/">Home</a><span>/</span>
            <a href="/faculties">Faculties</a><span>/</span>
            <span>{decoded}</span><span>/</span><span>Semester</span>
          </div>
          <h1 className="page-title">{decoded} — Select Semester</h1>
          <p className="page-subtitle">Choose your semester</p>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /><span>Loading...</span></div>
        ) : semesters.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p>No semesters configured. Please add semesters via the CodeIgniter Dashboard.</p>
          </div>
        ) : (
          <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {semesters.map((sem, i) => (
              <div
                key={sem._id}
                className="nav-card"
                onClick={() => navigate(`/modules/${sem._id}/${encodeURIComponent(sem.name)}`)}
                style={{ padding: '2.5rem 1.5rem' }}
              >
                <span className="card-icon" style={{ fontSize: '3rem' }}>{SEM_ICONS[i % 2]}</span>
                <div className="card-title" style={{ fontSize: '1.3rem' }}>{sem.name}</div>
                <div className="card-desc">Explore modules →</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SemesterPage;

```

---

## src/Pages/YearPage.js

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getYears } from '../services/api';
import './HomePage.css';

const YEAR_LABELS = ['Year 1', 'Year 2', 'Year 3', 'Year 4'];

const YearPage = () => {
  const navigate = useNavigate();
  const { facultyId, facultyName } = useParams();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchYears(); }, [facultyId]);

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await getYears(facultyId);
      setYears(res.data);
    } catch {
      toast.error('Failed to load years');
    } finally { setLoading(false); }
  };

  const decodedFaculty = decodeURIComponent(facultyName);

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="nav-brand"><span className="brand-icon">🎓</span><span className="brand-name">UniConnect</span></div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate('/')}>Courses</button>
          <button className="nav-btn admin-btn" onClick={() => navigate('/codeigniter-dashboard')}>CodeIgniter Dashboard</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div className="breadcrumb">
            <a href="/">Home</a><span>/</span>
            <a href="/faculties">Faculties</a><span>/</span>
            <span>{decodedFaculty}</span>
          </div>
          <h1 className="page-title">{decodedFaculty} — Select Year</h1>
          <p className="page-subtitle">Choose your academic year</p>
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner" /><span>Loading...</span></div>
        ) : years.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No years configured yet. Please add years via the CodeIgniter Dashboard.</p>
          </div>
        ) : (
          <div className="cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {years.map((year, i) => (
              <div
                key={year._id}
                className="year-card"
                onClick={() => navigate(`/semesters/${year._id}/${encodeURIComponent(year.name)}`)}
              >
                <div className="year-number">{i + 1}</div>
                <div className="year-label">{year.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YearPage;

```

---

## src/Pages/CodeIgniterDashboard.js

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getFaculties, createFaculty, updateFaculty, deleteFaculty,
  getYears, createYear, deleteYear,
  getSemesters, createSemester, deleteSemester,
  getModules, createModule, updateModule, deleteModule,
  getAllRequests, updateRequestStatus, deleteRequest,
  getDashboardStats
} from '../services/api';
import './HomePage.css';

const CodeIgniterDashboard = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  // Data
  const [faculties, setFaculties] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [modules, setModules] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);

  // Selections
  const [selFaculty, setSelFaculty] = useState('');
  const [selYear, setSelYear] = useState('');
  const [selSemester, setSelSemester] = useState('');

  // New forms
  const [newFaculty, setNewFaculty] = useState({ name: '', icon: '🏛️' });
  const [newYear, setNewYear] = useState({ name: 'Year 1' });
  const [newSemester, setNewSemester] = useState({ name: 'Semester 1' });
  const [newModule, setNewModule] = useState({ name: '', description: '' });

  // Inline validation errors
  const [adminErrors, setAdminErrors] = useState({});

  // Edit Faculty State
  const [editingFacultyId, setEditingFacultyId] = useState(null);
  const [editFacultyName, setEditFacultyName] = useState('');
  const [editFacultyIcon, setEditFacultyIcon] = useState('');

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (selFaculty) loadYears(selFaculty); }, [selFaculty]);
  useEffect(() => { if (selYear) loadSemesters(selYear); }, [selYear]);
  useEffect(() => { if (selSemester) loadModules(selSemester); }, [selSemester]);

  const fetchAll = async () => {
    try {
      const [facRes, reqRes, statRes] = await Promise.all([getFaculties(), getAllRequests(), getDashboardStats()]);
      setFaculties(facRes.data);
      setRequests(reqRes.data);
      setStats(statRes.data);
    } catch { toast.error('Failed to load data'); }
  };

  const loadYears = async (fid) => { try { const r = await getYears(fid); setYears(r.data); } catch {} };
  const loadSemesters = async (yid) => { try { const r = await getSemesters(yid); setSemesters(r.data); } catch {} };
  const loadModules = async (sid) => { try { const r = await getModules(sid); setModules(r.data); } catch {} };

  // Faculty CRUD
  const handleAddFaculty = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!newFaculty.name.trim()) errs.facultyName = 'Faculty name is required.';
    if (Object.keys(errs).length) { setAdminErrors(errs); return; }
    setAdminErrors({});
    try {
      await createFaculty(newFaculty);
      toast.success('Faculty added!');
      setNewFaculty({ name: '', icon: '🏛️' });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Delete this faculty?')) return;
    await deleteFaculty(id); toast.success('Deleted'); fetchAll();
  };

  const handleEditFacultyClick = (faculty) => {
    setEditingFacultyId(faculty._id);
    setEditFacultyName(faculty.name);
    setEditFacultyIcon(faculty.icon);
  };

  const handleSaveEditFaculty = async (id) => {
    try {
      if (!editFacultyName.trim()) { toast.warning('Name is required'); return; }
      await updateFaculty(id, { name: editFacultyName, icon: editFacultyIcon });
      toast.success('Faculty updated!');
      setEditingFacultyId(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating faculty');
    }
  };

  const handleCancelEditFaculty = () => {
    setEditingFacultyId(null);
  };

  // Year CRUD
  const handleAddYear = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!selFaculty) errs.yearFaculty = 'Please select a faculty first.';
    if (Object.keys(errs).length) { setAdminErrors(errs); return; }
    setAdminErrors({});
    try {
      await createYear({ ...newYear, facultyId: selFaculty });
      toast.success('Year added!');
      loadYears(selFaculty);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const handleDeleteYear = async (id) => {
    if (!window.confirm('Delete this year?')) return;
    await deleteYear(id); toast.success('Deleted'); loadYears(selFaculty);
  };

  // Semester CRUD
  const handleAddSemester = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!selYear) errs.semYear = 'Please select a year first.';
    if (Object.keys(errs).length) { setAdminErrors(errs); return; }
    setAdminErrors({});
    try {
      await createSemester({ ...newSemester, yearId: selYear });
      toast.success('Semester added!');
      loadSemesters(selYear);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const handleDeleteSemester = async (id) => {
    if (!window.confirm('Delete this semester?')) return;
    await deleteSemester(id); toast.success('Deleted'); loadSemesters(selYear);
  };

  // Module CRUD
  const handleAddModule = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!selSemester) errs.modSemester = 'Please select a semester first.';
    if (!newModule.name.trim()) errs.modName = 'Module name is required.';
    if (Object.keys(errs).length) { setAdminErrors(errs); return; }
    setAdminErrors({});
    try {
      await createModule({ ...newModule, semesterId: selSemester });
      toast.success('Module added!');
      setNewModule({ name: '', description: '' });
      loadModules(selSemester);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const handleDeleteModule = async (id) => {
    if (!window.confirm('Delete this module?')) return;
    await deleteModule(id); toast.success('Deleted'); loadModules(selSemester);
  };

  // Request management
  const handleStatusChange = async (id, status) => {
    try {
      await updateRequestStatus(id, status);
      toast.success(`Request marked as ${status}`);
      if (status === 'Accepted') toast.info('🔔 Notification sent to student!');
      fetchAll();
    } catch { toast.error('Failed to update status'); }
  };
  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    await deleteRequest(id); toast.success('Deleted'); fetchAll();
  };

  const highDemandModules = stats?.byModule?.filter(m => m.total >= 5) || [];
  const totalStudents = requests.reduce((s, r) => s + r.studentsCount, 0);

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'faculties', label: '🏛️ Faculties' },
    { id: 'years', label: '📅 Years' },
    { id: 'semesters', label: '📚 Semesters' },
    { id: 'modules', label: '📖 Modules' },
    { id: 'requests', label: '📋 Requests' },
  ];

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="nav-brand"><span className="brand-icon">🎓</span><span className="brand-name">UniConnect</span></div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate('/')}>Courses</button>
          <button className="nav-btn" onClick={() => navigate('/')}>Exit Dashboard</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">⚙️ CodeIgniter Dashboard</h1>
          <p className="page-subtitle">Manage faculties, years, semesters, modules, and student requests</p>
        </div>

        <div className="admin-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`admin-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div className="admin-stats">
              <div className="admin-stat-card">
                <h4>Total Requests</h4>
                <div className="big-num">{stats?.totalRequests || 0}</div>
              </div>
              <div className="admin-stat-card">
                <h4>Total Students</h4>
                <div className="big-num">{totalStudents}</div>
              </div>
              <div className="admin-stat-card">
                <h4>Faculties</h4>
                <div className="big-num">{faculties.length}</div>
              </div>
              <div className="admin-stat-card">
                <h4>🔥 High Demand</h4>
                <div className="big-num">{highDemandModules.length}</div>
              </div>
            </div>

            <h3 style={{ marginBottom: '1rem' }}>📈 Most Requested Modules</h3>
            {stats?.byModule?.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Module</th><th>Total Requests</th><th>Total Students</th><th>Avg Heat Score</th><th>Demand</th></tr></thead>
                  <tbody>
                    {stats.byModule.map((m, i) => {
                      const score = Math.round(m.avgHeatScore);
                      const level = score >= 60 ? 'high' : score >= 35 ? 'medium' : 'low';
                      const label = level === 'high' ? '🔥 High' : level === 'medium' ? '⚡ Medium' : '❄️ Low';
                      return (
                        <tr key={i}>
                          <td><strong>{m.moduleName}</strong></td>
                          <td>{m.total}</td>
                          <td>👥 {m.totalStudents}</td>
                          <td>🔥 {score}</td>
                          <td><span className={`demand-badge ${level}`}>{label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state"><div className="empty-icon">📊</div><p>No requests yet. Students will see data here after submitting.</p></div>
            )}
          </>
        )}

        {/* ── FACULTIES ── */}
        {tab === 'faculties' && (
          <>
            <form className="admin-form" onSubmit={handleAddFaculty}>
              <h3>Add Faculty</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Faculty Name</label>
                  <input value={newFaculty.name} onChange={e => { setNewFaculty({ ...newFaculty, name: e.target.value }); setAdminErrors(p => ({...p, facultyName: ''})); }} placeholder="e.g. Computing" required />
                  {adminErrors.facultyName && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px' }}>{adminErrors.facultyName}</p>}
                </div>
                <div className="form-group" style={{ maxWidth: 100 }}>
                  <label>Icon</label>
                  <input value={newFaculty.icon} onChange={e => setNewFaculty({ ...newFaculty, icon: e.target.value })} style={{ textAlign: 'center', fontSize: '1.4rem' }} />
                </div>
                <button type="submit" className="btn-add">+ Add</button>
              </div>
            </form>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Icon</th><th>Name</th><th>Created</th><th>Action</th></tr></thead>
                <tbody>
                  {faculties.map(f => (
                    <tr key={f._id}>
                      {editingFacultyId === f._id ? (
                        <>
                          <td>
                            <input 
                              value={editFacultyIcon} 
                              onChange={e => setEditFacultyIcon(e.target.value)} 
                              style={{ width: '50px', textAlign: 'center', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }} 
                            />
                          </td>
                          <td>
                            <input 
                              value={editFacultyName} 
                              onChange={e => setEditFacultyName(e.target.value)} 
                              style={{ width: '100%', padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }} 
                            />
                          </td>
                          <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                          <td style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-success" onClick={() => handleSaveEditFaculty(f._id)}>💾 Save</button>
                            <button className="btn-danger" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)' }} onClick={handleCancelEditFaculty}>✕ Cancel</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ fontSize: '1.5rem' }}>{f.icon}</td>
                          <td><strong>{f.name}</strong></td>
                          <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                          <td style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn-success" 
                              style={{ background: 'rgba(255, 165, 2, 0.15)', color: 'var(--yellow)', border: '1px solid rgba(255, 165, 2, 0.3)' }} 
                              onClick={() => handleEditFacultyClick(f)}
                            >
                              ✏️ Edit
                            </button>
                            <button className="btn-danger" onClick={() => handleDeleteFaculty(f._id)}>🗑 Delete</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {faculties.length === 0 && <div className="empty-state"><div className="empty-icon">🏛️</div><p>No faculties added yet.</p></div>}
            </div>
          </>
        )}

        {/* ── YEARS ── */}
        {tab === 'years' && (
          <>
            <form className="admin-form" onSubmit={handleAddYear}>
              <h3>Add Year</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Faculty</label>
                  <select value={selFaculty} onChange={e => { setSelFaculty(e.target.value); setAdminErrors(p => ({...p, yearFaculty: ''})); }} required>
                    <option value="">Select faculty</option>
                    {faculties.map(f => <option key={f._id} value={f._id}>{f.icon} {f.name}</option>)}
                  </select>
                  {adminErrors.yearFaculty && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px' }}>{adminErrors.yearFaculty}</p>}
                </div>
                <div className="form-group">
                  <label>Year Name</label>
                  <select value={newYear.name} onChange={e => setNewYear({ name: e.target.value })}>
                    {['Year 1','Year 2','Year 3','Year 4'].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-add">+ Add</button>
              </div>
            </form>
            {selFaculty && (
              <table className="data-table">
                <thead><tr><th>Year</th><th>Faculty</th><th>Action</th></tr></thead>
                <tbody>
                  {years.map(y => (
                    <tr key={y._id}>
                      <td><strong>{y.name}</strong></td>
                      <td>{faculties.find(f => f._id === y.facultyId)?.name || '—'}</td>
                      <td><button className="btn-danger" onClick={() => handleDeleteYear(y._id)}>🗑 Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!selFaculty && <div className="empty-state"><div className="empty-icon">📅</div><p>Select a faculty above to view its years.</p></div>}
          </>
        )}

        {/* ── SEMESTERS ── */}
        {tab === 'semesters' && (
          <>
            <form className="admin-form" onSubmit={handleAddSemester}>
              <h3>Add Semester</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Faculty</label>
                  <select value={selFaculty} onChange={e => { setSelFaculty(e.target.value); setSelYear(''); }}>
                    <option value="">Select faculty</option>
                    {faculties.map(f => <option key={f._id} value={f._id}>{f.icon} {f.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <select value={selYear} onChange={e => { setSelYear(e.target.value); setAdminErrors(p => ({...p, semYear: ''})); }} required>
                    <option value="">Select year</option>
                    {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                  </select>
                  {adminErrors.semYear && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px' }}>{adminErrors.semYear}</p>}
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select value={newSemester.name} onChange={e => setNewSemester({ name: e.target.value })}>
                    {['Semester 1','Semester 2'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-add">+ Add</button>
              </div>
            </form>
            {selYear && (
              <table className="data-table">
                <thead><tr><th>Semester</th><th>Action</th></tr></thead>
                <tbody>
                  {semesters.map(s => (
                    <tr key={s._id}>
                      <td><strong>{s.name}</strong></td>
                      <td><button className="btn-danger" onClick={() => handleDeleteSemester(s._id)}>🗑 Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!selYear && <div className="empty-state"><div className="empty-icon">📚</div><p>Select a year above to view semesters.</p></div>}
          </>
        )}

        {/* ── MODULES ── */}
        {tab === 'modules' && (
          <>
            <form className="admin-form" onSubmit={handleAddModule}>
              <h3>Add Module</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Faculty</label>
                  <select value={selFaculty} onChange={e => { setSelFaculty(e.target.value); setSelYear(''); setSelSemester(''); }}>
                    <option value="">Select faculty</option>
                    {faculties.map(f => <option key={f._id} value={f._id}>{f.icon} {f.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <select value={selYear} onChange={e => { setSelYear(e.target.value); setSelSemester(''); }}>
                    <option value="">Select year</option>
                    {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select value={selSemester} onChange={e => { setSelSemester(e.target.value); setAdminErrors(p => ({...p, modSemester: ''})); }} required>
                    <option value="">Select semester</option>
                    {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  {adminErrors.modSemester && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px' }}>{adminErrors.modSemester}</p>}
                </div>
              </div>
              <div className="form-row" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Module Name *</label>
                  <input value={newModule.name} onChange={e => { setNewModule({ ...newModule, name: e.target.value }); setAdminErrors(p => ({...p, modName: ''})); }} placeholder="e.g. Network Management" required />
                  {adminErrors.modName && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px' }}>{adminErrors.modName}</p>}
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input value={newModule.description} onChange={e => setNewModule({ ...newModule, description: e.target.value })} placeholder="Brief description..." />
                </div>
                <button type="submit" className="btn-add">+ Add</button>
              </div>
            </form>
            {selSemester ? (
              <table className="data-table">
                <thead><tr><th>Module</th><th>Description</th><th>Requests</th><th>Action</th></tr></thead>
                <tbody>
                  {modules.map(m => (
                    <tr key={m._id}>
                      <td><strong>{m.name}</strong></td>
                      <td>{m.description || '—'}</td>
                      <td>📋 {m.requestCount}</td>
                      <td><button className="btn-danger" onClick={() => handleDeleteModule(m._id)}>🗑 Delete</button></td>
                    </tr>
                  ))}
                  {modules.length === 0 && <tr><td colSpan={4}><div className="empty-state" style={{ padding: '1rem' }}><p>No modules in this semester.</p></div></td></tr>}
                </tbody>
              </table>
            ) : <div className="empty-state"><div className="empty-icon">📖</div><p>Select Faculty → Year → Semester to view modules.</p></div>}
          </>
        )}

        {/* ── REQUESTS ── */}
        {tab === 'requests' && (
          <>
            <h3 style={{ marginBottom: '1rem' }}>All Student Requests ({requests.length})</h3>
            {requests.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📋</div><p>No requests submitted yet.</p></div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Module</th><th>Category</th><th>Urgency</th><th>Students</th><th>Heat</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r._id}>
                        <td><strong>{r.moduleName}</strong></td>
                        <td style={{ maxWidth: 160 }}>{r.category}</td>
                        <td>{r.urgency}</td>
                        <td>👥 {r.studentsCount}</td>
                        <td>🔥 {r.heatScore}</td>
                        <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                        <td style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {r.status !== 'Accepted' && <button className="btn-success" onClick={() => handleStatusChange(r._id, 'Accepted')}>✅ Accept</button>}
                          {r.status !== 'Rejected' && <button className="btn-danger" onClick={() => handleStatusChange(r._id, 'Rejected')}>✕</button>}
                          <button className="btn-danger" onClick={() => handleDeleteRequest(r._id)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CodeIgniterDashboard;

```

---

## src/Components/MyCoursePanel.js

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getFaculties,
  getYears,
  getSemesters,
  getModules,
  getUserPreference,
  saveUserPreference,
  clearUserPreference,
} from '../services/api';
import './MyCoursePanel.css';

// Routes where the My Course button should appear.
// Pattern-based: works for ALL faculties — including new ones added via the CodeIgniter Dashboard.
const COURSE_ROUTES = ['/years/', '/semesters/', '/modules/', '/request/'];

// Generate or retrieve a persistent user ID from localStorage
const getUserId = () => {
  let id = localStorage.getItem('uniconnect_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('uniconnect_user_id', id);
  }
  return id;
};

const MyCoursePanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Dropdown data
  const [faculties, setFaculties] = useState([]);
  const [years, setYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [modules, setModules] = useState([]);

  // Selections (store id + name pairs)
  const [selFaculty, setSelFaculty] = useState({ id: '', name: '' });
  const [selYear, setSelYear]       = useState({ id: '', name: '' });
  const [selSemester, setSelSemester] = useState({ id: '', name: '' });
  const [selModule, setSelModule]   = useState({ id: '', name: '' });

  // Loading preferences flag
  const [prefLoaded, setPrefLoaded] = useState(false);

  const userId = getUserId();

  // ── Load faculties on mount ──
  useEffect(() => {
    getFaculties()
      .then(res => setFaculties(res.data))
      .catch(() => {});
  }, []);

  // ── Load saved preference on mount ──
  useEffect(() => {
    getUserPreference(userId)
      .then(res => {
        if (res.data) {
          const { faculty, year, semester, module: mod } = res.data;
          if (faculty?.id) setSelFaculty(faculty);
          if (year?.id)    setSelYear(year);
          if (semester?.id) setSelSemester(semester);
          if (mod?.id)     setSelModule(mod);
        }
        setPrefLoaded(true);
      })
      .catch(() => setPrefLoaded(true));
  }, [userId]);

  // ── Cascade: Faculty → Years ──
  useEffect(() => {
    if (!selFaculty.id) { setYears([]); setSelYear({ id: '', name: '' }); return; }
    getYears(selFaculty.id)
      .then(res => setYears(res.data))
      .catch(() => setYears([]));
  }, [selFaculty.id]);

  // ── Cascade: Year → Semesters ──
  useEffect(() => {
    if (!selYear.id) { setSemesters([]); setSelSemester({ id: '', name: '' }); return; }
    getSemesters(selYear.id)
      .then(res => setSemesters(res.data))
      .catch(() => setSemesters([]));
  }, [selYear.id]);

  // ── Cascade: Semester → Modules ──
  useEffect(() => {
    if (!selSemester.id) { setModules([]); setSelModule({ id: '', name: '' }); return; }
    getModules(selSemester.id)
      .then(res => setModules(res.data))
      .catch(() => setModules([]));
  }, [selSemester.id]);

  const handleFacultyChange = (e) => {
    const found = faculties.find(f => f._id === e.target.value);
    setSelFaculty(found ? { id: found._id, name: found.name } : { id: '', name: '' });
    setSelYear({ id: '', name: '' });
    setSelSemester({ id: '', name: '' });
    setSelModule({ id: '', name: '' });
  };

  const handleYearChange = (e) => {
    const found = years.find(y => y._id === e.target.value);
    setSelYear(found ? { id: found._id, name: found.name } : { id: '', name: '' });
    setSelSemester({ id: '', name: '' });
    setSelModule({ id: '', name: '' });
  };

  const handleSemesterChange = (e) => {
    const found = semesters.find(s => s._id === e.target.value);
    setSelSemester(found ? { id: found._id, name: found.name } : { id: '', name: '' });
    setSelModule({ id: '', name: '' });
  };

  const handleModuleChange = (e) => {
    const found = modules.find(m => m._id === e.target.value);
    setSelModule(found ? { id: found._id, name: found.name } : { id: '', name: '' });
  };

  const handleMyCourse = async () => {
    if (!selFaculty.id) { toast.warning('Please select a Faculty'); return; }
    if (!selYear.id)    { toast.warning('Please select a Year'); return; }
    if (!selSemester.id) { toast.warning('Please select a Semester'); return; }
    if (!selModule.id)  { toast.warning('Please select a Module'); return; }

    // Save to DB
    try {
      await saveUserPreference(userId, {
        faculty:  selFaculty,
        year:     selYear,
        semester: selSemester,
        module:   selModule,
      });
      toast.success('✅ Course saved!');
    } catch {
      toast.error('Failed to save preference');
    }

    // Navigate to the request form
    setIsOpen(false);
    navigate(`/request/${selModule.id}/${encodeURIComponent(selModule.name)}`);
  };

  const handleClearSaved = async () => {
    try {
      await clearUserPreference(userId);
      setSelFaculty({ id: '', name: '' });
      setSelYear({ id: '', name: '' });
      setSelSemester({ id: '', name: '' });
      setSelModule({ id: '', name: '' });
      toast.info('Saved options cleared');
    } catch {
      toast.error('Failed to clear preference');
    }
  };

  // ── Visibility check ──
  // Show on any course-navigation route (faculty-agnostic, fully dynamic).
  const shouldShowButton = () =>
    COURSE_ROUTES.some(r => location.pathname.startsWith(r));

  if (!shouldShowButton()) return null;

  return (
    <>
      <div className="mycourse-floating-btn" onClick={() => setIsOpen(true)}>
        <span className="btn-icon">📚</span>
        <span className="btn-text">My Course</span>
      </div>

      <div className={`mycourse-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

      <div className={`mycourse-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="title-icon">📚</span> Faculties
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <span style={{ color: '#ff6b6b' }}>✕</span> Close
          </button>
        </div>

        <div className="sidebar-content">
          <div className="quick-access-box">
            <h3 className="qa-title"><span className="qa-icon">⚡</span> Quick Access To Saved Options</h3>
            <p className="qa-subtitle">Select options below to quickly navigate to your module.</p>

            <div className="qa-form">
              {/* Faculty */}
              <div className="qa-group">
                <label>Faculty</label>
                <select className="qa-select" value={selFaculty.id} onChange={handleFacultyChange}>
                  <option value="">-- Select Faculty --</option>
                  {faculties.map(f => (
                    <option key={f._id} value={f._id}>{f.icon} {f.name}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="qa-group">
                <label>Year</label>
                <select
                  className="qa-select"
                  value={selYear.id}
                  onChange={handleYearChange}
                  disabled={!selFaculty.id}
                >
                  <option value="">-- Select Year --</option>
                  {years.map(y => (
                    <option key={y._id} value={y._id}>{y.name}</option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div className="qa-group">
                <label>Semester</label>
                <select
                  className="qa-select"
                  value={selSemester.id}
                  onChange={handleSemesterChange}
                  disabled={!selYear.id}
                >
                  <option value="">-- Select Semester --</option>
                  {semesters.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Module */}
              <div className="qa-group">
                <label>Module</label>
                <select
                  className="qa-select"
                  value={selModule.id}
                  onChange={handleModuleChange}
                  disabled={!selSemester.id}
                >
                  <option value="">-- Select Module --</option>
                  {modules.map(m => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
                {selSemester.id && modules.length === 0 && (
                  <p className="qa-no-data">No modules found for this semester.</p>
                )}
              </div>

              <div className="qa-actions">
                <button className="btn-my-course" onClick={handleMyCourse}>My Course</button>
                <button className="btn-clear-saved" onClick={handleClearSaved}>Clear Saved</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyCoursePanel;

```

---

