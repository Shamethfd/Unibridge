import { useState } from 'react';
import axios from 'axios';
import './NoticeManagement.css';

const CreateNotice = ({ onCreated }) => {
  const [form, setForm] = useState({
    title: '', content: '', targetAudience: 'all', module: '', scheduledAt: '', ctaText: '', ctaLink: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const validate = () => {
    const newErrors = {};

    // Title validation
    if (!form.title.trim()) newErrors.title = 'Title is required';
    else if (form.title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    else if (form.title.trim().length > 100) newErrors.title = 'Title must be under 100 characters';

    // Content validation
    if (!form.content.trim()) newErrors.content = 'Content is required';
    else if (form.content.trim().length < 10) newErrors.content = 'Content must be at least 10 characters';
    else if (form.content.trim().length > 1000) newErrors.content = 'Content must be under 1000 characters';

    // Scheduled date validation
    if (form.scheduledAt) {
      const selectedDate = new Date(form.scheduledAt);
      if (selectedDate <= new Date()) {
        newErrors.scheduledAt = 'Scheduled date must be in the future';
      }
    }

    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const fillDummyData = () => {
    setForm({
      title: 'Exam Schedule Update – NDM Spot Test',
      content: 'The NDM Spot test will be held on 22nd March 2026 at 9:00 AM in Hall A. All students are required to bring their student IDs.',
      targetAudience: 'students',
      module: 'NDM',
      scheduledAt: '',
      ctaText: '',
      ctaLink: '',
    });
    setErrors({});
  };

  const addTutorApplicationCTA = () => {
    setForm((prev) => ({
      ...prev,
      ctaText: 'Fill the form',
      ctaLink: '/student/apply',
    }));
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
      await axios.post('http://localhost:5000/api/notices', form);
      setMessage('✅ Notice published successfully!');
      setMessageType('success');
      setForm({ title: '', content: '', targetAudience: 'all', module: '', scheduledAt: '', ctaText: '', ctaLink: '' });
      setErrors({});
      if (onCreated) onCreated();
    } catch (err) {
      setMessage('❌ Error creating notice. Please try again.');
      setMessageType('error');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="create-notice-container">
      <div className="section-header">
        <h3>📢 Create New Notice</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-dummy" onClick={fillDummyData} type="button">
            ⚡ Fill Demo Data
          </button>
          <button className="btn-dummy" onClick={addTutorApplicationCTA} type="button">
            🔗 Add Fill Form Link
          </button>
        </div>
      </div>

      {message && (
        <div className={`notice-message ${messageType}`}>{message}</div>
      )}

      <form onSubmit={handleSubmit} className="notice-form" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label>Title <span className="required">*</span></label>
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

        <div className="form-row">
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

          <div className="form-group">
            <label>Schedule for Later <span className="optional">(optional)</span></label>
            <input
              type="datetime-local"
              name="scheduledAt"
              value={form.scheduledAt}
              onChange={handleChange}
              className={errors.scheduledAt ? 'input-error' : ''}
            />
            {errors.scheduledAt && <span className="error-text">{errors.scheduledAt}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Action Text <span className="optional">(optional)</span></label>
            <input
              type="text"
              name="ctaText"
              value={form.ctaText}
              onChange={handleChange}
              placeholder="e.g. Fill the form"
            />
          </div>

          <div className="form-group">
            <label>Action Link <span className="optional">(optional)</span></label>
            <input
              type="text"
              name="ctaLink"
              value={form.ctaLink}
              onChange={handleChange}
              placeholder="e.g. /student/apply"
            />
          </div>
        </div>

        <button type="submit" className="btn-publish" disabled={loading}>
          {loading ? (
            <span>⏳ Publishing...</span>
          ) : (
            <span>🚀 Publish Notice</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateNotice;