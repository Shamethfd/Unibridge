import React from 'react';
import { FiStar, FiMessageSquare } from 'react-icons/fi';
import StarRating from '../Components/StarRating';
import { mockFeedback, getTutorStats } from '../data/mockData';

export default function TutorRatingPage() {
  const stats = getTutorStats('tutor001');
  const tutorFeedback = mockFeedback.filter(f => f.tutorId === 'tutor001');

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="page-title">My Ratings & Feedback</h1>
        <p className="page-subtitle">View all feedback received from students.</p>
      </div>

      {/* Rating Summary */}
      <div className="card mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="text-center">
            <p className="text-5xl font-gilroyHeavy text-primary-500 mb-1">{stats.averageRating}</p>
            <StarRating value={Math.round(stats.averageRating)} readOnly size={20} />
            <p className="text-sm text-neutral-400 font-gilroyRegular mt-2">Average Rating</p>
          </div>
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 rounded-xl text-center">
                <p className="text-2xl font-gilroyBold text-neutral-800">{stats.totalFeedback}</p>
                <p className="text-xs text-neutral-400 font-gilroyMedium uppercase">Total Feedback</p>
              </div>
              <div className="p-4 bg-neutral-50 rounded-xl text-center">
                <p className="text-2xl font-gilroyBold text-neutral-800">{stats.sessionsCreated}</p>
                <p className="text-xs text-neutral-400 font-gilroyMedium uppercase">Sessions</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="mt-4 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = tutorFeedback.filter(f => f.rating === star).length;
                const pct = tutorFeedback.length > 0 ? (count / tutorFeedback.length) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs font-gilroyMedium text-neutral-500 w-4">{star}</span>
                    <FiStar size={12} className="text-warning-400" />
                    <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-warning-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-neutral-400 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <h2 className="section-title flex items-center gap-2">
        <FiMessageSquare className="text-primary-500" />
        All Feedback ({tutorFeedback.length})
      </h2>

      {tutorFeedback.length === 0 ? (
        <div className="card text-center py-12">
          <FiMessageSquare className="text-neutral-300 mx-auto mb-3" size={40} />
          <p className="text-neutral-400 font-gilroyRegular">No feedback received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tutorFeedback.map((fb) => (
            <div key={fb._id} className="card animate-fade-in-up">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-gilroyBold text-neutral-800">{fb.studentName}</p>
                  <p className="text-xs text-neutral-400 font-gilroyRegular">
                    {fb.sessionTitle} • {formatDate(fb.createdAt)}
                  </p>
                </div>
                <StarRating value={fb.rating} readOnly size={16} />
              </div>
              <p className="text-sm text-neutral-600 font-gilroyRegular leading-relaxed">
                {fb.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
