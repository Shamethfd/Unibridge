import React, { useState } from 'react';
import { FiSend, FiCheckCircle } from 'react-icons/fi';
import FormInput, { getTodayDate, getCurrentTime } from '../Components/FormInput';

const initialForm = {
  tutorName: '',
  studentId: '',
  subject: '',
  title: '',
  date: '',
  time: '',
  meetingLink: '',
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

export default function CreateSessionPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const getSelectedDateTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return null;
    const [year, month, day] = dateValue.split('-').map(Number);
    const [hour, minute] = timeValue.split(':').map(Number);

    if ([year, month, day, hour, minute].some(Number.isNaN)) {
      return null;
    }

    return new Date(year, month - 1, day, hour, minute, 0, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    const studentIdValue = form.studentId.trim();

    if (!form.tutorName.trim()) {
      newErrors.tutorName = 'Tutor name is required';
    }

    if (!studentIdValue) {
      newErrors.studentId = 'Tutor student ID is required';
    } else if (studentIdValue.length !== 10) {
      newErrors.studentId = 'Student ID must be exactly 10 characters';
    } else if (!/^IT\d{8}$/i.test(studentIdValue)) {
      newErrors.studentId = 'Student ID must be in format IT followed by 8 digits';
    }

    if (!form.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!form.title.trim()) {
      newErrors.title = 'Session title is required';
    } else if (form.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!form.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }

    if (!form.time) {
      newErrors.time = 'Time is required';
    } else if (form.date === getTodayDate()) {
      const selectedDateTime = getSelectedDateTime(form.date, form.time);
      const now = new Date();
      now.setSeconds(0, 0);

      if (!selectedDateTime || selectedDateTime < now) {
        newErrors.time = 'Time cannot be in the past for today';
      }
    }

    if (!form.meetingLink.trim()) {
      newErrors.meetingLink = 'Meeting link is required';
    } else if (!/^https?:\/\/.+/.test(form.meetingLink.trim())) {
      newErrors.meetingLink = 'Please enter a valid URL starting with http:// or https://';
    }

    if (form.description && form.description.trim().length > 0 && form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters if provided';
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
          <h2 className="text-2xl font-gilroyBold text-neutral-800 mb-3">Session Created!</h2>
          <p className="text-neutral-500 font-gilroyRegular mb-2">
            Your study session "<strong>{form.title}</strong>" has been posted successfully.
          </p>
          <p className="text-sm text-neutral-400 font-gilroyRegular mb-8">
            Students can now find and join your session from the Notice Board.
          </p>
          <button onClick={handleReset} className="btn-primary">
            Create Another Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="page-title">Create Study Session</h1>
          <p className="page-subtitle">Schedule a new peer tutoring session for students to join.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FormInput
                label="Tutor Name"
                name="tutorName"
                value={form.tutorName}
                onChange={handleChange}
                error={errors.tutorName}
                placeholder="Your full name"
                required
                inputFilter="name"
              />
              <FormInput
                label="Tutor Student ID"
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                error={errors.studentId}
                placeholder="e.g., IT21508745"
                required
                inputFilter="studentId"
                maxLength={10}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FormInput
                label="Subject"
                name="subject"
                type="select"
                value={form.subject}
                onChange={handleChange}
                error={errors.subject}
                options={subjectOptions}
                required
              />
              <FormInput
                label="Session Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="e.g., React Hooks Deep Dive"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <FormInput
                label="Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                error={errors.date}
                required
                disablePastDates
              />
              <FormInput
                label="Time"
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                error={errors.time}
                required
                selectedDate={form.date}
              />
            </div>

            <FormInput
              label="Online Meeting Link"
              name="meetingLink"
              value={form.meetingLink}
              onChange={handleChange}
              error={errors.meetingLink}
              placeholder="e.g., https://meet.google.com/abc-defg-hij"
              required
            />

            <FormInput
              label="Description"
              name="description"
              type="textarea"
              value={form.description}
              onChange={handleChange}
              error={errors.description}
              placeholder="Describe what topics you'll cover in this session..."
              rows={3}
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
                Create Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
