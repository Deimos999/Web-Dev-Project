import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Search, Users, CheckCircle } from 'lucide-react';
import { eventService } from '../services/eventService';
import { categoryService } from '../services/categoryService';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { AuthContext } from '../context/AuthContext';

const EventsPage = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsData, categoriesData] = await Promise.all([
        eventService.getAllEvents(),
        categoryService.getAllCategories(),
      ]);
      console.log('[EventsPage] Loaded events:', eventsData.length);
      setEvents(eventsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('[EventsPage] Error loading data:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await eventService.searchEvents(searchQuery);
      setEvents(data);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId);
    try {
      setLoading(true);
      const data = categoryId
        ? await eventService.getEventsByCategory(categoryId)
        : await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError('Filter failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, eventId, eventTitle) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${eventTitle}"?\n\nThis will permanently delete:\n- The event\n- All tickets\n- All registrations\n\nThis action cannot be undone.`)) {
      return;
    }

    console.log(`[EventsPage] Starting delete for event: ${eventId}`);
    setDeletingId(eventId);
    setError(''); // Clear any previous errors

    try {
      const response = await eventService.deleteEvent(eventId);
      console.log('[EventsPage] Delete response:', response);
      
      if (response.success || response.message) {
        // Remove the event from state immediately
        setEvents((prevEvents) => {
          const newEvents = prevEvents.filter((event) => event.id !== eventId);
          console.log(`[EventsPage] Updated events list. Remaining: ${newEvents.length}`);
          return newEvents;
        });
        
        // Show success message
        alert('✅ Event deleted successfully!');
        
        // Optionally refresh the entire list to ensure sync
        setTimeout(() => {
          console.log('[EventsPage] Refreshing events list...');
          fetchData();
        }, 500);
      } else {
        throw new Error('Delete operation did not return success');
      }
    } catch (err) {
      console.error('[EventsPage] Delete error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete event';
      setError(errorMessage);
      alert(`❌ Failed to delete event: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  const canManageEvent = (event) => {
    // Admin can manage all events, Organizer can manage their own
    return user?.role === 'ADMIN' || user?.id === event.organizerId;
  };

  if (loading && !events.length) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">Events</h1>
        {user?.role === 'ADMIN' && (
          <div className="text-sm text-slate-400 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <span className="text-blue-400 font-semibold">Admin Mode:</span> You can manage all events
          </div>
        )}
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Search
        </button>
      </form>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => handleCategoryFilter('')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition ${
            !selectedCategory
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          All Events
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryFilter(category.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className={`bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden flex flex-col ${
                deletingId === event.id ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div
                className="h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${event.imageUrl || ''})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50"></div>
                {user?.role === 'ADMIN' && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                    ADMIN
                  </div>
                )}
                {deletingId === event.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white font-semibold">Deleting...</div>
                  </div>
                )}
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white flex-1">{event.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    event.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'
                  }`}>
                    {event.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4 flex-grow">
                  {event.description?.substring(0, 100)}...
                </p>
                <div className="space-y-2 text-sm text-slate-300">
                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-400" />
                    {new Date(event.startTime).toLocaleDateString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-400" />
                    {event.meetingLink || 'Online'}
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign size={16} className="text-blue-400" />
                    $
                    {event.tickets?.length
                      ? Math.min(...event.tickets.map((t) => t.price))
                      : 0}
                  </p>
                  {user?.role === 'ADMIN' && (
                    <>
                      <p className="flex items-center gap-2">
                        <Users size={16} className="text-green-400" />
                        {event.registrations?.length || 0} / {event.capacity} registered
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-400" />
                        {event.registrations?.filter(r => r.checkedIn).length || 0} checked in
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 border-t border-slate-700 flex flex-col gap-2">
                <Link
                  to={`/events/${event.id}`}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition"
                >
                  View Details
                </Link>

                {canManageEvent(event) && (
                  <>
                    <Link
                      to={`/events/${event.id}/edit`}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-center transition"
                    >
                      Edit Event
                    </Link>
                    <button
                      onClick={(e) => handleDelete(e, event.id, event.title)}
                      disabled={deletingId === event.id}
                      className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === event.id ? 'Deleting...' : 'Delete Event'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 text-lg">No events found</p>
        </div>
      )}
    </div>
  );
};

export default EventsPage;