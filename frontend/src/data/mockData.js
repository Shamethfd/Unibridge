// ===== Mock Data for LearnBridge Frontend =====
// This file provides sample data for all pages since there is no backend connected.

export const mockApplications = [
  {
    _id: 'app001',
    studentName: 'Kasun Perera',
    studentId: 'IT21504832',
    email: 'kasun.perera@student.uni.lk',
    subject: 'Data Structures & Algorithms',
    experience: '3 years of competitive programming, Dean\'s list student',
    description: 'I want to help fellow students understand complex algorithmic concepts through practical examples.',
    status: 'pending',
    createdAt: '2026-03-15T09:00:00Z',
  },
  {
    _id: 'app002',
    studentName: 'Nimali Fernando',
    studentId: 'IT21508745',
    email: 'nimali.f@student.uni.lk',
    subject: 'Web Development',
    experience: 'Internship at TechCorp, built 5+ full-stack projects',
    description: 'Passionate about teaching modern web technologies including React and Node.js.',
    status: 'approved',
    decisionBy: 'Dr. Silva',
    decisionAt: '2026-03-16T14:30:00Z',
    createdAt: '2026-03-10T11:00:00Z',
  },
  {
    _id: 'app003',
    studentName: 'Ashan Jayawardena',
    studentId: 'IT21501234',
    email: 'ashan.j@student.uni.lk',
    subject: 'Database Management',
    experience: 'Oracle certified, 2 years of database administration experience',
    description: 'I can help students with SQL, NoSQL, database design and optimization.',
    status: 'rejected',
    decisionBy: 'Dr. Silva',
    decisionAt: '2026-03-17T10:00:00Z',
    createdAt: '2026-03-12T08:30:00Z',
  },
  {
    _id: 'app004',
    studentName: 'Dilini Rathnayake',
    studentId: 'IT21507890',
    email: 'dilini.r@student.uni.lk',
    subject: 'Object Oriented Programming',
    experience: 'Teaching assistant for OOP module, strong Java background',
    description: 'Want to share my knowledge about OOP principles and Java programming with juniors.',
    status: 'pending',
    createdAt: '2026-03-18T15:00:00Z',
  },
  {
    _id: 'app005',
    studentName: 'Ruwan Bandara',
    studentId: 'IT21506543',
    email: 'ruwan.b@student.uni.lk',
    subject: 'Software Engineering',
    experience: 'Led 3 group projects, Agile/Scrum certified',
    description: 'I can guide students through software development lifecycle and project management.',
    status: 'pending',
    createdAt: '2026-03-19T12:00:00Z',
  },
];

export const mockSessions = [
  {
    _id: 'sess001',
    tutorId: 'tutor001',
    tutorName: 'Nimali Fernando',
    subject: 'Web Development',
    title: 'React Hooks Deep Dive',
    date: '2026-03-25',
    time: '14:00',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    description: 'We will cover useState, useEffect, useContext, and custom hooks with practical examples. Bring your laptops!',
    createdAt: '2026-03-18T10:00:00Z',
  },
  {
    _id: 'sess002',
    tutorId: 'tutor002',
    tutorName: 'Kasun Perera',
    subject: 'Data Structures & Algorithms',
    title: 'Binary Trees & Traversals',
    date: '2026-03-26',
    time: '10:00',
    meetingLink: 'https://zoom.us/j/123456789',
    description: 'Learn about binary trees, BST, tree traversals (inorder, preorder, postorder) and solve LeetCode problems together.',
    createdAt: '2026-03-17T09:00:00Z',
  },
  {
    _id: 'sess003',
    tutorId: 'tutor001',
    tutorName: 'Nimali Fernando',
    subject: 'Web Development',
    title: 'Building REST APIs with Node.js',
    date: '2026-03-28',
    time: '16:00',
    meetingLink: 'https://meet.google.com/xyz-uvwx-yz',
    description: 'Hands-on session to build a REST API using Express.js and MongoDB. We\'ll create a complete CRUD application.',
    createdAt: '2026-03-19T14:00:00Z',
  },
  {
    _id: 'sess004',
    tutorId: 'tutor003',
    tutorName: 'Dilini Rathnayake',
    subject: 'Object Oriented Programming',
    title: 'Design Patterns in Java',
    date: '2026-03-30',
    time: '11:00',
    meetingLink: 'https://teams.microsoft.com/l/meetup-join/123',
    description: 'Explore popular design patterns: Singleton, Factory, Observer, and Strategy with real-world Java examples.',
    createdAt: '2026-03-20T08:00:00Z',
  },
];

