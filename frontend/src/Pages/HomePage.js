import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
      color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
      title: 'Resource Sharing',
      desc: 'Share and access high-quality learning materials from peers and educators across all academic levels.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
      ),
      color: '#059669', bg: '#f0fdf4', border: '#a7f3d0',
      title: 'Module Management',
      desc: 'Organize resources by academic year, semester, and modules for structured, easy access.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
        </svg>
      ),
      color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe',
      title: 'Quality Control',
      desc: 'Resource manager approval ensures only verified, high-quality materials reach your feed.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      color: '#d97706', bg: '#fffbeb', border: '#fde68a',
      title: 'User Roles',
      desc: 'Tailored access for students, resource managers, coordinators, and administrators.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      ),
      color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
      title: 'Secure Platform',
      desc: 'JWT authentication and role-based access control keeps your data and activity protected.',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
      color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc',
      title: 'Smart Search',
      desc: 'Find exactly what you need instantly with category filters, tags, and keyword search.',
    },
  ];

  const stats = [
    { num: '1,000+', label: 'Resources', sub: 'Shared & approved', color: '#2563eb', bg: '#eff6ff' },
    { num: '50+',    label: 'Modules',   sub: 'Academic courses',  color: '#059669', bg: '#f0fdf4' },
    { num: '500+',   label: 'Students',  sub: 'Active learners',   color: '#7c3aed', bg: '#faf5ff' },
    { num: '99.9%',  label: 'Uptime',    sub: 'Platform reliability', color: '#d97706', bg: '#fffbeb' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hp-root { min-height: 100vh; font-family: 'DM Sans', sans-serif; background: white; color: #1e293b; overflow-x: hidden; }

        /* ── NAVBAR ── */
        .hp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: all 0.3s;
          padding: 0 1.5rem;
        }
        .hp-nav.scrolled {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 12px rgba(9,72,134,0.08);
        }
        .hp-nav-inner {
          max-width: 1280px; margin: 0 auto;
          height: 68px; display: flex;
          align-items: center; justify-content: space-between;
        }
        .hp-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .hp-brand-logo {
          width: 150px;
          height: 42px;
          object-fit: contain;
          display: block;
        }
        .hp-brand-name {
          font-family: 'Sora', sans-serif; font-size: 1.25rem;
          font-weight: 800; color: #0f1e35; letter-spacing: -0.3px;
        }
        .hp-nav-right { display: flex; align-items: center; gap: 8px; }
        .hp-nav-link {
          padding: 8px 16px; border-radius: 10px;
          font-size: 0.88rem; font-weight: 500; color: #475569;
          text-decoration: none; transition: background 0.15s, color 0.15s;
        }
        .hp-nav-link:hover { background: #f1f5f9; color: #094886; }
        .hp-nav-cta {
          display: flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 12px;
          background: linear-gradient(135deg, #094886, #2563eb);
          color: white; text-decoration: none;
          font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600;
          box-shadow: 0 3px 12px rgba(37,99,235,0.30);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .hp-nav-cta:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(37,99,235,0.38); }

        /* ── HERO ── */
        .hp-hero {
          min-height: 100vh;
          background: linear-gradient(160deg, #f8faff 0%, #eef4ff 40%, #f0f4f8 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 120px 1.5rem 80px;
          position: relative; overflow: hidden;
          text-align: center;
        }
        .hp-hero::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 30% 20%, rgba(37,99,235,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 75% 80%, rgba(9,72,134,0.06) 0%, transparent 70%);
        }
        .hp-hero-ring1, .hp-hero-ring2 {
          position: absolute; border-radius: 50%;
          border: 1.5px solid rgba(37,99,235,0.08); pointer-events: none;
        }
        .hp-hero-ring1 { width: 600px; height: 600px; top: -200px; right: -150px; animation: hp-spin 40s linear infinite; }
        .hp-hero-ring2 { width: 400px; height: 400px; bottom: -100px; left: -80px; animation: hp-spin 28s linear infinite reverse; }
        @keyframes hp-spin { to { transform: rotate(360deg); } }

        .hp-hero-inner { position: relative; z-index: 1; max-width: 760px; }

        .hp-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px; border-radius: 20px;
          background: #eff6ff; border: 1.5px solid #bfdbfe;
          font-size: 0.80rem; font-weight: 600; color: #2563eb;
          font-family: 'Sora', sans-serif; margin-bottom: 1.8rem;
          animation: hp-up 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .hp-hero-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2563eb; box-shadow: 0 0 6px #2563eb;
          animation: hp-blink 1.8s ease-in-out infinite;
        }
        @keyframes hp-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

        .hp-hero-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2.4rem, 6vw, 4rem);
          font-weight: 800; line-height: 1.12;
          color: #0f1e35; margin-bottom: 1.4rem;
          animation: hp-up 0.5s 0.06s cubic-bezier(0.16,1,0.3,1) both;
        }
        .hp-hero-title .blue { color: #2563eb; }
        .hp-hero-title .line2 {
          display: block;
          background: linear-gradient(135deg, #094886, #2563eb);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hp-hero-sub {
          font-size: 1.1rem; color: #64748b; line-height: 1.75;
          max-width: 560px; margin: 0 auto 2.5rem;
          animation: hp-up 0.5s 0.12s cubic-bezier(0.16,1,0.3,1) both;
        }

        .hp-hero-btns {
          display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;
          animation: hp-up 0.5s 0.18s cubic-bezier(0.16,1,0.3,1) both;
        }
        .hp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 14px;
          background: linear-gradient(135deg, #094886, #2563eb);
          color: white; text-decoration: none;
          font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700;
          box-shadow: 0 4px 18px rgba(37,99,235,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .hp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(37,99,235,0.45); }
        .hp-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 28px; border-radius: 14px;
          background: white; color: #094886;
          border: 1.5px solid #bfdbfe;
          text-decoration: none;
          font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 600;
          box-shadow: 0 2px 8px rgba(9,72,134,0.08);
          transition: border-color 0.15s, background 0.15s, transform 0.15s;
        }
        .hp-btn-secondary:hover { border-color: #2563eb; background: #eff6ff; transform: translateY(-1px); }

        /* Hero mockup cards */
        .hp-hero-cards {
          display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;
          margin-top: 3.5rem;
          animation: hp-up 0.5s 0.24s cubic-bezier(0.16,1,0.3,1) both;
        }
        .hp-mini-card {
          background: white; border-radius: 14px; padding: 12px 16px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 4px 16px rgba(9,72,134,0.08), 0 0 0 1px rgba(9,72,134,0.05);
          font-size: 0.82rem; color: #334155; font-weight: 500;
          transition: transform 0.15s;
        }
        .hp-mini-card:hover { transform: translateY(-2px); }
        .hp-mini-ico {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ── SECTION WRAPPER ── */
        .hp-section { max-width: 1280px; margin: 0 auto; padding: 6rem 1.5rem; }

        .hp-section-label {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.78rem; font-weight: 700; color: #2563eb;
          text-transform: uppercase; letter-spacing: 1.2px;
          font-family: 'Sora', sans-serif; margin-bottom: 1rem;
        }
        .hp-section-title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 800;
          color: #0f1e35; line-height: 1.2; margin-bottom: 1rem;
        }
        .hp-section-title span { color: #2563eb; }
        .hp-section-sub { font-size: 1rem; color: #64748b; line-height: 1.7; max-width: 520px; }

        /* ── FEATURES ── */
        .hp-features-bg {
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }
        .hp-features-header { text-align: center; margin-bottom: 3.5rem; }
        .hp-features-header .hp-section-sub { margin: 0 auto; }
        .hp-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.2rem;
        }
        .hp-feat-card {
          background: white; border-radius: 18px; padding: 1.6rem;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 2px 8px rgba(9,72,134,0.05);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          position: relative; overflow: hidden;
        }
        .hp-feat-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          border-radius: 18px 18px 0 0; opacity: 0;
          transition: opacity 0.2s;
        }
        .hp-feat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(9,72,134,0.10); border-color: transparent; }
        .hp-feat-card:hover::before { opacity: 1; }
        .hp-feat-ico {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem; border: 1.5px solid;
        }
        .hp-feat-title {
          font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700;
          color: #0f1e35; margin-bottom: 6px;
        }
        .hp-feat-desc { font-size: 0.87rem; color: #64748b; line-height: 1.65; }

        /* ── STATS STRIP ── */
        .hp-stats-bg {
          background: linear-gradient(135deg, #094886 0%, #1a6dbf 50%, #2563eb 100%);
          position: relative; overflow: hidden;
        }
        .hp-stats-bg::before {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='20'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .hp-stats-inner {
          max-width: 1280px; margin: 0 auto; padding: 5rem 1.5rem;
          position: relative; z-index: 1;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem; text-align: center;
        }
        .hp-stat-num {
          font-family: 'Sora', sans-serif; font-size: 2.8rem; font-weight: 800;
          color: white; line-height: 1;
        }
        .hp-stat-label {
          font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700;
          color: rgba(255,255,255,0.90); margin-top: 6px;
        }
        .hp-stat-sub { font-size: 0.82rem; color: rgba(255,255,255,0.55); margin-top: 3px; }

        /* ── HOW IT WORKS ── */
        .hp-steps {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem; margin-top: 3.5rem; position: relative;
        }
        .hp-step {
          display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px;
        }
        .hp-step-num {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(135deg, #094886, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 800; color: white;
          box-shadow: 0 4px 14px rgba(37,99,235,0.30);
          flex-shrink: 0;
        }
        .hp-step-title { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f1e35; }
        .hp-step-desc { font-size: 0.84rem; color: #64748b; line-height: 1.6; }

        /* ── CTA SECTION ── */
        .hp-cta-bg {
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
        }
        .hp-cta-inner {
          max-width: 680px; margin: 0 auto;
          padding: 6rem 1.5rem; text-align: center;
        }
        .hp-cta-card {
          background: linear-gradient(135deg, #094886 0%, #1a6dbf 50%, #2563eb 100%);
          border-radius: 28px; padding: 3.5rem 2.5rem;
          position: relative; overflow: hidden;
          box-shadow: 0 20px 60px rgba(9,72,134,0.25);
        }
        .hp-cta-card::before {
          content: '';
          position: absolute; width: 380px; height: 380px;
          border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.08);
          top: -120px; right: -80px; pointer-events: none;
        }
        .hp-cta-card::after {
          content: '';
          position: absolute; width: 240px; height: 240px;
          border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.06);
          bottom: -60px; left: -40px; pointer-events: none;
        }
        .hp-cta-title {
          font-family: 'Sora', sans-serif; font-size: 2rem; font-weight: 800;
          color: white; margin-bottom: 1rem; position: relative; z-index: 1;
        }
        .hp-cta-title span { color: #93c5fd; }
        .hp-cta-desc { font-size: 0.97rem; color: rgba(255,255,255,0.72); line-height: 1.7; margin-bottom: 2rem; position: relative; z-index: 1; }
        .hp-cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 13px 30px; border-radius: 14px;
          background: white; color: #094886;
          font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          transition: transform 0.15s, box-shadow 0.15s; position: relative; z-index: 1;
        }
        .hp-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.20); }

        /* ── FOOTER ── */
        .hp-footer {
          background: #0f1e35;
          padding: 3rem 1.5rem 2rem;
        }
        .hp-footer-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; flex-wrap: wrap; align-items: center;
          justify-content: space-between; gap: 1.5rem;
        }
        .hp-footer-brand { display: flex; align-items: center; }
        .hp-footer-logo {
          width: 130px;
          height: 42px;
          object-fit: contain;
          display: block;
        }
        .hp-footer-name {
          font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: white;
        }
        .hp-footer-links { display: flex; flex-wrap: wrap; gap: 6px; }
        .hp-footer-link {
          padding: 6px 12px; border-radius: 8px; font-size: 0.82rem;
          color: rgba(255,255,255,0.50); text-decoration: none;
          transition: color 0.15s, background 0.15s;
        }
        .hp-footer-link:hover { color: white; background: rgba(255,255,255,0.07); }
        .hp-footer-copy { font-size: 0.78rem; color: rgba(255,255,255,0.30); width: 100%; text-align: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.07); }

        @keyframes hp-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 640px) {
          .hp-hero-title { font-size: 2rem; }
          .hp-hero-btns { flex-direction: column; align-items: center; }
          .hp-cta-card { padding: 2rem 1.2rem; }
          .hp-cta-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="hp-root">

        {/* NAVBAR */}
        <nav className={`hp-nav${scrolled ? ' scrolled' : ''}`}>
          <div className="hp-nav-inner">
            <Link to="/" className="hp-brand">
              <img src="/_Logo.png" alt="Home logo" className="hp-brand-logo" />
            </Link>
            <div className="hp-nav-right">
              <Link to="/login" className="hp-nav-link">Sign In</Link>
              <Link to="/register" className="hp-nav-cta">
                Get Started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                </svg>
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="hp-hero">
          <div className="hp-hero-ring1" /><div className="hp-hero-ring2" />
          <div className="hp-hero-inner">
            <div className="hp-hero-badge">
              <span className="hp-hero-badge-dot" />
              Academic Resource Platform
            </div>
            <h1 className="hp-hero-title">
              Bridge the Gap Between
              <span className="line2">Learning & Excellence</span>
            </h1>
            <p className="hp-hero-sub">
              Connect with quality educational resources, collaborate with peers, and accelerate your academic journey — all in one platform built for modern learners.
            </p>
            <div className="hp-hero-btns">
              <Link to="/register" className="hp-btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Create Free Account
              </Link>
              <Link to="/login" className="hp-btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10,17 15,12 10,7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Sign In
              </Link>
            </div>

            {/* Mini info cards */}
            <div className="hp-hero-cards">
              {[
                { ico: '📚', text: '1,000+ Resources' },
                { ico: '🎓', text: '500+ Students' },
                { ico: '✅', text: 'Quality Approved' },
                { ico: '🔒', text: 'Secure & Private' },
              ].map((c, i) => (
                <div key={i} className="hp-mini-card">
                  <span style={{ fontSize: '1.1rem' }}>{c.ico}</span>
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <div className="hp-features-bg">
          <div className="hp-section">
            <div className="hp-features-header">
              <div className="hp-section-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>
                Platform Features
              </div>
              <h2 className="hp-section-title">Everything You Need for <span>Academic Success</span></h2>
              <p className="hp-section-sub">Our platform provides comprehensive tools for modern learning management and resource sharing.</p>
            </div>

            <div className="hp-features-grid">
              {features.map((f, i) => (
                <div
                  key={i} className="hp-feat-card"
                  style={{ '--feat-color': f.color }}
                >
                  <style>{`.hp-feat-card:nth-child(${i+1})::before { background: linear-gradient(90deg, ${f.color}aa, ${f.color}); }`}</style>
                  <div className="hp-feat-ico" style={{ background: f.bg, borderColor: f.border, color: f.color }}>
                    {f.icon}
                  </div>
                  <h3 className="hp-feat-title">{f.title}</h3>
                  <p className="hp-feat-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="hp-stats-bg">
          <div className="hp-stats-inner">
            {stats.map((s, i) => (
              <div key={i}>
                <div className="hp-stat-num">{s.num}</div>
                <div className="hp-stat-label">{s.label}</div>
                <div className="hp-stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="hp-section" style={{ paddingBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div className="hp-section-label">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              How It Works
            </div>
            <h2 className="hp-section-title">Get Started in <span>3 Simple Steps</span></h2>
            <p className="hp-section-sub" style={{ margin: '0 auto' }}>Join LearnBridge and start accessing quality educational resources in minutes.</p>
          </div>
          <div className="hp-steps">
            {[
              { n: '1', title: 'Create Your Account', desc: 'Sign up for free with your email. No credit card required — just your academic email address.' },
              { n: '2', title: 'Browse & Download', desc: 'Explore hundreds of approved resources filtered by category, module, and academic level.' },
              { n: '3', title: 'Contribute & Share', desc: 'Upload your own materials for review, help peers succeed, and build your academic portfolio.' },
            ].map((s, i) => (
              <div key={i} className="hp-step">
                <div className="hp-step-num">{s.n}</div>
                <h4 className="hp-step-title">{s.title}</h4>
                <p className="hp-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="hp-cta-bg">
          <div className="hp-cta-inner">
            <div className="hp-cta-card">
              <h2 className="hp-cta-title">Ready to Start <span>Learning?</span></h2>
              <p className="hp-cta-desc">Join thousands of students and educators already sharing knowledge and accelerating academic growth on LearnBridge.</p>
              <Link to="/register" className="hp-cta-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="8.5" cy="7" r="4"/>
                  <line x1="20" y1="8" x2="20" y2="14"/>
                  <line x1="23" y1="11" x2="17" y2="11"/>
                </svg>
                Create Your Free Account
              </Link>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="hp-footer">
          <div className="hp-footer-inner">
            <div className="hp-footer-brand">
              <img src="/Logof.png" alt="Footer logo" className="hp-footer-logo" />
            </div>
            <div className="hp-footer-links">
              {[['About','/about'],['Contact','/contact'],['Privacy','/privacy'],['Terms','/terms'],['Sign In','/login'],['Register','/register']].map(([l,h]) => (
                <Link key={l} to={h} className="hp-footer-link">{l}</Link>
              ))}
            </div>
          </div>
          <p className="hp-footer-copy">© {new Date().getFullYear()} All rights reserved. Built for academic excellence.</p>
        </footer>

      </div>
    </>
  );
};

export default HomePage;