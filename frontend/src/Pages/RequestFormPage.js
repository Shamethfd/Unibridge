import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createRequest, joinRequest, getRequestsByModule, getModules } from '../services/api';
import './HomePage.css';

const TIME_SLOTS = [
  'Mon 8-10am', 'Mon 2-4pm', 'Tue 8-10am', 'Tue 2-4pm',
  'Wed 8-10am', 'Wed 2-4pm', 'Thu 8-10am', 'Thu 2-4pm',
  'Fri 8-10am', 'Fri 2-4pm', 'Weekend Morning', 'Weekend Afternoon',
];

const CATEGORIES = [
  'Lecture Discussion',
  'Mid Past Paper Discussion',
  'Final Past Paper Discussion',
  'Others',
];

const calcHeatScore = (students, urgency, slots) => {
  const u = urgency === 'Exam Priority' ? 30 : urgency === 'Urgent' ? 20 : 10;
  return (students * 10) + u + (slots.length > 0 ? 15 : 0);
};

const getDemand = (score) => {
  if (score >= 60) return { label: '🔥 High Demand', cls: 'high' };
  if (score >= 35) return { label: '⚡ Medium Demand', cls: 'medium' };
  return { label: '❄️ Low Demand', cls: 'low' };
};

const RequestFormPage = () => {
  const navigate = useNavigate();
  const { moduleId, moduleName } = useParams();
  const decoded = decodeURIComponent(moduleName);

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [existingReqs, setExistingReqs] = useState([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const heatScore = calcHeatScore(1, urgency, selectedSlots);
  const demand = getDemand(heatScore);

  useEffect(() => {
    fetchExistingRequests();
  }, [moduleId]);

  const fetchExistingRequests = async () => {
    try {
      const res = await getRequestsByModule(moduleId);
      setExistingReqs(res.data);
    } catch { }
  };

  const toggleSlot = (slot) => {
    setSelectedSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!category) newErrors.category = 'Please select a category.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    if (selectedSlots.length === 0) newErrors.slots = 'Please select at least one preferred time slot.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDescriptionBlur = () => {
    if (!description.trim()) {
      setErrors(prev => ({ ...prev, description: 'Description is required.' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    setDuplicateData(null);
    try {
      const payload = {
        moduleId,
        moduleName: decoded,
        category,
        description,
        urgency,
        preferredTime: selectedSlots,
      };
      const res = await createRequest(payload);
      if (res.data.duplicate) {
        setDuplicateData(res.data);
        toast.info('This request already exists! You can join it.');
      } else {
        toast.success(`✅ Request submitted! ${demand.label}`);
        // simulate accepted notification after 3s
        setTimeout(() => {
          toast.info('🔔 Your request has been received by admin!', { autoClose: 5000 });
        }, 3000);
        setTimeout(() => navigate('/faculties'), 2500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  const handleJoin = async () => {
    if (!duplicateData?.request?._id) return;
    try {
      await joinRequest(duplicateData.request._id);
      toast.success('✅ You joined the existing request!');
      setTimeout(() => navigate('/faculties'), 2000);
    } catch {
      toast.error('Failed to join request');
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/request/${moduleId}/${moduleName}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    toast.success('🔗 Invite link copied!');
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const existingByCategory = existingReqs.filter(r => r.category === category);

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="nav-brand"><span className="brand-icon">🎓</span><span className="brand-name">UniConnect</span></div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate('/faculties')}>Courses</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <div className="breadcrumb">
            <a href="/">Home</a><span>/</span>
            <a href="/faculties">Faculties</a><span>/</span>
            <span>Request</span>
          </div>
          <h1 className="page-title">📋 Study Request</h1>
        </div>

        <div className="request-form-card">
          {/* Module Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(19, 198, 214, 0.2), rgba(255,101,132,0.2))',
            border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Selected Module</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>📚 {decoded}</div>
            </div>
            <span className={`demand-badge ${demand.cls}`} style={{ fontSize: '0.9rem' }}>{demand.label}</span>
          </div>

          {/* Duplicate Alert */}
          {duplicateData && (
            <div className="duplicate-alert">
              <h4>⚠️ Request Already Exists!</h4>
              <p>{duplicateData.message}</p>
              <p style={{ marginBottom: '1rem' }}>
                Urgency: <strong>{duplicateData.request.urgency}</strong> &nbsp;|&nbsp;
                Heat Score: <strong>{duplicateData.request.heatScore}</strong>
              </p>
              <button className="btn-join" onClick={handleJoin}>👥 Join This Request</button>
            </div>
          )}

          {/* Existing requests for selected category */}
          {category && existingByCategory.length > 0 && !duplicateData && (
            <div style={{
              background: 'rgba(46,213,115,0.08)',
              border: '1px solid rgba(46,213,115,0.3)',
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
              color: 'var(--green)'
            }}>
              ℹ️ {existingByCategory.length} existing request(s) for this category — submitting will auto-check for duplicates.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Category *</label>
              <select value={category} onChange={e => { setCategory(e.target.value); setErrors(p => ({...p, category: ''})); }} required>
                <option value="">— Select category —</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px' }}>{errors.category}</p>}
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Description <span style={{ color: '#da1e28' }}>*</span></label>
              <textarea
                value={description}
                onChange={e => {
                  setDescription(e.target.value);
                  if (e.target.value.trim()) setErrors(prev => ({ ...prev, description: '' }));
                }}
                onBlur={handleDescriptionBlur}
                placeholder="Describe what topics you need help with..."
                rows={4}
                style={errors.description ? {
                  border: '1.5px solid #da1e28',
                  boxShadow: '0 0 0 3px rgba(218,30,40,0.12)',
                  outline: 'none'
                } : {}}
              />
              {errors.description && (
                <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '4px', marginBottom: 0 }}>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Urgency */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Urgency Level</label>
              <div className="urgency-options">
                {['Normal', 'Urgent', 'Exam Priority'].map(u => (
                  <button
                    type="button"
                    key={u}
                    className={`urgency-btn ${u === 'Urgent' ? 'urgent' : u === 'Exam Priority' ? 'exam' : ''} ${urgency === u ? 'selected' : ''}`}
                    onClick={() => setUrgency(u)}
                  >
                    {u === 'Normal' ? '🟢' : u === 'Urgent' ? '🟡' : '🔴'} {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Preferred Time Slots (select all applicable)</label>
              <div className="time-slots">
                {TIME_SLOTS.map(slot => (
                  <button
                    type="button"
                    key={slot}
                    className={`time-slot ${selectedSlots.includes(slot) ? 'selected' : ''}`}
                    onClick={() => { toggleSlot(slot); setErrors(p => ({...p, slots: ''})); }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {errors.slots && <p style={{ color: '#da1e28', fontSize: '0.82rem', marginTop: '6px' }}>{errors.slots}</p>}
            </div>

            {/* Heat Score Preview */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Request Heat Score (Preview)</label>
              <div className="heat-bar-wrap">
                <div className="heat-bar-bg">
                  <div className="heat-bar-fill" style={{ width: `${Math.min((heatScore / 100) * 100, 100)}%` }} />
                </div>
                <div className="heat-score-val">Score: {heatScore} / 100 &nbsp;— {demand.label}</div>
              </div>
            </div>

            {/* Invite Friends */}
            <div className="form-group" style={{ marginBottom: '1.8rem' }}>
              <label>👥 Invite Friends</label>
              <div className="invite-bar">
                <p>Share this link with classmates to boost demand for this session</p>
                <button type="button" className="btn-copy" onClick={handleCopyLink}>
                  {linkCopied ? '✅ Copied!' : '📋 Copy Link'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }} disabled={submitting}>
              {submitting ? '⏳ Submitting...' : '🚀 Submit Request'}
            </button>
          </form>

          {/* Smart Suggestions */}
          {suggestions.length > 0 && (
            <div className="suggestions-section">
              <h4>💡 Related Modules You Might Also Need:</h4>
              <div className="suggestion-chips">
                {suggestions.map(s => (
                  <span
                    key={s._id}
                    className="suggestion-chip"
                    onClick={() => navigate(`/request/${s._id}/${encodeURIComponent(s.name)}`)}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Existing Requests Panel */}
        {existingReqs.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>📊 Current Requests for This Module</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Urgency</th>
                    <th>Students</th>
                    <th>Heat Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {existingReqs.map(r => (
                    <tr key={r._id}>
                      <td>{r.category}</td>
                      <td>{r.urgency}</td>
                      <td>👥 {r.studentsCount}</td>
                      <td>🔥 {r.heatScore}</td>
                      <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestFormPage;
