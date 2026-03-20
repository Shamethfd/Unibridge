import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResourceList = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchResources();
  }, [currentPage, selectedCategory, searchTerm]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/management/approved?${params}`
      );
      if (response.data.success) {
        setResources(response.data.data.resources);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error) {
      toast.error('Failed to fetch approved resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchResources();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleDownload = async (resourceId, fileName) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resources/${resourceId}/download`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download resource');
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resources/${resourceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Resource deleted successfully');
        fetchResources();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete resource');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const categoryConfig = {
    all:        { label: 'All',        color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    lecture:    { label: 'Lecture',    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    assignment: { label: 'Assignment', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    tutorial:   { label: 'Tutorial',   color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
    reference:  { label: 'Reference',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    other:      { label: 'Other',      color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
  };

  const getFileIcon = (fileName) => {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return { icon: 'pdf', color: '#dc2626', bg: '#fef2f2' };
    if (['doc','docx'].includes(ext)) return { icon: 'doc', color: '#2563eb', bg: '#eff6ff' };
    if (['ppt','pptx'].includes(ext)) return { icon: 'ppt', color: '#ea580c', bg: '#fff7ed' };
    if (['xls','xlsx'].includes(ext)) return { icon: 'xls', color: '#059669', bg: '#f0fdf4' };
    if (['mp4','mov','avi'].includes(ext)) return { icon: 'vid', color: '#7c3aed', bg: '#faf5ff' };
    if (['zip','rar'].includes(ext)) return { icon: 'zip', color: '#64748b', bg: '#f8fafc' };
    return { icon: 'file', color: '#2563eb', bg: '#eff6ff' };
  };

  const getInitials = (u) => {
    if (!u) return '?';
    const f = u?.profile?.firstName || '';
    const l = u?.profile?.lastName || '';
    if (f || l) return `${f[0] || ''}${l[0] || ''}`.toUpperCase();
    return (u?.username?.[0] || '?').toUpperCase();
  };

  const categories = ['all', 'lecture', 'assignment', 'tutorial', 'reference', 'other'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rl-root {
          min-height: 100vh;
          background: #f0f4f8;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── NAVBAR ── */
        .rl-nav {
          position: sticky; top: 0; z-index: 50;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 12px rgba(9,72,134,0.07);
        }
        .rl-nav-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 1.5rem; height: 64px;
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        }
        .rl-brand {
          display: flex; align-items: center; gap: 10px; text-decoration: none;
        }
        .rl-brand-logo {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #094886 0%, #2563eb 100%);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .rl-brand-name {
          font-family: 'Sora', sans-serif;
          font-size: 1.15rem; font-weight: 700; color: #0f1e35; letter-spacing: -0.2px;
        }
        .rl-nav-right { display: flex; align-items: center; gap: 8px; }
        .rl-nav-link {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px;
          font-size: 0.84rem; font-weight: 500; color: #475569;
          text-decoration: none; transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }
        .rl-nav-link:hover { background: #f1f5f9; color: #094886; }
        .rl-nav-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 10px;
          font-size: 0.84rem; font-weight: 600;
          background: linear-gradient(135deg, #094886, #2563eb);
          color: white; text-decoration: none;
          box-shadow: 0 3px 10px rgba(37,99,235,0.28);
          transition: transform 0.15s, box-shadow 0.15s;
          font-family: 'Sora', sans-serif; white-space: nowrap;
        }
        .rl-nav-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(37,99,235,0.35); }

        /* ── PAGE BODY ── */
        .rl-body {
          max-width: 1280px; margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        /* Page header */
        .rl-page-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 1.5rem;
          animation: rl-up 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .rl-page-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.7rem; font-weight: 800; color: #0f1e35; line-height: 1.2;
        }
        .rl-page-title span { color: #2563eb; }
        .rl-page-sub { font-size: 0.87rem; color: #94a3b8; margin-top: 4px; }
        .rl-count-badge {
          padding: 6px 14px;
          background: #eff6ff; border: 1.5px solid #bfdbfe;
          border-radius: 20px;
          font-family: 'Sora', sans-serif;
          font-size: 0.82rem; font-weight: 600; color: #2563eb;
        }

        /* Search + Filter bar */
        .rl-toolbar {
          background: white;
          border-radius: 18px;
          padding: 1.2rem 1.4rem;
          box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04);
          margin-bottom: 1.2rem;
          display: flex; flex-direction: column; gap: 1rem;
          animation: rl-up 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both;
        }
        .rl-search-row { display: flex; gap: 8px; }
        .rl-search-wrap {
          flex: 1; position: relative;
        }
        .rl-search-ico {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%); color: #94a3b8; pointer-events: none;
          display: flex;
        }
        .rl-search-input {
          width: 100%; padding: 10px 12px 10px 38px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
          color: #1e293b; background: #f8fafc; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .rl-search-input:focus {
          border-color: #2563eb; background: white;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.10);
        }
        .rl-search-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, #094886, #2563eb);
          color: white; border: none; border-radius: 12px;
          font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          box-shadow: 0 3px 10px rgba(37,99,235,0.28);
          transition: transform 0.15s, box-shadow 0.15s; white-space: nowrap;
        }
        .rl-search-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(37,99,235,0.35); }

        /* Category pills */
        .rl-cats { display: flex; flex-wrap: wrap; gap: 6px; }
        .rl-cat-pill {
          padding: 5px 14px; border-radius: 20px;
          font-size: 0.80rem; font-weight: 600;
          cursor: pointer; border: 1.5px solid transparent;
          transition: all 0.15s; font-family: 'Sora', sans-serif;
          display: flex; align-items: center; gap: 5px;
        }

        /* Resource card list */
        .rl-list {
          background: white;
          border-radius: 18px;
          box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04);
          overflow: hidden;
          animation: rl-up 0.4s 0.10s cubic-bezier(0.16,1,0.3,1) both;
        }
        .rl-list-header {
          padding: 1.1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; gap: 10px;
        }
        .rl-list-title {
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem; font-weight: 700; color: #0f1e35;
        }

        /* Loading */
        .rl-loading {
          padding: 4rem;
          text-align: center;
        }
        .rl-spinner {
          width: 40px; height: 40px;
          border: 3px solid #e2e8f0; border-top-color: #2563eb;
          border-radius: 50%; animation: rl-spin 0.7s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes rl-spin { to { transform: rotate(360deg); } }
        .rl-loading p { font-size: 0.87rem; color: #94a3b8; }

        /* Empty */
        .rl-empty {
          padding: 4rem 2rem; text-align: center;
        }
        .rl-empty-ico {
          width: 56px; height: 56px;
          background: #f1f5f9; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
        }
        .rl-empty h4 {
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem; font-weight: 700; color: #334155; margin-bottom: 4px;
        }
        .rl-empty p { font-size: 0.84rem; color: #94a3b8; margin-bottom: 16px; }
        .rl-empty-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 18px; border-radius: 12px;
          background: linear-gradient(135deg, #094886, #2563eb);
          color: white; text-decoration: none;
          font-family: 'Sora', sans-serif; font-size: 0.85rem; font-weight: 600;
          box-shadow: 0 3px 10px rgba(37,99,235,0.28);
          transition: transform 0.15s;
        }
        .rl-empty-btn:hover { transform: translateY(-1px); }

        /* Resource row */
        .rl-resource-row {
          padding: 1.2rem 1.5rem;
          border-bottom: 1px solid #f8fafc;
          display: flex; gap: 1rem; align-items: flex-start;
          transition: background 0.15s;
        }
        .rl-resource-row:last-child { border-bottom: none; }
        .rl-resource-row:hover { background: #fafbfe; }

        .rl-file-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif; font-size: 0.62rem; font-weight: 800;
          letter-spacing: 0.2px; flex-shrink: 0; margin-top: 2px;
        }

        .rl-resource-body { flex: 1; min-width: 0; }
        .rl-resource-top {
          display: flex; align-items: center; gap: 8px;
          flex-wrap: wrap; margin-bottom: 5px;
        }
        .rl-resource-title {
          font-family: 'Sora', sans-serif;
          font-size: 0.97rem; font-weight: 700; color: #0f1e35;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .rl-cat-tag {
          padding: 2px 9px; border-radius: 20px;
          font-size: 0.72rem; font-weight: 600;
          font-family: 'Sora', sans-serif; flex-shrink: 0;
          border: 1px solid;
        }
        .rl-resource-desc {
          font-size: 0.84rem; color: #64748b;
          line-height: 1.55; margin-bottom: 10px;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .rl-resource-meta {
          display: flex; align-items: center; flex-wrap: wrap; gap: 6px;
          font-size: 0.77rem; color: #94a3b8; margin-bottom: 10px;
        }
        .rl-meta-chip {
          display: flex; align-items: center; gap: 4px;
          background: #f8fafc; padding: 3px 8px; border-radius: 8px;
          border: 1px solid #f1f5f9;
        }
        .rl-uploader {
          display: flex; align-items: center; gap: 5px;
        }
        .rl-uploader-av {
          width: 18px; height: 18px; border-radius: 50%;
          background: linear-gradient(135deg, #094886, #2563eb);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.55rem; font-weight: 700; color: white;
          font-family: 'Sora', sans-serif;
        }
        .rl-tags { display: flex; flex-wrap: wrap; gap: 5px; }
        .rl-tag {
          padding: 2px 8px; border-radius: 8px;
          background: #f1f5f9; color: #475569;
          font-size: 0.74rem;
        }

        /* Action buttons */
        .rl-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
        .rl-btn-dl {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, #094886, #2563eb);
          color: white; font-family: 'Sora', sans-serif;
          font-size: 0.80rem; font-weight: 600; cursor: pointer;
          box-shadow: 0 2px 8px rgba(37,99,235,0.25);
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
        }
        .rl-btn-dl:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,235,0.35); }
        .rl-btn-edit {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 14px; border-radius: 10px;
          background: #eff6ff; color: #2563eb;
          border: 1.5px solid #bfdbfe;
          font-family: 'Sora', sans-serif; font-size: 0.80rem; font-weight: 600;
          text-decoration: none; transition: background 0.15s;
          white-space: nowrap; cursor: pointer;
        }
        .rl-btn-edit:hover { background: #dbeafe; }
        .rl-btn-del {
          display: flex; align-items: center; gap: 5px;
          padding: 6px 14px; border-radius: 10px;
          background: #fef2f2; color: #dc2626;
          border: 1.5px solid #fecaca;
          font-family: 'Sora', sans-serif; font-size: 0.80rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
          white-space: nowrap;
        }
        .rl-btn-del:hover { background: #fee2e2; }

        /* Pagination */
        .rl-pagination {
          padding: 1rem 1.5rem;
          border-top: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }
        .rl-page-info { font-size: 0.82rem; color: #94a3b8; }
        .rl-page-info span { font-weight: 600; color: #475569; }
        .rl-page-btns { display: flex; gap: 6px; }
        .rl-page-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 14px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; background: white;
          font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600;
          color: #475569; cursor: pointer;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
        }
        .rl-page-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
        .rl-page-btn:disabled { opacity: 0.40; cursor: not-allowed; }
        .rl-page-btn.active {
          background: linear-gradient(135deg, #094886, #2563eb);
          border-color: transparent; color: white;
          box-shadow: 0 2px 8px rgba(37,99,235,0.28);
        }

        @keyframes rl-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .rl-body { padding: 1rem; }
          .rl-page-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .rl-resource-row { flex-direction: column; }
          .rl-actions { flex-direction: row; flex-wrap: wrap; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="rl-root">

        {/* ── NAVBAR ── */}
        <nav className="rl-nav">
          <div className="rl-nav-inner">
            <Link to="/dashboard" className="rl-brand">
              <div className="rl-brand-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="rl-brand-name">LearnBridge</span>
            </Link>

            <div className="rl-nav-right">
              <Link to="/dashboard" className="rl-nav-link">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Dashboard
              </Link>
              <Link to="/upload-resource" className="rl-nav-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload Resource
              </Link>
            </div>
          </div>
        </nav>

        {/* ── BODY ── */}
        <div className="rl-body">

          {/* Page header */}
          <div className="rl-page-header">
            <div>
              <h1 className="rl-page-title">Learning <span>Resources</span></h1>
              <p className="rl-page-sub">Browse and download approved educational materials</p>
            </div>
            <div className="rl-count-badge">
              {resources.length} resource{resources.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Toolbar */}
          <div className="rl-toolbar">
            <div className="rl-search-row">
              <div className="rl-search-wrap">
                <span className="rl-search-ico">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </span>
                <input
                  type="text"
                  className="rl-search-input"
                  placeholder="Search by title, description or tags…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                />
              </div>
              <button className="rl-search-btn" onClick={handleSearch}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Search
              </button>
            </div>

            <div className="rl-cats">
              {categories.map((cat) => {
                const cfg = categoryConfig[cat];
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    className="rl-cat-pill"
                    onClick={() => handleCategoryChange(cat)}
                    style={{
                      background: active ? cfg.bg : 'transparent',
                      color: active ? cfg.color : '#64748b',
                      borderColor: active ? cfg.border : '#e2e8f0',
                    }}
                  >
                    {active && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />
                    )}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resource list */}
          <div className="rl-list">
            <div className="rl-list-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
              <span className="rl-list-title">
                {selectedCategory === 'all' ? 'All Resources' : `${categoryConfig[selectedCategory]?.label} Resources`}
              </span>
            </div>

            {loading ? (
              <div className="rl-loading">
                <div className="rl-spinner" />
                <p>Loading resources…</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="rl-empty">
                <div className="rl-empty-ico">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                </div>
                <h4>No resources found</h4>
                <p>
                  {searchTerm ? `No results for "${searchTerm}"` : 'No approved resources yet.'}
                </p>
                <Link to="/upload-resource" className="rl-empty-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Upload the first resource
                </Link>
              </div>
            ) : (
              <>
                {resources.map((resource, idx) => {
                  const fileInfo = getFileIcon(resource.fileName);
                  const catCfg = categoryConfig[resource.category] || categoryConfig.other;
                  const uploaderName = [resource.uploadedBy?.profile?.firstName, resource.uploadedBy?.profile?.lastName].filter(Boolean).join(' ') || resource.uploadedBy?.username || 'Unknown';
                  const canEdit = user && (resource.uploadedBy?._id === user._id || user.role === 'admin');

                  return (
                    <div key={resource._id} className="rl-resource-row" style={{ animationDelay: `${idx * 0.04}s` }}>

                      {/* File icon */}
                      <div className="rl-file-icon" style={{ background: fileInfo.bg, color: fileInfo.color }}>
                        {fileInfo.icon.toUpperCase()}
                      </div>

                      {/* Body */}
                      <div className="rl-resource-body">
                        <div className="rl-resource-top">
                          <span className="rl-resource-title">{resource.title}</span>
                          <span
                            className="rl-cat-tag"
                            style={{ background: catCfg.bg, color: catCfg.color, borderColor: catCfg.border }}
                          >
                            {catCfg.label}
                          </span>
                        </div>

                        {resource.description && (
                          <p className="rl-resource-desc">{resource.description}</p>
                        )}

                        <div className="rl-resource-meta">
                          <div className="rl-meta-chip rl-uploader">
                            <div className="rl-uploader-av">{getInitials(resource.uploadedBy)}</div>
                            <span>{uploaderName}</span>
                          </div>
                          <div className="rl-meta-chip">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                              <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            {resource.downloadCount || 0} downloads
                          </div>
                          <div className="rl-meta-chip">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14,2 14,8 20,8"/>
                            </svg>
                            {formatFileSize(resource.fileSize)}
                          </div>
                          <div className="rl-meta-chip">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>

                        {resource.tags?.length > 0 && (
                          <div className="rl-tags">
                            {resource.tags.map((tag, i) => (
                              <span key={i} className="rl-tag">#{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="rl-actions">
                        <button className="rl-btn-dl" onClick={() => handleDownload(resource._id, resource.fileName)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                          Download
                        </button>
                        {canEdit && (
                          <>
                            <Link to={`/edit-resource/${resource._id}`} className="rl-btn-edit">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </Link>
                            <button className="rl-btn-del" onClick={() => handleDelete(resource._id)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="rl-pagination">
                    <p className="rl-page-info">
                      Page <span>{currentPage}</span> of <span>{totalPages}</span>
                    </p>
                    <div className="rl-page-btns">
                      <button
                        className="rl-page-btn"
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
                        </svg>
                        Previous
                      </button>
                      <button
                        className="rl-page-btn"
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResourceList;