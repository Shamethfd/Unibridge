import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
  };

  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  const dots = {
    pending: 'bg-warning-500',
    approved: 'bg-accent-500',
    rejected: 'bg-danger-500',
  };

  const key = status?.toLowerCase() || 'pending';

  return (
    <span className={styles[key] || styles.pending}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dots[key] || dots.pending}`} />
      {labels[key] || status}
    </span>
  );
}
