import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SubmitResource = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'other',
    tags: '', year: '', semester: '', module: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [availableModules, setAvailableModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchModules();
  }, [formData.year, formData.semester]);

  const fetchModules = async () => {
    if (!formData.year || !formData.semester) { setAvailableModules([]); return; }
    try {
      setLoadingModules(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/modules?year=${formData.year}&semester=${formData.semester}`
      );
      if (response.data.success) setAvailableModules(response.data.data.modules || []);
    } catch (error) {
      toast.error('Failed to fetch modules');
    } finally {
      setLoadingModules(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    if (selectedFile.size > 10 * 1024 * 1024) { toast.error('File size must be less than 10MB'); return false; }
    const allowedTypes = [
      'application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain','image/jpeg','image/png','image/gif'
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, TXT, and images are allowed.');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (validateFile(f)) setFile(f);
    else { e.target.value = ''; setFile(null); }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && validateFile(f)) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file to upload'); return; }
    if (!formData.title.trim() || !formData.description.trim() || !formData.year || !formData.semester || !formData.module) {
      toast.error('Please fill in all required fields'); return;
    }
    setLoading(true); setUploadProgress(0);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/management/submit`,
        fd,
        {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
          onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
        }
      );
      if (response.data.success) {
        toast.success('Resource submitted! It will be reviewed by the resource manager.');
        setFormData({ title: '', description: '', category: 'other', tags: '', year: '', semester: '', module: '' });
        setFile(null); setUploadProgress(0);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit resource');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    const mb = bytes / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getFileIcon = (f) => {
    if (!f) return null;
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return { label: 'PDF', color: '#dc2626', bg: '#fef2f2' };
    if (['doc','docx'].includes(ext)) return { label: 'DOC', color: '#2563eb', bg: '#eff6ff' };
    if (['ppt','pptx'].includes(ext)) return { label: 'PPT', color: '#ea580c', bg: '#fff7ed' };
    if (['jpg','jpeg','png','gif'].includes(ext)) return { label: 'IMG', color: '#7c3aed', bg: '#faf5ff' };
    return { label: 'TXT', color: '#059669', bg: '#f0fdf4' };
  };

  const categoryConfig = {
    lecture:    { label: 'Lecture',    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    assignment: { label: 'Assignment', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    tutorial:   { label: 'Tutorial',   color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
    reference:  { label: 'Reference',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    other:      { label: 'Other',      color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
  };

  const fileInfo = getFileIcon(file);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sr-root { min-height: 100vh; background: #f0f4f8; font-family: 'DM Sans', sans-serif; }

        /* NAVBAR */
        .sr-nav { position: sticky; top: 0; z-index: 50; background: white; border-bottom: 1px solid #e2e8f0; box-shadow: 0 1px 12px rgba(9,72,134,0.07); }
        .sr-nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .sr-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .sr-brand-logo { width: 36px; height: 36px; background: linear-gradient(135deg, #094886, #2563eb); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .sr-brand-name { font-family: 'Sora', sans-serif; font-size: 1.15rem; font-weight: 700; color: #0f1e35; letter-spacing: -0.2px; }
        .sr-nav-links { display: flex; gap: 4px; }
        .sr-nav-link { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 500; color: #475569; text-decoration: none; transition: background 0.15s, color 0.15s; }
        .sr-nav-link:hover { background: #f1f5f9; color: #094886; }

        /* BODY */
        .sr-body { max-width: 780px; margin: 0 auto; padding: 2rem 1.5rem; }

        /* Page header */
        .sr-page-header { margin-bottom: 1.5rem; animation: sr-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .sr-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 0.80rem; color: #94a3b8; margin-bottom: 10px; }
        .sr-breadcrumb a { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
        .sr-breadcrumb a:hover { color: #2563eb; }
        .sr-breadcrumb span { color: #334155; font-weight: 500; }
        .sr-page-title { font-family: 'Sora', sans-serif; font-size: 1.7rem; font-weight: 800; color: #0f1e35; }
        .sr-page-title span { color: #2563eb; }
        .sr-page-sub { font-size: 0.87rem; color: #94a3b8; margin-top: 4px; }

        /* Info banner */
        .sr-info-banner {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 13px 16px; background: #eff6ff; border: 1.5px solid #bfdbfe;
          border-radius: 14px; margin-bottom: 1.2rem;
          animation: sr-up 0.4s 0.03s cubic-bezier(0.16,1,0.3,1) both;
        }
        .sr-info-ico { width: 32px; height: 32px; background: #dbeafe; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sr-info-title { font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 600; color: #1e40af; margin-bottom: 2px; }
        .sr-info-desc { font-size: 0.78rem; color: #3b82f6; line-height: 1.55; }

        /* Card */
        .sr-card { background: white; border-radius: 20px; box-shadow: 0 2px 8px rgba(9,72,134,0.07), 0 0 0 1px rgba(9,72,134,0.04); overflow: hidden; animation: sr-up 0.4s 0.07s cubic-bezier(0.16,1,0.3,1) both; }
        .sr-card-header { padding: 1.3rem 1.8rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
        .sr-card-header-ico { width: 38px; height: 38px; border-radius: 11px; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; }
        .sr-card-header-title { font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: #0f1e35; }
        .sr-card-header-sub { font-size: 0.80rem; color: #94a3b8; margin-top: 1px; }
        .sr-card-body { padding: 1.8rem; }

        /* Section label */
        .sr-sec { font-family: 'Sora', sans-serif; font-size: 0.74rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.9px; display: flex; align-items: center; gap: 8px; margin: 0 0 0.9rem; }
        .sr-sec::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }

        /* Fields */
        .sr-field { margin-bottom: 1.1rem; }
        .sr-field label { display: block; font-size: 0.82rem; font-weight: 500; color: #374151; margin-bottom: 5px; }
        .sr-req { color: #2563eb; }
        .sr-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

        .sr-wrap { position: relative; }
        .sr-ico { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; display: flex; pointer-events: none; }

        .sr-input, .sr-select, .sr-textarea {
          width: 100%; padding: 10px 12px 10px 38px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 0.88rem; font-family: 'DM Sans', sans-serif;
          color: #1e293b; background: #f8fafc; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .sr-input:focus, .sr-select:focus, .sr-textarea:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.10); }
        .sr-textarea { padding: 10px 12px; resize: none; line-height: 1.6; }
        .sr-select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        .sr-hint { font-size: 0.76rem; color: #94a3b8; margin-top: 5px; }

        /* Category pills */
        .sr-cat-grid { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 5px; }
        .sr-cat-btn { padding: 6px 14px; border-radius: 20px; border: 1.5px solid; font-family: 'Sora', sans-serif; font-size: 0.80rem; font-weight: 600; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 5px; background: transparent; }

        /* Divider */
        .sr-divider { height: 1px; background: #f1f5f9; margin: 1.4rem 0; }

        /* Drop zone */
        .sr-dropzone { border: 2px dashed #e2e8f0; border-radius: 16px; padding: 2rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; background: #fafbfc; }
        .sr-dropzone:hover, .sr-dropzone.over { border-color: #2563eb; background: #eff6ff; transform: scale(1.005); }
        .sr-drop-ico { width: 50px; height: 50px; border-radius: 15px; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .sr-drop-title { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f1e35; margin-bottom: 4px; }
        .sr-drop-sub { font-size: 0.82rem; color: #94a3b8; margin-bottom: 10px; }
        .sr-drop-btn { display: inline-flex; align-items: center; gap: 5px; padding: 7px 16px; border-radius: 10px; background: #eff6ff; color: #2563eb; border: none; font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .sr-drop-btn:hover { background: #dbeafe; }
        .sr-drop-types { margin-top: 10px; font-size: 0.73rem; color: #cbd5e1; }
        .sr-file-input { display: none; }

        /* File selected */
        .sr-file-selected { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: #f0fdf4; border: 1.5px solid #a7f3d0; margin-top: 10px; }
        .sr-file-badge { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-size: 0.62rem; font-weight: 800; flex-shrink: 0; }
        .sr-file-name { font-family: 'Sora', sans-serif; font-size: 0.87rem; font-weight: 600; color: #0f1e35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sr-file-size { font-size: 0.76rem; color: #64748b; margin-top: 1px; }
        .sr-file-remove { width: 28px; height: 28px; border-radius: 8px; background: #fee2e2; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #dc2626; flex-shrink: 0; transition: background 0.15s; margin-left: auto; }
        .sr-file-remove:hover { background: #fecaca; }

        /* Progress */
        .sr-progress-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .sr-progress-label { font-size: 0.80rem; font-weight: 600; color: #475569; font-family: 'Sora', sans-serif; }
        .sr-progress-pct { font-size: 0.80rem; font-weight: 700; color: #2563eb; font-family: 'Sora', sans-serif; }
        .sr-progress-track { height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
        .sr-progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #094886, #2563eb); transition: width 0.3s; position: relative; overflow: hidden; }
        .sr-progress-fill::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent); animation: sr-shimmer 1.2s infinite; }
        @keyframes sr-shimmer { to { left: 100%; } }

        /* Actions */
        .sr-actions { display: flex; justify-content: flex-end; gap: 10px; }
        .sr-btn-cancel { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600; color: #475569; text-decoration: none; transition: all 0.15s; }
        .sr-btn-cancel:hover { border-color: #cbd5e1; background: #f8fafc; }
        .sr-btn-submit { display: flex; align-items: center; gap: 7px; padding: 10px 24px; border-radius: 12px; border: none; background: linear-gradient(135deg, #094886, #2563eb); color: white; font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,0.30); transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s; }
        .sr-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.38); }
        .sr-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .sr-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.30); border-top-color: white; border-radius: 50%; animation: sr-spin 0.65s linear infinite; display: inline-block; }

        @keyframes sr-spin { to { transform: rotate(360deg); } }
        @keyframes sr-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 640px) {
          .sr-body { padding: 1rem; }
          .sr-card-body { padding: 1.2rem; }
          .sr-grid3 { grid-template-columns: 1fr; }
          .sr-page-title { font-size: 1.4rem; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="sr-root">

        {/* NAVBAR */}
        <nav className="sr-nav">
          <div className="sr-nav-inner">
            <Link to="/dashboard" className="sr-brand">
              <div className="sr-brand-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="sr-brand-name">LearnBridge</span>
            </Link>
            <div className="sr-nav-links">
              <Link to="/dashboard" className="sr-nav-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Dashboard
              </Link>
              <Link to="/resources" className="sr-nav-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                Resources
              </Link>
            </div>
          </div>
        </nav>

        <div className="sr-body">

          {/* Page header */}
          <div className="sr-page-header">
            <div className="sr-breadcrumb">
              <Link to="/dashboard">Dashboard</Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>
              <Link to="/resources">Resources</Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>
              <span>Submit</span>
            </div>
            <h1 className="sr-page-title">Submit a <span>Resource</span></h1>
            <p className="sr-page-sub">Share your materials for review — approved resources go live for all students</p>
          </div>

          {/* Info banner */}
          <div className="sr-info-banner">
            <div className="sr-info-ico">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <div className="sr-info-title">Pending Review Process</div>
              <div className="sr-info-desc">All submitted resources are reviewed by a resource manager before being published. You'll be notified once your submission is approved or rejected.</div>
            </div>
          </div>

          {/* Main card */}
          <div className="sr-card">
            <div className="sr-card-header">
              <div className="sr-card-header-ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <p className="sr-card-header-title">Resource Submission</p>
                <p className="sr-card-header-sub">Fill in the details below to submit your material</p>
              </div>
            </div>

            <div className="sr-card-body">
              <form onSubmit={handleSubmit}>

                {/* ── Academic Context ── */}
                <div className="sr-sec">Academic Context</div>

                <div className="sr-field">
                  <label>Title <span className="sr-req">*</span></label>
                  <div className="sr-wrap">
                    <span className="sr-ico">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
                    </span>
                    <input className="sr-input" type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="e.g. Data Structures – Week 3 Lecture Notes" />
                  </div>
                </div>

                <div className="sr-grid3">
                  {/* Year */}
                  <div className="sr-field">
                    <label>Year <span className="sr-req">*</span></label>
                    <div className="sr-wrap">
                      <span className="sr-ico">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      </span>
                      <select className="sr-select" name="year" required value={formData.year} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="1">1st Year</option>
                        <option value="2">2nd Year</option>
                        <option value="3">3rd Year</option>
                        <option value="4">4th Year</option>
                      </select>
                    </div>
                  </div>

                  {/* Semester */}
                  <div className="sr-field">
                    <label>Semester <span className="sr-req">*</span></label>
                    <div className="sr-wrap">
                      <span className="sr-ico">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      </span>
                      <select className="sr-select" name="semester" required value={formData.semester} onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="1">1st Semester</option>
                        <option value="2">2nd Semester</option>
                      </select>
                    </div>
                  </div>

                  {/* Module */}
                  <div className="sr-field">
                    <label>Module <span className="sr-req">*</span></label>
                    <div className="sr-wrap">
                      <span className="sr-ico">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      </span>
                      <select className="sr-select" name="module" required value={formData.module} onChange={handleChange} disabled={!formData.year || !formData.semester || loadingModules}>
                        <option value="">
                          {!formData.year || !formData.semester
                            ? 'Select year & semester first'
                            : loadingModules ? 'Loading…'
                            : availableModules.length === 0 ? 'No modules'
                            : 'Select module'}
                        </option>
                        {availableModules.map((m) => (
                          <option key={m._id} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    {loadingModules && (
                      <p style={{ fontSize: '0.73rem', color: '#2563eb', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 10, height: 10, border: '2px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', display: 'inline-block', animation: 'sr-spin 0.65s linear infinite' }} />
                        Fetching modules…
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="sr-field">
                  <label>Description <span className="sr-req">*</span></label>
                  <textarea className="sr-textarea" name="description" rows={4} required value={formData.description} onChange={handleChange} placeholder="Describe what this resource covers, who it's for, and any key details…" />
                </div>

                <div className="sr-divider" />

                {/* ── Resource Info ── */}
                <div className="sr-sec">Resource Info</div>

                {/* Category */}
                <div className="sr-field">
                  <label>Category</label>
                  <div className="sr-cat-grid">
                    {Object.entries(categoryConfig).map(([val, cfg]) => {
                      const active = formData.category === val;
                      return (
                        <button key={val} type="button" className="sr-cat-btn" onClick={() => setFormData({ ...formData, category: val })}
                          style={{ background: active ? cfg.bg : 'transparent', color: active ? cfg.color : '#64748b', borderColor: active ? cfg.border : '#e2e8f0' }}>
                          {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />}
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tags */}
                <div className="sr-field">
                  <label>Tags</label>
                  <div className="sr-wrap">
                    <span className="sr-ico">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    </span>
                    <input className="sr-input" type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. algorithms, sorting, CS101" />
                  </div>
                  <p className="sr-hint">Separate multiple tags with commas to improve discoverability</p>
                </div>

                <div className="sr-divider" />

                {/* ── File Upload ── */}
                <div className="sr-sec">File Upload</div>

                <div
                  className={`sr-dropzone${dragOver ? ' over' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="sr-drop-ico">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <p className="sr-drop-title">Drop your file here</p>
                  <p className="sr-drop-sub">or click to browse from your computer</p>
                  <button type="button" className="sr-drop-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Choose File
                  </button>
                  <p className="sr-drop-types">PDF · DOC · DOCX · PPT · PPTX · TXT · JPG · PNG · GIF — max 10 MB</p>
                  <input ref={fileInputRef} type="file" className="sr-file-input" onChange={handleFileChange} accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif" />
                </div>

                {file && fileInfo && (
                  <div className="sr-file-selected">
                    <div className="sr-file-badge" style={{ background: fileInfo.bg, color: fileInfo.color }}>{fileInfo.label}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="sr-file-name">{file.name}</p>
                      <p className="sr-file-size">{formatSize(file.size)}</p>
                    </div>
                    <button type="button" className="sr-file-remove" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                )}

                {/* Progress */}
                {loading && uploadProgress > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div className="sr-progress-header">
                      <span className="sr-progress-label">Uploading…</span>
                      <span className="sr-progress-pct">{uploadProgress}%</span>
                    </div>
                    <div className="sr-progress-track">
                      <div className="sr-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="sr-divider" />

                {/* Actions */}
                <div className="sr-actions">
                  <Link to="/dashboard" className="sr-btn-cancel">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Cancel
                  </Link>
                  <button type="submit" className="sr-btn-submit" disabled={loading}>
                    {loading ? (
                      <><span className="sr-spinner" /> Submitting…</>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Submit for Review
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubmitResource;