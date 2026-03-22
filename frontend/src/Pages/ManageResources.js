import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/* ── Config ── */
const categoryConfig = {
  lecture:    { label: 'Lecture',    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  assignment: { label: 'Assignment', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  tutorial:   { label: 'Tutorial',   color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
  reference:  { label: 'Reference',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  other:      { label: 'Other',      color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
};

const statusConfig = {
  approved: { label: 'Approved', color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb', border: '#fde68a' }
};

const groupResourcesByYearSemester = (items = []) => {
  const grouped = items.reduce((acc, resource) => {
    const year = resource.year || 'Unknown';
    const semester = resource.semester || 'Unknown';
    const key = `y-${year}-s-${semester}`;

    if (!acc[key]) {
      acc[key] = {
        key,
        year,
        semester,
        resources: []
      };
    }

    acc[key].resources.push(resource);
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => {
    const aYear = Number.isNaN(Number(a.year)) ? -1 : Number(a.year);
    const bYear = Number.isNaN(Number(b.year)) ? -1 : Number(b.year);

    if (bYear !== aYear) {
      return bYear - aYear;
    }

    const aSemester = Number.isNaN(Number(a.semester)) ? -1 : Number(a.semester);
    const bSemester = Number.isNaN(Number(b.semester)) ? -1 : Number(b.semester);
    return bSemester - aSemester;
  });
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getInitials = (u) => {
  const f = u?.profile?.firstName?.[0] || '';
  const l = u?.profile?.lastName?.[0]  || '';
  return (f + l).toUpperCase() || (u?.username?.[0] || '?').toUpperCase();
};

const getMimeType = (ext) => ({
  pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', gif: 'image/gif', txt: 'text/plain',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
}[ext] || 'application/octet-stream');

/* ── Preview Modal ── */
const PreviewModal = ({ resource, previewUrl, onClose }) => {
  const ext = (resource?.fileName || '').split('.').pop().toLowerCase();
  const isImage = ['jpg','jpeg','png','gif'].includes(ext);
  const isPdf   = ext === 'pdf';

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={e => e.stopPropagation()}>
        <div className="pm-header">
          <div className="pm-header-left">
            <div className="pm-header-ico">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div>
              <p className="pm-title">File Preview</p>
              <p className="pm-subtitle">{resource?.fileName}</p>
            </div>
          </div>
          <button className="pm-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="pm-body">
          {isPdf ? (
            <iframe src={previewUrl} className="pm-iframe" title="PDF Preview" />
          ) : isImage ? (
            <img src={previewUrl} alt="Preview" className="pm-img" />
          ) : (
            <div className="pm-fallback">
              <div className="pm-fallback-ico">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
              </div>
              <p className="pm-fallback-ext">.{ext.toUpperCase()}</p>
              <p className="pm-fallback-text">Preview not available for this file type</p>
              <button className="pm-dl-btn" onClick={() => {
                const link = document.createElement('a');
                link.href = previewUrl; link.download = resource.fileName;
                document.body.appendChild(link); link.click(); document.body.removeChild(link);
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download to View
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Resource Item ── */
const ResourceItem = ({ resource, mode, onApprove, onReject, onUpdate, onDelete }) => {
  const [category, setCategory] = useState(resource.category || 'other');
  const [reviewNotes, setReviewNotes] = useState(resource.reviewNotes || '');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [title, setTitle] = useState(resource.title || '');
  const [description, setDescription] = useState(resource.description || '');
  const [tags, setTags] = useState(Array.isArray(resource.tags) ? resource.tags.join(', ') : '');

  const uploaderName = [resource.uploadedBy?.profile?.firstName, resource.uploadedBy?.profile?.lastName]
    .filter(Boolean).join(' ') || resource.uploadedBy?.username || 'Unknown';

  const handleApprove = async () => {
    setLoading(true);
    await onApprove(resource._id, category, reviewNotes);
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    await onReject(resource._id, reviewNotes);
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    await onUpdate(resource._id, {
      title: title.trim(),
      description: description.trim(),
      category,
      tags
    });
    setLoading(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Delete this completed resource? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    setLoading(true);
    await onDelete(resource._id);
    setLoading(false);
  };

  const handlePreview = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resources/${resource._id}/preview`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );
      const ext  = resource.fileName.split('.').pop().toLowerCase();
      const blob = new Blob([res.data], { type: getMimeType(ext) });
      const objectUrl = URL.createObjectURL(blob);

      if (ext === 'pdf') {
        const previewWindow = window.open(objectUrl, '_blank', 'noopener,noreferrer');
        if (!previewWindow) {
          URL.revokeObjectURL(objectUrl);
          toast.error('Popup blocked. Please allow popups to view full-screen PDF preview.');
          return;
        }

        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        return;
      }

      setPreviewUrl(objectUrl);
      setShowPreview(true);
    } catch { toast.error('Failed to preview file'); }
  };

  const catCfg = categoryConfig[resource.category] || categoryConfig.other;
  const selCfg = categoryConfig[category]           || categoryConfig.other;
  const statusCfg = statusConfig[resource.status] || statusConfig.pending;

  return (
    <>
      <div className="ri-row">
        <div className="ri-avatar">{getInitials(resource.uploadedBy)}</div>
        <div className="ri-body">
          <div className="ri-title-row">
            <span className="ri-title">{resource.title}</span>
            <span className="ri-cat-tag" style={{ background: catCfg.bg, color: catCfg.color, borderColor: catCfg.border }}>
              {catCfg.label}
            </span>
            <span className="ri-status-tag" style={{ background: statusCfg.bg, color: statusCfg.color, borderColor: statusCfg.border }}>
              {statusCfg.label}
            </span>
          </div>

          {resource.description && <p className="ri-desc">{resource.description}</p>}

          <div className="ri-meta">
            <div className="ri-chip">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              {uploaderName}
            </div>
            {resource.year     && <div className="ri-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> Year {resource.year}</div>}
            {resource.semester && <div className="ri-chip">Sem {resource.semester}</div>}
            {resource.module   && <div className="ri-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>{resource.module}</div>}
            <div className="ri-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>{formatFileSize(resource.fileSize)}</div>
            <div className="ri-chip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{new Date(resource.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}</div>
          </div>

          <button className="ri-toggle" onClick={() => setExpanded(!expanded)}>
            {expanded
              ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Close Panel</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> {mode === 'pending' ? 'Open Review Panel' : 'Open Edit Panel'}</>
            }
          </button>

          {expanded && (
            <div className="ri-panel">
              {mode === 'pending' ? (
                <>
                  <div className="ri-panel-field">
                    <label className="ri-panel-label">Set Category</label>
                    <select className="ri-select" value={category} onChange={e => setCategory(e.target.value)}
                      style={{ borderColor: selCfg.border, color: selCfg.color }}>
                      {Object.entries(categoryConfig).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  </div>

                  <div className="ri-panel-notes">
                    <label className="ri-panel-label">Review Notes <span style={{ color:'#dc2626' }}>*</span> for rejection</label>
                    <input className="ri-notes-input" type="text" value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)} placeholder="Add feedback or rejection reason…" />
                  </div>

                  <div className="ri-panel-actions">
                    <button className="ri-btn-preview" onClick={handlePreview}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Preview
                    </button>
                    <button className="ri-btn-approve" onClick={handleApprove} disabled={loading}>
                      {loading ? <span className="ri-spin-g" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>}
                      Approve
                    </button>
                    <button className="ri-btn-reject" onClick={handleReject} disabled={loading}>
                      {loading ? <span className="ri-spin-r" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                      Reject
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="ri-panel-field ri-panel-wide">
                    <label className="ri-panel-label">Title</label>
                    <input className="ri-notes-input" type="text" value={title}
                      onChange={e => setTitle(e.target.value)} placeholder="Resource title" />
                  </div>

                  <div className="ri-panel-field">
                    <label className="ri-panel-label">Category</label>
                    <select className="ri-select" value={category} onChange={e => setCategory(e.target.value)}
                      style={{ borderColor: selCfg.border, color: selCfg.color }}>
                      {Object.entries(categoryConfig).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                  </div>

                  <div className="ri-panel-notes">
                    <label className="ri-panel-label">Description</label>
                    <textarea className="ri-notes-input ri-notes-area" value={description}
                      onChange={e => setDescription(e.target.value)} placeholder="Resource description" />
                  </div>

                  <div className="ri-panel-field ri-panel-wide">
                    <label className="ri-panel-label">Tags (comma separated)</label>
                    <input className="ri-notes-input" type="text" value={tags}
                      onChange={e => setTags(e.target.value)} placeholder="exam, lecture, notes" />
                  </div>

                  <div className="ri-panel-actions">
                    <button className="ri-btn-preview" onClick={handlePreview}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      Preview
                    </button>
                    <button className="ri-btn-approve" onClick={handleUpdate} disabled={loading}>
                      {loading ? <span className="ri-spin-g" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/></svg>}
                      Update
                    </button>
                    <button className="ri-btn-delete" onClick={handleDelete} disabled={loading}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19,6l-1,14a2,2 0 0,1-2,2H8a2,2 0 0,1-2-2L5,6"/><path d="M10,11v6"/><path d="M14,11v6"/><path d="M9,6V4a1,1 0 0,1 1-1h4a1,1 0 0,1 1,1V6"/></svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <PreviewModal resource={resource} previewUrl={previewUrl} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
};

/* ── Main Component ── */
const ManageResources = () => {
  const [resources, setResources] = useState([]);
  const [approvedResources, setApprovedResources] = useState([]);
  const [rejectedResources, setRejectedResources] = useState([]);
  const [stats, setStats] = useState({ pending:0, approved:0, rejected:0, total:0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('completed');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [sectionFilters, setSectionFilters] = useState({ approved: '', rejected: '' });

  useEffect(() => {
    fetchResources();
    fetchStats();
  }, [currentPage, viewMode]);

  const fetchResources = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

      if (viewMode === 'pending') {
        const res = await axios.get(
          `${baseUrl}/api/management/pending?page=${currentPage}&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setResources(res.data.data.resources);
          setTotalPages(res.data.data.pagination.pages);
        }

        setApprovedResources([]);
        setRejectedResources([]);
      } else {
        const [approvedRes, rejectedRes] = await Promise.all([
          axios.get(
            `${baseUrl}/api/management/completed?status=approved&page=1&limit=200`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `${baseUrl}/api/management/completed?status=rejected&page=1&limit=200`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        ]);

        if (approvedRes.data.success) {
          setApprovedResources(approvedRes.data.data.resources);
        }

        if (rejectedRes.data.success) {
          setRejectedResources(rejectedRes.data.data.resources);
        }

        setResources([]);
        setTotalPages(1);
      }

    } catch {
      toast.error(`Failed to fetch ${viewMode} resources`);
    }

    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/management/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setStats(res.data.data);
    } catch {}
  };

  const handleApprove = async (id, category, reviewNotes) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/management/${id}/approve`,
        { category, reviewNotes }, { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) { toast.success('Resource approved!'); fetchResources(); fetchStats(); }
    } catch { toast.error('Failed to approve resource'); }
  };

  const handleReject = async (id, reviewNotes) => {
    if (!reviewNotes.trim()) { toast.error('Please provide a rejection reason'); return; }
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/management/${id}/reject`,
        { reviewNotes }, { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) { toast.success('Resource rejected'); fetchResources(); fetchStats(); }
    } catch { toast.error('Failed to reject resource'); }
  };

  const handleUpdateResource = async (id, payload) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/management/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('Resource updated successfully');
        fetchResources();
      }
    } catch {
      toast.error('Failed to update resource');
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/management/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('Resource deleted successfully');
        fetchResources();
        fetchStats();
      }
    } catch {
      toast.error('Failed to delete resource');
    }
  };

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: prev[groupKey] === false
    }));
  };

  const handleSectionFilterChange = (statusMode, value) => {
    setSectionFilters((prev) => ({
      ...prev,
      [statusMode]: value
    }));
  };

  const renderGroupedSection = (sectionTitle, sectionColor, sectionResources, statusMode) => {
    const searchValue = (sectionFilters[statusMode] || '').trim().toLowerCase();
    const filteredResources = !searchValue
      ? sectionResources
      : sectionResources.filter((resource) => {
          const title = (resource.title || '').toLowerCase();
          const module = (resource.module || '').toLowerCase();
          return title.includes(searchValue) || module.includes(searchValue);
        });

    const grouped = groupResourcesByYearSemester(filteredResources);

    return (
      <div className="mr-group-wrap">
        <div className="mr-group-head">
          <div className="mr-group-title" style={{ color: sectionColor }}>
            {sectionTitle} ({filteredResources.length}/{sectionResources.length})
          </div>
          <input
            className="mr-group-search"
            type="text"
            value={sectionFilters[statusMode] || ''}
            onChange={(e) => handleSectionFilterChange(statusMode, e.target.value)}
            placeholder="Filter by module or title"
          />
        </div>

        {grouped.length === 0 ? (
          <div className="mr-sub-empty">
            {searchValue ? 'No resources match this filter.' : 'No resources in this section.'}
          </div>
        ) : (
          grouped.map((group) => {
            const groupKey = `${statusMode}-${group.key}`;
            const isExpanded = expandedGroups[groupKey] !== false;

            return (
              <div key={groupKey} className="mr-year-group">
                <button className="mr-year-head" onClick={() => toggleGroup(groupKey)}>
                  <span>{`Year ${group.year} • Semester ${group.semester}`}</span>
                  <span className="mr-year-head-right">
                    {group.resources.length}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
                    >
                      <polyline points="6,9 12,15 18,9"/>
                    </svg>
                  </span>
                </button>

                {isExpanded && group.resources.map(resource => (
                  <ResourceItem
                    key={resource._id}
                    resource={resource}
                    mode="completed"
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onUpdate={handleUpdateResource}
                    onDelete={handleDeleteResource}
                  />
                ))}
              </div>
            );
          })
        )}
      </div>
    );
  };

  const statCards = [
    { label:'Pending Review',  value:stats.pending,  color:'#d97706', bg:'#fffbeb', border:'#fde68a', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg> },
    { label:'Approved',        value:stats.approved, color:'#059669', bg:'#f0fdf4', border:'#a7f3d0', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg> },
    { label:'Rejected',        value:stats.rejected, color:'#dc2626', bg:'#fef2f2', border:'#fecaca', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
    { label:'Total Resources', value:stats.total,    color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .mr-root { min-height: 100vh; background: #f0f4f8; font-family: 'DM Sans', sans-serif; }

        /* BODY */
        .mr-body { max-width: 1280px; margin: 0 auto; padding: 2rem 1.5rem; }

        .mr-page-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 1.5rem; animation: mr-up 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .mr-page-title { font-family: 'Sora', sans-serif; font-size: 1.7rem; font-weight: 800; color: #0f1e35; }
        .mr-page-title span { color: #2563eb; }
        .mr-page-sub { font-size: 0.87rem; color: #94a3b8; margin-top: 4px; }
        .mr-pending-badge { display: inline-flex; align-items: center; gap: 7px; padding: 6px 14px; border-radius: 20px; background: #fffbeb; border: 1.5px solid #fde68a; font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600; color: #d97706; }
        .mr-pending-dot { width: 6px; height: 6px; border-radius: 50%; background: #d97706; box-shadow: 0 0 5px #d97706; animation: mr-blink 1.8s ease-in-out infinite; }
        @keyframes mr-blink { 0%,100%{opacity:1}50%{opacity:0.3} }

        .mr-mode-switch { display: inline-flex; align-items: center; gap: 6px; background: #e2e8f0; border-radius: 12px; padding: 4px; margin-top: 12px; }
        .mr-mode-btn { border: none; background: transparent; color: #475569; padding: 7px 12px; border-radius: 9px; font-family: 'Sora', sans-serif; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.15s; }
        .mr-mode-btn:hover { color: #1e293b; }
        .mr-mode-btn.active { background: white; color: #2563eb; box-shadow: 0 1px 4px rgba(9,72,134,0.12); }

        .mr-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem; animation: mr-up 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both; }
        .mr-stat-card { background: white; border-radius: 16px; padding: 1.2rem 1.4rem; display: flex; align-items: center; gap: 14px; box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04); transition: transform 0.15s, box-shadow 0.15s; }
        .mr-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(9,72,134,0.10); }
        .mr-stat-ico { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1.5px solid; }
        .mr-stat-num { font-family: 'Sora', sans-serif; font-size: 1.6rem; font-weight: 800; line-height: 1; }
        .mr-stat-label { font-size: 0.78rem; color: #94a3b8; font-weight: 500; margin-top: 2px; }

        .mr-list { background: white; border-radius: 18px; box-shadow: 0 2px 8px rgba(9,72,134,0.06), 0 0 0 1px rgba(9,72,134,0.04); overflow: hidden; animation: mr-up 0.4s 0.10s cubic-bezier(0.16,1,0.3,1) both; }
        .mr-list-header { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 10px; }
        .mr-list-title { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f1e35; }

        .mr-loading { padding: 4rem; text-align: center; }
        .mr-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: mr-spin 0.7s linear infinite; margin: 0 auto 12px; }
        .mr-loading p { font-size: 0.87rem; color: #94a3b8; }

        .mr-empty { padding: 4rem 2rem; text-align: center; }
        .mr-empty-ico { width: 56px; height: 56px; background: #f0fdf4; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .mr-empty h4 { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #334155; margin-bottom: 4px; }
        .mr-empty p { font-size: 0.84rem; color: #94a3b8; }

        .mr-group-wrap { padding: 1rem 1.2rem 0.8rem; }
        .mr-group-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 0.7rem; }
        .mr-group-title { font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 700; margin-bottom: 0.7rem; }
        .mr-group-search { width: 260px; max-width: 100%; padding: 8px 11px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.82rem; color: #334155; background: white; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .mr-group-search:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.10); }
        .mr-sub-empty { border: 1px dashed #cbd5e1; border-radius: 12px; padding: 0.9rem 1rem; font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.8rem; }
        .mr-year-group { border: 1px solid #e2e8f0; border-radius: 13px; margin-bottom: 0.75rem; overflow: hidden; background: #f8fafc; }
        .mr-year-head { width: 100%; border: none; border-bottom: 1px solid #e2e8f0; background: #f1f5f9; padding: 0.72rem 0.95rem; display: flex; align-items: center; justify-content: space-between; font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 700; color: #334155; cursor: pointer; }
        .mr-year-head-right { display: inline-flex; align-items: center; gap: 7px; color: #64748b; }

        .mr-pagination { padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
        .mr-page-info { font-size: 0.82rem; color: #94a3b8; }
        .mr-page-info span { font-weight: 600; color: #475569; }
        .mr-page-btns { display: flex; gap: 6px; }
        .mr-page-btn { display: flex; align-items: center; gap: 5px; padding: 7px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; font-family: 'Sora', sans-serif; font-size: 0.82rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s; }
        .mr-page-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; background: #eff6ff; }
        .mr-page-btn:disabled { opacity: 0.40; cursor: not-allowed; }

        /* RESOURCE ITEM */
        .ri-row { display: flex; gap: 1rem; align-items: flex-start; padding: 1.3rem 1.5rem; border-bottom: 1px solid #f8fafc; transition: background 0.15s; }
        .ri-row:last-child { border-bottom: none; }
        .ri-row:hover { background: #fafbfe; }
        .ri-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; font-family: 'Sora', sans-serif; font-size: 0.80rem; font-weight: 700; color: white; box-shadow: 0 2px 8px rgba(37,99,235,0.20); flex-shrink: 0; margin-top: 2px; }
        .ri-body { flex: 1; min-width: 0; }
        .ri-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 5px; }
        .ri-title { font-family: 'Sora', sans-serif; font-size: 0.97rem; font-weight: 700; color: #0f1e35; }
        .ri-cat-tag { padding: 2px 9px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; font-family: 'Sora', sans-serif; border: 1px solid; flex-shrink: 0; }
        .ri-status-tag { padding: 2px 9px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; font-family: 'Sora', sans-serif; border: 1px solid; flex-shrink: 0; }
        .ri-desc { font-size: 0.84rem; color: #64748b; line-height: 1.55; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .ri-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        .ri-chip { display: flex; align-items: center; gap: 4px; background: #f8fafc; border: 1px solid #f1f5f9; padding: 3px 8px; border-radius: 8px; font-size: 0.76rem; color: #64748b; }
        .ri-toggle { display: inline-flex; align-items: center; gap: 5px; font-size: 0.80rem; font-weight: 600; color: #2563eb; background: none; border: none; cursor: pointer; padding: 0; font-family: 'Sora', sans-serif; transition: color 0.15s; }
        .ri-toggle:hover { color: #094886; }
        .ri-panel { margin-top: 12px; padding: 14px 16px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
        .ri-panel-field { display: flex; flex-direction: column; gap: 5px; }
        .ri-panel-wide { min-width: min(100%, 420px); flex: 1; }
        .ri-panel-label { font-size: 0.78rem; font-weight: 600; color: #475569; font-family: 'Sora', sans-serif; }
        .ri-select { padding: 8px 32px 8px 12px; border-radius: 10px; border: 1.5px solid; background: white; font-size: 0.84rem; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; transition: box-shadow 0.2s; }
        .ri-select:focus { box-shadow: 0 0 0 3px rgba(37,99,235,0.10); }
        .ri-panel-notes { flex: 1; min-width: 200px; display: flex; flex-direction: column; gap: 5px; }
        .ri-notes-input { width: 100%; padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.84rem; font-family: 'DM Sans', sans-serif; color: #1e293b; background: white; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .ri-notes-area { min-height: 80px; resize: vertical; }
        .ri-notes-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.10); }
        .ri-notes-input::placeholder { color: #cbd5e1; }
        .ri-panel-actions { display: flex; gap: 8px; flex-shrink: 0; align-items: flex-end; }
        .ri-btn-preview { display: flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 11px; border: 1.5px solid #bfdbfe; background: #eff6ff; color: #2563eb; font-family: 'Sora', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.15s; }
        .ri-btn-preview:hover { background: #dbeafe; transform: translateY(-1px); }
        .ri-btn-approve { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 11px; border: none; background: linear-gradient(135deg, #047857, #059669); color: white; font-family: 'Sora', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; box-shadow: 0 3px 10px rgba(5,150,105,0.28); transition: transform 0.15s, box-shadow 0.15s, opacity 0.2s; }
        .ri-btn-approve:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(5,150,105,0.35); }
        .ri-btn-approve:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .ri-btn-reject { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 11px; border: 1.5px solid #fecaca; background: #fef2f2; color: #dc2626; font-family: 'Sora', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.15s, opacity 0.2s; }
        .ri-btn-reject:hover:not(:disabled) { background: #fee2e2; transform: translateY(-1px); }
        .ri-btn-reject:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .ri-btn-delete { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 11px; border: 1.5px solid #fecaca; background: #dc2626; color: white; font-family: 'Sora', sans-serif; font-size: 0.84rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.15s, opacity 0.2s; }
        .ri-btn-delete:hover:not(:disabled) { background: #b91c1c; transform: translateY(-1px); }
        .ri-btn-delete:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .ri-spin-g { width: 13px; height: 13px; border: 2px solid rgba(255,255,255,0.30); border-top-color: white; border-radius: 50%; animation: mr-spin 0.65s linear infinite; display: inline-block; }
        .ri-spin-r { width: 13px; height: 13px; border: 2px solid rgba(220,38,38,0.20); border-top-color: #dc2626; border-radius: 50%; animation: mr-spin 0.65s linear infinite; display: inline-block; }

        /* PREVIEW MODAL */
        .pm-overlay { position: fixed; inset: 0; background: rgba(15,30,53,0.70); backdrop-filter: blur(6px); z-index: 200; display: flex; align-items: stretch; justify-content: stretch; padding: 0; animation: mr-fade 0.2s ease; }
        @keyframes mr-fade { from{opacity:0} to{opacity:1} }
        .pm-modal { background: white; border-radius: 0; width: 100vw; max-width: none; height: 100vh; display: flex; flex-direction: column; box-shadow: none; animation: pm-in 0.3s cubic-bezier(0.16,1,0.3,1) both; overflow: hidden; }
        @keyframes pm-in { from{opacity:0;transform:scale(0.93) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .pm-header { padding: 1rem 1.4rem; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .pm-header-left { display: flex; align-items: center; gap: 12px; }
        .pm-header-ico { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, #094886, #2563eb); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pm-title { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 700; color: #0f1e35; }
        .pm-subtitle { font-size: 0.76rem; color: #94a3b8; margin-top: 1px; max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pm-close { width: 34px; height: 34px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: background 0.15s, color 0.15s; }
        .pm-close:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        .pm-body { flex: 1; padding: 0.75rem 1rem 1rem; overflow: hidden; display: flex; flex-direction: column; }
        .pm-iframe { width: 100%; height: 100%; border: none; border-radius: 0; }
        .pm-img { width: 100%; height: 100%; object-fit: contain; border-radius: 0; }
        .pm-fallback { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 10px; }
        .pm-fallback-ico { width: 64px; height: 64px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .pm-fallback-ext { font-family: 'Sora', sans-serif; font-size: 2rem; font-weight: 800; color: #cbd5e1; }
        .pm-fallback-text { font-size: 0.87rem; color: #94a3b8; }
        .pm-dl-btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 22px; border-radius: 12px; border: none; background: linear-gradient(135deg, #094886, #2563eb); color: white; font-family: 'Sora', sans-serif; font-size: 0.88rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(37,99,235,0.28); transition: transform 0.15s, box-shadow 0.15s; margin-top: 6px; }
        .pm-dl-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.36); }

        @keyframes mr-spin { to { transform: rotate(360deg); } }
        @keyframes mr-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 1024px) { .mr-stats { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px) { .mr-stats { grid-template-columns: 1fr 1fr; } .mr-body { padding: 1rem; } .ri-panel { flex-direction: column; } .mr-group-head { flex-direction: column; align-items: stretch; } .mr-group-title { margin-bottom: 0; } .mr-group-search { width: 100%; } }
      `}</style>

      <ToastContainer position="top-right" toastStyle={{ fontFamily: "'DM Sans', sans-serif" }} />

      <div className="mr-root">
        <div className="mr-body">
          <div className="mr-page-header">
            <div>
              <h1 className="mr-page-title">Manage <span>Resources</span></h1>
              <p className="mr-page-sub">
                {viewMode === 'pending'
                  ? 'Review, approve, or reject submitted learning materials'
                  : 'View all completed resources and update or remove them'}
              </p>
              <div className="mr-mode-switch">
                <button
                  className={`mr-mode-btn ${viewMode === 'completed' ? 'active' : ''}`}
                  onClick={() => {
                    setViewMode('completed');
                    setCurrentPage(1);
                  }}
                >
                  Completed
                </button>
                <button
                  className={`mr-mode-btn ${viewMode === 'pending' ? 'active' : ''}`}
                  onClick={() => {
                    setViewMode('pending');
                    setCurrentPage(1);
                  }}
                >
                  Pending Review
                </button>
              </div>
            </div>
            {stats.pending > 0 && (
              <div className="mr-pending-badge">
                <span className="mr-pending-dot" />
                {stats.pending} awaiting review
              </div>
            )}
          </div>

          <div className="mr-stats">
            {statCards.map((s, i) => (
              <div key={i} className="mr-stat-card">
                <div className="mr-stat-ico" style={{ background:s.bg, borderColor:s.border, color:s.color }}>{s.icon}</div>
                <div>
                  <p className="mr-stat-num" style={{ color:s.color }}>{s.value}</p>
                  <p className="mr-stat-label">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mr-list">
            <div className="mr-list-header">
              {viewMode === 'pending' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
              )}
              <span className="mr-list-title">
                {viewMode === 'pending'
                  ? `Pending Resources (${resources.length})`
                  : `Completed Resources (${approvedResources.length + rejectedResources.length})`}
              </span>
            </div>

            {loading ? (
              <div className="mr-loading"><div className="mr-spinner" /><p>{`Loading ${viewMode} resources…`}</p></div>
            ) : (viewMode === 'pending' && resources.length === 0) || (viewMode === 'completed' && approvedResources.length + rejectedResources.length === 0) ? (
              <div className="mr-empty">
                <div className="mr-empty-ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'pending' ? '#d97706' : '#059669'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg></div>
                <h4>{viewMode === 'pending' ? 'All caught up!' : 'No completed resources found'}</h4>
                <p>{viewMode === 'pending' ? 'No pending resources to review right now.' : 'Approved or rejected resources will appear here.'}</p>
              </div>
            ) : (
              <>
                {viewMode === 'pending' ? (
                  resources.map(resource => (
                    <ResourceItem
                      key={resource._id}
                      resource={resource}
                      mode={viewMode}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onUpdate={handleUpdateResource}
                      onDelete={handleDeleteResource}
                    />
                  ))
                ) : (
                  <>
                    {renderGroupedSection('Completed (Approved)', '#059669', approvedResources, 'approved')}
                    {renderGroupedSection('Rejected Resources', '#dc2626', rejectedResources, 'rejected')}
                  </>
                )}
                {viewMode === 'pending' && totalPages > 1 && (
                  <div className="mr-pagination">
                    <p className="mr-page-info">Page <span>{currentPage}</span> of <span>{totalPages}</span></p>
                    <div className="mr-page-btns">
                      <button className="mr-page-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>
                        Previous
                      </button>
                      <button className="mr-page-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
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
    </>
  );
};

export default ManageResources;