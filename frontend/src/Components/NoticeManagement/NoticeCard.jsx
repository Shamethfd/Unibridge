import { useState } from 'react';
import axios from 'axios';
import './NoticeManagement.css';

const NoticeCard = ({ notice, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: notice.title,
    content: notice.content,
    targetAudience: notice.targetAudience,
    module: notice.module,
  });

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      await axios.delete(`http://localhost:5000/api/notices/${notice._id}`);
      onUpdate();
    }
  };

  const handleArchive = async () => {
    await axios.put(`http://localhost:5000/api/notices/${notice._id}/archive`);
    onUpdate();
  };

  const handleUpdate = async () => {
    if (!editForm.title.trim() || !editForm.content.trim()) {
      alert('Title and content cannot be empty!');
      return;
    }
    await axios.put(`http://localhost:5000/api/notices/${notice._id}`, editForm);
    setEditing(false);
    onUpdate();
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const badgeColor = { all: '#094886', students: '#2563eb', tutors: '#059669' };

  if (editing) {
    return (
      <div className="notice-card editing">
        <h4>✏️ Edit Notice</h4>
        <input
          className="edit-input"
          value={editForm.title}
          onChange={e => setEditForm({ ...editForm, title: e.target.value })}
          placeholder="Title"
        />
        <textarea
          className="edit-textarea"
          value={editForm.content}
          onChange={e => setEditForm({ ...editForm, content: e.target.value })}
          rows={3}
        />
        <select
          className="edit-select"
          value={editForm.targetAudience}
          onChange={e => setEditForm({ ...editForm, targetAudience: e.target.value })}
        >
          <option value="all">All Users</option>
          <option value="students">Students</option>
          <option value="tutors">Tutors</option>
        </select>
        <input
          className="edit-input"
          value={editForm.module}
          onChange={e => setEditForm({ ...editForm, module: e.target.value })}
          placeholder="Module (optional)"
        />
        <div className="edit-actions">
          <button className="btn-save" onClick={handleUpdate}>💾 Save</button>
          <button className="btn-cancel" onClick={() => setEditing(false)}>✖ Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="notice-card">
      
      <div className="notice-card-header">
        <h4>{notice.title}</h4>
        <span className="audience-badge" style={{ backgroundColor: badgeColor[notice.targetAudience] }}>
          {notice.targetAudience === 'all' ? '🌐 All' :
           notice.targetAudience === 'students' ? '🎓 Students' : 
           notice.targetAudience === 'tutors' ? '👨‍🏫 Tutors' :
           '📋 Coordinators'}
        </span>
      </div>

      <p className="notice-content">{notice.content}</p>

      {notice.module && (
        <p className="notice-module">📚 {notice.module}</p>
      )}

      <div className="notice-card-footer">
        <span>📅 {formatDate(notice.createdAt)}</span>
        <span>👁 {notice.viewedBy?.length || 0} views</span>
        {notice.scheduledAt && <span>⏰ Scheduled</span>}
      </div>

      <div className="notice-actions">
        <button className="btn-edit" onClick={() => setEditing(true)}>✏️ Edit</button>
        {!notice.isArchived && (
          <button className="btn-archive" onClick={handleArchive}>🗂 Archive</button>
        )}
        <button className="btn-delete" onClick={handleDelete}>🗑 Delete</button>
      </div>
    </div>
  );
};

export default NoticeCard;