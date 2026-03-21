import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState({
    totalResources: 0,
    totalModules: 0,
    recentActivity: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!token) { 
      navigate('/login'); 
      return; 
    }
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
        return;
      }
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock notices data
      const mockNotices = [
        {
          id: 1,
          title: "Welcome to UniBridge!",
          content: "Your academic resource management platform is now ready. Explore modules, submit resources, and collaborate with peers.",
          type: "info",
          date: new Date().toISOString(),
          priority: "high"
        },
        {
          id: 2,
          title: "New Module Available",
          content: "Advanced Web Development has been added to curriculum. Check out the latest resources and materials.",
          type: "success",
          date: new Date(Date.now() - 86400000).toISOString(),
          priority: "medium"
        },
        {
          id: 3,
          title: "System Maintenance",
          content: "Scheduled maintenance will occur this weekend from 2 AM to 4 AM. The platform may be temporarily unavailable.",
          type: "warning",
          date: new Date(Date.now() - 172800000).toISOString(),
          priority: "low"
        }
      ];

      // Mock stats
      const mockStats = {
        totalResources: 156,
        totalModules: 24,
        recentActivity: 12
      };

      setNotices(mockNotices);
      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getNoticeIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-amber-500 bg-amber-50';
      default: return 'border-l-green-500 bg-green-50';
    }
  };

  const getQuickActions = () => {
    const actions = [
      {
        title: "Browse Resources",
        description: "Explore available study materials",
        icon: "📚",
        link: "/resources",
        color: "bg-primary-500"
      },
      {
        title: "Submit Resource",
        description: "Share your study materials",
        icon: "📤",
        link: "/submit-resource",
        color: "bg-green-500"
      }
    ];

    if (user?.role === 'admin' || user?.role === 'resourceManager' || user?.role === 'coordinator') {
      actions.unshift(
        {
          title: "Manage Modules",
          description: "Create and edit course modules",
          icon: "⚙️",
          link: "/manage-modules",
          color: "bg-amber-500"
        },
        {
          title: "Manage Resources",
          description: "Review and moderate submissions",
          icon: "📁",
          link: "/manage-resources",
          color: "bg-secondary-500"
        }
      );
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-sage-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sage-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer position="top-right" />

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Welcome back, {user?.profile?.firstName || 'Student'}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Here's what's happening in your academic journey today
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {user?.profile?.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </h3>
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm rounded-full font-medium">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              📖
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalResources}</h3>
              <p className="text-gray-600 font-medium">Total Resources</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
              📚
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalModules}</h3>
              <p className="text-gray-600 font-medium">Available Modules</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
              🔥
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{stats.recentActivity}</h3>
              <p className="text-gray-600 font-medium">Recent Activities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Notices Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              📢 Notices & Announcements
            </h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {notices.map((notice) => (
              <div key={notice.id} className={`p-4 rounded-xl border-l-4 transition-all hover:translate-x-1 hover:shadow-md ${getPriorityClass(notice.priority)}`}>
                <div className="flex items-start gap-3">
                  <span className="text-xl">{getNoticeIcon(notice.type)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{notice.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{notice.content}</p>
                    <span className="text-xs text-gray-500">{formatDate(notice.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-bold text-gray-900">🚀 Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {getQuickActions().map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group p-6 bg-gray-50 rounded-xl border-2 border-transparent hover:border-primary-200 hover:bg-white hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-center mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm text-center">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">📈 Recent Activity</h2>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
              📤
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                New resource uploaded: <strong>JavaScript Fundamentals</strong>
              </p>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">
              📚
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                New module created: <strong>Machine Learning Basics</strong>
              </p>
              <span className="text-sm text-gray-500">5 hours ago</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
              👤
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                New user joined: <strong>John Doe</strong>
              </p>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
