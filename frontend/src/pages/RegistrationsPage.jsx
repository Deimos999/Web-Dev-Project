import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Trash2, Eye } from 'lucide-react';
import { registrationService } from '../services/registrationService';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';

function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await registrationService.getUserRegistrations();
      console.log('Registrations loaded:', data);
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load registrations';
      setError(errorMsg);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRegistration = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    setCancelingId(id);
    try {
      await registrationService.cancelRegistration(id);
      setRegistrations(registrations.filter((reg) => reg.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">My Registrations</h1>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {registrations.length > 0 ? (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:border-blue-500 transition"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {registration.event?.title || 'Event'}
                  </h3>
                  <div className="space-y-2 text-slate-300 text-sm">
                    <p className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-400" />
                      {registration.event?.startTime ? new Date(registration.event.startTime).toLocaleDateString() : 'Date TBA'}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-blue-400" />
                      {registration.event?.meetingLink || registration.event?.location || 'Online'}
                    </p>
                    <p className="flex items-center gap-2">
                      <DollarSign size={16} className="text-blue-400" />
                      ${registration.ticket?.price || 0}
                    </p>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block px-3 py-1 bg-green-900 text-green-200 rounded-full text-xs font-semibold">
                      Registered on {registration.registeredAt ? new Date(registration.registeredAt).toLocaleDateString() : 'Date TBA'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      registration.status === 'confirmed' ? 'bg-blue-900 text-blue-200' : 'bg-yellow-900 text-yellow-200'
                    }`}>
                      Status: {registration.status || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/events/${registration.eventId}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                  >
                    <Eye size={18} /> View Event
                  </Link>
                  <button
                    onClick={() => handleCancelRegistration(registration.id)}
                    disabled={cancelingId === registration.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition"
                  >
                    <Trash2 size={18} /> {cancelingId === registration.id ? 'Canceling...' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-lg mb-4">No registrations yet</p>
          {error && (
            <p className="text-red-400 text-sm mb-4">Error: {error}</p>
          )}
          <div className="flex gap-4 justify-center">
            <Link
              to="/events"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Browse Events
            </Link>
            <button
              onClick={fetchRegistrations}
              className="inline-block px-6 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-semibold transition"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrationsPage;