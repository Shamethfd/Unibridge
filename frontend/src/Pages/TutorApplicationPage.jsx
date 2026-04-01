import React, { useState, useEffect } from 'react';
import { FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import FormInput from '../Components/FormInput';
import { api, getApiErrorMessage } from '../services/api';
import { setStoredTutorStudentId } from '../utils/tutorStorage';

const initialForm = {
  studentName: '',
  studentId: '',
  email: '',
  subject: '',
  experience: '',
  description: '',
};

const subjectOptions = [
  'Data Structures & Algorithms',
  'Web Development',
  'Database Management',
  'Object Oriented Programming',
  'Software Engineering',
  'Machine Learning',
  'Mobile Development',
  'Cybersecurity',
  'Computer Networks',
  'Operating Systems',
];

export default function TutorApplicationPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

    // Auto-populate email and name from user account
    useEffect(() => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setForm(prev => ({
            ...prev,
            email: userData.email || '',
            studentName: `${userData.profile?.firstName || ''} ${userData.profile?.lastName || ''}`.trim(),
          }));
        } catch (err) {
          console.error('Failed to load user data:', err);
        }
      }
    }, []);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error on change
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    const studentIdValue = form.studentId.trim();

    if (!form.studentName.trim()) {
      newErrors.studentName = 'Student name is required';
    } else if (form.studentName.trim().length < 2) {
      newErrors.studentName = 'Name must be at least 2 characters';
    }

    if (!studentIdValue) {
      newErrors.studentId = 'Student ID is required';
    } else if (studentIdValue.length !== 10) {
      newErrors.studentId = 'Student ID must be exactly 10 characters';
    } else if (!/^IT\d{8}$/i.test(studentIdValue)) {
      newErrors.studentId = 'Student ID must be in format IT followed by 8 digits (e.g., IT21504832)';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!form.experience.trim()) {
      newErrors.experience = 'Please describe your experience or qualifications';
    } else if (form.experience.trim().length < 10) {
      newErrors.experience = 'Experience must be at least 10 characters';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Please provide a short description';
    } else if (form.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    try {
      setSubmitting(true);
      await api.post('/api/tutor-applications', form);
      setStoredTutorStudentId(form.studentId.trim());
      setSubmitted(true);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
    setSubmitError('');
  };

  if (submitted) {
    return (
      <div className="page-container animate-fade-in">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-accent-100 text-accent-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pop-in">
            <FiCheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-gilroyBold text-neutral-800 mb-3">Application Submitted!</h2>
          <p className="text-neutral-500 font-gilroyRegular mb-2">
            Thank you, <strong>{form.studentName}</strong>. Your tutor application for <strong>{form.subject}</strong> has been submitted successfully.
          </p>
          <p className="text-sm text-neutral-400 font-gilroyRegular mb-8">
            The coordinator will review your application and notify you via email at <strong>{form.email}</strong>.
          </p>
          <button onClick={handleReset} className="btn-primary">
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title">Apply as a Tutor</h1>
          <p className="page-subtitle">
            Share your knowledge with fellow students. Fill out the form below to apply as a peer tutor.
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FormInput
                label="Student Name"
                name="studentName"
                value={form.studentName}
                onChange={handleChange}
                error={errors.studentName}
                placeholder="e.g., Kasun Perera"
                required
                inputFilter="name"
              />
              <FormInput
                label="Student ID"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                error={errors.studentId}
                placeholder="e.g., IT21504832"
                required
                inputFilter="studentId"
                maxLength={10}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="e.g., kasun@student.uni.lk"
                required
                inputFilter="email"
              />
              <FormInput
                label="Subject / Module"
                name="subject"
                type="select"
                value={form.subject}
                onChange={handleChange}
                error={errors.subject}
                options={subjectOptions}
                required
              />
            </div>

            <FormInput
              label="Experience / Qualifications"
              name="experience"
              type="textarea"
              value={form.experience}
              onChange={handleChange}
              error={errors.experience}
              placeholder="Describe your relevant experience, certifications, or qualifications..."
              required
              rows={3}
            />

            <FormInput
              label="Why Do You Want to Be a Tutor?"
              name="description"
              type="textarea"
              value={form.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Tell us why you want to become a peer tutor and how you plan to help students..."
              required
              rows={3}
            />

            {submitError && (
              <div className="flex items-center gap-2 p-3 bg-danger-50 text-danger-600 rounded-lg text-sm font-gilroyMedium mb-4 animate-fade-in">
                <FiAlertCircle />
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-lg text-neutral-500 font-gilroyMedium hover:bg-neutral-100 transition-colors"
              >
                Clear Form
              </button>
              <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={submitting}>
                <FiSend />
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