export const mockNotices = [
  {
    _id: 'notice001',
    type: 'tutor',
    title: 'New Tutor Approved — Web Development',
    message: 'Nimali Fernando has been approved as a tutor for Web Development. Check the notice board for upcoming sessions!',
    createdAt: '2026-03-16T14:30:00Z',
  },
  {
    _id: 'notice002',
    type: 'session',
    title: 'Upcoming Session: React Hooks Deep Dive',
    message: 'Join Nimali Fernando for a deep dive into React Hooks on March 25th at 2:00 PM. Don\'t miss this opportunity!',
    createdAt: '2026-03-18T10:30:00Z',
  },
  {
    _id: 'notice003',
    type: 'tutor',
    title: 'Tutor Applications Open for March',
    message: 'We are accepting new tutor applications for the following subjects: Machine Learning, Mobile Development, and Cybersecurity. Apply now!',
    createdAt: '2026-03-14T09:00:00Z',
  },
  {
    _id: 'notice004',
    type: 'session',
    title: 'Study Group: Design Patterns in Java',
    message: 'A new study session on Design Patterns has been scheduled for March 30th. Perfect for students preparing for the OOP exam.',
    createdAt: '2026-03-20T08:30:00Z',
  },
];

export const mockFeedback = [
  {
    _id: 'fb001',
    studentName: 'Tharindu Silva',
    tutorId: 'tutor001',
    tutorName: 'Nimali Fernando',
    sessionId: 'sess001',
    sessionTitle: 'React Hooks Deep Dive',
    rating: 5,
    message: 'Excellent session! Nimali explained hooks in a way that finally made sense. The practical examples were very helpful.',
    createdAt: '2026-03-25T16:00:00Z',
  },
  {
    _id: 'fb002',
    studentName: 'Malika Jayasuriya',
    tutorId: 'tutor001',
    tutorName: 'Nimali Fernando',
    sessionId: 'sess001',
    sessionTitle: 'React Hooks Deep Dive',
    rating: 4,
    message: 'Very good session. Would have liked more time for Q&A at the end.',
    createdAt: '2026-03-25T16:30:00Z',
  },
  {
    _id: 'fb003',
    studentName: 'Praveena Kumar',
    tutorId: 'tutor002',
    tutorName: 'Kasun Perera',
    sessionId: 'sess002',
    sessionTitle: 'Binary Trees & Traversals',
    rating: 5,
    message: 'Kasun is an amazing tutor. He broke down complex tree concepts into simple steps. Highly recommend!',
    createdAt: '2026-03-26T12:00:00Z',
  },
  {
    _id: 'fb004',
    studentName: 'Sahan Wickrama',
    tutorId: 'tutor001',
    tutorName: 'Nimali Fernando',
    sessionId: 'sess003',
    sessionTitle: 'Building REST APIs with Node.js',
    rating: 5,
    message: 'Best session yet! Building the API step by step was incredibly helpful for my assignment.',
    createdAt: '2026-03-28T18:00:00Z',
  },
];

export const mockTutors = [
  {
    _id: 'tutor001',
    studentName: 'Nimali Fernando',
    studentId: 'IT21508745',
    email: 'nimali.f@student.uni.lk',
    subjects: ['Web Development'],
    isActive: true,
    averageRating: 4.7,
    totalFeedbacks: 3,
  },
  {
    _id: 'tutor002',
    studentName: 'Kasun Perera',
    studentId: 'IT21504832',
    email: 'kasun.perera@student.uni.lk',
    subjects: ['Data Structures & Algorithms'],
    isActive: true,
    averageRating: 5.0,
    totalFeedbacks: 1,
  },
];

// ===== Stats helpers =====
export const getStudentStats = () => ({
  totalApplications: 1,
  activeSessions: mockSessions.length,
  feedbackGiven: 2,
  upcomingSessions: mockSessions.filter(s => new Date(s.date) >= new Date()).length,
});

export const getTutorStats = (tutorId = 'tutor001') => {
  const tutorFeedback = mockFeedback.filter(f => f.tutorId === tutorId);
  const avgRating = tutorFeedback.length > 0
    ? (tutorFeedback.reduce((sum, f) => sum + f.rating, 0) / tutorFeedback.length).toFixed(1)
    : 0;
  return {
    sessionsCreated: mockSessions.filter(s => s.tutorId === tutorId).length,
    averageRating: parseFloat(avgRating),
    totalFeedback: tutorFeedback.length,
  };
};

export const getCoordinatorStats = () => ({
  total: mockApplications.length,
  pending: mockApplications.filter(a => a.status === 'pending').length,
  approved: mockApplications.filter(a => a.status === 'approved').length,
  rejected: mockApplications.filter(a => a.status === 'rejected').length,
});
