import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import CreateEventPage from './pages/CreateEventPage.jsx';
import RegistrationsPage from './pages/RegistrationsPage.jsx';
import TicketsPage from './pages/TicketsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) setUser(JSON.parse(userData));
    } catch (error) {
      console.error('App initialization error:', error);
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div className="text-white text-xl">Loading...</div>;

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
              <Route path="/create-event" element={<PrivateRoute><CreateEventPage /></PrivateRoute>} />
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
