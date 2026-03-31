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

  return (
    <div className="home-page">
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

      <footer className="footer">
        <p>© 2026 UniConnect — Module & Study Request Management System</p>
      </footer>
    </div>
  );
};

export default HomePage;
