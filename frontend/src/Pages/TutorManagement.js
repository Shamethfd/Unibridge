import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAllRequests, createMessage, getAllMessages } from '../services/api';

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
    <div className="page-container animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
            <Link to="/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-neutral-700">Tutor Management</span>
          </div>
          <h1 className="page-title">Tutor Management</h1>
          <p className="page-subtitle">Send notes regarding student requests to the dashboard administrator.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Send Note Form */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📤 Send Note for Request</h3>
            <form onSubmit={handleSendNote}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="label">Select Request *</label>
                <select className="input-field" value={selectedReqId} onChange={(e) => setSelectedReqId(e.target.value)} required>
                  <option value="">-- Choose a Request --</option>
                  {requests.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.moduleName} ({r.category}) - {r.studentsCount} Students - {r.status}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="label">University</label>
                <input 
                  className="input-field"
                  type="text" 
                  value={university} 
                  onChange={(e) => setUniversity(e.target.value)} 
                  placeholder="e.g. UniBridge" 
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Note Message *</label>
                <textarea 
                  className="input-field"
                  value={noteText} 
                  onChange={(e) => setNoteText(e.target.value)} 
                  placeholder="Hello admin, I am available to take this module..." 
                  required 
                  style={{ minHeight: '120px' }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>Post Note</button>
            </form>
          </div>

          {/* Inbox / Received Messages */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>📥 Dashboard Inbox</h3>
            
            {dashboardMessages.length === 0 ? (
              <div className="text-center py-10 text-neutral-500">
                <div className="text-4xl mb-3">📫</div>
                <p>No messages received from the dashboard yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                {dashboardMessages.map(m => (
                  <div key={m._id} className="rounded-xl border border-accent-200 bg-accent-50 p-4">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                      <span className="status-badge approved">Approved Selection</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <strong>{m.moduleName}</strong> - <span style={{ color: 'var(--text-secondary)' }}>{m.category}</span>
                    <p className="mt-3 italic bg-white p-3 rounded-lg text-neutral-700">
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
