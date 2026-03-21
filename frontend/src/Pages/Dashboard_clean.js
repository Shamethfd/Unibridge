import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [stats, setStats]     = useState({ totalResources: 0, totalModules: 0, recentActivity: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token) { navigate('/login'); return; }
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setNotices([
        { id: 1, title: 'Welcome to LearnBridge!', content: 'Your academic resource management platform is ready. Explore modules, submit resources, and collaborate with peers.', type: 'info', date: new Date().toISOString(), priority: 'high' },
        { id: 2, title: 'New Module Available', content: 'Advanced Web Development has been added to the curriculum. Check out the latest resources and materials.', type: 'success', date: new Date(Date.now() - 86400000).toISOString(), priority: 'medium' },
        { id: 3, title: 'System Maintenance', content: 'Scheduled maintenance this weekend from 2 AM to 4 AM. The platform may be temporarily unavailable.', type: 'warning', date: new Date(Date.now() - 172800000).toISOString(), priority: 'low' },
      ]);
      setStats({ totalResources: 156, totalModules: 24, recentActivity: 12 });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ds) => {
    const diff = Math.ceil(Math.abs(new Date() - new Date(ds)) / 864e5);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 7)  return `${diff} days ago`;
    return new Date(ds).toLocaleDateString();
  };

  const noticeConfig = {
    info:    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', leftBar: '#2563eb', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
    success: { color: '#059669', bg: '#f0fdf4', border: '#a7f3d0', leftBar: '#059669', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg> },
    warning: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', leftBar: '#d97706', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    error:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', leftBar: '#dc2626', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
  };

  const quickActions = [
    { title: 'Browse Resources', desc: 'Explore study materials', link: '/resources', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
    { title: 'Submit Resource', desc: 'Share your materials', link: '/submit-resource', color: '#059669', bg: '#f0fdf4', border: '#a7f3d0', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
    ...((user?.role === 'admin' || user?.role === 'resourceManager' || user?.role === 'coordinator') ? [
      { title: 'Manage Modules', desc: 'Create & edit modules', link: '/manage-modules', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
      { title: 'Manage Resources', desc: 'Review submissions', link: '/manage-resources', color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
    ] : []),
  ];

  const recentActivity = [
    { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, iconBg: '#eff6ff', text: 'New resource uploaded', detail: 'JavaScript Fundamentals', time: '2 hours ago' },
    { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>, iconBg: '#f0fdf4', text: 'New module created', detail: 'Machine Learning Basics', time: '5 hours ago' },
    { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, iconBg: '#faf5ff', text: 'New user joined', detail: 'John Doe', time: '1 day ago' },
  ];

  const getInitials = () => {
    const f = user?.profile?.firstName?.[0] || '';
    const l = user?.profile?.lastName?.[0] || '';
    return (f + l).toUpperCase() || (user?.username?.[0] || 'U').toUpperCase();
  };

  const roleLabel = { admin: 'Administrator', resourceManager: 'Resource Manager', coordinator: 'Coordinator', student: 'Student' };
  const roleColor = { admin: '#7c3aed', resourceManager: '#2563eb', coordinator: '#d97706', student: '#059669' };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500&display=swap'); @keyframes cd-spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 44, height: 44, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'cd-spin 0.7s linear infinite', margin: '0 auto 14px' }} />
          <p style={{ color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cd-root { min-height: 100vh; background: #f0f4f8; font-family: 'DM Sans', sans-serif; }

        /* BODY */
        .cd-body { max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem; }

        /* WELCOME HERO */
        .cd-hero {
          background: linear-gradient(135deg, #094886 0%, #1a6dbf 50%, #2563eb 100%);
          border-radius: 22px; padding: 2rem 2.4rem;
          color: white; position: relative; overflow: hidden;
          box-shadow: 0 6px 24px rgba(9,72,134,0.22);
          margin-bottom: 1.5rem;
          animation: cd-up 0.45s cubic-bezier(0.16,1,0.3,1) both;
        }
        .cd-hero::before { content: ''; position: absolute; width: 380px; height: 380px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.08); top: -120px; right: -80px; pointer-events: none; animation: cd-spin 38s linear infinite; }
        .cd-hero::after  { content: ''; position: absolute; width: 240px; height: 240px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.06); bottom: -70px; right: 180px; pointer-events: none; }
        @keyframes cd-spin { to { transform: rotate(360deg); } }

        .cd-hero-inner { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
        .cd-hero-left { z-index: 1; }
        .cd-hero-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.20); font-size: 0.78rem; font-weight: 600; font-family: 'Sora', sans-serif; color: rgba(255,255,255,0.90); margin-bottom: 10px; }
        .cd-hero-blink { width: 6px; height: 6px; border-radius: 50%; background: #93c5fd; box-shadow: 0 0 6px #93c5fd; animation: cd-blink 1.8s ease-in-out infinite; }
        @keyframes cd-blink { 0%,100%{opacity:1}50%{opacity:0.3} }
        .cd-hero-title { font-family: 'Sora', sans-serif; font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; line-height: 1.2; margin-bottom: 6px; }
        .cd-hero-title span { color: #93c5fd; }
        .cd-hero-sub { font-size: 0.9rem; color: rgba(255,255,255,0.68); line-height: 1.6; max-width: 440px; }

        .cd-profile-card { z-index: 1; background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.22); border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; backdrop-filter: blur(10px); flex-shrink: 0; }
        .cd-profile-av { width: 52px; height: 52px; border-radius: 50%; background: rgba(255,255,255,0.18); border: 2px solid rgba(255,255,255,0.35); display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 800; color: white; flex-shrink: 0; }
        .cd-profile-name { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: white; }
        .cd-profile-role { display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; padding: 3px 10px; border-radius: 20px; background: rgba(255,255,255,0.15); font-size: 0.74rem; font-weight: 600; font-family: 'Sora', sans-serif; color: rgba(255,255,255,0.90); }

        .cd-hero-dots { position: absolute; top: 16px; left: 50%; transform: translateX(-50%); display: grid; grid-template-columns: repeat(8,1fr); gap: 8px; opacity: 0.08; pointer-events: none; }
        .cd-hero-dot { width: 4px; height: 4px; background: white; border-radius: 50%; }

        /* STATS */
        .cd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; animation: cd-up 0.45s 0.06s cubic-bezier(0.16,1,0.3,1) both; }
        .cd-stat-card { background: white; border-radius: 16px; padding: 1.2rem 1.4rem; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04); transition: transform 0.15s, box-shadow 0.15s; }
        .cd-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(9,72,134,0.10); }
        .cd-stat-ico { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cd-stat-num { font-family: 'Sora', sans-serif; font-size: 1.6rem; font-weight: 800; color: #0f1e35; line-height: 1; }
        .cd-stat-label { font-size: 0.80rem; color: #94a3b8; font-weight: 500; margin-top: 3px; }

        /* 2-column grid */
        .cd-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.5rem; animation: cd-up 0.45s 0.12s cubic-bezier(0.16,1,0.3,1) both; }

        /* Cards */
        .cd-card { background: white; border-radius: 18px; box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04); overflow: hidden; }
        .cd-card-header { padding: 1.1rem 1.4rem 0; display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
        .cd-card-title { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f1e35; display: flex; align-items: center; gap: 8px; }
        .cd-view-all { font-size: 0.80rem; font-weight: 600; color: #2563eb; background: none; border: none; cursor: pointer; font-family: 'Sora', sans-serif; transition: color 0.15s; }
        .cd-view-all:hover { color: #094886; }
        .cd-card-body { padding: 0 1.4rem 1.4rem; }

        /* Notices */
        .cd-notice { display: flex; gap: 10px; padding: 11px 13px; border-radius: 12px; border: 1.5px solid; border-left: 4px solid; margin-bottom: 8px; transition: transform 0.15s, box-shadow 0.15s; }
        .cd-notice:last-child { margin-bottom: 0; }
        .cd-notice:hover { transform: translateX(2px); box-shadow: 0 3px 12px rgba(9,72,134,0.08); }
        .cd-notice-ico { width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cd-notice-title { font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 700; color: #0f1e35; margin-bottom: 3px; }
        .cd-notice-text { font-size: 0.80rem; color: #64748b; line-height: 1.5; margin-bottom: 5px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .cd-notice-time { font-size: 0.72rem; color: #94a3b8; font-weight: 500; }

        /* Quick actions */
        .cd-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cd-action-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 1.1rem 0.8rem; border-radius: 14px; border: 1.5px solid #f1f5f9; background: #fafbfc; text-decoration: none; transition: all 0.2s; position: relative; overflow: hidden; }
        .cd-action-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 14px 14px 0 0; opacity: 0; transition: opacity 0.2s; }
        .cd-action-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(9,72,134,0.08); border-color: transparent; }
        .cd-action-card:hover::before { opacity: 1; }
        .cd-action-ico { width: 44px; height: 44px; border-radius: 13px; display: flex; align-items: center; justify-content: center; border: 1.5px solid; }
        .cd-action-title { font-family: 'Sora', sans-serif; font-size: 0.84rem; font-weight: 700; color: #0f1e35; text-align: center; }
        .cd-action-desc { font-size: 0.76rem; color: #94a3b8; text-align: center; line-height: 1.4; }

        /* Activity */
        .cd-activity { background: white; border-radius: 18px; box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04); animation: cd-up 0.45s 0.18s cubic-bezier(0.16,1,0.3,1) both; }
        .cd-activity-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f8fafc; transition: background 0.15s; }
        .cd-activity-row:last-child { border-bottom: none; }
        .cd-activity-row:hover { background: #fafbfe; }
        .cd-activity-ico { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cd-activity-text { flex: 1; font-size: 0.86rem; color: #475569; }
        .cd-activity-text strong { color: #0f1e35; font-weight: 600; }
        .cd-activity-time { font-size: 0.76rem; color: #94a3b8; white-space: nowrap; flex-shrink: 0; }

        @keyframes cd-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1024px) { .cd-grid2 { grid-template-columns: 1fr; } }
        @media (max-width: 640px) {
          .cd-stats { grid-template-columns: 1fr; }
          .cd-actions-grid { grid-template-columns: 1fr 1fr; }
          .cd-body { padding: 1rem; }
          .cd-hero { padding: 1.4rem; }
          .cd-hero-inner { flex-direction: column; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="cd-root">
        <div className="cd-body">

          {/* HERO */}
          <div className="cd-hero">
            <div className="cd-hero-dots">
              {Array.from({ length: 24 }).map((_, i) => <div className="cd-hero-dot" key={i} />)}
            </div>
            <div className="cd-hero-inner">
              <div className="cd-hero-left">
                <div className="cd-hero-tag">
                  <span className="cd-hero-blink" />
                  Academic Dashboard
                </div>
                <h1 className="cd-hero-title">
                  Welcome back, <span>{user?.profile?.firstName || 'there'}</span>! 👋
                </h1>
                <p className="cd-hero-sub">
                  Here's what's happening in your academic journey today. Stay on top of resources, modules, and activities.
                </p>
              </div>

              <div className="cd-profile-card">
                <div className="cd-profile-av">{getInitials()}</div>
                <div>
                  <p className="cd-profile-name">{[user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ') || user?.username || 'User'}</p>
                  <div className="cd-profile-role">
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#93c5fd', display: 'inline-block' }} />
                    {roleLabel[user?.role] || user?.role || 'User'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="cd-stats">
            {[
              { num: stats.totalResources, label: 'Total Resources', color: '#2563eb', bg: '#eff6ff', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
              { num: stats.totalModules,   label: 'Available Modules', color: '#059669', bg: '#f0fdf4', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
              { num: stats.recentActivity, label: 'Recent Activities', color: '#7c3aed', bg: '#faf5ff', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg> },
            ].map((s, i) => (
              <div key={i} className="cd-stat-card">
                <div className="cd-stat-ico" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <p className="cd-stat-num">{s.num}</p>
                  <p className="cd-stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 2-COL */}
          <div className="cd-grid2">

            {/* Notices */}
            <div className="cd-card">
              <div className="cd-card-header">
                <div className="cd-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
                  Notices & Announcements
                </div>
                <button className="cd-view-all">View All</button>
              </div>
              <div className="cd-card-body">
                {notices.map(n => {
                  const nc = noticeConfig[n.type] || noticeConfig.info;
                  return (
                    <div key={n.id} className="cd-notice"
                      style={{ background: nc.bg, borderColor: nc.border, borderLeftColor: nc.leftBar }}>
                      <div className="cd-notice-ico" style={{ background: `${nc.color}18`, color: nc.color }}>{nc.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="cd-notice-title">{n.title}</p>
                        <p className="cd-notice-text">{n.content}</p>
                        <span className="cd-notice-time">{formatDate(n.date)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="cd-card">
              <div className="cd-card-header">
                <div className="cd-card-title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/></svg>
                  Quick Actions
                </div>
              </div>
              <div className="cd-card-body">
                <div className="cd-actions-grid">
                  {quickActions.map((a, i) => (
                    <Link key={i} to={a.link} className="cd-action-card"
                      style={{ '--ac': a.color }}>
                      <style>{`.cd-action-card:nth-child(${i+1})::before { background: linear-gradient(90deg, ${a.color}99, ${a.color}); }`}</style>
                      <div className="cd-action-ico" style={{ background: a.bg, borderColor: a.border, color: a.color }}>
                        {a.icon}
                      </div>
                      <p className="cd-action-title">{a.title}</p>
                      <p className="cd-action-desc">{a.desc}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="cd-activity">
            <div className="cd-card-header" style={{ padding: '1.1rem 1.5rem 0' }}>
              <div className="cd-card-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
                Recent Activity
              </div>
              <button className="cd-view-all">View All</button>
            </div>
            <div style={{ padding: '0.8rem 0 0.4rem' }}>
              {recentActivity.map((a, i) => (
                <div key={i} className="cd-activity-row">
                  <div className="cd-activity-ico" style={{ background: a.iconBg }}>{a.icon}</div>
                  <p className="cd-activity-text">{a.text}: <strong>{a.detail}</strong></p>
                  <span className="cd-activity-time">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;