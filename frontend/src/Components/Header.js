import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { onLogout(); navigate('/login'); };

  const getInitials = () => {
    const f = user?.profile?.firstName?.[0] || '';
    const l = user?.profile?.lastName?.[0]  || '';
    return (f + l).toUpperCase() || (user?.username?.[0] || 'U').toUpperCase();
  };

  const roleLabel = { admin: 'Administrator', resourceManager: 'Resource Manager', coordinator: 'Coordinator', student: 'Student' };

  const navLinks = !user ? [] : [
    { path: '/dashboard', label: 'Dashboard',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    ...(['admin','resourceManager','coordinator'].includes(user?.role) ? [
      { path: '/manage-modules', label: 'Modules',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
      { path: '/manage-resources', label: 'Manage',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
    ] : []),
    { path: '/resources', label: 'Resources',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
    { path: '/submit-resource', label: 'Submit',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .hd-header {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Scrolled: white glassmorphism ── */
        .hd-header.scrolled {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 16px rgba(9,72,134,0.09);
        }

        /* ── Top: gradient ── */
        .hd-header.top {
          background: linear-gradient(135deg, #094886 0%, #1460aa 50%, #2563eb 100%);
        }

        .hd-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 1.5rem; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem;
        }

        /* Brand */
        .hd-brand {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0;
        }
        .hd-brand-logo {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .scrolled .hd-brand-logo { background: linear-gradient(135deg, #094886, #2563eb); box-shadow: 0 2px 8px rgba(37,99,235,0.28); }
        .top     .hd-brand-logo { background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.28); backdrop-filter: blur(8px); }
        .hd-brand-name {
          font-family: 'Sora', sans-serif; font-size: 1.18rem; font-weight: 800;
          letter-spacing: -0.3px; transition: color 0.2s;
        }
        .scrolled .hd-brand-name { color: #0f1e35; }
        .top     .hd-brand-name { color: white; }

        /* Desktop nav */
        .hd-nav { display: flex; align-items: center; gap: 2px; flex: 1; justify-content: center; }
        .hd-nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px;
          font-size: 0.84rem; font-weight: 500;
          text-decoration: none; transition: all 0.15s;
          white-space: nowrap;
        }
        /* Active */
        .scrolled .hd-nav-link.active { background: #eff6ff; color: #2563eb; }
        .top     .hd-nav-link.active { background: rgba(255,255,255,0.20); color: white; }
        /* Inactive */
        .scrolled .hd-nav-link:not(.active) { color: #475569; }
        .scrolled .hd-nav-link:not(.active):hover { background: #f1f5f9; color: #094886; }
        .top     .hd-nav-link:not(.active) { color: rgba(255,255,255,0.78); }
        .top     .hd-nav-link:not(.active):hover { background: rgba(255,255,255,0.12); color: white; }

        /* Active dot */
        .hd-active-dot {
          width: 5px; height: 5px; border-radius: 50%;
          display: inline-block; flex-shrink: 0;
        }
        .scrolled .hd-active-dot { background: #2563eb; }
        .top     .hd-active-dot { background: white; }

        /* Right area */
        .hd-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        /* User button */
        .hd-user-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 10px 6px 6px; border-radius: 12px;
          border: none; cursor: pointer; transition: all 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .scrolled .hd-user-btn { background: #f8fafc; border: 1.5px solid #e2e8f0; }
        .scrolled .hd-user-btn:hover { background: #eff6ff; border-color: #bfdbfe; }
        .top     .hd-user-btn { background: rgba(255,255,255,0.14); border: 1.5px solid rgba(255,255,255,0.22); }
        .top     .hd-user-btn:hover { background: rgba(255,255,255,0.22); }

        .hd-user-av {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif; font-size: 0.76rem; font-weight: 700;
          flex-shrink: 0;
        }
        .scrolled .hd-user-av { background: linear-gradient(135deg, #094886, #2563eb); color: white; box-shadow: 0 2px 6px rgba(37,99,235,0.28); }
        .top     .hd-user-av { background: rgba(255,255,255,0.22); color: white; border: 1.5px solid rgba(255,255,255,0.35); }

        .hd-user-info { display: flex; flex-direction: column; align-items: flex-start; }
        .hd-user-name { font-size: 0.84rem; font-weight: 600; line-height: 1.2; transition: color 0.2s; }
        .scrolled .hd-user-name { color: #0f1e35; }
        .top     .hd-user-name { color: white; }
        .hd-user-role { font-size: 0.72rem; transition: color 0.2s; }
        .scrolled .hd-user-role { color: #94a3b8; }
        .top     .hd-user-role { color: rgba(255,255,255,0.62); }

        .hd-chevron { transition: transform 0.2s, color 0.2s; flex-shrink: 0; }
        .hd-chevron.open { transform: rotate(180deg); }
        .scrolled .hd-chevron { color: #64748b; }
        .top     .hd-chevron { color: rgba(255,255,255,0.75); }

        /* Dropdown */
        .hd-dropdown-wrap { position: relative; }
        .hd-dropdown {
          position: absolute; right: 0; top: calc(100% + 10px);
          width: 220px; background: white; border-radius: 16px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 8px 32px rgba(9,72,134,0.14), 0 2px 8px rgba(9,72,134,0.07);
          overflow: hidden;
          transform-origin: top right;
          transition: opacity 0.15s, transform 0.15s;
        }
        .hd-dropdown.open  { opacity: 1; transform: scale(1); pointer-events: all; }
        .hd-dropdown.close { opacity: 0; transform: scale(0.94); pointer-events: none; }

        .hd-dropdown-user {
          padding: 14px 16px; background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; gap: 10px;
        }
        .hd-dd-av {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #094886, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif; font-size: 0.80rem; font-weight: 700; color: white;
          flex-shrink: 0;
        }
        .hd-dd-name { font-family: 'Sora', sans-serif; font-size: 0.85rem; font-weight: 700; color: #0f1e35; }
        .hd-dd-role {
          display: inline-flex; align-items: center; gap: 4px;
          margin-top: 3px; padding: 2px 8px; border-radius: 20px;
          background: #eff6ff; color: #2563eb;
          font-size: 0.70rem; font-weight: 600; font-family: 'Sora', sans-serif;
        }
        .hd-dropdown-items { padding: 6px; }
        .hd-dd-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          font-size: 0.84rem; font-weight: 500; color: #374151;
          text-decoration: none; cursor: pointer;
          transition: background 0.12s, color 0.12s;
          border: none; background: none; width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif;
        }
        .hd-dd-item:hover { background: #f8fafc; color: #094886; }
        .hd-dd-item.danger { color: #dc2626; }
        .hd-dd-item.danger:hover { background: #fef2f2; color: #dc2626; }
        .hd-dd-divider { height: 1px; background: #f1f5f9; margin: 4px 6px; }

        /* Mobile hamburger */
        .hd-hamburger {
          display: none; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 10px;
          border: none; cursor: pointer; transition: all 0.15s;
        }
        .scrolled .hd-hamburger { background: #f8fafc; color: #475569; }
        .scrolled .hd-hamburger:hover { background: #eff6ff; color: #2563eb; }
        .top     .hd-hamburger { background: rgba(255,255,255,0.14); color: white; }
        .top     .hd-hamburger:hover { background: rgba(255,255,255,0.22); }

        /* Mobile nav panel */
        .hd-mobile-panel {
          display: none;
          border-top: 1px solid rgba(255,255,255,0.10);
          overflow: hidden;
          transition: max-height 0.3s ease, opacity 0.2s ease;
        }
        .hd-mobile-panel.open  { max-height: 400px; opacity: 1; }
        .hd-mobile-panel.close { max-height: 0; opacity: 0; }
        .hd-mobile-panel-inner { padding: 10px 1.5rem 14px; display: flex; flex-direction: column; gap: 4px; }
        .hd-mobile-link {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 12px;
          font-size: 0.88rem; font-weight: 500; text-decoration: none;
          transition: all 0.15s;
        }
        .scrolled .hd-mobile-link { color: #475569; }
        .scrolled .hd-mobile-link:hover, .scrolled .hd-mobile-link.active { background: #eff6ff; color: #2563eb; }
        .top .hd-mobile-link { color: rgba(255,255,255,0.85); }
        .top .hd-mobile-link:hover, .top .hd-mobile-link.active { background: rgba(255,255,255,0.14); color: white; }
        .hd-mobile-logout {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 12px; border: none;
          font-size: 0.88rem; font-weight: 500; cursor: pointer;
          font-family: 'DM Sans', sans-serif; width: 100%; text-align: left;
          margin-top: 4px; transition: all 0.15s;
        }
        .scrolled .hd-mobile-logout { color: #dc2626; background: #fef2f2; }
        .scrolled .hd-mobile-logout:hover { background: #fee2e2; }
        .top .hd-mobile-logout { color: rgba(255,120,120,0.9); background: rgba(255,255,255,0.10); }
        .top .hd-mobile-logout:hover { background: rgba(255,255,255,0.18); }

        /* Responsive */
        @media (max-width: 768px) {
          .hd-nav      { display: none; }
          .hd-user-info { display: none; }
          .hd-hamburger { display: flex; }
          .hd-mobile-panel { display: block; }
        }
        @media (max-width: 480px) {
          .hd-inner { padding: 0 1rem; }
        }
      `}</style>

      <header className={`hd-header ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="hd-inner">

          {/* Brand */}
          <Link to="/dashboard" className="hd-brand">
            <div className="hd-brand-logo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="hd-brand-name">LearnBridge</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hd-nav">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`hd-nav-link${isActive(link.path) ? ' active' : ''}`}
              >
                {isActive(link.path) && <span className="hd-active-dot" />}
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="hd-right">
            {/* User dropdown */}
            <div className="hd-dropdown-wrap" ref={dropdownRef}>
              <button className="hd-user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="hd-user-av">{getInitials()}</div>
                <div className="hd-user-info">
                  <span className="hd-user-name">{user?.profile?.firstName || 'User'}</span>
                  <span className="hd-user-role">{roleLabel[user?.role] || user?.role || 'User'}</span>
                </div>
                <svg className={`hd-chevron${menuOpen ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6,9 12,15 18,9"/>
                </svg>
              </button>

              <div className={`hd-dropdown${menuOpen ? ' open' : ' close'}`}>
                {/* User info row */}
                <div className="hd-dropdown-user">
                  <div className="hd-dd-av">{getInitials()}</div>
                  <div>
                    <p className="hd-dd-name">{[user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ') || user?.username || 'User'}</p>
                    <div className="hd-dd-role">
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
                      {roleLabel[user?.role] || user?.role}
                    </div>
                  </div>
                </div>

                <div className="hd-dropdown-items">
                  <Link to="/dashboard" className="hd-dd-item" onClick={() => setMenuOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    Dashboard
                  </Link>
                  <Link to="/profile" className="hd-dd-item" onClick={() => setMenuOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    My Profile
                  </Link>
                  <div className="hd-dd-divider" />
                  <button className="hd-dd-item danger" onClick={() => { setMenuOpen(false); handleLogout(); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Hamburger */}
            <button className="hd-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle mobile menu">
              {mobileOpen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile panel */}
        <div className={`hd-mobile-panel${mobileOpen ? ' open' : ' close'}`}>
          <div className="hd-mobile-panel-inner">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`hd-mobile-link${isActive(link.path) ? ' active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', margin: '4px 0' }} />
            <button className="hd-mobile-logout" onClick={() => { setMobileOpen(false); handleLogout(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;