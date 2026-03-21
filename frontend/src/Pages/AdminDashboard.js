import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('create-resource-manager');
  const [formLoading, setFormLoading] = useState(false);
  const [showPassRM, setShowPassRM] = useState(false);
  const [showPassCoord, setShowPassCoord] = useState(false);

  const emptyForm = (role) => ({ username: '', email: '', password: '', firstName: '', lastName: '', phone: '', bio: '', role });
  const [resourceManagerForm, setResourceManagerForm] = useState(emptyForm('resourceManager'));
  const [coordinatorForm, setCoordinatorForm] = useState(emptyForm('coordinator'));

  useEffect(() => { fetchUsers(); }, [currentPage]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/users?page=${currentPage}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) { setUsers(res.data.data.users); setTotalPages(res.data.data.pagination.pages); }
    } catch { toast.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e, form, role, resetFn) => {
    e.preventDefault(); setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/create-user`,
        form, { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`${role} created successfully`);
        resetFn(emptyForm(role === 'Resource Manager' ? 'resourceManager' : 'coordinator'));
        fetchUsers();
      }
    } catch (err) { toast.error(err.response?.data?.message || `Failed to create ${role}`); }
    finally { setFormLoading(false); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('User deleted successfully'); fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/admin-login'; };

  const roleConfig = {
    admin:           { label: 'Admin',            color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
    resourceManager: { label: 'Resource Manager', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    coordinator:     { label: 'Coordinator',      color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    student:         { label: 'Student',          color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
  };

  const getInitials = (u) => {
    const f = u?.profile?.firstName?.[0] || '';
    const l = u?.profile?.lastName?.[0] || '';
    return (f + l).toUpperCase() || (u?.username?.[0] || '?').toUpperCase();
  };

  const tabs = [
    { id: 'create-resource-manager', label: 'Create Resource Manager', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
    { id: 'create-coordinator',       label: 'Create Coordinator',       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'manage-users',             label: 'Manage Users',             icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  const UserForm = ({ title, form, setForm, onSubmit, showPass, setShowPass, submitLabel }) => (
    <div className="ad-card" style={{ animation: 'ad-up 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
      <div className="ad-card-header">
        <div className="ad-card-header-ico">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <div>
          <p className="ad-card-title">{title}</p>
          <p className="ad-card-sub">Fill in the details to create a new account</p>
        </div>
      </div>
      <div className="ad-card-body">
        <form onSubmit={onSubmit}>
          <div className="ad-sec">Personal Information</div>
          <div className="ad-grid2">
            {[['firstName','First Name','person'],['lastName','Last Name','person'],['phone','Phone','phone'],['username','Username','at']].map(([name, label, ico]) => (
              <div className="ad-field" key={name}>
                <label>{label} {['firstName','lastName','username'].includes(name) && <span className="ad-req">*</span>}{name==='phone'&&<span className="ad-opt">optional</span>}</label>
                <div className="ad-wrap">
                  <span className="ad-ico">
                    {ico==='person' ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    : ico==='phone' ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.32 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6.36 6.36l.96-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    : <span style={{ fontSize: '0.84rem', fontWeight: 700, fontFamily: "'Sora',sans-serif", color: '#94a3b8' }}>@</span>}
                  </span>
                  <input className="ad-input" type={name==='phone'?'tel':'text'} required={['firstName','lastName','username'].includes(name)} value={form[name]} onChange={e=>setForm({...form,[name]:e.target.value})} placeholder={name==='firstName'?'John':name==='lastName'?'Doe':name==='phone'?'+94 77 000 0000':name==='username'?'johndoe':''} />
                </div>
              </div>
            ))}
            <div className="ad-field">
              <label>Email <span className="ad-req">*</span></label>
              <div className="ad-wrap">
                <span className="ad-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                <input className="ad-input" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="user@learnbridge.com" />
              </div>
            </div>
            <div className="ad-field">
              <label>Password <span className="ad-req">*</span></label>
              <div className="ad-wrap">
                <span className="ad-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                <input className="ad-input" style={{ paddingRight: 38 }} type={showPass?'text':'password'} required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min. 6 characters" />
                <button type="button" className="ad-eye" onClick={()=>setShowPass(!showPass)}>
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
          </div>
          <div className="ad-field" style={{ marginTop: '0.4rem' }}>
            <label>Bio <span className="ad-opt">optional</span></label>
            <textarea className="ad-textarea" rows={2} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Brief description about this user…" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.4rem' }}>
            <button type="submit" className="ad-btn-submit" disabled={formLoading}>
              {formLoading
                ? <><span className="ad-spinner" /> Creating…</>
                : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>{submitLabel}</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ad-root { min-height: 100vh; background: #f0f4f8; font-family: 'DM Sans', sans-serif; }

        /* NAVBAR */
        .ad-nav { position: sticky; top: 0; z-index: 50; background: white; border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 12px rgba(9,72,134,0.07); }
        .ad-nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .ad-brand { display: flex; align-items: center; gap: 10px; }
        .ad-brand-logo { width: 36px; height: 36px; background: linear-gradient(135deg, #094886, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .ad-brand-name { font-family: 'Sora', sans-serif; font-size: 1.15rem; font-weight: 700; color: #0f1e35; }
        .ad-brand-badge { padding: 3px 10px; border-radius: 20px; background: #eff6ff; border: 1.5px solid #bfdbfe; font-family: 'Sora', sans-serif; font-size: 0.70rem; font-weight: 700; color: #2563eb; letter-spacing: 0.3px; }
        .ad-nav-right { display: flex; align-items: center; gap: 6px; }
        .ad-nav-link { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 500; color: #475569; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .ad-nav-link:hover { background: #f1f5f9; color: #094886; }
        .ad-logout-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; font-size: 0.84rem; font-weight: 500; color: #64748b; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
        .ad-logout-btn:hover { border-color: #fca5a5; color: #dc2626; background: #fff5f5; }

        /* BODY */
        .ad-body { max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem; }

        /* Page header */
        .ad-page-header { margin-bottom: 1.5rem; animation: ad-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .ad-page-title { font-family: 'Sora', sans-serif; font-size: 1.7rem; font-weight: 800; color: #0f1e35; }
        .ad-page-title span { color: #2563eb; }
        .ad-page-sub { font-size: 0.87rem; color: #94a3b8; margin-top: 4px; }

        /* Tabs */
        .ad-tabs { display: flex; gap: 4px; background: white; border-radius: 16px; padding: 5px; box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04); margin-bottom: 1.5rem; animation: ad-up 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both; }
        .ad-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 9px 12px; border-radius: 12px; border: none; background: transparent; font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .ad-tab:hover { background: #f8fafc; color: #094886; }
        .ad-tab.active { background: linear-gradient(135deg, #094886, #2563eb); color: white; box-shadow: 0 3px 10px rgba(37,99,235,0.28); }

        /* Cards */
        .ad-card { background: white; border-radius: 20px; box-shadow: 0 2px 8px rgba(9,72,134,0.07), 0 0 0 1px rgba(9,72,134,0.04); overflow: hidden; }
        .ad-card-header { padding: 1.3rem 1.8rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
        .ad-card-header-ico { width: 38px; height: 38px; border-radius: 11px; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ad-card-title { font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: #0f1e35; }
        .ad-card-sub { font-size: 0.80rem; color: #94a3b8; margin-top: 1px; }
        .ad-card-body { padding: 1.8rem; }

        /* Section divider */
        .ad-sec { font-family: 'Sora', sans-serif; font-size: 0.74rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.9px; display: flex; align-items: center; gap: 8px; margin-bottom: 0.9rem; }
        .ad-sec::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }

        /* Form fields */
        .ad-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ad-field { margin-bottom: 1rem; }
        .ad-field label { display: block; font-size: 0.82rem; font-weight: 500; color: #374151; margin-bottom: 5px; }
        .ad-req { color: #2563eb; }
        .ad-opt { font-size: 0.70rem; color: #94a3b8; font-weight: 400; background: #f1f5f9; padding: 1px 6px; border-radius: 6px; margin-left: 4px; }
        .ad-wrap { position: relative; }
        .ad-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; display: flex; pointer-events: none; }
        .ad-input { width: 100%; padding: 10px 12px 10px 38px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; color: #1e293b; background: #f8fafc; outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
        .ad-input:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.10); }
        .ad-textarea { width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 0.88rem; font-family: 'DM Sans', sans-serif; color: #1e293b; background: #f8fafc; outline: none; resize: none; line-height: 1.6; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
        .ad-textarea:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.10); }
        .ad-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; padding: 2px; transition: color 0.2s; }
        .ad-eye:hover { color: #2563eb; }

        /* Submit button */
        .ad-btn-submit { display: flex; align-items: center; gap: 7px; padding: 10px 24px; border-radius: 12px; border: none; background: linear-gradient(135deg, #094886, #2563eb); color: white; font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,0.30); transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s; }
        .ad-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.38); }
        .ad-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .ad-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.30); border-top-color: white; border-radius: 50%; animation: ad-spin 0.65s linear infinite; display: inline-block; }

        /* Users table */
        .ad-table-header { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 10px; }
        .ad-table-title { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f1e35; }
        .ad-tbl { width: 100%; border-collapse: collapse; }
        .ad-tbl th { padding: 10px 16px; text-align: left; font-family: 'Sora', sans-serif; font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.7px; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
        .ad-tbl th:first-child { border-radius: 0; }
        .ad-tbl td { padding: 12px 16px; border-bottom: 1px solid #f8fafc; font-size: 0.86rem; color: #334155; vertical-align: middle; }
        .ad-tbl tr:last-child td { border-bottom: none; }
        .ad-tbl tr:hover td { background: #fafbfe; }
        .ad-user-name { font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600; color: #0f1e35; }
        .ad-user-handle { font-size: 0.76rem; color: #94a3b8; margin-top: 1px; }
        .ad-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-size: 0.72rem; font-weight: 700; color: white; flex-shrink: 0; }
        .ad-user-cell { display: flex; align-items: center; gap: 10px; }
        .ad-role-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.74rem; font-weight: 600; font-family: 'Sora', sans-serif; border: 1px solid; display: inline-flex; align-items: center; gap: 4px; }
        .ad-btn-del { display: flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 8px; background: #fef2f2; color: #dc2626; border: 1.5px solid #fecaca; font-family: 'Sora', sans-serif; font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .ad-btn-del:hover { background: #fee2e2; }

        /* Loading */
        .ad-loading { padding: 4rem; text-align: center; }
        .ad-spinner-lg { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: ad-spin 0.7s linear infinite; margin: 0 auto 12px; }
        .ad-loading p { font-size: 0.87rem; color: #94a3b8; }

        /* Empty */
        .ad-empty { padding: 3.5rem 2rem; text-align: center; }
        .ad-empty-ico { width: 52px; height: 52px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .ad-empty p { font-size: 0.87rem; color: #94a3b8; }

        /* Pagination */
        .ad-pagination { padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
        .ad-page-info { font-size: 0.82rem; color: #94a3b8; }
        .ad-page-info span { font-weight: 600; color: #475569; }
        .ad-page-btns { display: flex; gap: 6px; }
        .ad-page-btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; }
        .ad-page-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
        .ad-page-btn:disabled { opacity: 0.40; cursor: not-allowed; }

        @keyframes ad-spin { to { transform: rotate(360deg); } }
        @keyframes ad-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .ad-body { padding: 1rem; }
          .ad-grid2 { grid-template-columns: 1fr; }
          .ad-tabs { flex-direction: column; }
          .ad-brand-badge { display: none; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="ad-root">

        {/* NAVBAR */}
        <nav className="ad-nav">
          <div className="ad-nav-inner">
            <div className="ad-brand">
              <div className="ad-brand-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="ad-brand-name">LearnBridge</span>
              <span className="ad-brand-badge">Admin Panel</span>
            </div>
            <div className="ad-nav-right">
              <Link to="/manage-resources" className="ad-nav-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Manage Resources
              </Link>
              <button className="ad-logout-btn" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="ad-body">

          {/* Page header */}
          <div className="ad-page-header">
            <h1 className="ad-page-title">Admin <span>Dashboard</span></h1>
            <p className="ad-page-sub">Manage users, create roles, and oversee platform operations</p>
          </div>

          {/* Tabs */}
          <div className="ad-tabs">
            {tabs.map(t => (
              <button key={t.id} className={`ad-tab${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ── CREATE RESOURCE MANAGER ── */}
          {activeTab === 'create-resource-manager' && (
            <UserForm
              title="Create Resource Manager"
              form={resourceManagerForm}
              setForm={setResourceManagerForm}
              onSubmit={e => handleCreate(e, resourceManagerForm, 'Resource Manager', setResourceManagerForm)}
              showPass={showPassRM}
              setShowPass={setShowPassRM}
              submitLabel="Create Resource Manager"
            />
          )}

          {/* ── CREATE COORDINATOR ── */}
          {activeTab === 'create-coordinator' && (
            <UserForm
              title="Create Coordinator"
              form={coordinatorForm}
              setForm={setCoordinatorForm}
              onSubmit={e => handleCreate(e, coordinatorForm, 'Coordinator', setCoordinatorForm)}
              showPass={showPassCoord}
              setShowPass={setShowPassCoord}
              submitLabel="Create Coordinator"
            />
          )}

          {/* ── MANAGE USERS ── */}
          {activeTab === 'manage-users' && (
            <div className="ad-card" style={{ animation: 'ad-up 0.35s cubic-bezier(0.16,1,0.3,1) both' }}>
              <div className="ad-table-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span className="ad-table-title">All Users ({users.length})</span>
              </div>

              {loading ? (
                <div className="ad-loading">
                  <div className="ad-spinner-lg" />
                  <p>Loading users…</p>
                </div>
              ) : users.length === 0 ? (
                <div className="ad-empty">
                  <div className="ad-empty-ico">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <p>No users found.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="ad-tbl">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => {
                        const rc = roleConfig[user.role] || { label: user.role, color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
                        return (
                          <tr key={user._id}>
                            <td>
                              <div className="ad-user-cell">
                                <div className="ad-avatar">{getInitials(user)}</div>
                                <div>
                                  <p className="ad-user-name">{[user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(' ') || '—'}</p>
                                  <p className="ad-user-handle">@{user.username}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ color: '#64748b', fontSize: '0.84rem' }}>{user.email}</td>
                            <td>
                              <span className="ad-role-badge" style={{ background: rc.bg, color: rc.color, borderColor: rc.border }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: rc.color, display: 'inline-block' }} />
                                {rc.label}
                              </span>
                            </td>
                            <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                              {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td>
                              {user.role !== 'admin' && (
                                <button className="ad-btn-del" onClick={() => handleDeleteUser(user._id)}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="ad-pagination">
                  <p className="ad-page-info">Page <span>{currentPage}</span> of <span>{totalPages}</span></p>
                  <div className="ad-page-btns">
                    <button className="ad-page-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
                      Previous
                    </button>
                    <button className="ad-page-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                      Next
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;