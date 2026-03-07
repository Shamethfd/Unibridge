import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', phone: '', bio: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token) { navigate('/login'); return; }
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setProfileData({
        firstName: userData.profile?.firstName || '',
        lastName: userData.profile?.lastName || '',
        phone: userData.profile?.phone || '',
        bio: userData.profile?.bio || ''
      });
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const u = response.data.data.user;
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
        setProfileData({
          firstName: u.profile?.firstName || '',
          lastName: u.profile?.lastName || '',
          phone: u.profile?.phone || '',
          bio: u.profile?.bio || ''
        });
      }
    } catch (error) {
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/profile`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setUser(response.data.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setEditMode(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const getInitials = () => {
    const f = user?.profile?.firstName || '';
    const l = user?.profile?.lastName || '';
    if (f || l) return `${f[0] || ''}${l[0] || ''}`.toUpperCase();
    return (user?.username?.[0] || 'U').toUpperCase();
  };

  const getRoleColor = (role) => {
    const map = { admin: '#7c3aed', resourceManager: '#059669', coordinator: '#d97706', student: '#2563eb' };
    return map[role] || '#2563eb';
  };

  const getRoleLabel = (role) => {
    const map = { admin: 'Administrator', resourceManager: 'Resource Manager', coordinator: 'Coordinator', student: 'Student' };
    return map[role] || role;
  };

  if (loading && !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: 16, color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const isManager = user?.role === 'admin' || user?.role === 'resourceManager';
  const isStudent = user?.role === 'student';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .db-root {
          min-height: 100vh;
          background: #f0f4f8;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          flex-direction: column;
        }

        /* ── NAVBAR ── */
        .db-nav {
          position: sticky; top: 0; z-index: 50;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 12px rgba(9,72,134,0.07);
        }
        .db-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .db-nav-brand {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .db-nav-logo {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #094886 0%, #2563eb 100%);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-nav-name {
          font-family: 'Sora', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f1e35;
          letter-spacing: -0.2px;
        }

        .db-nav-links {
          display: flex; align-items: center; gap: 4px;
          flex: 1;
          justify-content: center;
        }
        .db-nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          border-radius: 10px;
          font-size: 0.84rem;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .db-nav-link:hover { background: #f1f5f9; color: #094886; }
        .db-nav-link.blue {
          background: #eff6ff;
          color: #2563eb;
        }
        .db-nav-link.blue:hover { background: #dbeafe; }

        .db-nav-right { display: flex; align-items: center; gap: 10px; }

        .db-avatar-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #094886 0%, #2563eb 100%);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        .db-logout-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: white;
          font-size: 0.84rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .db-logout-btn:hover { border-color: #fca5a5; color: #dc2626; background: #fff5f5; }

        /* ── PAGE BODY ── */
        .db-body {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          width: 100%;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* ── SIDEBAR (Profile) ── */
        .db-sidebar { display: flex; flex-direction: column; gap: 1.2rem; }

        .db-profile-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(9,72,134,0.07), 0 0 0 1px rgba(9,72,134,0.05);
          animation: db-fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .db-profile-banner {
          height: 72px;
          background: linear-gradient(135deg, #094886 0%, #2563eb 100%);
          position: relative;
        }
        .db-profile-banner::after {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .db-avatar-wrap {
          padding: 0 1.5rem;
          margin-top: -24px;
          position: relative;
          z-index: 1;
        }
        .db-avatar {
          width: 52px; height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #094886 0%, #2563eb 100%);
          border: 3px solid white;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          box-shadow: 0 4px 12px rgba(9,72,134,0.25);
        }
        .db-profile-info { padding: 0.8rem 1.5rem 1.5rem; }
        .db-profile-name {
          font-family: 'Sora', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: #0f1e35;
          margin-bottom: 2px;
        }
        .db-profile-username { font-size: 0.82rem; color: #94a3b8; margin-bottom: 10px; }
        .db-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          margin-bottom: 1rem;
          letter-spacing: 0.2px;
        }
        .db-divider { height: 1px; background: #f1f5f9; margin: 0 0 1rem; }

        .db-info-row { margin-bottom: 10px; }
        .db-info-label {
          font-size: 0.73rem;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 2px;
        }
        .db-info-value { font-size: 0.87rem; color: #334155; }

        .db-edit-btn {
          width: 100%;
          padding: 9px;
          background: linear-gradient(135deg, #094886 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Sora', sans-serif;
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 3px 12px rgba(37,99,235,0.28);
          margin-top: 0.8rem;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .db-edit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,99,235,0.35); }

        /* Edit form */
        .db-edit-form { padding: 0 1.5rem 1.5rem; }
        .db-edit-form-title {
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f1e35;
          margin-bottom: 1rem;
        }
        .db-field { margin-bottom: 0.9rem; }
        .db-field label {
          display: block;
          font-size: 0.78rem;
          font-weight: 500;
          color: #475569;
          margin-bottom: 4px;
        }
        .db-field input, .db-field textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif;
          color: #1e293b;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          resize: none;
        }
        .db-field input:focus, .db-field textarea:focus {
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.10);
        }
        .db-form-actions { display: flex; gap: 8px; margin-top: 1rem; }
        .db-save-btn {
          flex: 1; padding: 9px;
          background: linear-gradient(135deg, #094886 0%, #2563eb 100%);
          color: white; border: none; border-radius: 10px;
          font-family: 'Sora', sans-serif; font-size: 0.86rem; font-weight: 600;
          cursor: pointer; transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 3px 10px rgba(37,99,235,0.28);
        }
        .db-save-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .db-save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .db-cancel-btn {
          flex: 1; padding: 9px;
          background: #f1f5f9; color: #475569;
          border: 1.5px solid #e2e8f0; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 0.86rem; font-weight: 500;
          cursor: pointer; transition: background 0.15s;
        }
        .db-cancel-btn:hover { background: #e2e8f0; }

        /* ── MAIN CONTENT ── */
        .db-main { display: flex; flex-direction: column; gap: 1.2rem; }

        /* Welcome hero */
        .db-welcome {
          background: linear-gradient(135deg, #094886 0%, #1a6dbf 50%, #2563eb 100%);
          border-radius: 20px;
          padding: 1.8rem 2rem;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(9,72,134,0.20);
          animation: db-fadeUp 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both;
        }
        .db-welcome::before {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.08);
          right: -80px; top: -80px;
        }
        .db-welcome::after {
          content: '';
          position: absolute;
          width: 200px; height: 200px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.06);
          right: 60px; bottom: -60px;
        }
        .db-welcome-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.70);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 500;
        }
        .db-welcome-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 6px;
          line-height: 1.2;
        }
        .db-welcome-title span { color: #93c5fd; }
        .db-welcome-desc { font-size: 0.87rem; color: rgba(255,255,255,0.68); max-width: 380px; }

        .db-welcome-dots {
          position: absolute;
          top: 16px; right: 180px;
          display: grid;
          grid-template-columns: repeat(4, 6px);
          gap: 7px;
          opacity: 0.15;
        }
        .db-welcome-dot { width: 4px; height: 4px; background: white; border-radius: 50%; }

        /* Stats row */
        .db-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          animation: db-fadeUp 0.4s 0.10s cubic-bezier(0.16,1,0.3,1) both;
        }
        .db-stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.2rem 1.4rem;
          box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04);
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .db-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(9,72,134,0.10); }
        .db-stat-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .db-stat-num {
          font-family: 'Sora', sans-serif;
          font-size: 1.5rem;
          font-weight: 800;
          line-height: 1;
          color: #0f1e35;
        }
        .db-stat-label { font-size: 0.78rem; color: #94a3b8; margin-top: 2px; font-weight: 500; }

        /* Action cards */
        .db-section {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04);
          animation: db-fadeUp 0.4s 0.15s cubic-bezier(0.16,1,0.3,1) both;
        }
        .db-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f1e35;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .db-section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #f1f5f9;
        }

        .db-action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 10px;
        }
        .db-action-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 1.1rem;
          border: 1.5px solid #f1f5f9;
          border-radius: 14px;
          text-decoration: none;
          transition: border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s;
          background: #fafbfc;
          position: relative;
          overflow: hidden;
        }
        .db-action-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 14px 14px 0 0;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .db-action-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(9,72,134,0.08); border-color: transparent; }
        .db-action-card:hover::before { opacity: 1; }

        .db-action-card.blue { --card-color: #2563eb; }
        .db-action-card.blue:hover { background: #eff6ff; }
        .db-action-card.blue::before { background: linear-gradient(90deg, #094886, #2563eb); }

        .db-action-card.green { --card-color: #059669; }
        .db-action-card.green:hover { background: #f0fdf4; }
        .db-action-card.green::before { background: linear-gradient(90deg, #047857, #059669); }

        .db-action-card.purple { --card-color: #7c3aed; }
        .db-action-card.purple:hover { background: #faf5ff; }
        .db-action-card.purple::before { background: linear-gradient(90deg, #6d28d9, #7c3aed); }

        .db-action-card.amber { --card-color: #d97706; }
        .db-action-card.amber:hover { background: #fffbeb; }
        .db-action-card.amber::before { background: linear-gradient(90deg, #b45309, #d97706); }

        .db-action-ico {
          width: 36px; height: 36px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .db-action-label {
          font-family: 'Sora', sans-serif;
          font-size: 0.86rem;
          font-weight: 600;
          color: #0f1e35;
          line-height: 1.3;
        }
        .db-action-desc { font-size: 0.77rem; color: #94a3b8; line-height: 1.5; }

        /* Empty state */
        .db-empty {
          text-align: center;
          padding: 2.5rem 1rem;
          color: #94a3b8;
        }
        .db-empty-ico {
          width: 48px; height: 48px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }
        .db-empty p { font-size: 0.88rem; }
        .db-empty span { font-size: 0.80rem; color: #cbd5e1; display: block; margin-top: 4px; }

        @keyframes db-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .db-body { grid-template-columns: 1fr; }
          .db-nav-links { display: none; }
        }
        @media (max-width: 640px) {
          .db-stats { grid-template-columns: 1fr 1fr; }
          .db-body { padding: 1rem; }
          .db-welcome-title { font-size: 1.25rem; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="db-root">

        {/* ── NAVBAR ── */}
        <nav className="db-nav">
          <div className="db-nav-inner">
            {/* Brand */}
            <Link to="/dashboard" className="db-nav-brand">
              <div className="db-nav-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="db-nav-name">LearnBridge</span>
            </Link>

            {/* Nav links */}
            <div className="db-nav-links">
              <Link to="/resources" className="db-nav-link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                Resources
              </Link>

              {isStudent && (
                <Link to="/submit-resource" className="db-nav-link blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Submit Resource
                </Link>
              )}

              {isManager && (
                <>
                  <Link to="/manage-resources" className="db-nav-link">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Manage
                  </Link>
                  <Link to="/manage-modules" className="db-nav-link">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Modules
                  </Link>
                  <Link to="/upload-resource" className="db-nav-link blue">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload
                  </Link>
                </>
              )}
            </div>

            {/* Right */}
            <div className="db-nav-right">
              <div className="db-avatar-btn">{getInitials()}</div>
              <button onClick={handleLogout} className="db-logout-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* ── PAGE BODY ── */}
        <div className="db-body">

          {/* SIDEBAR */}
          <aside className="db-sidebar">
            <div className="db-profile-card">
              <div className="db-profile-banner" />
              <div className="db-avatar-wrap">
                <div className="db-avatar">{getInitials()}</div>
              </div>

              {editMode ? (
                <div className="db-edit-form">
                  <p className="db-edit-form-title">Edit Profile</p>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="db-field">
                      <label>First Name</label>
                      <input type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} placeholder="First name" />
                    </div>
                    <div className="db-field">
                      <label>Last Name</label>
                      <input type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} placeholder="Last name" />
                    </div>
                    <div className="db-field">
                      <label>Phone</label>
                      <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} placeholder="+94 77 000 0000" />
                    </div>
                    <div className="db-field">
                      <label>Bio</label>
                      <textarea name="bio" rows={3} value={profileData.bio} onChange={handleProfileChange} placeholder="Tell us about yourself…" />
                    </div>
                    <div className="db-form-actions">
                      <button type="submit" className="db-save-btn" disabled={loading}>
                        {loading ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button type="button" className="db-cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="db-profile-info">
                  <p className="db-profile-name">
                    {user?.profile?.firstName || user?.profile?.lastName
                      ? `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim()
                      : user?.username || 'User'}
                  </p>
                  <p className="db-profile-username">@{user?.username}</p>

                  <span
                    className="db-role-badge"
                    style={{
                      background: `${getRoleColor(user?.role)}18`,
                      color: getRoleColor(user?.role),
                      border: `1px solid ${getRoleColor(user?.role)}30`
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: getRoleColor(user?.role), display: 'inline-block' }} />
                    {getRoleLabel(user?.role)}
                  </span>

                  <div className="db-divider" />

                  <div className="db-info-row">
                    <p className="db-info-label">Email</p>
                    <p className="db-info-value">{user?.email}</p>
                  </div>
                  {user?.profile?.phone && (
                    <div className="db-info-row">
                      <p className="db-info-label">Phone</p>
                      <p className="db-info-value">{user.profile.phone}</p>
                    </div>
                  )}
                  {user?.profile?.bio && (
                    <div className="db-info-row">
                      <p className="db-info-label">Bio</p>
                      <p className="db-info-value" style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.83rem' }}>{user.profile.bio}</p>
                    </div>
                  )}

                  <button className="db-edit-btn" onClick={() => setEditMode(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* MAIN */}
          <main className="db-main">

            {/* Welcome hero */}
            <div className="db-welcome">
              <div className="db-welcome-dots">
                {Array.from({ length: 16 }).map((_, i) => <div className="db-welcome-dot" key={i} />)}
              </div>
              <p className="db-welcome-sub">Welcome back</p>
              <h2 className="db-welcome-title">
                Hello, <span>{user?.profile?.firstName || user?.username || 'there'}</span> 👋
              </h2>
              <p className="db-welcome-desc">
                {isStudent
                  ? 'Explore resources, submit your materials, and track your learning progress.'
                  : 'Manage resources, moderate content, and keep the platform running smoothly.'}
              </p>
            </div>

            {/* Stats */}
            <div className="db-stats">
              <div className="db-stat-card">
                <div className="db-stat-icon" style={{ background: '#eff6ff' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div>
                  <p className="db-stat-num">0</p>
                  <p className="db-stat-label">Uploaded</p>
                </div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon" style={{ background: '#f0fdf4' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </div>
                <div>
                  <p className="db-stat-num">0</p>
                  <p className="db-stat-label">Downloads</p>
                </div>
              </div>
              <div className="db-stat-card">
                <div className="db-stat-icon" style={{ background: '#faf5ff' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </div>
                <div>
                  <p className="db-stat-num">0</p>
                  <p className="db-stat-label">Viewed</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="db-section">
              <h3 className="db-section-title">Quick Actions</h3>
              <div className="db-action-grid">

                <Link to="/resources" className="db-action-card blue">
                  <div className="db-action-ico" style={{ background: '#eff6ff' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="db-action-label">Browse Resources</p>
                    <p className="db-action-desc">Access approved learning materials</p>
                  </div>
                </Link>

                {isStudent && (
                  <Link to="/submit-resource" className="db-action-card blue">
                    <div className="db-action-ico" style={{ background: '#eff6ff' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div>
                      <p className="db-action-label">Submit Resource</p>
                      <p className="db-action-desc">Share your learning materials</p>
                    </div>
                  </Link>
                )}

                {isManager && (
                  <>
                    <Link to="/manage-resources" className="db-action-card purple">
                      <div className="db-action-ico" style={{ background: '#faf5ff' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="db-action-label">Manage Resources</p>
                        <p className="db-action-desc">Review and approve submissions</p>
                      </div>
                    </Link>
                    <Link to="/manage-modules" className="db-action-card green">
                      <div className="db-action-ico" style={{ background: '#f0fdf4' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                      </div>
                      <div>
                        <p className="db-action-label">Manage Modules</p>
                        <p className="db-action-desc">Create and edit academic modules</p>
                      </div>
                    </Link>
                    <Link to="/upload-resource" className="db-action-card amber">
                      <div className="db-action-ico" style={{ background: '#fffbeb' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <div>
                        <p className="db-action-label">Upload Resource</p>
                        <p className="db-action-desc">Add new materials directly</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="db-section">
              <h3 className="db-section-title">Recent Activity</h3>
              <div className="db-empty">
                <div className="db-empty-ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <p>No recent activity yet</p>
                <span>Start browsing or uploading resources to see your activity here</span>
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;