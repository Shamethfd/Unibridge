import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageModules = () => {
  const [modules, setModules]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [showForm, setShowForm]         = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formLoading, setFormLoading]   = useState(false);
  const [formData, setFormData]         = useState({ name: '', year: '', semester: '' });
  const [filters, setFilters]           = useState({ year: '', semester: '' });

  useEffect(() => { fetchModules(); }, [currentPage, filters.year, filters.semester]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (filters.year)     params.append('year', filters.year);
      if (filters.semester) params.append('semester', filters.semester);
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/modules?${params}`);
      if (res.data.success) { setModules(res.data.data.modules); setTotalPages(res.data.data.pagination.pages); }
    } catch { toast.error('Failed to fetch modules'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.year || !formData.semester) {
      toast.error('Module name, year, and semester are required'); return;
    }
    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      if (editingModule) {
        await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/modules/${editingModule._id}`, formData, { headers });
        toast.success('Module updated successfully');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/modules`, formData, { headers });
        toast.success('Module created successfully');
      }
      setFormData({ name: '', year: '', semester: '' });
      setShowForm(false); setEditingModule(null);
      fetchModules();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save module'); }
    finally { setFormLoading(false); }
  };

  const handleEdit = (mod) => {
    setEditingModule(mod);
    setFormData({ name: mod.name, year: mod.year.toString(), semester: mod.semester.toString() });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this module?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/modules/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Module deleted'); fetchModules();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete module'); }
  };

  const handleFilterChange = (field, value) => { setFilters(p => ({ ...p, [field]: value })); setCurrentPage(1); };

  const openCreate = () => { setEditingModule(null); setFormData({ name: '', year: '', semester: '' }); setShowForm(true); };

  const yearLabels   = { '1': '1st Year', '2': '2nd Year', '3': '3rd Year', '4': '4th Year' };
  const semLabels    = { '1': '1st Semester', '2': '2nd Semester' };
  const yearColors   = { '1': { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }, '2': { color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' }, '3': { color: '#d97706', bg: '#fffbeb', border: '#fde68a' }, '4': { color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' } };

  const getCreator = (mod) => [mod.createdBy?.profile?.firstName, mod.createdBy?.profile?.lastName].filter(Boolean).join(' ') || mod.createdBy?.username || '—';
  const getInitials = (mod) => { const f = mod.createdBy?.profile?.firstName?.[0] || ''; const l = mod.createdBy?.profile?.lastName?.[0] || ''; return (f+l).toUpperCase() || '?'; };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mm-root { min-height: 100vh; background: #f0f4f8; font-family: 'DM Sans', sans-serif; }

        /* ── NAVBAR ── */
        .mm-nav { position: sticky; top: 0; z-index: 50; background: white; border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 12px rgba(9,72,134,0.07); }
        .mm-nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .mm-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .mm-brand-logo { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; }
        .mm-brand-name { font-family: 'Sora', sans-serif; font-size: 1.15rem; font-weight: 700; color: #0f1e35; }
        .mm-nav-links { display: flex; gap: 4px; }
        .mm-nav-link { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 500; color: #475569; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .mm-nav-link:hover { background: #f1f5f9; color: #094886; }

        /* ── BODY ── */
        .mm-body { max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem; }

        /* Page header */
        .mm-page-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.5rem; animation: mm-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .mm-page-title { font-family: 'Sora', sans-serif; font-size: 1.7rem; font-weight: 800; color: #0f1e35; }
        .mm-page-title span { color: #2563eb; }
        .mm-page-sub { font-size: 0.87rem; color: #94a3b8; margin-top: 4px; }
        .mm-create-btn { display: flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 12px; border: none; background: linear-gradient(135deg, #094886, #2563eb); color: white; font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,0.28); transition: transform 0.15s, box-shadow 0.15s; }
        .mm-create-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.36); }

        /* Filters */
        .mm-filters { background: white; border-radius: 18px; padding: 1.2rem 1.4rem; box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04); margin-bottom: 1.2rem; animation: mm-up 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both; }
        .mm-filters-title { font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 700; color: #475569; margin-bottom: 0.9rem; display: flex; align-items: center; gap: 6px; }
        .mm-filter-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .mm-filter-field { display: flex; flex-direction: column; gap: 5px; min-width: 160px; }
        .mm-filter-label { font-size: 0.78rem; font-weight: 500; color: #475569; }
        .mm-filter-select { padding: 9px 32px 9px 12px; border: 1.5px solid #e2e8f0; border-radius: 11px; font-size: 0.85rem; font-family: 'DM Sans', sans-serif; color: #1e293b; background: #f8fafc; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; transition: border-color 0.2s, box-shadow 0.2s; }
        .mm-filter-select:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 3px rgba(37,99,235,0.10); }

        /* Modules list card */
        .mm-list { background: white; border-radius: 18px; box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04); overflow: hidden; animation: mm-up 0.4s 0.10s cubic-bezier(0.16,1,0.3,1) both; }
        .mm-list-header { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
        .mm-list-title { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f1e35; display: flex; align-items: center; gap: 8px; }

        /* Loading */
        .mm-loading { padding: 4rem; text-align: center; }
        .mm-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: mm-spin 0.7s linear infinite; margin: 0 auto 12px; }
        .mm-loading p { font-size: 0.87rem; color: #94a3b8; }

        /* Empty */
        .mm-empty { padding: 4rem 2rem; text-align: center; }
        .mm-empty-ico { width: 60px; height: 60px; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .mm-empty h4 { font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: #334155; margin-bottom: 6px; }
        .mm-empty p { font-size: 0.84rem; color: #94a3b8; margin-bottom: 18px; }
        .mm-empty-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 12px; border: none; background: linear-gradient(135deg, #094886, #2563eb); color: white; font-family: 'Sora', sans-serif; font-size: 0.85rem; font-weight: 600; cursor: pointer; box-shadow: 0 3px 10px rgba(37,99,235,0.28); transition: transform 0.15s; }
        .mm-empty-btn:hover { transform: translateY(-1px); }

        /* Module row */
        .mm-row { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f8fafc; display: flex; align-items: center; gap: 14px; transition: background 0.15s; }
        .mm-row:last-child { border-bottom: none; }
        .mm-row:hover { background: #fafbfe; }

        .mm-module-ico { width: 44px; height: 44px; border-radius: 13px; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mm-module-body { flex: 1; min-width: 0; }
        .mm-module-name { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f1e35; margin-bottom: 5px; }
        .mm-module-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .mm-year-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.74rem; font-weight: 600; font-family: 'Sora', sans-serif; border: 1px solid; display: inline-flex; align-items: center; gap: 4px; }
        .mm-meta-chip { display: flex; align-items: center; gap: 4px; background: #f8fafc; border: 1px solid #f1f5f9; padding: 3px 8px; border-radius: 8px; font-size: 0.76rem; color: #64748b; }
        .mm-creator { display: flex; align-items: center; gap: 5px; }
        .mm-creator-av { width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; font-size: 0.52rem; font-weight: 700; color: white; font-family: 'Sora', sans-serif; flex-shrink: 0; }

        .mm-actions { display: flex; gap: 7px; flex-shrink: 0; }
        .mm-btn-edit { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 10px; border: 1.5px solid #bfdbfe; background: #eff6ff; color: #2563eb; font-family: 'Sora', sans-serif; font-size: 0.80rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.15s; }
        .mm-btn-edit:hover { background: #dbeafe; transform: translateY(-1px); }
        .mm-btn-del { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 10px; border: 1.5px solid #fecaca; background: #fef2f2; color: #dc2626; font-family: 'Sora', sans-serif; font-size: 0.80rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.15s; }
        .mm-btn-del:hover { background: #fee2e2; transform: translateY(-1px); }

        /* Pagination */
        .mm-pagination { padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
        .mm-page-info { font-size: 0.82rem; color: #94a3b8; }
        .mm-page-info span { font-weight: 600; color: #475569; }
        .mm-page-btns { display: flex; gap: 6px; }
        .mm-page-btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; }
        .mm-page-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
        .mm-page-btn:disabled { opacity: 0.40; cursor: not-allowed; }

        /* ── MODAL ── */
        .mm-overlay { position: fixed; inset: 0; background: rgba(15,30,53,0.45); backdrop-filter: blur(4px); z-index: 60; display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: mm-fade 0.2s ease; }
        @keyframes mm-fade { from { opacity: 0; } to { opacity: 1; } }
        .mm-modal { background: white; border-radius: 22px; padding: 2rem; width: 100%; max-width: 460px; box-shadow: 0 24px 64px rgba(9,72,134,0.22), 0 0 0 1px rgba(9,72,134,0.06); animation: mm-modal-in 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes mm-modal-in { from { opacity: 0; transform: scale(0.94) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .mm-modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1.6rem; }
        .mm-modal-ico { width: 42px; height: 42px; border-radius: 13px; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .mm-modal-title { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 700; color: #0f1e35; }
        .mm-modal-sub { font-size: 0.80rem; color: #94a3b8; margin-top: 1px; }

        .mm-mfield { margin-bottom: 1rem; }
        .mm-mfield label { display: block; font-size: 0.82rem; font-weight: 500; color: #374151; margin-bottom: 5px; }
        .mm-req { color: #2563eb; }
        .mm-mwrap { position: relative; }
        .mm-mico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; display: flex; pointer-events: none; }
        .mm-minput, .mm-mselect { width: 100%; padding: 10px 12px 10px 38px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; color: #1e293b; background: #f8fafc; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
        .mm-minput:focus, .mm-mselect:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.10); }
        .mm-mselect { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        .mm-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .mm-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem; }
        .mm-cancel-btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; }
        .mm-cancel-btn:hover { border-color: #cbd5e1; background: #f8fafc; }
        .mm-save-btn { display: flex; align-items: center; gap: 7px; padding: 10px 22px; border-radius: 12px; border: none; background: linear-gradient(135deg, #094886, #2563eb); color: white; font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,0.28); transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s; }
        .mm-save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.36); }
        .mm-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .mm-form-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.30); border-top-color: white; border-radius: 50%; animation: mm-spin 0.65s linear infinite; display: inline-block; }

        @keyframes mm-spin { to { transform: rotate(360deg); } }
        @keyframes mm-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .mm-body { padding: 1rem; }
          .mm-page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .mm-row { flex-direction: column; align-items: flex-start; }
          .mm-actions { align-self: flex-end; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="mm-root">

        {/* NAVBAR */}
        <nav className="mm-nav">
          <div className="mm-nav-inner">
            <Link to="/dashboard" className="mm-brand">
              <div className="mm-brand-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="mm-brand-name">LearnBridge</span>
            </Link>
            <div className="mm-nav-links">
              <Link to="/manage-resources" className="mm-nav-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Manage Resources
              </Link>
              <Link to="/admin-dashboard" className="mm-nav-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Admin Dashboard
              </Link>
            </div>
          </div>
        </nav>

        <div className="mm-body">

          {/* Page header */}
          <div className="mm-page-header">
            <div>
              <h1 className="mm-page-title">Manage <span>Modules</span></h1>
              <p className="mm-page-sub">Create and manage academic modules by year and semester</p>
            </div>
            <button className="mm-create-btn" onClick={openCreate}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Module
            </button>
          </div>

          {/* Filters */}
          <div className="mm-filters">
            <div className="mm-filters-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/></svg>
              Filter Modules
            </div>
            <div className="mm-filter-row">
              <div className="mm-filter-field">
                <span className="mm-filter-label">Year</span>
                <select className="mm-filter-select" value={filters.year} onChange={e => handleFilterChange('year', e.target.value)}>
                  <option value="">All Years</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>
              <div className="mm-filter-field">
                <span className="mm-filter-label">Semester</span>
                <select className="mm-filter-select" value={filters.semester} onChange={e => handleFilterChange('semester', e.target.value)}>
                  <option value="">All Semesters</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                </select>
              </div>
              {(filters.year || filters.semester) && (
                <div className="mm-filter-field" style={{ justifyContent: 'flex-end' }}>
                  <span className="mm-filter-label" style={{ opacity: 0 }}>clear</span>
                  <button onClick={() => { setFilters({ year: '', semester: '' }); setCurrentPage(1); }}
                    style={{ padding: '9px 14px', borderRadius: 11, border: '1.5px solid #e2e8f0', background: 'white', fontSize: '0.82rem', fontWeight: 600, color: '#64748b', cursor: 'pointer', fontFamily: "'Sora',sans-serif", display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.borderColor='#cbd5e1'}
                    onMouseOut={e => e.currentTarget.style.borderColor='#e2e8f0'}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* List */}
          <div className="mm-list">
            <div className="mm-list-header">
              <div className="mm-list-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Academic Modules ({modules.length})
              </div>
            </div>

            {loading ? (
              <div className="mm-loading">
                <div className="mm-spinner" />
                <p>Loading modules…</p>
              </div>
            ) : modules.length === 0 ? (
              <div className="mm-empty">
                <div className="mm-empty-ico">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <h4>No Modules Found</h4>
                <p>{filters.year || filters.semester ? 'No modules match the selected filters.' : 'No modules created yet. Create your first module to get started!'}</p>
                {!filters.year && !filters.semester && (
                  <button className="mm-empty-btn" onClick={openCreate}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Create First Module
                  </button>
                )}
              </div>
            ) : (
              <>
                {modules.map((mod) => {
                  const yearStr = mod.year != null ? mod.year.toString() : '';
                  const semStr  = mod.semester != null ? mod.semester.toString() : '';
                  const yc = yearColors[yearStr] || yearColors['1'];
                  return (
                    <div key={mod._id} className="mm-row">
                      <div className="mm-module-ico">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                      </div>

                      <div className="mm-module-body">
                        <p className="mm-module-name">{mod.name}</p>
                        <div className="mm-module-meta">
                          <span className="mm-year-badge" style={{ background: yc.bg, color: yc.color, borderColor: yc.border }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: yc.color, display: 'inline-block' }} />
                            {yearLabels[yearStr] || (yearStr ? `Year ${yearStr}` : '—')}
                          </span>
                          <div className="mm-meta-chip">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            {semLabels[semStr] || (semStr ? `Semester ${semStr}` : '—')}
                          </div>
                          <div className="mm-meta-chip mm-creator">
                            <div className="mm-creator-av">{getInitials(mod)}</div>
                            {getCreator(mod)}
                          </div>
                          <div className="mm-meta-chip">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                            {new Date(mod.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>

                      <div className="mm-actions">
                        <button className="mm-btn-edit" onClick={() => handleEdit(mod)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit
                        </button>
                        <button className="mm-btn-del" onClick={() => handleDelete(mod._id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}

                {totalPages > 1 && (
                  <div className="mm-pagination">
                    <p className="mm-page-info">Page <span>{currentPage}</span> of <span>{totalPages}</span></p>
                    <div className="mm-page-btns">
                      <button className="mm-page-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
                        Previous
                      </button>
                      <button className="mm-page-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                        Next
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {showForm && (
        <div className="mm-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="mm-modal">
            <div className="mm-modal-header">
              <div className="mm-modal-ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  {editingModule
                    ? <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>
                    : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>
                  }
                </svg>
              </div>
              <div>
                <p className="mm-modal-title">{editingModule ? 'Edit Module' : 'Create New Module'}</p>
                <p className="mm-modal-sub">{editingModule ? 'Update the module details below' : 'Add a new academic module to the platform'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mm-mfield">
                <label>Module Name <span className="mm-req">*</span></label>
                <div className="mm-mwrap">
                  <span className="mm-mico">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                  </span>
                  <input className="mm-minput" type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Data Structures and Algorithms" />
                </div>
              </div>

              <div className="mm-grid2">
                <div className="mm-mfield">
                  <label>Year <span className="mm-req">*</span></label>
                  <div className="mm-mwrap">
                    <span className="mm-mico">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    </span>
                    <select className="mm-mselect" name="year" required value={formData.year} onChange={handleChange}>
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="mm-mfield">
                  <label>Semester <span className="mm-req">*</span></label>
                  <div className="mm-mwrap">
                    <span className="mm-mico">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </span>
                    <select className="mm-mselect" name="semester" required value={formData.semester} onChange={handleChange}>
                      <option value="">Select Semester</option>
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mm-modal-actions">
                <button type="button" className="mm-cancel-btn" onClick={() => setShowForm(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Cancel
                </button>
                <button type="submit" className="mm-save-btn" disabled={formLoading}>
                  {formLoading ? (
                    <><span className="mm-form-spinner" /> Saving…</>
                  ) : editingModule ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg> Update Module</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Create Module</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ManageModules;