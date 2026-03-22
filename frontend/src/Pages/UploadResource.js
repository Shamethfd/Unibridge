import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadResource = () => {
  const [formData, setFormData] = useState({ title: '', description: '', category: 'other', tags: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return false;
    }
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
    const selectedFile = e.target.files[0];
    if (validateFile(selectedFile)) setFile(selectedFile);
    else { e.target.value = ''; setFile(null); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && validateFile(dropped)) setFile(dropped);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file to upload'); return; }
    if (!formData.title.trim() || !formData.description.trim()) { toast.error('Title and description are required'); return; }
    setLoading(true); setUploadProgress(0);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('category', formData.category);
      fd.append('tags', formData.tags);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resources/upload`,
        fd,
        {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
          onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total))
        }
      );
      if (response.data.success) {
        toast.success('Resource uploaded successfully!');
        setFormData({ title: '', description: '', category: 'other', tags: '' });
        setFile(null); setUploadProgress(0);
        setTimeout(() => navigate('/resources'), 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resource');
      setUploadProgress(0);
    } finally { setLoading(false); }
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

        .ur-root { min-height: 100vh; background: #f0f4f8; font-family: 'DM Sans', sans-serif; }

        /* BODY */
        .ur-body {
          max-width: 780px; margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        /* Page header */
        .ur-page-header {
          margin-bottom: 1.5rem;
          animation: ur-up 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ur-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.80rem; color: #94a3b8; margin-bottom: 10px;
        }
        .ur-breadcrumb a { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
        .ur-breadcrumb a:hover { color: #2563eb; }
        .ur-breadcrumb span { color: #334155; font-weight: 500; }
        .ur-page-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.7rem; font-weight: 800; color: #0f1e35;
        }
        .ur-page-title span { color: #2563eb; }
        .ur-page-sub { font-size: 0.87rem; color: #94a3b8; margin-top: 4px; }

        /* Card */
        .ur-card {
          background: white; border-radius: 20px;
          box-shadow: 0 2px 8px rgba(9,72,134,0.07), 0 0 0 1px rgba(9,72,134,0.04);
          overflow: hidden;
          animation: ur-up 0.4s 0.06s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ur-card-header {
          padding: 1.4rem 1.8rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; gap: 12px;
        }
        .ur-card-header-ico {
          width: 38px; height: 38px; border-radius: 11px;
          background: linear-gradient(135deg, #094886, #2563eb);
          display: flex; align-items: center; justify-content: center;
        }
        .ur-card-header-title {
          font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: #0f1e35;
        }
        .ur-card-header-sub { font-size: 0.80rem; color: #94a3b8; margin-top: 1px; }
        .ur-card-body { padding: 1.8rem; }

        /* Fields */
        .ur-field { margin-bottom: 1.4rem; }
        .ur-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.83rem; font-weight: 600; color: #334155; margin-bottom: 6px;
        }
        .ur-label .req { color: #2563eb; }
        .ur-input, .ur-textarea, .ur-select {
          width: 100%; padding: 11px 14px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
          color: #1e293b; background: #f8fafc; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .ur-input:focus, .ur-textarea:focus, .ur-select:focus {
          border-color: #2563eb; background: white;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.10);
        }
        .ur-textarea { resize: vertical; min-height: 110px; line-height: 1.6; }
        .ur-select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }
        .ur-hint { font-size: 0.77rem; color: #94a3b8; margin-top: 5px; }

        /* Category selector */
        .ur-cat-grid { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 6px; }
        .ur-cat-btn {
          padding: 6px 14px; border-radius: 20px; border: 1.5px solid;
          font-family: 'Sora', sans-serif; font-size: 0.80rem; font-weight: 600;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; gap: 5px;
          background: transparent;
        }

        /* Drop zone */
        .ur-dropzone {
          border: 2px dashed #e2e8f0; border-radius: 16px;
          padding: 2.2rem 1.5rem; text-align: center;
          cursor: pointer; transition: all 0.2s; position: relative;
          background: #fafbfc;
        }
        .ur-dropzone:hover, .ur-dropzone.over {
          border-color: #2563eb; background: #eff6ff;
        }
        .ur-dropzone.over { transform: scale(1.005); }
        .ur-drop-ico {
          width: 52px; height: 52px; border-radius: 16px;
          background: linear-gradient(135deg, #094886, #2563eb);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 14px;
        }
        .ur-drop-title {
          font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f1e35;
          margin-bottom: 4px;
        }
        .ur-drop-sub { font-size: 0.82rem; color: #94a3b8; margin-bottom: 12px; }
        .ur-drop-link {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 7px 16px; border-radius: 10px;
          background: #eff6ff; color: #2563eb; border: 1.5px solid #bfdbfe;
          font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; border: none; transition: background 0.15s;
        }
        .ur-drop-link:hover { background: #dbeafe; }
        .ur-drop-types {
          margin-top: 10px; font-size: 0.74rem; color: #cbd5e1;
        }
        .ur-file-input { display: none; }

        /* Selected file */
        .ur-file-selected {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 12px;
          background: #f0fdf4; border: 1.5px solid #a7f3d0; margin-top: 10px;
        }
        .ur-file-type-badge {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Sora', sans-serif; font-size: 0.62rem; font-weight: 800;
          flex-shrink: 0;
        }
        .ur-file-info { flex: 1; min-width: 0; }
        .ur-file-name {
          font-family: 'Sora', sans-serif; font-size: 0.87rem; font-weight: 600; color: #0f1e35;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ur-file-size { font-size: 0.76rem; color: #64748b; margin-top: 1px; }
        .ur-file-remove {
          width: 28px; height: 28px; border-radius: 8px;
          background: #fee2e2; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center; color: #dc2626;
          flex-shrink: 0; transition: background 0.15s;
        }
        .ur-file-remove:hover { background: #fecaca; }

        /* Progress bar */
        .ur-progress-wrap { margin-top: 0; }
        .ur-progress-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 6px;
        }
        .ur-progress-label { font-size: 0.80rem; font-weight: 600; color: #475569; font-family: 'Sora', sans-serif; }
        .ur-progress-pct { font-size: 0.80rem; font-weight: 700; color: #2563eb; font-family: 'Sora', sans-serif; }
        .ur-progress-track {
          height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden;
        }
        .ur-progress-fill {
          height: 100%; border-radius: 999px;
          background: linear-gradient(90deg, #094886, #2563eb);
          transition: width 0.3s ease;
          position: relative; overflow: hidden;
        }
        .ur-progress-fill::after {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          animation: ur-shimmer 1.2s infinite;
        }
        @keyframes ur-shimmer { to { left: 100%; } }

        /* Divider */
        .ur-divider { height: 1px; background: #f1f5f9; margin: 1.6rem 0; }

        /* Form actions */
        .ur-actions { display: flex; justify-content: flex-end; gap: 10px; }
        .ur-btn-cancel {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 20px; border-radius: 12px;
          border: 1.5px solid #e2e8f0; background: white;
          font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600;
          color: #475569; text-decoration: none;
          transition: border-color 0.15s, background 0.15s;
          cursor: pointer;
        }
        .ur-btn-cancel:hover { border-color: #cbd5e1; background: #f8fafc; }
        .ur-btn-submit {
          display: flex; align-items: center; gap: 7px;
          padding: 10px 24px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, #094886, #2563eb);
          color: white; font-family: 'Sora', sans-serif;
          font-size: 0.88rem; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px rgba(37,99,235,0.30);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s;
        }
        .ur-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.38); }
        .ur-btn-submit:disabled { opacity: 0.60; cursor: not-allowed; transform: none; }
        .ur-btn-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.30); border-top-color: white;
          border-radius: 50%; animation: ur-spin 0.65s linear infinite;
        }
        @keyframes ur-spin { to { transform: rotate(360deg); } }
        @keyframes ur-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Tips card */
        .ur-tips {
          background: white; border-radius: 18px;
          box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04);
          padding: 1.3rem 1.5rem; margin-top: 1.2rem;
          animation: ur-up 0.4s 0.12s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ur-tips-title {
          font-family: 'Sora', sans-serif; font-size: 0.83rem; font-weight: 700;
          color: #334155; margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px;
        }
        .ur-tip-row {
          display: flex; align-items: flex-start; gap: 8px;
          font-size: 0.80rem; color: #64748b; margin-bottom: 6px; line-height: 1.5;
        }
        .ur-tip-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #2563eb; flex-shrink: 0; margin-top: 5px;
        }

        @media (max-width: 640px) {
          .ur-body { padding: 1rem; }
          .ur-card-body { padding: 1.2rem; }
          .ur-page-title { font-size: 1.4rem; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="ur-root">
        {/* BODY */}
        <div className="ur-body">

          {/* Page header */}
          <div className="ur-page-header">
            <div className="ur-breadcrumb">
              <Link to="/dashboard">Dashboard</Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
              <Link to="/resources">Resources</Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
              <span>Upload</span>
            </div>
            <h1 className="ur-page-title">Upload a <span>Resource</span></h1>
            <p className="ur-page-sub">Share educational materials with the LearnBridge community</p>
          </div>

          {/* Main card */}
          <div className="ur-card">
            <div className="ur-card-header">
              <div className="ur-card-header-ico">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <p className="ur-card-header-title">Resource Details</p>
                <p className="ur-card-header-sub">Fill in the information below to share your resource</p>
              </div>
            </div>

            <div className="ur-card-body">
              <form onSubmit={handleSubmit}>

                {/* Title */}
                <div className="ur-field">
                  <label className="ur-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>
                    </svg>
                    Title <span className="req">*</span>
                  </label>
                  <input
                    type="text" name="title" className="ur-input" required
                    value={formData.title} onChange={handleChange}
                    placeholder="e.g. Introduction to Calculus – Chapter 1 Notes"
                  />
                </div>

                {/* Description */}
                <div className="ur-field">
                  <label className="ur-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                    Description <span className="req">*</span>
                  </label>
                  <textarea
                    name="description" className="ur-textarea" required rows={4}
                    value={formData.description} onChange={handleChange}
                    placeholder="Describe what this resource covers, who it's for, and any important details…"
                  />
                </div>

                {/* Category */}
                <div className="ur-field">
                  <label className="ur-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    Category
                  </label>
                  <div className="ur-cat-grid">
                    {Object.entries(categoryConfig).map(([val, cfg]) => {
                      const active = formData.category === val;
                      return (
                        <button
                          key={val} type="button"
                          className="ur-cat-btn"
                          onClick={() => setFormData({ ...formData, category: val })}
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

                {/* Tags */}
                <div className="ur-field">
                  <label className="ur-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                      <line x1="7" y1="7" x2="7.01" y2="7"/>
                    </svg>
                    Tags
                  </label>
                  <input
                    type="text" name="tags" className="ur-input"
                    value={formData.tags} onChange={handleChange}
                    placeholder="e.g. math, algebra, equations, year-2"
                  />
                  <p className="ur-hint">Separate multiple tags with commas to improve discoverability</p>
                </div>

                <div className="ur-divider" />

                {/* File drop zone */}
                <div className="ur-field">
                  <label className="ur-label">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    File <span className="req">*</span>
                  </label>

                  <div
                    className={`ur-dropzone${dragOver ? ' over' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="ur-drop-ico">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <p className="ur-drop-title">Drop your file here</p>
                    <p className="ur-drop-sub">or click to browse from your computer</p>
                    <button type="button" className="ur-drop-link" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Choose File
                    </button>
                    <p className="ur-drop-types">PDF · DOC · DOCX · PPT · PPTX · TXT · JPG · PNG · GIF — max 10 MB</p>
                    <input
                      ref={fileInputRef} type="file" className="ur-file-input"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                    />
                  </div>

                  {/* Selected file preview */}
                  {file && fileInfo && (
                    <div className="ur-file-selected">
                      <div className="ur-file-type-badge" style={{ background: fileInfo.bg, color: fileInfo.color }}>
                        {fileInfo.label}
                      </div>
                      <div className="ur-file-info">
                        <p className="ur-file-name">{file.name}</p>
                        <p className="ur-file-size">{formatSize(file.size)}</p>
                      </div>
                      <button
                        type="button" className="ur-file-remove"
                        onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        title="Remove file"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload progress */}
                {loading && uploadProgress > 0 && (
                  <div className="ur-field ur-progress-wrap">
                    <div className="ur-progress-header">
                      <span className="ur-progress-label">Uploading…</span>
                      <span className="ur-progress-pct">{uploadProgress}%</span>
                    </div>
                    <div className="ur-progress-track">
                      <div className="ur-progress-fill" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="ur-divider" />

                {/* Actions */}
                <div className="ur-actions">
                  <Link to="/dashboard" className="ur-btn-cancel">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    Cancel
                  </Link>
                  <button type="submit" className="ur-btn-submit" disabled={loading}>
                    {loading ? (
                      <><div className="ur-btn-spinner" /> Uploading…</>
                    ) : (
                      <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload Resource
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Tips card */}
          <div className="ur-tips">
            <div className="ur-tips-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Tips for a great submission
            </div>
            {[
              'Use a clear, descriptive title so others can find your resource easily.',
              'Add relevant tags to improve searchability across the platform.',
              'Keep file size under 10 MB — compress large PDFs before uploading.',
              'Pick the most accurate category so the right audience sees your resource.',
            ].map((tip, i) => (
              <div key={i} className="ur-tip-row">
                <span className="ur-tip-dot" />
                <span>{tip}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default UploadResource;