import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ─────────────────────────────────────────
   STEP CONFIG
───────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Academic Context', short: 'Context' },
  { id: 2, label: 'Resource Info',    short: 'Info'    },
  { id: 3, label: 'File Upload',      short: 'Upload'  },
];

const categoryConfig = {
  lecture:    { label: 'Lecture',    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  assignment: { label: 'Assignment', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  tutorial:   { label: 'Tutorial',   color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
  reference:  { label: 'Reference',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  other:      { label: 'Other',      color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
};

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
const SubmitResource = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors]           = useState({});
  const [touched, setTouched]         = useState({});

  const [formData, setFormData] = useState({
    title: '', description: '', category: 'other',
    tags: '', year: '', semester: '', module: '',
  });
  const [file, setFile]                       = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [uploadProgress, setUploadProgress]   = useState(0);
  const [availableModules, setAvailableModules] = useState([]);
  const [loadingModules, setLoadingModules]   = useState(false);
  const [dragOver, setDragOver]               = useState(false);
  const fileInputRef = useRef(null);
  const navigate     = useNavigate();

  /* fetch modules when year/semester change */
  useEffect(() => {
    if (!formData.year || !formData.semester) { setAvailableModules([]); return; }
    (async () => {
      try {
        setLoadingModules(true);
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/modules?year=${formData.year}&semester=${formData.semester}`
        );
        if (res.data.success) setAvailableModules(res.data.data.modules || []);
      } catch { toast.error('Failed to fetch modules'); }
      finally  { setLoadingModules(false); }
    })();
  }, [formData.year, formData.semester]);

  /* ── field-level validation rules ── */
  const validate = (data, f) => {
    const e = {};
    if (!data.title.trim())       e.title    = 'Title is required';
    else if (data.title.length < 5) e.title  = 'Title must be at least 5 characters';
    if (!data.year)               e.year     = 'Please select a year';
    if (!data.semester)           e.semester = 'Please select a semester';
    if (!data.module)             e.module   = 'Please select a module';
    if (!data.description.trim()) e.description = 'Description is required';
    else if (data.description.length < 20) e.description = 'Description must be at least 20 characters';
    if (!f)                       e.file     = 'Please select a file to upload';
    return e;
  };

  /* step-scoped field names */
  const stepFields = {
    1: ['title', 'year', 'semester', 'module'],
    2: ['description'],
    3: ['file'],
  };

  const validateStep = (step) => {
    const all = validate(formData, file);
    const relevant = {};
    stepFields[step].forEach(k => { if (all[k]) relevant[k] = all[k]; });
    return relevant;
  };

  /* mark all fields in current step as touched */
  const touchAll = (step) => {
    const t = { ...touched };
    stepFields[step].forEach(k => t[k] = true);
    setTouched(t);
  };

  /* handle input */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (touched[name]) {
      const all = validate(next, file);
      setErrors(prev => ({ ...prev, [name]: all[name] }));
    }
    if (name === 'year' || name === 'semester') setFormData(f => ({ ...next, module: '' }));
  };

  const handleBlur = (name) => {
    setTouched(t => ({ ...t, [name]: true }));
    const all = validate(formData, file);
    setErrors(prev => ({ ...prev, [name]: all[name] }));
  };

  /* navigation */
  const goNext = () => {
    touchAll(currentStep);
    const stepErrors = validateStep(currentStep);
    setErrors(prev => ({ ...prev, ...stepErrors }));
    if (Object.keys(stepErrors).length === 0) setCurrentStep(s => s + 1);
    else toast.error('Please fix the errors before continuing');
  };

  const goPrev = () => setCurrentStep(s => s - 1);

  /* file helpers */
  const validateFile = (f) => {
    if (!f) return false;
    if (f.size > 10 * 1024 * 1024) { toast.error('File size must be less than 10MB'); return false; }
    const ok = [
      'application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain','image/jpeg','image/png','image/gif',
    ];
    if (!ok.includes(f.type)) { toast.error('Invalid file type.'); return false; }
    return true;
  };

  const pickFile = (f) => {
    if (validateFile(f)) {
      setFile(f);
      setErrors(prev => ({ ...prev, file: undefined }));
    } else setFile(null);
  };

  const handleFileChange = (e) => { pickFile(e.target.files[0]); };
  const handleDrop       = (e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0]); };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    touchAll(3);
    const all = validate(formData, file);
    setErrors(all);
    if (Object.keys(all).length) { toast.error('Please fix all errors'); return; }

    setLoading(true); setUploadProgress(0);
    try {
      const token = localStorage.getItem('token');
      const fd    = new FormData();
      fd.append('file', file);
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/management/submit`, fd,
        { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
          onUploadProgress: (ev) => setUploadProgress(Math.round((ev.loaded * 100) / ev.total)) }
      );
      if (res.data.success) {
        toast.success('Resource submitted for review!');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit resource');
      setUploadProgress(0);
    } finally { setLoading(false); }
  };

  /* utils */
  const fmt  = (b) => { if (!b) return ''; const mb = b/1024/1024; return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(b/1024).toFixed(1)} KB`; };
  const fIco = (f) => {
    if (!f) return null;
    const x = f.name.split('.').pop().toLowerCase();
    if (x === 'pdf')                  return { label:'PDF', color:'#dc2626', bg:'#fef2f2' };
    if (['doc','docx'].includes(x))   return { label:'DOC', color:'#2563eb', bg:'#eff6ff' };
    if (['ppt','pptx'].includes(x))   return { label:'PPT', color:'#ea580c', bg:'#fff7ed' };
    if (['jpg','jpeg','png','gif'].includes(x)) return { label:'IMG', color:'#7c3aed', bg:'#faf5ff' };
    return { label:'TXT', color:'#059669', bg:'#f0fdf4' };
  };

  const fi = fIco(file);
  const completedSteps = currentStep - 1; // steps before current are done

  /* ── RENDER ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sr-root  { min-height: 100vh; background: #f0f4f8; font-family: 'DM Sans', sans-serif; }

        .sr-body { max-width: 780px; margin: 0 auto; padding: 2rem 1.5rem; }

        /* Page header */
        .sr-page-header   { margin-bottom: 1.5rem; animation: sr-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .sr-breadcrumb    { display: flex; align-items: center; gap: 6px; font-size: 0.80rem; color: #94a3b8; margin-bottom: 10px; }
        .sr-breadcrumb a  { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
        .sr-breadcrumb a:hover { color: #2563eb; }
        .sr-breadcrumb span { color: #334155; font-weight: 500; }
        .sr-page-title    { font-family: 'Sora', sans-serif; font-size: 1.7rem; font-weight: 800; color: #0f1e35; }
        .sr-page-title span { color: #2563eb; }
        .sr-page-sub      { font-size: 0.87rem; color: #94a3b8; margin-top: 4px; }

        /* ── STEPPER ── */
        .sr-stepper        { display: flex; align-items: center; margin-bottom: 1.6rem; animation: sr-up 0.4s 0.04s cubic-bezier(0.16,1,0.3,1) both; }
        .sr-step-item      { display: flex; align-items: center; flex: 1; }
        .sr-step-item:last-child { flex: none; }
        .sr-step-dot-wrap  { display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .sr-step-dot       { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 700; transition: all 0.3s; flex-shrink: 0; }
        .sr-step-dot.done  { background: #2563eb; color: white; box-shadow: 0 2px 8px rgba(37,99,235,0.35); }
        .sr-step-dot.active{ background: linear-gradient(135deg,#094886,#2563eb); color: white; box-shadow: 0 3px 12px rgba(37,99,235,0.40); transform: scale(1.08); }
        .sr-step-dot.idle  { background: #f1f5f9; color: #94a3b8; border: 2px solid #e2e8f0; }
        .sr-step-label     { font-family: 'Sora', sans-serif; font-size: 0.72rem; font-weight: 600; white-space: nowrap; margin-top: 2px; }
        .sr-step-label.active { color: #2563eb; }
        .sr-step-label.done   { color: #059669; }
        .sr-step-label.idle   { color: #94a3b8; }
        .sr-step-line      { flex: 1; height: 2px; margin: 0 6px; margin-bottom: 18px; border-radius: 999px; transition: background 0.4s; }
        .sr-step-line.done { background: #2563eb; }
        .sr-step-line.idle { background: #e2e8f0; }

        /* Card */
        .sr-card          { background: white; border-radius: 20px; box-shadow: 0 2px 8px rgba(9,72,134,0.07), 0 0 0 1px rgba(9,72,134,0.04); overflow: hidden; animation: sr-up 0.4s 0.08s cubic-bezier(0.16,1,0.3,1) both; }
        .sr-card-header   { padding: 1.3rem 1.8rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
        .sr-card-hico     { width: 38px; height: 38px; border-radius: 11px; background: linear-gradient(135deg,#094886,#2563eb); display: flex; align-items: center; justify-content: center; }
        .sr-card-htitle   { font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: #0f1e35; }
        .sr-card-hsub     { font-size: 0.80rem; color: #94a3b8; margin-top: 1px; }
        .sr-card-body     { padding: 1.8rem; }

        /* Progress bar (top of card) */
        .sr-step-progress  { height: 4px; background: #f1f5f9; }
        .sr-step-progress-fill { height: 100%; background: linear-gradient(90deg,#094886,#2563eb); border-radius: 0 999px 999px 0; transition: width 0.5s cubic-bezier(0.16,1,0.3,1); }

        /* Section label */
        .sr-sec { font-family: 'Sora', sans-serif; font-size: 0.74rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.9px; display: flex; align-items: center; gap: 8px; margin: 0 0 0.9rem; }
        .sr-sec::after { content: ''; flex: 1; height: 1px; background: #f1f5f9; }

        /* Fields */
        .sr-field  { margin-bottom: 1.1rem; }
        .sr-field label { display: block; font-size: 0.82rem; font-weight: 500; color: #374151; margin-bottom: 5px; }
        .sr-req    { color: #2563eb; }
        .sr-grid3  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .sr-wrap   { position: relative; }
        .sr-ico    { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; display: flex; pointer-events: none; }

        /* Inputs */
        .sr-input, .sr-select, .sr-textarea {
          width: 100%; padding: 10px 12px 10px 38px;
          border: 1.5px solid #e2e8f0; border-radius: 12px;
          font-size: 0.88rem; font-family: 'DM Sans', sans-serif;
          color: #1e293b; background: #f8fafc; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .sr-input:focus, .sr-select:focus, .sr-textarea:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.10); }
        .sr-input.err, .sr-select.err, .sr-textarea.err { border-color: #f87171; background: #fff5f5; }
        .sr-input.err:focus, .sr-select.err:focus, .sr-textarea.err:focus { border-color: #ef4444; box-shadow: 0 0 0 4px rgba(239,68,68,0.10); }
        .sr-textarea { padding: 10px 12px; resize: none; line-height: 1.6; }
        .sr-select   { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; }

        /* Error message */
        .sr-err-msg { display: flex; align-items: center; gap: 5px; font-size: 0.74rem; color: #dc2626; margin-top: 5px; animation: sr-shake 0.35s cubic-bezier(0.36,0.07,0.19,0.97); }
        @keyframes sr-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)} 60%{transform:translateX(4px)} 80%{transform:translateX(-2px)} }

        .sr-hint { font-size: 0.76rem; color: #94a3b8; margin-top: 5px; }

        /* Char counter */
        .sr-counter { font-size: 0.73rem; color: #94a3b8; text-align: right; margin-top: 4px; }
        .sr-counter.warn { color: #f97316; }
        .sr-counter.ok   { color: #059669; }

        /* Category pills */
        .sr-cat-grid { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 5px; }
        .sr-cat-btn  { padding: 6px 14px; border-radius: 20px; border: 1.5px solid; font-family: 'Sora', sans-serif; font-size: 0.80rem; font-weight: 600; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 5px; background: transparent; }

        /* Divider */
        .sr-divider { height: 1px; background: #f1f5f9; margin: 1.4rem 0; }

        /* Drop zone */
        .sr-dropzone { border: 2px dashed #e2e8f0; border-radius: 16px; padding: 2rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.2s; background: #fafbfc; }
        .sr-dropzone:hover, .sr-dropzone.over { border-color: #2563eb; background: #eff6ff; transform: scale(1.005); }
        .sr-dropzone.dz-err { border-color: #f87171; background: #fff5f5; }
        .sr-drop-ico   { width: 50px; height: 50px; border-radius: 15px; background: linear-gradient(135deg,#094886,#2563eb); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .sr-drop-title { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f1e35; margin-bottom: 4px; }
        .sr-drop-sub   { font-size: 0.82rem; color: #94a3b8; margin-bottom: 10px; }
        .sr-drop-btn   { display: inline-flex; align-items: center; gap: 5px; padding: 7px 16px; border-radius: 10px; background: #eff6ff; color: #2563eb; border: none; font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: background 0.15s; }
        .sr-drop-btn:hover { background: #dbeafe; }
        .sr-drop-types { margin-top: 10px; font-size: 0.73rem; color: #cbd5e1; }
        .sr-file-input { display: none; }

        /* File selected */
        .sr-file-selected { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: #f0fdf4; border: 1.5px solid #a7f3d0; margin-top: 10px; animation: sr-up 0.3s cubic-bezier(0.16,1,0.3,1); }
        .sr-file-badge    { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-size: 0.62rem; font-weight: 800; flex-shrink: 0; }
        .sr-file-name     { font-family: 'Sora', sans-serif; font-size: 0.87rem; font-weight: 600; color: #0f1e35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sr-file-size     { font-size: 0.76rem; color: #64748b; margin-top: 1px; }
        .sr-file-remove   { width: 28px; height: 28px; border-radius: 8px; background: #fee2e2; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #dc2626; flex-shrink: 0; transition: background 0.15s; margin-left: auto; }
        .sr-file-remove:hover { background: #fecaca; }

        /* Review summary (step 3 sidebar) */
        .sr-review-box  { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 14px 16px; margin-bottom: 1.2rem; }
        .sr-review-title { font-family: 'Sora', sans-serif; font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 10px; }
        .sr-review-row   { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; font-size: 0.82rem; margin-bottom: 6px; }
        .sr-review-key   { color: #94a3b8; font-weight: 500; flex-shrink: 0; }
        .sr-review-val   { color: #0f1e35; font-weight: 600; text-align: right; }
        .sr-review-cat   { display: inline-flex; align-items: center; padding: 2px 10px; border-radius: 20px; border: 1.5px solid; font-family: 'Sora', sans-serif; font-size: 0.75rem; font-weight: 700; }

        /* Progress */
        .sr-prog-header  { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .sr-prog-label   { font-size: 0.80rem; font-weight: 600; color: #475569; font-family: 'Sora', sans-serif; }
        .sr-prog-pct     { font-size: 0.80rem; font-weight: 700; color: #2563eb; font-family: 'Sora', sans-serif; }
        .sr-prog-track   { height: 8px; background: #e2e8f0; border-radius: 999px; overflow: hidden; }
        .sr-prog-fill    { height: 100%; border-radius: 999px; background: linear-gradient(90deg,#094886,#2563eb); transition: width 0.3s; position: relative; overflow: hidden; }
        .sr-prog-fill::after { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent); animation: sr-shimmer 1.2s infinite; }
        @keyframes sr-shimmer { to { left: 100%; } }

        /* Actions */
        .sr-actions     { display: flex; justify-content: space-between; align-items: center; margin-top: 1.4rem; }
        .sr-btn-back    { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; font-family: 'Sora', sans-serif; font-size: 0.87rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; text-decoration: none; }
        .sr-btn-back:hover { border-color: #cbd5e1; background: #f8fafc; }
        .sr-btn-next    { display: flex; align-items: center; gap: 7px; padding: 10px 22px; border-radius: 12px; border: none; background: linear-gradient(135deg,#094886,#2563eb); color: white; font-family: 'Sora', sans-serif; font-size: 0.87rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,0.30); transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s; }
        .sr-btn-next:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.38); }
        .sr-btn-next:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .sr-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.30); border-top-color: white; border-radius: 50%; animation: sr-spin 0.65s linear infinite; display: inline-block; }

        /* Step panel slide */
        .sr-step-panel { animation: sr-up 0.35s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes sr-spin { to { transform: rotate(360deg); } }
        @keyframes sr-up   { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 640px) {
          .sr-body { padding: 1rem; }
          .sr-card-body { padding: 1.2rem; }
          .sr-grid3 { grid-template-columns: 1fr; }
          .sr-page-title { font-size: 1.4rem; }
          .sr-step-label { display: none; }
        }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="sr-root">
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
            <p className="sr-page-sub">Share your materials — approved resources go live for all students</p>
          </div>

          {/* ── STEPPER ── */}
          <div className="sr-stepper">
            {STEPS.map((step, i) => {
              const status = currentStep > step.id ? 'done' : currentStep === step.id ? 'active' : 'idle';
              return (
                <React.Fragment key={step.id}>
                  <div className="sr-step-item">
                    <div className="sr-step-dot-wrap">
                      <div className={`sr-step-dot ${status}`}>
                        {status === 'done'
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                          : step.id}
                      </div>
                      <span className={`sr-step-label ${status}`}>{step.short}</span>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`sr-step-line ${currentStep > step.id ? 'done' : 'idle'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── CARD ── */}
          <div className="sr-card">

            {/* Progress bar */}
            <div className="sr-step-progress">
              <div className="sr-step-progress-fill" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />
            </div>

            {/* Card header */}
            <div className="sr-card-header">
              <div className="sr-card-hico">
                {currentStep === 1 && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
                {currentStep === 2 && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
                {currentStep === 3 && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
              </div>
              <div>
                <p className="sr-card-htitle">{STEPS[currentStep - 1].label}</p>
                <p className="sr-card-hsub">Step {currentStep} of {STEPS.length}</p>
              </div>
            </div>

            <div className="sr-card-body">
              <form onSubmit={handleSubmit} noValidate>

                {/* ══════════════════════════════
                    STEP 1 — Academic Context
                ══════════════════════════════ */}
                {currentStep === 1 && (
                  <div className="sr-step-panel" key="step1">
                    <div className="sr-sec">Academic Context</div>

                    {/* Title */}
                    <div className="sr-field">
                      <label>Title <span className="sr-req">*</span></label>
                      <div className="sr-wrap">
                        <span className="sr-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg></span>
                        <input className={`sr-input${touched.title && errors.title ? ' err' : ''}`}
                          type="text" name="title" value={formData.title} maxLength={120}
                          onChange={handleChange} onBlur={() => handleBlur('title')}
                          placeholder="e.g. Data Structures – Week 3 Lecture Notes" />
                      </div>
                      {touched.title && errors.title
                        ? <p className="sr-err-msg"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.title}</p>
                        : <p className={`sr-counter${formData.title.length > 100 ? ' warn' : formData.title.length >= 5 ? ' ok' : ''}`}>{formData.title.length}/120</p>}
                    </div>

                    <div className="sr-grid3">
                      {/* Year */}
                      <div className="sr-field">
                        <label>Year <span className="sr-req">*</span></label>
                        <div className="sr-wrap">
                          <span className="sr-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></span>
                          <select className={`sr-select${touched.year && errors.year ? ' err' : ''}`}
                            name="year" value={formData.year}
                            onChange={handleChange} onBlur={() => handleBlur('year')}>
                            <option value="">Select</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                          </select>
                        </div>
                        {touched.year && errors.year && <p className="sr-err-msg"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.year}</p>}
                      </div>

                      {/* Semester */}
                      <div className="sr-field">
                        <label>Semester <span className="sr-req">*</span></label>
                        <div className="sr-wrap">
                          <span className="sr-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                          <select className={`sr-select${touched.semester && errors.semester ? ' err' : ''}`}
                            name="semester" value={formData.semester}
                            onChange={handleChange} onBlur={() => handleBlur('semester')}>
                            <option value="">Select</option>
                            <option value="1">1st Semester</option>
                            <option value="2">2nd Semester</option>
                          </select>
                        </div>
                        {touched.semester && errors.semester && <p className="sr-err-msg"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.semester}</p>}
                      </div>

                      {/* Module */}
                      <div className="sr-field">
                        <label>Module <span className="sr-req">*</span></label>
                        <div className="sr-wrap">
                          <span className="sr-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
                          <select className={`sr-select${touched.module && errors.module ? ' err' : ''}`}
                            name="module" value={formData.module}
                            onChange={handleChange} onBlur={() => handleBlur('module')}
                            disabled={!formData.year || !formData.semester || loadingModules}>
                            <option value="">
                              {!formData.year || !formData.semester ? 'Select year & semester first'
                                : loadingModules ? 'Loading…'
                                : availableModules.length === 0 ? 'No modules found'
                                : 'Select module'}
                            </option>
                            {availableModules.map(m => <option key={m._id} value={m.name}>{m.name}</option>)}
                          </select>
                        </div>
                        {loadingModules && (
                          <p style={{ fontSize:'0.73rem', color:'#2563eb', marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
                            <span style={{ width:10, height:10, border:'2px solid #bfdbfe', borderTopColor:'#2563eb', borderRadius:'50%', display:'inline-block', animation:'sr-spin 0.65s linear infinite' }} />
                            Fetching modules…
                          </p>
                        )}
                        {touched.module && errors.module && <p className="sr-err-msg"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.module}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════
                    STEP 2 — Resource Info
                ══════════════════════════════ */}
                {currentStep === 2 && (
                  <div className="sr-step-panel" key="step2">
                    <div className="sr-sec">Resource Details</div>

                    {/* Description */}
                    <div className="sr-field">
                      <label>Description <span className="sr-req">*</span></label>
                      <textarea
                        className={`sr-textarea${touched.description && errors.description ? ' err' : ''}`}
                        name="description" rows={5} maxLength={1000}
                        value={formData.description}
                        onChange={handleChange} onBlur={() => handleBlur('description')}
                        placeholder="Describe what this resource covers, who it's for, and any key details…" />
                      {touched.description && errors.description
                        ? <p className="sr-err-msg"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.description}</p>
                        : <p className={`sr-counter${formData.description.length > 900 ? ' warn' : formData.description.length >= 20 ? ' ok' : ''}`}>{formData.description.length}/1000</p>}
                    </div>

                    <div className="sr-divider" />

                    {/* Category */}
                    <div className="sr-field">
                      <label>Category</label>
                      <div className="sr-cat-grid">
                        {Object.entries(categoryConfig).map(([val, cfg]) => {
                          const active = formData.category === val;
                          return (
                            <button key={val} type="button" className="sr-cat-btn"
                              onClick={() => setFormData(f => ({ ...f, category: val }))}
                              style={{ background: active ? cfg.bg : 'transparent', color: active ? cfg.color : '#64748b', borderColor: active ? cfg.border : '#e2e8f0' }}>
                              {active && <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.color, display:'inline-block' }} />}
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="sr-field">
                      <label>Tags <span style={{ color:'#94a3b8', fontWeight:400 }}>(optional)</span></label>
                      <div className="sr-wrap">
                        <span className="sr-ico"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>
                        <input className="sr-input" type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g. algorithms, sorting, CS101" />
                      </div>
                      <p className="sr-hint">Separate multiple tags with commas to improve discoverability</p>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════
                    STEP 3 — File Upload
                ══════════════════════════════ */}
                {currentStep === 3 && (
                  <div className="sr-step-panel" key="step3">

                    {/* Quick review */}
                    <div className="sr-review-box">
                      <div className="sr-review-title">Summary</div>
                      <div className="sr-review-row"><span className="sr-review-key">Title</span><span className="sr-review-val">{formData.title}</span></div>
                      <div className="sr-review-row"><span className="sr-review-key">Year / Sem</span><span className="sr-review-val">Year {formData.year}, Sem {formData.semester}</span></div>
                      <div className="sr-review-row"><span className="sr-review-key">Module</span><span className="sr-review-val">{formData.module}</span></div>
                      <div className="sr-review-row">
                        <span className="sr-review-key">Category</span>
                        <span className="sr-review-cat" style={{ color: categoryConfig[formData.category].color, background: categoryConfig[formData.category].bg, borderColor: categoryConfig[formData.category].border }}>
                          {categoryConfig[formData.category].label}
                        </span>
                      </div>
                    </div>

                    <div className="sr-sec">File Upload</div>

                    <div
                      className={`sr-dropzone${dragOver ? ' over' : ''}${touched.file && errors.file && !file ? ' dz-err' : ''}`}
                      onDrop={handleDrop}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onClick={() => fileInputRef.current?.click()}>
                      <div className="sr-drop-ico">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                      <p className="sr-drop-title">Drop your file here</p>
                      <p className="sr-drop-sub">or click to browse from your computer</p>
                      <button type="button" className="sr-drop-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Choose File
                      </button>
                      <p className="sr-drop-types">PDF · DOC · DOCX · PPT · PPTX · TXT · JPG · PNG · GIF — max 10 MB</p>
                      <input ref={fileInputRef} type="file" className="sr-file-input" onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif" />
                    </div>

                    {touched.file && errors.file && !file && (
                      <p className="sr-err-msg" style={{ marginTop:8 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{errors.file}</p>
                    )}

                    {file && fi && (
                      <div className="sr-file-selected">
                        <div className="sr-file-badge" style={{ background:fi.bg, color:fi.color }}>{fi.label}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p className="sr-file-name">{file.name}</p>
                          <p className="sr-file-size">{fmt(file.size)}</p>
                        </div>
                        <button type="button" className="sr-file-remove" onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    )}

                    {loading && uploadProgress > 0 && (
                      <div style={{ marginTop:14 }}>
                        <div className="sr-prog-header">
                          <span className="sr-prog-label">Uploading…</span>
                          <span className="sr-prog-pct">{uploadProgress}%</span>
                        </div>
                        <div className="sr-prog-track"><div className="sr-prog-fill" style={{ width:`${uploadProgress}%` }} /></div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── ACTIONS ── */}
                <div style={{ height:1, background:'#f1f5f9', margin:'1.4rem 0' }} />
                <div className="sr-actions">
                  {/* Left side */}
                  {currentStep === 1
                    ? <Link to="/dashboard" className="sr-btn-back">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Cancel
                      </Link>
                    : <button type="button" className="sr-btn-back" onClick={goPrev}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
                        Back
                      </button>}

                  {/* Right side */}
                  {currentStep < STEPS.length
                    ? <button type="button" className="sr-btn-next" onClick={goNext}>
                        Continue
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>
                      </button>
                    : <button type="submit" className="sr-btn-next" disabled={loading}>
                        {loading
                          ? <><span className="sr-spinner" /> Submitting…</>
                          : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Submit for Review</>}
                      </button>}
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