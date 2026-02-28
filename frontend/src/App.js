import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './Pages/HomePage';
import Register from './Pages/Register';
import Login from './Pages/Login';
import AdminLogin from './Pages/AdminLogin';
import AdminDashboard from './Pages/AdminDashboard';
import Dashboard from './Pages/Dashboard';
import ResourceList from './Pages/ResourceList';
import UploadResource from './Pages/UploadResource';
import SubmitResource from './Pages/SubmitResource';
import ManageResources from './Pages/ManageResources';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!token);
    if (user) {
      setUserRole(JSON.parse(user).role);
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      
      {/* Admin Dashboard - Protected Route */}
      <Route 
        path="/admin-dashboard" 
        element={isAuthenticated && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/admin-login" />} 
      />
      
      {/* Regular Dashboard - Protected Route */}
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/resources" 
        element={isAuthenticated ? <ResourceList /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/upload-resource" 
        element={isAuthenticated ? <UploadResource /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/submit-resource" 
        element={isAuthenticated ? <SubmitResource /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/manage-resources" 
        element={isAuthenticated ? <ManageResources /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}

export default App;
