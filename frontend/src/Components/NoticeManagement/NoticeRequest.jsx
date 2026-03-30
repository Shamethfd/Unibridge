import { useState } from 'react';
import axios from 'axios';
import './NoticeManagement.css';

const NoticeRequest = () => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    module: '',
    targetAudience: 'all',
    requestedBy: '',
    role: 'coordinator',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    else if (form.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    else if (form.title.trim().length > 100) newErrors.title = 'Title must be under 100 characters';
    if (!form.content.trim()) newErrors.content = 'Content is required';
    else if (form.content.trim().length < 10) newErrors.content = 'Content must be at least 10 characters';
    else if (form.content.trim().length > 1000) newErrors.content = 'Content must be under 1000 characters';
    if (!form.requestedBy.trim()) newErrors.requestedBy = 'Your name is required';
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/notice-requests', form);
      setMessage('✅ Request submitted successfully! Waiting for admin approval.');
      setMessageType('success');
      setForm({ title: '', content: '', module: '', targetAudience: 'all', requestedBy: '', role: 'coordinator' });
      setErrors({});
    } catch (err) {
      setMessage('❌ Error submitting request. Please try again.');
      setMessageType('error');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="create-notice-container">
      <div className="section-header">
        <h3>📝 Request Notice Publication</h3>
      </div>

      {message && (
        <div className={`notice-message ${messageType}`}>{message}</div>
      )}

      <form onSubmit={handleSubmit} className="notice-form" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Your Name <span className="required">*</span></label>
            <input
              type="text"
              name="requestedBy"
              value={form.requestedBy}
              onChange={handleChange}
              placeholder="Enter your name"
              className={errors.requestedBy ? 'input-error' : ''}
            />
            {errors.requestedBy && <span className="error-text">{errors.requestedBy}</span>}
          </div>

          <div className="form-group">
            <label>Role <span className="required">*</span></label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="coordinator">📋 Coordinator</option>
              <option value="tutor">👨‍🏫 Tutor</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Notice Title <span className="required">*</span></label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter notice title"
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Target Audience <span className="required">*</span></label>
            <select name="targetAudience" value={form.targetAudience} onChange={handleChange}>
              <option value="all">🌐 All Users</option>
              <option value="students">🎓 Students</option>
              <option value="tutors">👨‍🏫 Tutors</option>
              <option value="coordinators">📋 Coordinators</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Content <span className="required">*</span></label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Enter detailed notice content..."
            rows={4}
            className={errors.content ? 'input-error' : ''}
          />
          {errors.content && <span className="error-text">{errors.content}</span>}
        </div>

        <div className="form-group">
          <label>Module <span className="optional">(optional)</span></label>
          <input
            type="text"
            name="module"
            value={form.module}
            onChange={handleChange}
            placeholder="e.g. Mathematics, NDM"
          />
        </div>

        <button type="submit" className="btn-publish" disabled={loading}>
          {loading ? <span>⏳ Submitting...</span> : <span>📤 Submit Request</span>}
        </button>
      </form>
    </div>
  );
};

export default NoticeRequest;