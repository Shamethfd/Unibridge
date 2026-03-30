import { useEffect, useState } from 'react';
import axios from 'axios';
import './NoticeManagement.css';

const NoticeRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/notice-requests');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notice-requests/${id}/approve`);
      setMessage('✅ Request approved and notice published!');
      setMessageType('success');
      fetchRequests();
    } catch (err) {
      setMessage('❌ Error approving request.');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notice-requests/${id}/reject`);
      setMessage('❌ Request rejected.');
      setMessageType('error');
      fetchRequests();
    } catch (err) {
      setMessage('❌ Error rejecting request.');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      await axios.delete(`http://localhost:5000/api/notice-requests/${id}`);
      fetchRequests();
    }
  };

  const statusColor = {
    pending: '#d97706',
    approved: '#059669',
    rejected: '#dc2626',
  };

  return (
    <div className="notice-list-container">
      <div className="section-header">
        <h3>📋 Notice Requests
          <span className="count-badge">{requests.length}</span>
        </h3>
      </div>

      {message && (
        <div className={`notice-message ${messageType}`}>{message}</div>
      )}

      {loading ? (
        <div className="loading-state"><p>⏳ Loading requests...</p></div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <p>📭 No requests found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Requested By</th>
                <th>Role</th>
                <th>Target</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, i) => (
                <tr key={req._id}>
                  <td>{i + 1}</td>
                  <td><strong>{req.title}</strong></td>
                  <td>{req.requestedBy}</td>
                  <td>
                    {req.role === 'coordinator' ? '📋 Coordinator' : '👨‍🏫 Tutor'}
                  </td>
                  <td>
                    <span className={`table-badge ${req.targetAudience}`}>
                      {req.targetAudience === 'all' ? '🌐 All' :
                       req.targetAudience === 'students' ? '🎓 Students' :
                       req.targetAudience === 'tutors' ? '👨‍🏫 Tutors' :
                       '📋 Coordinators'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: statusColor[req.status], fontWeight: 600 }}>
                      {req.status === 'pending' ? '⏳ Pending' :
                       req.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </span>
                  </td>
                  <td>
                    <div className="notice-actions">
                      {req.status === 'pending' && (
                        <>
                          <button className="btn-save" onClick={() => handleApprove(req._id)}>
                            ✅ Approve
                          </button>
                          <button className="btn-delete" onClick={() => handleReject(req._id)}>
                            ❌ Reject
                          </button>
                        </>
                      )}
                      <button className="btn-delete" onClick={() => handleDelete(req._id)}>
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NoticeRequestList;