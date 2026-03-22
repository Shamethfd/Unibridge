import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');

    if (token && user) {
      try {
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', user);
        
        const userData = JSON.parse(decodeURIComponent(user));
        
        toast.success('Google login successful!');
        
        // Redirect based on user role
        setTimeout(() => {
          switch (userData.role) {
            case 'admin':
              navigate('/admin-dashboard');
              break;
            case 'resourceManager':
              navigate('/manage-resources');
              break;
            case 'coordinator':
              navigate('/dashboard');
              break;
            default:
              navigate('/dashboard');
              break;
          }
        }, 1500);
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Login failed. Please try again.');
        navigate('/login');
      }
    } else {
      // Handle error case
      const error = searchParams.get('error');
      if (error) {
        toast.error('Google login failed. Please try again.');
      } else {
        toast.error('Invalid authentication response.');
      }
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f4f8',
      fontFamily: 'DM Sans, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Completing Authentication...
        </h2>
        <p style={{
          color: '#64748b',
          fontSize: '0.9rem'
        }}>
          Please wait while we sign you in.
        </p>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;
