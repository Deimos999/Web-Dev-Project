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

  const fetchData = async (options = {}) => {
    try {
      setLoading(true);
      const [eventsData, categoriesData] = await Promise.all([
        eventService.getAllEvents(
          options.cacheBust ? { _ts: Date.now() } : undefined
        ),
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
        
        // Hard refresh list to ensure consistency and bust any cache
        console.log('[EventsPage] Refreshing events list (cache-bust)...');
        await fetchData({ cacheBust: true });
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
    <div className="container section space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-primary">Events</h1>
        {user?.role === 'ADMIN' && (
          <div className="text-sm px-4 py-2 rounded-lg border border-muted bg-card text-secondary">
            <span className="font-semibold" style={{color: 'var(--color-primary)'}}>Admin Mode:</span> You can manage all events
          </div>
        )}
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search events..." className="ds-input pl-10" />
        </div>
        <button type="submit" className="ds-btn ds-btn-primary">Search</button>
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
          <button key={category.id} onClick={() => handleCategoryFilter(category.id)} className={`ds-btn ${selectedCategory === category.id ? 'ds-btn-primary' : ''}`}>{category.name}</button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className={`ds-card flex flex-col ${deletingId === event.id ? 'opacity-50 pointer-events-none' : ''}`}>
              <div
                className="h-40 bg-cover bg-center relative"
                style={{
                  backgroundImage: `url(${
                    event.imageUrl ||
                    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'
                  })`,
                }}
              >
                <div className="absolute inset-0" style={{background: 'linear-gradient(90deg, rgba(249,115,22,0.35), rgba(245,158,11,0.18))'}}></div>
                {user?.role === 'ADMIN' && (
                  <div className="absolute top-2 right-2 text-white text-xs px-2 py-1 rounded" style={{backgroundColor: 'var(--color-error)'}}>
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
                  <h3 className="text-lg font-semibold text-primary flex-1">{event.title}</h3>
                  <span className="text-xs px-2 py-1 rounded" style={{backgroundColor: event.status === 'published' ? 'var(--color-success)' : 'var(--color-warning)', color: '#fff'}}>{event.status}</span>
                </div>
                <p className="text-secondary text-sm mb-4 flex-grow">
                  {event.description?.substring(0, 100)}...
                </p>
                <div className="space-y-2 text-sm text-secondary">
                  <p className="flex items-center gap-2">
                    <Calendar size={16} style={{color: 'var(--color-primary)'}} />
                    {new Date(event.startTime).toLocaleDateString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={16} style={{color: 'var(--color-primary)'}} />
                    {event.meetingLink || 'Online'}
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign size={16} style={{color: 'var(--color-primary)'}} />
                    $
                    {event.tickets?.length
                      ? Math.min(...event.tickets.map((t) => t.price))
                      : 0}
                  </p>
                  {user?.role === 'ADMIN' && (
                    <>
                      <p className="flex items-center gap-2">
                        <Users size={16} style={{color: 'var(--color-success)'}} />
                        {event.registrations?.length || 0} / {event.capacity} registered
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle size={16} style={{color: 'var(--color-success)'}} />
                        {event.registrations?.filter(r => r.checkedIn).length || 0} checked in
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 border-t border-muted flex flex-col gap-2">
                <Link to={`/events/${event.id}`} className="ds-btn ds-btn-primary text-center">View Details</Link>

                {canManageEvent(event) && (
                  <>
                    <Link to={`/events/${event.id}/edit`} className="ds-btn w-full">Edit Event</Link>
                    <button onClick={(e) => handleDelete(e, event.id, event.title)} disabled={deletingId === event.id} className="ds-btn w-full" style={{backgroundColor: 'var(--color-error)', color: '#fff'}}> {deletingId === event.id ? 'Deleting...' : 'Delete Event'}</button>
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