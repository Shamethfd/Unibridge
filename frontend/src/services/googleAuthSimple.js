// Simple Google OAuth redirect service
export const signInWithGoogle = () => {
  // For testing purposes, redirect to a mock Google OAuth flow
  // In production, this would be your actual Google OAuth endpoint
  
  const googleOAuthUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`;
  
  // Open Google OAuth in same window
  window.location.href = googleOAuthUrl;
  
  return {
    success: false,
    message: 'Redirecting to Google OAuth...'
  };
};
