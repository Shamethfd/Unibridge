import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-name">UniConnect</span>
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link active">Home</a>
          <button className="nav-btn" onClick={() => navigate('/faculties')}>
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
          <div className="hero-badge">🚀 Smart Learning Requests</div>
          <h1 className="hero-title">
            Module & Study Request
            <span className="gradient-text"> Management System</span>
          </h1>
          <p className="hero-subtitle">
            Easily request study sessions, track demand, and connect with fellow students.
            Our smart system prioritizes sessions based on urgency and demand.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/faculties')}>
              📚 Browse Courses
            </button>
            <button className="btn-secondary" onClick={() => navigate('/admin')}>
              ⚙️ Admin Dashboard
            </button>
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

      {/* Features Section */}
      <div className="features-section">
        <h2 className="section-title">Why Use Our System?</h2>
        <div className="features-grid">
          {[
            { icon: '🔍', title: 'Duplicate Detection', desc: 'Automatically detects and groups similar requests' },
            { icon: '👥', title: 'Group Requests', desc: 'Join existing requests and boost priority' },
            { icon: '🎯', title: 'Urgency Levels', desc: 'Normal, Urgent, or Exam Priority support' },
            { icon: '📊', title: 'Heat Score', desc: 'Smart demand scoring based on students & urgency' },
            { icon: '💡', title: 'Smart Suggestions', desc: 'Related module suggestions as you browse' },
            { icon: '🔔', title: 'Notifications', desc: 'Get alerted when your request is accepted' },
          ].map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="cta-section">
        <h2>Ready to get started?</h2>
        <p>Click on Courses to explore faculties and submit your study request.</p>
        <button className="btn-primary large" onClick={() => navigate('/faculties')}>
          Get Started →
        </button>
      </div>

      <footer className="footer">
        <p>© 2026 UniConnect — Module & Study Request Management System</p>
      </footer>
    </div>
  );
};

export default HomePage;
