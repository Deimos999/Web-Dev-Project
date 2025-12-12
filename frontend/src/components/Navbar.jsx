import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, Menu, X, Home, LogIn, UserPlus, Settings, PlusCircle } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
    setMobileMenuOpen(false);
  };
  // Only users whose email starts with "organizer" can create events
  const isOrganizer = !!(user && user.email && user.email.toLowerCase().startsWith('organizer'));


  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-blue-400 hover:text-blue-300 transition"
          >
            <Calendar size={28} />
            EventHub
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition text-slate-300 hover:text-white"
            >
              <Home size={18} /> Home
            </Link>
            <Link
              to="/events"
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition text-slate-300 hover:text-white"
            >
              <Calendar size={18} /> Events
            </Link>

            {/* Create Event Button - only for organizer emails */}
            {isOrganizer && (
              <Link
                to="/create-event"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
              >
                <PlusCircle size={18} /> Create Event
              </Link>
            )}

            {user && (
              <>
                <Link
                  to="/registrations"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition text-slate-300 hover:text-white"
                >
                  My Registrations
                </Link>
                <Link
                  to="/tickets"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition text-slate-300 hover:text-white"
                >
                  Tickets
                </Link>
              </>
            )}

            <div className="flex items-center gap-3 pl-6 border-l border-slate-700">
              {user ? (
                <>
                  <span className="text-slate-300 text-sm">{user.email}</span>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-700 transition text-slate-300 hover:text-white"
                  >
                    <Settings size={18} />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
                  >
                    <LogIn size={18} /> Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition"
                  >
                    <UserPlus size={18} /> Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-slate-700">
            <Link
              to="/"
              className="block px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/events"
              className="block px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>

            {/* Mobile Create Event Button */}
            {isOrganizer && (
              <Link
                to="/create-event"
                className="block px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Event
              </Link>
            )}

            {user && (
              <>
                <Link
                  to="/registrations"
                  className="block px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Registrations
                </Link>
                <Link
                  to="/tickets"
                  className="block px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tickets
                </Link>
                <Link
                  to="/settings"
                  className="block px-3 py-2 rounded-lg hover:bg-slate-700 text-slate-300 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
              </>
            )}
            <div className="pt-2 border-t border-slate-700 space-y-2">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-lg hover:bg-slate-700 text-blue-400 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-lg hover:bg-slate-700 text-green-400 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 text-red-400 transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
