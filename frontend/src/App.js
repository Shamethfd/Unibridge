import './App.css';
import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from './Pages/HomePage';
import Register from './Pages/Register';
import Login from './Pages/Login';
import AuthCallback from './Pages/AuthCallback';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import Dashboard from './Pages/Dashboard_fixed';
import Profile from './Pages/Profile';
import UploadResource from './Pages/UploadResource';
import SubmitResource from './Pages/SubmitResource';
import ManageResources from './Pages/ManageResources';
import StructuredResources from './Pages/StructuredResources';
import ManageModules from './Pages/ManageModules';
import NoticePage from './Pages/NoticePage';
import YearPage from './Pages/YearPage';
import SemesterPage from './Pages/SemesterPage';
import ModulePage from './Pages/ModulePage';
import RequestFormPage from './Pages/RequestFormPage';
import CodeIgniterDashboard from './Pages/CodeIgniterDashboard';
import TutorManagement from './Pages/TutorManagement';
import Hpage from './Pages/Hpage';
import MyCoursePanel from './Components/MyCoursePanel';
import CreateNotice from './Components/NoticeManagement/CreateNotice';
import NoticeDetail from './Components/NoticeManagement/NoticeDetail';
import UserNoticeView from './Components/NoticeManagement/UserNoticeView';
import NoticeRequest from './Components/NoticeManagement/NoticeRequest';
import NoticeRequestList from './Components/NoticeManagement/NoticeRequestList';
import NoticeManagementDashboard from './Components/NoticeManagement/NoticeManagementDashboard';
import StudentDashboard from './Pages/StudentDashboard';
import TutorApplicationPage from './Pages/TutorApplicationPage';
import NoticeBoardPage from './Pages/NoticeBoardPage';
import FeedbackPage from './Pages/FeedbackPage';
import TutorDashboard from './Pages/TutorDashboard';
import CreateSessionPage from './Pages/CreateSessionPage';
import StudySessionsPage from './Pages/StudySessionsPage';
import TutorRatingPage from './Pages/TutorRatingPage';
import TutorMessagesPage from './Pages/TutorMessagesPage';
import CoordinatorDashboard from './Pages/CoordinatorDashboard';

