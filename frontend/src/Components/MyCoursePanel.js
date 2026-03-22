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
// Pattern-based: works for ALL faculties — including new ones added by admin.
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
