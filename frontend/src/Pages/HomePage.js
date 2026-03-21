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
          <span className="brand-name">UniConnect</span>
        </div>
        <div className="nav-links">
          <button className="nav-btn" onClick={scrollToCourses}>
            Courses
          </button>
          <button className="nav-btn admin-btn" onClick={() => navigate('/admin')}>
            Admin Panel
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
                <p>No faculties yet. Please ask an admin to add faculties.</p>
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
