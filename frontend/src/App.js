import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import HomePage from './Pages/HomePage';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import ResourceList from './Pages/ResourceList';
import UploadResource from './Pages/UploadResource';
import SubmitResource from './Pages/SubmitResource';
import ManageResources from './Pages/ManageResources';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
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
