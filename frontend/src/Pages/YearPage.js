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
          <a href="/" className="nav-link">Home</a>
          <button className="nav-btn" onClick={() => navigate('/faculties')}>Courses</button>
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
            <p>No years configured yet. Please ask an admin to add years.</p>
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
