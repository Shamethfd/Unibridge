import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  getFaculties, createFaculty, updateFaculty, deleteFaculty,
  getYears, createYear, deleteYear,
  getSemesters, createSemester, deleteSemester,
  getModules, createModule, updateModule, deleteModule,
  getAllRequests, updateRequestStatus, deleteRequest,
  getDashboardStats, getTutorApplications, approveTutorApplication, rejectTutorApplication
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
  const [tutorFormRequests, setTutorFormRequests] = useState([]);

  // Send Note State
  const [sendNoteRequest, setSendNoteRequest] = useState(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to access the dashboard');
      navigate('/login');
      return;
    }
    fetchAll();
  }, [navigate]);
  useEffect(() => { if (selFaculty) loadYears(selFaculty); }, [selFaculty]);
  useEffect(() => { if (selYear) loadSemesters(selYear); }, [selYear]);
  useEffect(() => { if (selSemester) loadModules(selSemester); }, [selSemester]);

  const fetchAll = async () => {
    try {
      const [facRes, reqRes, statRes, appsRes] = await Promise.all([
        getFaculties(),
        getAllRequests(),
        getDashboardStats(),
        getTutorApplications(),
      ]);
      setFaculties(facRes.data);
      setRequests(reqRes.data);
      setStats(statRes.data);
      setTutorFormRequests(appsRes.data?.data || []);
    } catch { toast.error('Failed to load data'); }
  };

  const loadYears = async (fid) => { try { const r = await getYears(fid); setYears(r.data); } catch { } };
  const loadSemesters = async (yid) => { try { const r = await getSemesters(yid); setSemesters(r.data); } catch { } };
  const loadModules = async (sid) => { try { const r = await getModules(sid); setModules(r.data); } catch { } };

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

  const handleSendClick = (request) => {
    setSendNoteRequest(request);
    setIsNoteModalOpen(true);
  };

  const handleCopyNote = () => {
    if (!sendNoteRequest) return;
    const noteText = `Module: ${sendNoteRequest.moduleName}
Category: ${sendNoteRequest.category}
University: ${sendNoteRequest.university || 'N/A'}
Students: ${sendNoteRequest.studentsCount}
Preferred Time: ${sendNoteRequest.preferredTime && sendNoteRequest.preferredTime.length > 0 ? sendNoteRequest.preferredTime.join(', ') : 'N/A'}`;
    
    navigator.clipboard.writeText(noteText)
      .then(() => toast.success('Note copied to clipboard!'))
      .catch(() => toast.error('Failed to copy note.'));
  };

  const handleTutorFormAction = async (applicationId, action) => {
    try {
      if (action === 'approve') {
        await approveTutorApplication(applicationId);
        toast.success('Tutor application approved.');
      } else {
        await rejectTutorApplication(applicationId);
        toast.success('Tutor application rejected.');
      }
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update tutor application');
    }
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
    { id: 'tutormessages', label: '👨‍🏫 Tutor from request' },
  ];



  return (
    <div className="page-shell">
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
                  <input value={newFaculty.name} onChange={e => { setNewFaculty({ ...newFaculty, name: e.target.value }); setAdminErrors(p => ({ ...p, facultyName: '' })); }} placeholder="e.g. Computing" required />
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
                  <select value={selFaculty} onChange={e => { setSelFaculty(e.target.value); setAdminErrors(p => ({ ...p, yearFaculty: '' })); }} required>
                    <option value="">Select faculty</option>
                    {faculties.map(f => <option key={f._id} value={f._id}>{f.icon} {f.name}</option>)}
                  </select>
                  {adminErrors.yearFaculty && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px' }}>{adminErrors.yearFaculty}</p>}
                </div>
                <div className="form-group">
                  <label>Year Name</label>
                  <select value={newYear.name} onChange={e => setNewYear({ name: e.target.value })}>
                    {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map(y => <option key={y}>{y}</option>)}
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
                  <select value={selYear} onChange={e => { setSelYear(e.target.value); setAdminErrors(p => ({ ...p, semYear: '' })); }} required>
                    <option value="">Select year</option>
                    {years.map(y => <option key={y._id} value={y._id}>{y.name}</option>)}
                  </select>
                  {adminErrors.semYear && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px' }}>{adminErrors.semYear}</p>}
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select value={newSemester.name} onChange={e => setNewSemester({ name: e.target.value })}>
                    {['Semester 1', 'Semester 2'].map(s => <option key={s}>{s}</option>)}
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
                  <select value={selSemester} onChange={e => { setSelSemester(e.target.value); setAdminErrors(p => ({ ...p, modSemester: '' })); }} required>
                    <option value="">Select semester</option>
                    {semesters.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  {adminErrors.modSemester && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px' }}>{adminErrors.modSemester}</p>}
                </div>
              </div>
              <div className="form-row" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label>Module Name *</label>
                  <input value={newModule.name} onChange={e => { setNewModule({ ...newModule, name: e.target.value }); setAdminErrors(p => ({ ...p, modName: '' })); }} placeholder="e.g. Network Management" required />
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
                      <th>Module</th><th>Category</th><th>Urgency</th><th>Students</th><th>Time</th><th>Preferred Time</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r._id}>
                        <td><strong>{r.moduleName}</strong></td>
                        <td style={{ maxWidth: 160 }}>{r.category}</td>
                        <td>{r.urgency}</td>
                        <td>👥 {r.studentsCount}</td>
                        <td>🕒 {new Date(r.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td>{r.preferredTime && r.preferredTime.length > 0 ? r.preferredTime.join(', ') : '—'}</td>
                        <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                        <td style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {r.status !== 'Accepted' && <button className="btn-success" onClick={() => handleStatusChange(r._id, 'Accepted')}>✅ Accept</button>}
                          {r.status !== 'Rejected' && <button className="btn-danger" onClick={() => handleStatusChange(r._id, 'Rejected')}>✕</button>}
                          <button className="btn-danger" onClick={() => handleDeleteRequest(r._id)}>🗑</button>
                          <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleSendClick(r)}>📤 Send</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── TUTOR FORM REQUESTS ── */}
        {tab === 'tutormessages' && (
          <>
            <h3 style={{ marginBottom: '1rem' }}>Tutor from request ({tutorFormRequests.length})</h3>
            {tutorFormRequests.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">📫</div><p>No tutor application forms submitted yet.</p></div>
            ) : (
              <div className="cards-grid">
                {tutorFormRequests.map(app => (
                  <div key={app._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', position: 'relative' }}>
                    
                    {app.status === 'approved' && (
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--green)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        ✅ Approved
                      </div>
                    )}

                    {app.status === 'rejected' && (
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--red)', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        ❌ Rejected
                      </div>
                    )}
                    
                    <div style={{ paddingBottom: '0.8rem', borderBottom: '1px solid var(--bg-card2)' }}>
                      <h4 style={{ color: 'var(--primary)', marginBottom: '0.4rem' }}>{app.studentName}</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.85rem', color: 'var(--text-secondary)', gap: '0.4rem' }}>
                        <span><strong>ID:</strong> {app.studentId}</span>
                        <span><strong>Email:</strong> {app.email}</span>
                        <span><strong>Subject:</strong> {app.subject}</span>
                        <span><strong>Status:</strong> {app.status}</span>
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                        <strong>Experience:</strong> {app.experience}
                      </p>
                      <p style={{ fontSize: '0.95rem', lineHeight: '1.6', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                        "{app.description || 'No additional description'}"
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--bg-card2)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(app.createdAt).toLocaleString()}
                      </span>
                      
                      {app.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-success" style={{ fontWeight: 'bold' }} onClick={() => handleTutorFormAction(app._id, 'approve')}>
                            Approve
                          </button>
                          <button className="btn-danger" onClick={() => handleTutorFormAction(app._id, 'reject')}>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 'bold' }}>Done</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Note Modal */}
      {isNoteModalOpen && sendNoteRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsNoteModalOpen(false)}>
          <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📤 Generated Note</h3>
            
            <div style={{ background: 'var(--bg-dark)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '1rem', color: 'var(--text-primary)' }}>
              {`Module: ${sendNoteRequest.moduleName}\nCategory: ${sendNoteRequest.category}\nUniversity: ${sendNoteRequest.university || 'N/A'}\nStudents: ${sendNoteRequest.studentsCount}\nPreferred Time: ${sendNoteRequest.preferredTime && sendNoteRequest.preferredTime.length > 0 ? sendNoteRequest.preferredTime.join(', ') : 'N/A'}`}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn-secondary" onClick={() => setIsNoteModalOpen(false)}>Close</button>
              <button className="btn-primary" onClick={handleCopyNote}>📋 Copy Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeIgniterDashboard;
