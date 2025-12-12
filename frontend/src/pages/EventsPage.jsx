import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Search } from 'lucide-react';
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
      setEvents(eventsData);
      setCategories(categoriesData);
    } catch (err) {
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

  const handleDelete = async (e, eventId) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventService.deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      alert('Event deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete event');
    }
  };

  if (loading && !events.length) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">Events</h1>

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
              className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden flex flex-col"
            >
              <div
                className="h-40 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${event.imageUrl || ''})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50"></div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
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
                </div>
              </div>
              <div className="px-6 pb-6 pt-2 border-t border-slate-700 flex flex-col gap-2">
                <Link
                  to={`/events/${event.id}`}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition"
                >
                  View Details
                </Link>

                {(user?.role === 'ADMIN' || user?.id === event.organizerId) && (
                  <button
                    onClick={(e) => handleDelete(e, event.id)}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                  >
                    Delete
                  </button>
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
