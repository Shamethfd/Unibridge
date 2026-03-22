import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StructuredResources = () => {
  const [academicStructure, setAcademicStructure]   = useState({});
  const [expandedYears, setExpandedYears]           = useState(new Set());
  const [expandedSemesters, setExpandedSemesters]   = useState(new Set());
  const [expandedModules, setExpandedModules]       = useState(new Set());
  const [selectedModule, setSelectedModule]         = useState(null);
  const [moduleResources, setModuleResources]       = useState([]);
  const [loading, setLoading]                       = useState(true);
  const [currentFilters, setCurrentFilters]         = useState({ year: '', semester: '' });

  useEffect(() => { fetchAcademicStructure(); }, []);

  const fetchAcademicStructure = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/modules`);
      if (res.data.success) {
        const modules = res.data.data.modules || [];
        const structure = {};
        modules.forEach((m) => {
          const name = m?.name?.trim();
          if (!name || m?.year == null || m?.semester == null) return;
          const y = String(m.year), s = String(m.semester);
          if (!structure[y]) structure[y] = {};
          if (!structure[y][s]) structure[y][s] = new Set();
          structure[y][s].add(name);
        });
        Object.keys(structure).forEach(y =>
          Object.keys(structure[y]).forEach(s => {
            structure[y][s] = Array.from(structure[y][s]).sort();
          })
        );
        setAcademicStructure(structure);
      } else {
        toast.error('Failed to fetch modules'); setAcademicStructure({});
      }
    } catch (err) {
      toast.error('Failed to fetch academic structure'); setAcademicStructure({});
    } finally { setLoading(false); }
  };

  const fetchModuleResources = async (module, year, semester) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/management/module/${encodeURIComponent(module)}?year=${year}&semester=${semester}`
      );
      if (res.data.success) {
        setModuleResources(res.data.data.resources);
        setCurrentFilters({ year, semester });
      }
    } catch { toast.error('Failed to fetch module resources'); }
    finally { setLoading(false); }
  };

  const toggleYear = (year) => {
    const n = new Set(expandedYears);
    n.has(year) ? n.delete(year) : n.add(year);
    setExpandedYears(n);
  };

  const toggleSemester = (year, semester) => {
    const key = `${year}-${semester}`;
    const n = new Set(expandedSemesters);
    n.has(key) ? n.delete(key) : n.add(key);
    setExpandedSemesters(n);
  };

  const toggleModule = (module, year, semester) => {
    const n = new Set(expandedModules);
    if (n.has(module)) {
      n.delete(module); setSelectedModule(null); setModuleResources([]);
    } else {
      n.add(module); setSelectedModule(module);
      fetchModuleResources(module, year, semester);
    }
    setExpandedModules(n);
  };

  const handleDownload = async (resource) => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resources/${resource._id}/download`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', resource.fileName);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch { toast.error('Failed to download resource'); }
  };

  const yearLabels = { '1':'1st Year','2':'2nd Year','3':'3rd Year','4':'4th Year' };
  const semLabels  = { '1':'1st Semester','2':'2nd Semester' };
  const yearColors = {
    '1':{ color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', light:'#dbeafe' },
    '2':{ color:'#059669', bg:'#f0fdf4', border:'#a7f3d0', light:'#bbf7d0' },
    '3':{ color:'#d97706', bg:'#fffbeb', border:'#fde68a', light:'#fef3c7' },
    '4':{ color:'#7c3aed', bg:'#faf5ff', border:'#ddd6fe', light:'#ede9fe' },
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024, sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = (fileName || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return { label:'PDF', color:'#dc2626', bg:'#fef2f2' };
    if (['doc','docx'].includes(ext)) return { label:'DOC', color:'#2563eb', bg:'#eff6ff' };
    if (['ppt','pptx'].includes(ext)) return { label:'PPT', color:'#ea580c', bg:'#fff7ed' };
    if (['jpg','jpeg','png','gif'].includes(ext)) return { label:'IMG', color:'#7c3aed', bg:'#faf5ff' };
    return { label:'FILE', color:'#059669', bg:'#f0fdf4' };
  };

  if (loading && Object.keys(academicStructure).length === 0) {
    return (
      <div style={{ minHeight:'100vh', background:'#f0f4f8', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap'); @keyframes sr-spin{to{transform:rotate(360deg)}}`}</style>
        <ToastContainer position="top-right" />
        <div style={{ textAlign:'center' }}>
          <div style={{ width:44, height:44, border:'3px solid #e2e8f0', borderTopColor:'#2563eb', borderRadius:'50%', animation:'sr-spin 0.7s linear infinite', margin:'0 auto 14px' }} />
          <p style={{ color:'#64748b', fontFamily:"'DM Sans',sans-serif" }}>Loading academic resources…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sr-root { min-height: 100vh; background: #f0f4f8; font-family: 'DM Sans', sans-serif; }

        /* BODY */
        .sr-body { max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem; }

        /* PAGE HEADER */
        .sr-page-header { margin-bottom: 1.5rem; animation: sr-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .sr-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 0.80rem; color: #94a3b8; margin-bottom: 10px; flex-wrap: wrap; }
        .sr-breadcrumb a { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
        .sr-breadcrumb a:hover { color: #2563eb; }
        .sr-breadcrumb .active { color: #2563eb; font-weight: 600; }
        .sr-breadcrumb-sep { color: #cbd5e1; }
        .sr-page-title { font-family: 'Sora', sans-serif; font-size: 1.7rem; font-weight: 800; color: #0f1e35; }
        .sr-page-title span { color: #2563eb; }
        .sr-page-sub { font-size: 0.87rem; color: #94a3b8; margin-top: 4px; }

        /* STRUCTURE VIEW */
        .sr-year-card { background: white; border-radius: 18px; box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04); overflow: hidden; margin-bottom: 1rem; animation: sr-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }

        .sr-year-header { padding: 1.1rem 1.4rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: background 0.15s; user-select: none; }
        .sr-year-header:hover { background: #fafbfe; }
        .sr-year-left { display: flex; align-items: center; gap: 12px; }
        .sr-year-ico { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1.5px solid; flex-shrink: 0; }
        .sr-year-label { font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: #0f1e35; }
        .sr-year-count { font-size: 0.78rem; color: #94a3b8; margin-top: 1px; }
        .sr-chevron { transition: transform 0.25s; color: #94a3b8; flex-shrink: 0; }
        .sr-chevron.open { transform: rotate(90deg); }

        .sr-year-body { border-top: 1px solid #f1f5f9; padding: 1rem 1.4rem; display: flex; flex-direction: column; gap: 8px; }

        /* Semester row */
        .sr-sem-block { border: 1.5px solid #f1f5f9; border-radius: 14px; overflow: hidden; }
        .sr-sem-header { padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: #fafbfc; transition: background 0.15s; user-select: none; }
        .sr-sem-header:hover { background: #f1f5f9; }
        .sr-sem-left { display: flex; align-items: center; gap: 8px; }
        .sr-sem-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .sr-sem-label { font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 700; color: #334155; }
        .sr-sem-count { font-size: 0.76rem; color: #94a3b8; padding: 2px 8px; background: white; border-radius: 20px; border: 1px solid #e2e8f0; }

        .sr-sem-body { border-top: 1px solid #f1f5f9; padding: 8px; display: flex; flex-direction: column; gap: 4px; }

        /* Module pill */
        .sr-module-item { border-radius: 11px; overflow: hidden; }
        .sr-module-header { padding: 9px 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: background 0.15s; background: white; border: 1.5px solid #f1f5f9; border-radius: 11px; user-select: none; }
        .sr-module-header:hover { border-color: #bfdbfe; background: #eff6ff; }
        .sr-module-header.expanded { border-color: #2563eb; background: #eff6ff; border-radius: 11px 11px 0 0; border-bottom-color: transparent; }
        .sr-module-left { display: flex; align-items: center; gap: 8px; }
        .sr-module-ico-sm { width: 26px; height: 26px; border-radius: 8px; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .sr-module-name { font-family: 'Sora', sans-serif; font-size: 0.86rem; font-weight: 600; color: #0f1e35; }
        .sr-module-arrow { color: #94a3b8; transition: transform 0.2s; flex-shrink: 0; }
        .sr-module-arrow.open { transform: rotate(90deg); color: #2563eb; }

        /* Module resources panel */
        .sr-module-panel { background: #f8fafc; border: 1.5px solid #2563eb; border-top: none; border-radius: 0 0 11px 11px; overflow: hidden; }
        .sr-module-panel-inner { padding: 8px; display: flex; flex-direction: column; gap: 6px; }

        /* Resource card inside module */
        .sr-res-card { background: white; border-radius: 10px; padding: 12px 14px; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; transition: box-shadow 0.15s, border-color 0.15s; }
        .sr-res-card:hover { border-color: #bfdbfe; box-shadow: 0 2px 10px rgba(9,72,134,0.07); }
        .sr-res-badge { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-size: 0.58rem; font-weight: 800; flex-shrink: 0; }
        .sr-res-body { flex: 1; min-width: 0; }
        .sr-res-title { font-family: 'Sora', sans-serif; font-size: 0.86rem; font-weight: 700; color: #0f1e35; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sr-res-desc { font-size: 0.76rem; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sr-res-meta { display: flex; gap: 6px; margin-top: 5px; flex-wrap: wrap; }
        .sr-res-chip { display: flex; align-items: center; gap: 3px; font-size: 0.72rem; color: #94a3b8; background: #f8fafc; padding: 2px 7px; border-radius: 6px; border: 1px solid #f1f5f9; }
        .sr-res-dl-btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 10px; border: none; background: linear-gradient(135deg, #094886, #2563eb); color: white; font-family: 'Sora', sans-serif; font-size: 0.78rem; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(37,99,235,0.25); flex-shrink: 0; transition: transform 0.15s, box-shadow 0.15s; }
        .sr-res-dl-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.35); }

        /* FULL MODULE RESOURCES VIEW */
        .sr-module-view { background: white; border-radius: 18px; box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04); overflow: hidden; animation: sr-up 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both; }
        .sr-module-view-header { padding: 1.2rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
        .sr-module-view-title { font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: #0f1e35; display: flex; align-items: center; gap: 10px; }
        .sr-count-badge { padding: 3px 10px; border-radius: 20px; background: #eff6ff; color: #2563eb; font-size: 0.76rem; font-weight: 600; font-family: 'Sora', sans-serif; border: 1px solid #bfdbfe; }
        .sr-back-btn { display: flex; align-items: center; gap: 5px; font-size: 0.82rem; font-weight: 600; color: #2563eb; background: none; border: none; cursor: pointer; font-family: 'Sora', sans-serif; transition: color 0.15s; }
        .sr-back-btn:hover { color: #094886; }

        /* Empty */
        .sr-empty { padding: 4rem 2rem; text-align: center; }
        .sr-empty-ico { width: 60px; height: 60px; background: linear-gradient(135deg, #eff6ff, #dbeafe); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .sr-empty h4 { font-family: 'Sora', sans-serif; font-size: 1rem; font-weight: 700; color: #334155; margin-bottom: 6px; }
        .sr-empty p { font-size: 0.84rem; color: #94a3b8; margin-bottom: 18px; }
        .sr-empty-cta { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 12px; background: linear-gradient(135deg, #094886, #2563eb); color: white; text-decoration: none; font-family: 'Sora', sans-serif; font-size: 0.85rem; font-weight: 600; box-shadow: 0 3px 10px rgba(37,99,235,0.28); transition: transform 0.15s; }
        .sr-empty-cta:hover { transform: translateY(-1px); }

        /* Loading inline */
        .sr-loading-inline { padding: 2rem; text-align: center; }
        .sr-spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: sr-spin 0.7s linear infinite; margin: 0 auto 10px; }
        .sr-loading-inline p { font-size: 0.84rem; color: #94a3b8; }

        @keyframes sr-spin { to { transform: rotate(360deg); } }
        @keyframes sr-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 640px) { .sr-body { padding: 1rem; } .sr-page-title { font-size: 1.4rem; } }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="sr-root">
        <div className="sr-body">

          {/* Page header */}
          <div className="sr-page-header">
            {selectedModule && (
              <div className="sr-breadcrumb">
                <Link to="/resources">Resources</Link>
                <span className="sr-breadcrumb-sep">›</span>
                <span>{yearLabels[currentFilters.year] || `Year ${currentFilters.year}`}</span>
                <span className="sr-breadcrumb-sep">›</span>
                <span>{semLabels[currentFilters.semester] || `Semester ${currentFilters.semester}`}</span>
                <span className="sr-breadcrumb-sep">›</span>
                <span className="active">{selectedModule}</span>
              </div>
            )}
            <h1 className="sr-page-title">
              {selectedModule ? <><span>{selectedModule}</span> Resources</> : <>Academic <span>Resources</span></>}
            </h1>
            <p className="sr-page-sub">
              {selectedModule
                ? `Browse and download resources for this module`
                : 'Explore resources organized by year, semester, and module'}
            </p>
          </div>

          {/* MODULE RESOURCES VIEW */}
          {selectedModule ? (
            <div className="sr-module-view">
              <div className="sr-module-view-header">
                <div className="sr-module-view-title">
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#094886,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  </div>
                  {selectedModule}
                  <span className="sr-count-badge">{moduleResources.length} resource{moduleResources.length !== 1 ? 's' : ''}</span>
                </div>
                <button className="sr-back-btn" onClick={() => { setSelectedModule(null); setModuleResources([]); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
                  Back to Structure
                </button>
              </div>

              {loading ? (
                <div className="sr-loading-inline"><div className="sr-spinner" /><p>Loading resources…</p></div>
              ) : moduleResources.length === 0 ? (
                <div className="sr-empty">
                  <div className="sr-empty-ico">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </div>
                  <h4>No resources found</h4>
                  <p>No approved resources for this module yet.</p>
                  <Link to="/submit-resource" className="sr-empty-cta">Submit the first resource</Link>
                </div>
              ) : (
                <div style={{ padding: '1rem' }}>
                  {moduleResources.map(resource => {
                    const fi = getFileIcon(resource.fileName);
                    const uploaderName = [resource.uploadedBy?.profile?.firstName, resource.uploadedBy?.profile?.lastName].filter(Boolean).join(' ') || '—';
                    return (
                      <div key={resource._id} className="sr-res-card" style={{ marginBottom: 8 }}>
                        <div className="sr-res-badge" style={{ background: fi.bg, color: fi.color }}>{fi.label}</div>
                        <div className="sr-res-body">
                          <p className="sr-res-title">{resource.title}</p>
                          {resource.description && <p className="sr-res-desc">{resource.description}</p>}
                          <div className="sr-res-meta">
                            <span className="sr-res-chip">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              {uploaderName}
                            </span>
                            <span className="sr-res-chip">{formatFileSize(resource.fileSize)}</span>
                            <span className="sr-res-chip">{new Date(resource.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</span>
                          </div>
                        </div>
                        <button className="sr-res-dl-btn" onClick={() => handleDownload(resource)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Download
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ACADEMIC STRUCTURE VIEW */
            Object.keys(academicStructure).length === 0 ? (
              <div style={{ background:'white', borderRadius:18, padding:'4rem 2rem', textAlign:'center', boxShadow:'0 2px 8px rgba(9,72,134,0.06)', animation:'sr-up 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>
                <div className="sr-empty-ico">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                </div>
                <h4 style={{ fontFamily:"'Sora',sans-serif", fontSize:'1rem', fontWeight:700, color:'#334155', marginBottom:6 }}>No Resources Available</h4>
                <p style={{ fontSize:'0.84rem', color:'#94a3b8', marginBottom:18 }}>There are no approved resources yet. Submit your first resource to get started!</p>
                <Link to="/submit-resource" className="sr-empty-cta">Submit Resource</Link>
              </div>
            ) : (
              Object.keys(academicStructure)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((year, yi) => {
                  const yc = yearColors[year] || yearColors['1'];
                  const totalModules = Object.values(academicStructure[year] || {}).flat().length;
                  return (
                    <div key={year} className="sr-year-card" style={{ animationDelay: `${yi * 0.05}s` }}>

                      {/* Year header */}
                      <div className="sr-year-header" onClick={() => toggleYear(year)}>
                        <div className="sr-year-left">
                          <div className="sr-year-ico" style={{ background: yc.bg, borderColor: yc.border, color: yc.color }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                          </div>
                          <div>
                            <p className="sr-year-label">{yearLabels[year] || `Year ${year}`}</p>
                            <p className="sr-year-count">{totalModules} module{totalModules !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <svg className={`sr-chevron${expandedYears.has(year) ? ' open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9,18 15,12 9,6"/>
                        </svg>
                      </div>

                      {/* Semesters */}
                      {expandedYears.has(year) && (
                        <div className="sr-year-body">
                          {[1, 2].map(sem => {
                            const semKey = `${year}-${sem}`;
                            const semModules = academicStructure[year]?.[String(sem)] || [];
                            if (semModules.length === 0) return null;
                            return (
                              <div key={semKey} className="sr-sem-block">
                                <div className="sr-sem-header" onClick={() => toggleSemester(year, sem)}>
                                  <div className="sr-sem-left">
                                    <div className="sr-sem-dot" style={{ background: yc.color, boxShadow: `0 0 5px ${yc.color}` }} />
                                    <span className="sr-sem-label">{semLabels[String(sem)] || `Semester ${sem}`}</span>
                                    <span className="sr-sem-count">{semModules.length} module{semModules.length !== 1 ? 's' : ''}</span>
                                  </div>
                                  <svg className={`sr-chevron${expandedSemesters.has(semKey) ? ' open' : ''}`} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9,18 15,12 9,6"/>
                                  </svg>
                                </div>

                                {/* Modules */}
                                {expandedSemesters.has(semKey) && (
                                  <div className="sr-sem-body">
                                    {semModules.map(mod => (
                                      <div key={mod} className="sr-module-item">
                                        <div
                                          className={`sr-module-header${expandedModules.has(mod) ? ' expanded' : ''}`}
                                          onClick={() => toggleModule(mod, year, String(sem))}
                                        >
                                          <div className="sr-module-left">
                                            <div className="sr-module-ico-sm">
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                            </div>
                                            <span className="sr-module-name">{mod}</span>
                                          </div>
                                          <svg className={`sr-module-arrow${expandedModules.has(mod) ? ' open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="9,18 15,12 9,6"/>
                                          </svg>
                                        </div>

                                        {/* Inline resources */}
                                        {expandedModules.has(mod) && (
                                          <div className="sr-module-panel">
                                            {loading && selectedModule === mod ? (
                                              <div className="sr-loading-inline"><div className="sr-spinner" /><p>Loading…</p></div>
                                            ) : moduleResources.length === 0 ? (
                                              <div style={{ padding:'1rem', textAlign:'center', fontSize:'0.82rem', color:'#94a3b8' }}>No resources found for this module.</div>
                                            ) : (
                                              <div className="sr-module-panel-inner">
                                                {moduleResources.map(resource => {
                                                  const fi = getFileIcon(resource.fileName);
                                                  return (
                                                    <div key={resource._id} className="sr-res-card">
                                                      <div className="sr-res-badge" style={{ background: fi.bg, color: fi.color }}>{fi.label}</div>
                                                      <div className="sr-res-body">
                                                        <p className="sr-res-title">{resource.title}</p>
                                                        <div className="sr-res-meta">
                                                          <span className="sr-res-chip">{formatFileSize(resource.fileSize)}</span>
                                                          <span className="sr-res-chip">{new Date(resource.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                                                        </div>
                                                      </div>
                                                      <button className="sr-res-dl-btn" onClick={() => handleDownload(resource)}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                        Download
                                                      </button>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
            )
          )}
        </div>
      </div>
    </>
  );
};

export default StructuredResources;