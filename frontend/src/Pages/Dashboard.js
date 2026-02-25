import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: ''
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
      setUser(JSON.parse(storedUser));
      const userData = JSON.parse(storedUser);
      setProfileData({
        firstName: userData.profile?.firstName || '',
        lastName: userData.profile?.lastName || '',
        phone: userData.profile?.phone || '',
        bio: userData.profile?.bio || ''
      });
    }

    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUser(response.data.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setProfileData({
          firstName: response.data.data.user.profile?.firstName || '',
          lastName: response.data.data.user.profile?.lastName || '',
          phone: response.data.data.user.profile?.phone || '',
          bio: response.data.data.user.profile?.bio || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        setUser(response.data.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        setEditMode(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />
      
      {/* Navigation Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">LearnBridge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/resources"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Resources
              </Link>
              <Link
                to="/upload-resource"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Upload Resource
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Profile Section */}
            <div className="lg:col-span-1">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile</h3>
                  
                  {editMode ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleProfileChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleProfileChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                          name="bio"
                          rows={3}
                          value={profileData.bio}
                          onChange={handleProfileChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Name</p>
                          <p className="text-sm text-gray-900">
                            {user?.profile?.firstName} {user?.profile?.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Username</p>
                          <p className="text-sm text-gray-900">@{user?.username}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-sm text-gray-900">{user?.email}</p>
                        </div>
                        {user?.profile?.phone && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Phone</p>
                            <p className="text-sm text-gray-900">{user.profile.phone}</p>
                          </div>
                        )}
                        {user?.profile?.bio && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Bio</p>
                            <p className="text-sm text-gray-900">{user.profile.bio}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-500">Role</p>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditMode(true)}
                        className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Welcome to LearnBridge!</h3>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        to="/resources"
                        className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Browse Resources</h4>
                        <p className="text-gray-600 text-sm">
                          Access and download learning materials shared by the community.
                        </p>
                      </Link>
                      
                      <Link
                        to="/upload-resource"
                        className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Resource</h4>
                        <p className="text-gray-600 text-sm">
                          Share your learning materials with other students.
                        </p>
                      </Link>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-indigo-600">0</p>
                          <p className="text-sm text-gray-600">Resources Uploaded</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">0</p>
                          <p className="text-sm text-gray-600">Downloads</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">0</p>
                          <p className="text-sm text-gray-600">Resources Viewed</p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
                      <div className="text-center py-8 text-gray-500">
                        <p>No recent activity</p>
                        <p className="text-sm mt-2">Start by browsing resources or uploading your first resource!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