const Header = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === 'admin') {
      return [
        { path: '/admin-dashboard', label: 'Admin Dashboard' },
        { path: '/manage-modules', label: 'Manage Modules' },
        { path: '/manage-resources', label: 'Manage Resources' },
        { path: '/notice-management', label: 'Notice Management' },
      ];
    }

    if (user.role === 'noticeManager') {
      return [
        { path: '/notice-management', label: 'Notice Management' },
        { path: '/user-notices', label: 'User Notices' },
      ];
    }

    if (user.role === 'coordinator') {
      return [
        { path: '/user-notices', label: 'Notices' },
      ];
    }

    if (user.role === 'resourceManager') {
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/manage-modules', label: 'Manage Modules' },
        { path: '/manage-resources', label: 'Manage Resources' },
        { path: '/resources', label: 'Resources' },
      ];
    }

    const baseLinks = [{ path: '/dashboard', label: 'Dashboard' }];

    if (user.role === 'student') {
      baseLinks.push({ path: '/tutor/study-sessions', label: 'Study Sessions' });
    }

    baseLinks.push(
      { path: '/resources', label: 'Resources' },
      { path: '/hpage', label: 'Courses' },
      { path: '/user-notices', label: 'Notices' }
    );

    return baseLinks;
  };

  const homePathByRole = {
    admin: '/admin-dashboard',
    noticeManager: '/notice-management',
    coordinator: '/coordinator',
  };
  const brandHomePath = homePathByRole[user?.role] || '/dashboard';

  const isActiveLink = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
          : 'bg-gradient-to-r from-primary-600 to-secondary-600'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to={brandHomePath} className="flex items-center group">
              <div className="h-12 w-[140px] flex items-center justify-start">
                <img
                  src="/Logof.png"
                  alt="Logo"
                  className="h-16 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                  style={{ transform: 'scale(1.35)', transformOrigin: 'left center' }}
                />
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex space-x-2">
              {getNavLinks().map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveLink(link.path)
                        ? scrolled
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-white/20 text-white'
                        : scrolled
                          ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                  scrolled ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    scrolled ? 'bg-primary-600 text-white' : 'bg-white/30 text-white'
                  }`}
                >
                  {user?.profile?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className={`text-sm font-medium ${scrolled ? 'text-gray-900' : 'text-white'}`}>{user?.profile?.firstName || 'User'}</div>
                  <div className={`text-xs ${scrolled ? 'text-gray-500' : 'text-white/70'}`}>{user?.role || 'student'}</div>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''} ${
                    scrolled ? 'text-gray-600' : 'text-white'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 transition-all duration-200 ${
                  isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className={`md:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className={`py-4 space-y-2 ${scrolled ? 'bg-white' : 'bg-gradient-to-r from-primary-600 to-secondary-600'}`}>
            {getNavLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActiveLink(link.path)
                    ? scrolled
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-white/20 text-white'
                    : scrolled
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

const ProtectedLayout = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        try {
          setUser(JSON.parse(decodeURIComponent(storedUser)));
        } catch {
          setUser(null);
        }
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/40 to-secondary-50/40">
      <Header user={user} onLogout={handleLogout} />
      <main className="pt-20 app-surface">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const isAuthenticated = !!token;

  let userRole = null;
  if (storedUser) {
    try {
      userRole = JSON.parse(storedUser).role;
    } catch {
      try {
        userRole = JSON.parse(decodeURIComponent(storedUser)).role;
      } catch {
        userRole = null;
      }
    }
  }

  const canManageNotices = isAuthenticated && (userRole === 'admin' || userRole === 'noticeManager');

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/years/:facultyId/:facultyName" element={<YearPage />} />
        <Route path="/semesters/:yearId/:yearName" element={<SemesterPage />} />
        <Route path="/modules/:semesterId/:semesterName" element={<ModulePage />} />
        <Route path="/request/:moduleId/:moduleName" element={<RequestFormPage />} />
        <Route path="/tutor-management" element={<TutorManagement />} />

        <Route path="/" element={<ProtectedLayout />}>
          <Route path="dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="hpage" element={isAuthenticated ? <Hpage /> : <Navigate to="/login" />} />
          <Route path="faculties" element={isAuthenticated ? <Hpage /> : <Navigate to="/login" />} />
          <Route path="profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="resources" element={isAuthenticated ? <StructuredResources /> : <Navigate to="/login" />} />
          <Route path="upload-resource" element={isAuthenticated ? <UploadResource /> : <Navigate to="/login" />} />
          <Route path="submit-resource" element={isAuthenticated ? <SubmitResource /> : <Navigate to="/login" />} />
          <Route path="manage-resources" element={isAuthenticated ? <ManageResources /> : <Navigate to="/login" />} />
          <Route path="manage-modules" element={isAuthenticated ? <ManageModules /> : <Navigate to="/login" />} />
          <Route path="codeigniter-dashboard" element={isAuthenticated ? <CodeIgniterDashboard /> : <Navigate to="/login" />} />
          <Route path="admin-dashboard" element={isAuthenticated && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/admin-login" />} />
          <Route path="notice-management" element={canManageNotices ? <NoticeManagementDashboard /> : <Navigate to="/login" />} />
          <Route path="notices" element={canManageNotices ? <NoticePage /> : <Navigate to="/login" />} />
          <Route path="user-notices" element={isAuthenticated ? <UserNoticeView /> : <Navigate to="/login" />} />
          <Route path="notices/:id" element={isAuthenticated ? <NoticeDetail /> : <Navigate to="/login" />} />
          <Route path="create-notice" element={canManageNotices ? <CreateNotice /> : <Navigate to="/login" />} />
          <Route path="notice-request" element={canManageNotices ? <NoticeRequest /> : <Navigate to="/login" />} />
          <Route path="notice-requests" element={canManageNotices ? <NoticeRequestList /> : <Navigate to="/login" />} />

          {/* Student routes */}
          <Route path="student" element={isAuthenticated ? <StudentDashboard /> : <Navigate to="/login" />} />
          <Route path="student/apply" element={isAuthenticated ? <TutorApplicationPage /> : <Navigate to="/login" />} />
          <Route path="student/noticeboard" element={isAuthenticated ? <NoticeBoardPage /> : <Navigate to="/login" />} />
          <Route path="student/feedback" element={isAuthenticated ? <FeedbackPage /> : <Navigate to="/login" />} />

          {/* Coordinator route */}
          <Route path="coordinator" element={isAuthenticated ? <CoordinatorDashboard /> : <Navigate to="/login" />} />

          {/* Tutor routes */}
          <Route path="tutor" element={isAuthenticated ? <TutorDashboard /> : <Navigate to="/login" />} />
          <Route path="tutor/create-session" element={isAuthenticated ? <CreateSessionPage /> : <Navigate to="/login" />} />
          <Route path="tutor/study-sessions" element={isAuthenticated ? <StudySessionsPage /> : <Navigate to="/login" />} />
          <Route path="tutor/ratings" element={isAuthenticated ? <TutorRatingPage /> : <Navigate to="/login" />} />
          <Route path="tutor/messages" element={isAuthenticated ? <TutorMessagesPage /> : <Navigate to="/login" />} />
        </Route>

        <Route
          path="/coordinator-dashboard"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={4000} theme="dark" />
      <MyCoursePanel />
    </>
  );
}

export default App;
