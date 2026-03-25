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
