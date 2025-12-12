import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import RegistrationsPage from './pages/RegistrationsPage';
import TicketsPage from './pages/TicketsPage';
import SettingsPage from './pages/SettingsPage';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    try {
      console.log('App mounting...');
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      console.log('Token:', token);
      console.log('User data:', userData);
      
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
      setDebugInfo('App initialized successfully');
    } catch (error) {
      console.error('App initialization error:', error);
      setDebugInfo(`Error: ${error.message}`);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <AuthContext.Provider value={{ user, setUser, logout }}>
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
          <Navbar user={user} onLogout={logout} />
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomePage user={user} />} />
              <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/registrations" element={<PrivateRoute><RegistrationsPage /></PrivateRoute>} />
              <Route path="/tickets" element={<PrivateRoute><TicketsPage /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthContext.Provider>
    </Router>
  );
}

export default App;