import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { signInWithGoogle } from '../services/googleAuthSimple';

const Login = () => {
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
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`,
        formData
      );
      if (response.data.success) {
        toast.success('Login successful!');
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        const userRole = response.data.data.user.role;
        if (userRole === 'admin') {
          window.location.href = '/admin-dashboard';
        } else if (userRole === 'resourceManager') {
          window.location.href = '/manage-resources';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithGoogle();
      
      if (response.success) {
        toast.success('Google login successful!');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        const userRole = response.data.user.role;
        switch (userRole) {
          case 'admin': navigate('/admin-dashboard', { replace: true }); break;
          case 'resourceManager': navigate('/manage-resources', { replace: true }); break;
          case 'coordinator': navigate('/dashboard', { replace: true }); break;
          default: navigate('/dashboard', { replace: true }); break;
        }
      }
    } catch (error) {
      toast.error('Google login failed. Please try again.');
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #f0f4f8;
        }

        /* ── LEFT PANEL ── */
        .left-panel {
          position: relative;
          width: 48%;
          background: linear-gradient(145deg, #094886 0%, #0d5fa3 50%, #2563eb 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem;
          overflow: hidden;
          color: white;
        }

        /* decorative circles */
        .left-panel::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.10);
          top: -120px; left: -120px;
          animation: slowSpin 30s linear infinite;
        }
        .left-panel::after {
          content: '';
          position: absolute;
          width: 340px; height: 340px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.08);
          bottom: -80px; right: -60px;
        }
        @keyframes slowSpin {
          to { transform: rotate(360deg); }
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 3.5rem;
          z-index: 1;
        }
        .brand-icon {
          width: 46px; height: 46px;
          background: rgba(255,255,255,0.15);
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(8px);
        }
        .brand-name {
          font-family: 'Sora', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.3px;
        }

        .left-headline {
          font-family: 'Sora', sans-serif;
          font-size: 2.6rem;
          font-weight: 800;
          line-height: 1.2;
          text-align: center;
          margin-bottom: 1.2rem;
          z-index: 1;
        }
        .left-headline span {
          color: #93c5fd;
        }
        .left-sub {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.72);
          text-align: center;
          line-height: 1.7;
          max-width: 340px;
          z-index: 1;
          margin-bottom: 3rem;
        }

        .stats-row {
          display: flex;
          gap: 2rem;
          z-index: 1;
        }
        .stat-box {
          text-align: center;
        }
        .stat-num {
          font-family: 'Sora', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
        }
        .stat-label {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.6);
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dots-grid {
          position: absolute;
          top: 60px; right: 40px;
          display: grid;
          grid-template-columns: repeat(5, 6px);
          gap: 8px;
          opacity: 0.2;
        }
        .dot { width: 4px; height: 4px; background: white; border-radius: 50%; }

        /* ── RIGHT PANEL ── */
        .right-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: #f8fafc;
        }

        .form-card {
          width: 100%;
          max-width: 440px;
          background: white;
          border-radius: 24px;
          padding: 2.6rem 2.4rem;
          box-shadow:
            0 4px 6px -1px rgba(9,72,134,0.06),
            0 20px 60px -10px rgba(9,72,134,0.12),
            0 0 0 1px rgba(9,72,134,0.05);
          animation: cardIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #0f1e35;
          margin-bottom: 0.35rem;
        }
        .form-subtitle {
          font-size: 0.88rem;
          color: #64748b;
          margin-bottom: 2rem;
        }
        .form-subtitle a {
          color: #2563eb;
          font-weight: 500;
          text-decoration: none;
        }
        .form-subtitle a:hover { text-decoration: underline; }

        /* admin link */
        .admin-link-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.5rem;
        }
        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 20px;
          font-size: 0.78rem;
          color: #dc2626;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.2s;
        }
        .admin-badge:hover { background: #fee2e2; }

        /* field */
        .field { margin-bottom: 1.2rem; }
        .field label {
          display: block;
          font-size: 0.83rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }
        .input-wrap { position: relative; }
        .input-icon {
          position: absolute;
          left: 13px; top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          display: flex;
        }
        .field input {
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
        .field input:focus {
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.10);
        }
        .pw-toggle {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #94a3b8;
          display: flex; padding: 2px;
        }
        .pw-toggle:hover { color: #2563eb; }

        /* row */
        .row-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .checkbox-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.84rem; color: #475569; cursor: pointer;
        }
        .checkbox-label input[type="checkbox"] {
          accent-color: #2563eb;
          width: 16px; height: 16px;
        }
        .forgot-link {
          font-size: 0.84rem;
          color: #2563eb;
          font-weight: 500;
          text-decoration: none;
        }
        .forgot-link:hover { text-decoration: underline; }

        /* submit */
        .btn-submit {
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
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(37,99,235,0.30);
          letter-spacing: 0.2px;
        }
        .btn-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.38);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.65; cursor: not-allowed; }

        .btn-inner {
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* divider */
        .divider {
          display: flex; align-items: center; gap: 12px;
          margin: 1.5rem 0;
        }
        .divider-line { flex: 1; height: 1px; background: #e2e8f0; }
        .divider-text { font-size: 0.78rem; color: #94a3b8; white-space: nowrap; }

        /* social */
        .social-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .social-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          font-size: 0.84rem;
          font-weight: 500;
          color: #374151;
          text-decoration: none;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }
        .social-btn:hover {
          border-color: #2563eb;
          background: #eff6ff;
          transform: translateY(-1px);
        }
        .social-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

        /* responsive */
        @media (max-width: 768px) {
          .left-panel { display: none; }
          .right-panel { background: #f0f4f8; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="login-root">

        {/* ── LEFT PANEL ── */}
        <div className="left-panel">

          {/* dot grid decoration */}
          <div className="dots-grid">
            {Array.from({ length: 25 }).map((_, i) => (
              <div className="dot" key={i} />
            ))}
          </div>

          {/* brand */}
          <div className="brand-logo">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="brand-name">LearnBridge</span>
          </div>

          <h1 className="left-headline">
            Bridge the Gap<br />Between <span>Learning</span><br />& Opportunity
          </h1>

          <p className="left-sub">
            Connect with expert educators, access curated resources, and accelerate your learning journey with LearnBridge.
          </p>

          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-num">50K+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">1.2K</div>
              <div className="stat-label">Courses</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">98%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="right-panel">
          <div className="form-card">

            <h2 className="form-title">Welcome back 👋</h2>
            <p className="form-subtitle">
              New here?&nbsp;
              <Link to="/register">Create a free account</Link>
            </p>

            <div className="admin-link-row">
              <Link to="/admin-login" className="admin-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Admin Login
              </Link>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="field">
                <label htmlFor="email">Email address</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </span>
                  <input
                    id="email" name="email" type="email"
                    autoComplete="email" required
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <span className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password" required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password"
                  >
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

              {/* Remember + Forgot */}
              <div className="row-between">
                <label className="checkbox-label">
                  <input type="checkbox" name="remember-me" />
                  Remember me
                </label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>

              {/* Submit */}
              <button type="submit" className="btn-submit" disabled={loading}>
                <span className="btn-inner">
                  {loading ? (
                    <><div className="spinner" /> Signing in…</>
                  ) : (
                    <>
                      Sign in
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12,5 19,12 12,19"/>
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">Or continue with</span>
              <div className="divider-line" />
            </div>

            {/* Social */}
            <div className="social-row">
              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="social-btn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.627 0-12 5.373-12 12s5.373 12 12 12c6.965 0 11.58-4.915 11.58-11.846 0-.799-.071-1.534-.205-2.269H12.24z" fill="#4285F4"/>
                </svg>
                Google
              </button>
              <a href="#" className="social-btn">
                <svg viewBox="0 0 24 24" fill="#1f2937">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                GitHub
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Login;