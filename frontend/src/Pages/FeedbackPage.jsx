import React, { useState } from 'react';
import { FiSend, FiCheckCircle } from 'react-icons/fi';
import FormInput from '../Components/FormInput';
import StarRating from '../Components/StarRating';
import { mockSessions } from '../data/mockData';

const initialForm = {
  studentName: '',
  tutorName: '',
  sessionId: '',
  rating: 0,
  message: '',
};

export default function FeedbackPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSessionChange = (e) => {
    const sessionId = e.target.value;
    const session = mockSessions.find((s) => s._id === sessionId);
    setForm({
      ...form,
      sessionId,
      tutorName: session ? session.tutorName : '',
    });
    if (errors.sessionId) setErrors({ ...errors, sessionId: '' });
  };

  const handleRatingChange = (rating) => {
    setForm({ ...form, rating });
    if (errors.rating) setErrors({ ...errors, rating: '' });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.studentName.trim()) {
      newErrors.studentName = 'Your name is required';
    } else if (form.studentName.trim().length < 2) {
      newErrors.studentName = 'Name must be at least 2 characters';
    }

    if (!form.sessionId) {
      newErrors.sessionId = 'Please select a session';
    }

    if (!form.rating || form.rating < 1 || form.rating > 5) {
      newErrors.rating = 'Please select a rating (1-5 stars)';
    }

    if (!form.message.trim()) {
      newErrors.message = 'Please provide your feedback message';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Feedback must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="page-container animate-fade-in">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-accent-100 text-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pop-in">
            <FiCheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-gilroyBold text-neutral-800 mb-3">Feedback Submitted!</h2>
          <p className="text-neutral-500 font-gilroyRegular mb-2">
            Thank you, <strong>{form.studentName}</strong>. Your feedback for <strong>{form.tutorName}</strong> has been recorded.
          </p>
          <p className="text-sm text-neutral-400 font-gilroyRegular mb-8">
            Your feedback helps tutors improve and helps other students find the best tutors.
          </p>
          <button onClick={handleReset} className="btn-primary">
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  const sessionOptions = mockSessions.map((s) => ({
    value: s._id,
    label: `${s.title} — ${s.tutorName} (${s.date})`,
  }));

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title">Session Feedback</h1>
          <p className="page-subtitle">
            Share your experience and help tutors improve. Your feedback matters!
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <FormInput
              label="Your Name"
              name="studentName"
              value={form.studentName}
              onChange={handleChange}
              error={errors.studentName}
              placeholder="Enter your full name"
              required
              inputFilter="name"
            />

            <FormInput
              label="Select Session"
              name="sessionId"
              type="select"
              value={form.sessionId}
              onChange={handleSessionChange}
              error={errors.sessionId}
              options={sessionOptions}
              required
            />

            {form.tutorName && (
              <div className="mb-4 p-3 bg-primary-50 rounded-lg animate-fade-in">
                <p className="text-sm font-gilroyMedium text-primary-700">
                  Tutor: <span className="font-gilroyBold">{form.tutorName}</span>
                </p>
              </div>
            )}

            {/* Star Rating */}
            <div className="mb-4">
              <label className="label">
                Rating <span className="text-danger-500 ml-1">*</span>
              </label>
              <StarRating value={form.rating} onChange={handleRatingChange} size={28} />
              {errors.rating && (
                <p className="mt-1 text-xs text-danger-500 font-gilroyMedium animate-fade-in">
                  {errors.rating}
                </p>
              )}
            </div>

            <FormInput
              label="Feedback Message"
              name="message"
              type="textarea"
              value={form.message}
              onChange={handleChange}
              error={errors.message}
              placeholder="Share your experience... What went well? What could be improved?"
              required
              rows={4}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-lg text-neutral-500 font-gilroyMedium hover:bg-neutral-100 transition-colors"
              >
                Clear
              </button>
              <button type="submit" className="btn-primary inline-flex items-center gap-2">
                <FiSend />
                Submit Feedback
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
