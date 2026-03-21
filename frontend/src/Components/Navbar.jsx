import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import {
  FiHome, FiUser, FiBookOpen, FiClipboard,
  FiMessageSquare, FiStar, FiUsers, FiCalendar
} from 'react-icons/fi';

const navLinks = [
  {
    label: 'Student',
    children: [
      { to: '/student', label: 'Dashboard', icon: <FiHome /> },
      { to: '/student/apply', label: 'Apply as Tutor', icon: <FiClipboard /> },
      { to: '/student/noticeboard', label: 'Notice Board', icon: <FiBookOpen /> },
      { to: '/student/feedback', label: 'Give Feedback', icon: <FiMessageSquare /> },
    ],
  },
  {
    label: 'Tutor',
    children: [
      { to: '/tutor', label: 'Dashboard', icon: <FiUser /> },
      { to: '/tutor/create-session', label: 'Create Session', icon: <FiCalendar /> },
      { to: '/tutor/ratings', label: 'My Ratings', icon: <FiStar /> },
    ],
  },
  {
    label: 'Coordinator',
    children: [
      { to: '/coordinator', label: 'Dashboard', icon: <FiUsers /> },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-gilroyBold text-lg">L</span>
            </div>
            <span className="text-xl font-gilroyBold text-primary-500 tracking-tight">
              Learn<span className="text-secondary-500">Bridge</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((group) => (
              <div key={group.label} className="relative">
                <button
                  onClick={() => toggleDropdown(group.label)}
                  className={`px-4 py-2 rounded-lg text-sm font-gilroyMedium transition-all duration-200 flex items-center gap-1
                    ${openDropdown === group.label
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-600 hover:text-primary-500 hover:bg-neutral-50'
                    }`}
                >
                  {group.label}
                  <svg className={`w-4 h-4 transition-transform ${openDropdown === group.label ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openDropdown === group.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-glass border border-neutral-100 py-2 animate-pop-in z-50">
                    {group.children.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpenDropdown(null)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150
                          ${isActive(link.to)
                            ? 'bg-primary-50 text-primary-600 font-gilroyMedium'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-500'
                          }`}
                      >
                        <span className="text-lg">{link.icon}</span>
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-gilroyBold text-neutral-400 uppercase tracking-wider px-3 pt-3 pb-1">
                  {group.label}
                </p>
                {group.children.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
                      ${isActive(link.to)
                        ? 'bg-primary-50 text-primary-600 font-gilroyMedium'
                        : 'text-neutral-600 hover:bg-neutral-50'
                      }`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {openDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
      )}
    </nav>
  );
}
