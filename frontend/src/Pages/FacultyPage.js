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

const FacultyPage = () => {
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

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="nav-brand"><span className="brand-icon">🎓</span><span className="brand-name">UniConnect</span></div>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <button className="nav-btn admin-btn" onClick={() => navigate('/admin')}>Admin Panel</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div className="breadcrumb"><a href="/">Home</a><span>/</span><span>Faculties</span></div>
          <h1 className="page-title">Select Your Faculty</h1>
          <p className="page-subtitle">Choose a faculty to browse available courses</p>
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
                <p>No faculties yet. Please ask an admin to add faculties.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyPage;
