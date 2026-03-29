import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllRequests, createMessage, getAllMessages } from '../services/api';
import './HomePage.css'; // Reusing dashboard styles

const TutorManagement = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);

  // Form state
  const [selectedReqId, setSelectedReqId] = useState('');
  const [university, setUniversity] = useState('UniBridge');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, msgRes] = await Promise.all([
        getAllRequests(),
        getAllMessages()
      ]);
      setRequests(reqRes.data);
      setMessages(msgRes.data);
    } catch (err) {
      toast.error('Failed to fetch data');
    }
  };

  const handleSendNote = async (e) => {
    e.preventDefault();
    if (!selectedReqId) {
      toast.warning('Please select a request');
      return;
    }
    if (!noteText.trim()) {
      toast.warning('Please write a note');
      return;
    }

    const req = requests.find((r) => r._id === selectedReqId);
    if (!req) return;

    try {
      await createMessage({
        moduleName: req.moduleName,
        category: req.category,
        university: university,
        studentsCount: req.studentsCount,
        preferredTime: req.preferredTime,
        message: noteText,
        source: 'Tutor',
      });
      toast.success('Note sent to dashboard!');
      setNoteText('');
      setSelectedReqId('');
      fetchData(); // refresh messages
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send note');
    }
  };

  // Only show messages sent FROM Dashboard
  const dashboardMessages = messages.filter((m) => m.source === 'Dashboard');

  return (
    <div className="page-shell">
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-name">LearnBridge</span>
        </div>
        <div className="nav-links">
          <button className="nav-btn" onClick={() => navigate('/')}>Courses</button>
          <button className="nav-btn" onClick={() => navigate('/codeigniter-dashboard')}>Admin</button>
        </div>
      </nav>

      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">👨‍🏫 Tutor Management</h1>
          <p className="page-subtitle">Send notes regarding student requests to the Dashboard administrator.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Send Note Form */}
          <div className="admin-form" style={{ marginBottom: 0 }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📤 Send Note for Request</h3>
            <form onSubmit={handleSendNote}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Select Request *</label>
                <select value={selectedReqId} onChange={(e) => setSelectedReqId(e.target.value)} required>
                  <option value="">-- Choose a Request --</option>
                  {requests.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.moduleName} ({r.category}) - {r.studentsCount} Students - {r.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>University</label>
                <input 
                  type="text" 
                  value={university} 
                  onChange={(e) => setUniversity(e.target.value)} 
                  placeholder="e.g. UniBridge" 
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Note Message *</label>
                <textarea 
                  value={noteText} 
                  onChange={(e) => setNoteText(e.target.value)} 
                  placeholder="Hello admin, I am available to take this module..." 
                  required 
                  style={{ minHeight: '120px' }}
                />
              </div>

              <button type="submit" className="btn-add" style={{ width: '100%' }}>POST NOTE</button>
            </form>
          </div>

          {/* Inbox / Received Messages */}
          <div className="admin-form" style={{ marginBottom: 0, background: 'var(--bg-card2)' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📥 Dashboard Inbox</h3>
            
            {dashboardMessages.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div className="empty-icon">📫</div>
                <p>No messages received from the Dashboard yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                {dashboardMessages.map(m => (
                  <div key={m._id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(46, 213, 115, 0.3)', borderLeft: '4px solid var(--green)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                      <span className="status-badge approved">Approved Selection</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <strong>{m.moduleName}</strong> - <span style={{ color: 'var(--text-secondary)' }}>{m.category}</span>
                    <p style={{ marginTop: '0.8rem', fontStyle: 'italic', background: 'var(--bg-dark)', padding: '0.8rem', borderRadius: '8px' }}>
                      "{m.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TutorManagement;
