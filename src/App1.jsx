
// src/App1.jsx
import React, { useState, useEffect } from 'react';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';
import AICourseBuilder from './App';

const MainApp = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authView, setAuthView] = useState('login');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('currentUser');
        
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      } finally {
        // ✅ Always set loading to false
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // ✅ Empty dependency array - runs once on mount

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleRegister = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    setAuthView('login');
  };

  // ✅ Show loading spinner with timeout protection
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Render authentication or main app
  if (!user) {
    switch (authView) {
      case 'register':
        return <RegisterPage onRegister={handleRegister} onShowLogin={() => setAuthView('login')} />;
      case 'forgot-password':
        return <ForgotPasswordPage onBackToLogin={() => setAuthView('login')} />;
      default:
        return (
          <LoginPage 
            onLogin={handleLogin} 
            onShowRegister={() => setAuthView('register')}
            onShowForgotPassword={() => setAuthView('forgot-password')}
          />
        );
    }
  }

  return <AICourseBuilder user={user} onLogout={handleLogout} />;
};

export default MainApp;
