import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiUsers, FiClipboard, FiArrowRight, FiStar, FiCalendar, FiMessageSquare } from 'react-icons/fi';

const features = [
  {
    icon: <FiClipboard className="text-2xl" />,
    title: 'Apply as Tutor',
    desc: 'Share your knowledge by becoming a peer tutor. Help fellow students excel in their studies.',
  },
  {
    icon: <FiCalendar className="text-2xl" />,
    title: 'Study Sessions',
    desc: 'Join live study sessions led by experienced tutors. Collaborate and learn together.',
  },
  {
    icon: <FiMessageSquare className="text-2xl" />,
    title: 'Feedback & Ratings',
    desc: 'Rate your tutoring sessions and help maintain quality across the platform.',
  },
  {
    icon: <FiBookOpen className="text-2xl" />,
    title: 'Notice Board',
    desc: 'Stay updated with the latest announcements, new tutors, and upcoming sessions.',
  },
];

const roles = [
  {
    title: 'Student',
    desc: 'Browse sessions, apply as tutor, give feedback',
    to: '/student',
    gradient: 'from-primary-500 to-primary-700',
    icon: <FiBookOpen size={32} />,
  },
  {
    title: 'Tutor',
    desc: 'Create sessions, view ratings & feedback',
    to: '/tutor',
    gradient: 'from-secondary-500 to-secondary-700',
    icon: <FiStar size={32} />,
  },
  {
    title: 'Coordinator',
    desc: 'Review & manage tutor applications',
    to: '/coordinator',
    gradient: 'from-primary-600 to-secondary-600',
    icon: <FiUsers size={32} />,
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm font-gilroyMedium border border-white/20">
              <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse-slow" />
              Peer Tutoring Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-gilroyHeavy leading-tight mb-6">
              Connect. Learn.
              <br />
              <span className="text-secondary-300">Grow Together.</span>
            </h1>
            <p className="text-lg md:text-xl font-gilroyLight text-white/80 mb-10 max-w-2xl mx-auto">
              LearnBridge connects students with peer tutors for collaborative learning.
              Apply as a tutor, join study sessions, and track your academic growth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/student"
                className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3.5 rounded-xl font-gilroyBold text-lg hover:bg-white/90 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Get Started
                <FiArrowRight />
              </Link>
              <Link
                to="/student/noticeboard"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-gilroyMedium text-lg border border-white/20 hover:bg-white/20 transition-all"
              >
                View Sessions
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 52C120 44 240 28 360 24C480 20 600 28 720 32C840 36 960 36 1080 32C1200 28 1320 20 1380 16L1440 12V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="page-container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-gilroyBold text-neutral-800 mb-3">
            Everything You Need to <span className="text-primary-500">Succeed</span>
          </h2>
          <p className="text-neutral-500 font-gilroyRegular max-w-lg mx-auto">
            A complete peer tutoring ecosystem designed to enhance your academic journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="card group hover:-translate-y-1 cursor-default"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-gilroyBold text-neutral-800 mb-2">{f.title}</h3>
              <p className="text-sm text-neutral-500 font-gilroyRegular leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="bg-white py-16">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-gilroyBold text-neutral-800 mb-3">
              Choose Your <span className="text-secondary-500">Role</span>
            </h2>
            <p className="text-neutral-500 font-gilroyRegular">
              Select your role to access the relevant dashboard and features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {roles.map((role, i) => (
              <Link
                key={i}
                to={role.to}
                className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-br ${role.gradient} p-8 text-white text-center`}>
                  <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {role.icon}
                  </div>
                  <h3 className="text-xl font-gilroyBold mb-2">{role.title}</h3>
                  <p className="text-sm text-white/75 font-gilroyRegular">{role.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-gilroyMedium text-white/90 group-hover:gap-2 transition-all">
                    Enter Dashboard <FiArrowRight />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="page-container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: '50+', label: 'Active Tutors' },
            { num: '200+', label: 'Study Sessions' },
            { num: '1,000+', label: 'Students Helped' },
            { num: '4.8', label: 'Average Rating' },
          ].map((stat, i) => (
            <div key={i} className="text-center py-6">
              <p className="text-3xl md:text-4xl font-gilroyHeavy text-primary-500 mb-1">{stat.num}</p>
              <p className="text-sm text-neutral-500 font-gilroyMedium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}