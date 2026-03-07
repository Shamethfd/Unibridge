import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/login`,
        formData
      );
      if (response.data.success) {
        toast.success('Admin login successful!');
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setTimeout(() => navigate('/admin-dashboard'), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ar-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #f0f4f8;
        }

        /* LEFT PANEL */
        .ar-left {
          position: relative;
          width: 48%;
          background: linear-gradient(150deg, #062d55 0%, #094886 45%, #1a6dbf 80%, #2563eb 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem 2.5rem;
          overflow: hidden;
          color: white;
        }
        .ar-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(37,99,235,0.25) 0%, transparent 70%),
            radial-gradient(ellipse 50% 60% at 80% 80%, rgba(9,72,134,0.30) 0%, transparent 70%);
          pointer-events: none;
        }
        .ar-ring1, .ar-ring2 {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.09);
          pointer-events: none;
        }
        .ar-ring1 { width: 520px; height: 520px; top: -160px; left: -160px; animation: ar-spin 35s linear infinite; }
        .ar-ring2 { width: 360px; height: 360px; bottom: -100px; right: -80px; animation: ar-spin 25s linear infinite reverse; }
        @keyframes ar-spin { to { transform: rotate(360deg); } }

        .ar-dots {
          position: absolute;
          top: 44px; right: 44px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 9px;
          opacity: 0.18;
          pointer-events: none;
        }
        .ar-dot { width: 4px; height: 4px; background: white; border-radius: 50%; }

        .ar-glow {
          position: absolute;
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(37,99,235,0.30) 0%, transparent 70%);
          bottom: -40px; left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }

        .ar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 3rem;
          z-index: 1;
        }
        .ar-brand-icon {
          width: 46px; height: 46px;
          background: rgba(255,255,255,0.13);
          border: 1.5px solid rgba(255,255,255,0.28);
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(10px);
        }
        .ar-brand-name {
          font-family: 'Sora', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .ar-shield-wrap { z-index: 1; margin-bottom: 1.8rem; }
        .ar-shield-circle {
          width: 88px; height: 88px;
          background: rgba(255,255,255,0.09);
          border: 2px solid rgba(255,255,255,0.20);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
          animation: ar-pulse 2.8s ease-in-out infinite;
        }
        @keyframes ar-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.18); }
          50%       { box-shadow: 0 0 0 16px rgba(255,255,255,0); }
        }

        .ar-headline {
          font-family: 'Sora', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.18;
          text-align: center;
          margin-bottom: 1.1rem;
          z-index: 1;
        }
        .ar-headline span { color: #93c5fd; }

        .ar-sub {
          font-size: 0.91rem;
          color: rgba(255,255,255,0.66);
          text-align: center;
          line-height: 1.72;
          max-width: 310px;
          z-index: 1;
          margin-bottom: 2.4rem;
        }

        .ar-pills {
          display: flex;
          flex-direction: column;
          gap: 9px;
          z-index: 1;
          width: 100%;
          max-width: 296px;
        }
        .ar-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.13);
          border-radius: 12px;
          font-size: 0.84rem;
          color: rgba(255,255,255,0.86);
          backdrop-filter: blur(4px);
        }
        .ar-pill-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #93c5fd;
          flex-shrink: 0;
          box-shadow: 0 0 7px rgba(147,197,253,0.70);
        }

        /* RIGHT PANEL */
        .ar-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: #f8fafc;
        }

        .ar-card {
          width: 100%;
          max-width: 440px;
          background: white;
          border-radius: 24px;
          padding: 2.6rem 2.4rem;
          box-shadow:
            0 4px 6px -1px rgba(9,72,134,0.07),
            0 20px 60px -10px rgba(9,72,134,0.13),
            0 0 0 1px rgba(9,72,134,0.05);
          animation: ar-cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes ar-cardIn {
          from { opacity: 0; transform: translateY(26px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ar-banner {
          display: flex;
          gap: 11px;
          align-items: flex-start;
          padding: 12px 14px;
          background: #eff6ff;
          border: 1.5px solid #bfdbfe;
          border-radius: 14px;
          margin-bottom: 1.8rem;
        }
        .ar-banner-icon {
          width: 32px; height: 32px;
          background: #dbeafe;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ar-banner-title {
          font-family: 'Sora', sans-serif;
          font-size: 0.83rem;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 2px;
        }
        .ar-banner-desc {
          font-size: 0.78rem;
          color: #3b82f6;
          line-height: 1.5;
        }

        .ar-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #0f1e35;
          margin-bottom: 0.3rem;
        }
        .ar-subtitle {
          font-size: 0.88rem;
          color: #64748b;
          margin-bottom: 1.8rem;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .ar-subtitle a {
          color: #2563eb;
          font-weight: 500;
          text-decoration: none;
        }
        .ar-subtitle a:hover { text-decoration: underline; }

        .ar-field { margin-bottom: 1.2rem; }
        .ar-field label {
          display: block;
          font-size: 0.83rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        .ar-input-wrap { position: relative; }
        .ar-input-ico {
          position: absolute;
          left: 13px; top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          display: flex;
          pointer-events: none;
        }
        .ar-field input {
          width: 100%;
          padding: 11px 12px 11px 40px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: 'DM Sans', sans-serif;
          color: #1e293b;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .ar-field input:focus {
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.10);
        }
        .ar-pw-btn {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #94a3b8;
          display: flex; padding: 2px;
          transition: color 0.2s;
        }
        .ar-pw-btn:hover { color: #2563eb; }

        .ar-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #094886 0%, #2563eb 100%);
          color: white;
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 4px 16px rgba(37,99,235,0.30);
          letter-spacing: 0.2px;
          margin-top: 0.4rem;
          margin-bottom: 1.5rem;
        }
        .ar-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.38);
        }
        .ar-btn:active:not(:disabled) { transform: translateY(0); }
        .ar-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .ar-btn-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .ar-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.30);
          border-top-color: white;
          border-radius: 50%;
          animation: ar-spin 0.65s linear infinite;
        }

        .ar-cred {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 16px;
        }
        .ar-cred-title {
          font-family: 'Sora', sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.7px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ar-cred-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 0;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.83rem;
        }
        .ar-cred-row:last-child { border-bottom: none; padding-bottom: 0; }
        .ar-cred-key { color: #94a3b8; min-width: 64px; font-weight: 500; }
        .ar-cred-val {
          font-family: 'Courier New', monospace;
          font-size: 0.82rem;
          background: #dbeafe;
          color: #1d4ed8;
          padding: 2px 9px;
          border-radius: 6px;
        }

        .ar-footer { margin-top: 1.4rem; text-align: center; }
        .ar-home-link {
          font-size: 0.84rem;
          color: #94a3b8;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: color 0.2s;
        }
        .ar-home-link:hover { color: #475569; }

        @media (max-width: 768px) {
          .ar-left { display: none; }
          .ar-right { background: #f0f4f8; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="ar-root">

        {/* LEFT PANEL */}
        <div className="ar-left">
          <div className="ar-ring1" />
          <div className="ar-ring2" />
          <div className="ar-glow" />
          <div className="ar-dots">
            {Array.from({ length: 30 }).map((_, i) => <div className="ar-dot" key={i} />)}
          </div>

          <div className="ar-brand">
            <div className="ar-brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="ar-brand-name">LearnBridge</span>
          </div>

          <div className="ar-shield-wrap">
            <div className="ar-shield-circle">
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9,12 11,14 15,10"/>
              </svg>
            </div>
          </div>

          <h1 className="ar-headline">
            Restricted<br /><span>Admin</span> Access
          </h1>

          <p className="ar-sub">
            This portal is exclusively for authorized administrators. Unauthorized access attempts are monitored and logged.
          </p>

          <div className="ar-pills">
            <div className="ar-pill">
              <span className="ar-pill-dot" />
              Full system control & user management
            </div>
            <div className="ar-pill">
              <span className="ar-pill-dot" />
              Resource & content moderation
            </div>
            <div className="ar-pill">
              <span className="ar-pill-dot" />
              Analytics & reporting dashboard
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="ar-right">
          <div className="ar-card">

            <div className="ar-banner">
              <div className="ar-banner-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <div className="ar-banner-title">Restricted Admin Portal</div>
                <div className="ar-banner-desc">Only authorized administrators may access this area. Activity is monitored.</div>
              </div>
            </div>

            <h2 className="ar-title">Admin Sign In</h2>
            <div className="ar-subtitle">
              <span>Not an admin?</span>
              <Link to="/login">Go to User Login</Link>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ar-field">
                <label htmlFor="email">Admin Email</label>
                <div className="ar-input-wrap">
                  <span className="ar-input-ico">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    id="email" name="email" type="email" required
                    placeholder="admin@learnbridge.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="ar-field" style={{ marginBottom: '1.6rem' }}>
                <label htmlFor="password">Admin Password</label>
                <div className="ar-input-wrap">
                  <span className="ar-input-ico">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button type="button" className="ar-pw-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="ar-btn" disabled={loading}>
                <span className="ar-btn-inner">
                  {loading ? (
                    <><div className="ar-spinner" /> Authenticating…</>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <polyline points="9,12 11,14 15,10"/>
                      </svg>
                      Sign In as Admin
                    </>
                  )}
                </span>
              </button>
            </form>

            <div className="ar-cred">
              <div className="ar-cred-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Default Credentials
              </div>
              <div className="ar-cred-row">
                <span className="ar-cred-key">Email</span>
                <span className="ar-cred-val">admin@learnbridge.com</span>
              </div>
              <div className="ar-cred-row">
                <span className="ar-cred-key">Password</span>
                <span className="ar-cred-val">123456</span>
              </div>
            </div>

            <div className="ar-footer">
              <Link to="/" className="ar-home-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/>
                  <polyline points="12,19 5,12 12,5"/>
                </svg>
                Back to Home
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;