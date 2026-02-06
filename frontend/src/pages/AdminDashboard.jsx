import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { eventService } from '../services/eventService';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    activeEvents: 0,
  });

  useEffect(() => {
    // Redirect if not admin
    if (user?.role !== 'ADMIN') {
      window.location.href = '/events';
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async (options = {}) => {
    try {
      setLoading(true);
      const eventsData = await eventService.getAllEvents({
        limit: 100,
        // cache buster to ensure we never see a stale event after delete
        ...(options.cacheBust ? { _ts: Date.now() } : {}),
      });
      setEvents(eventsData);

      // Calculate stats
      const totalRegistrations = eventsData.reduce(
        (sum, event) => sum + (event.registrations?.length || 0),
        0
      );
      const totalRevenue = eventsData.reduce((sum, event) => {
        const eventRevenue = event.registrations?.reduce((regSum, reg) => {
          const ticket = event.tickets?.find(t => t.id === reg.ticketId);
          return regSum + (ticket?.price || 0);
        }, 0) || 0;
        return sum + eventRevenue;
      }, 0);
      const activeEvents = eventsData.filter(
        (e) => e.status === 'published' && new Date(e.endTime) > new Date()
      ).length;

      setStats({
        totalEvents: eventsData.length,
        totalRegistrations,
        totalRevenue,
        activeEvents,
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await eventService.deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      alert('Event deleted successfully');
      await fetchDashboardData({ cacheBust: true }); // Refresh stats with cache bust
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete event');
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    if (event.status !== 'published') return 'draft';
    if (now > end) return 'ended';
    if (now >= start && now <= end) return 'ongoing';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ongoing': return 'bg-green-600';
      case 'upcoming': return 'bg-blue-600';
      case 'ended': return 'bg-gray-600';
      case 'draft': return 'bg-yellow-600';
      default: return 'bg-slate-600';
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
        <Link
          to="/events/create"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Create Event
        </Link>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Events</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalEvents}</p>
            </div>
            <Calendar className="text-blue-400" size={40} />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Events</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.activeEvents}</p>
            </div>
            <TrendingUp className="text-green-400" size={40} />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Registrations</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.totalRegistrations}</p>
            </div>
            <Users className="text-purple-400" size={40} />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-1">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="text-yellow-400" size={40} />
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">All Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                  Organizer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                  Registrations
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                  Checked In
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {events.map((event) => {
                const status = getEventStatus(event);
                const checkedIn = event.registrations?.filter(r => r.checkedIn).length || 0;
                const totalReg = event.registrations?.length || 0;

                return (
                  <tr key={event.id} className="hover:bg-slate-750">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-semibold">{event.title}</p>
                        <p className="text-slate-400 text-sm">{event.category?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {event.organizer?.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(event.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        {totalReg} / {event.capacity}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-400" />
                        {checkedIn} / {totalReg}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/events/${event.id}`}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/events/${event.id}/edit`}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
                          title="Edit Event"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-400 text-lg">No events found</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;