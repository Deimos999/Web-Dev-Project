import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Users, ArrowLeft, Share2, Link2 } from 'lucide-react';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { useAuth } from '../hooks/useAuth';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);

  const minTicketPrice = useMemo(() => {
    if (!event?.tickets || event.tickets.length === 0) return 0;
    return Math.min(...event.tickets.map((t) => parseFloat(t.price)));
  }, [event]);

  useEffect(() => {
    fetchEventDetails();
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventById(id);
      setEvent(data);
      setAttendeeCount(data.registrations?.length || 0);
      
      // Check if user is already registered
      if (user) {
        try {
          const userRegistrations = await registrationService.getUserRegistrations();
          const isRegistered = userRegistrations.some(
            (reg) => reg.eventId === id && reg.status === 'confirmed'
          );
          setRegistered(isRegistered);
        } catch (err) {
          // Silently fail - not critical
          console.warn('Could not check registration status:', err);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    setError('');

    try {
      await registrationService.registerForEvent(id);
      setRegistered(true);
      setAttendeeCount((prev) => prev + 1);
      alert('Successfully registered for this event!');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Registration failed. Please check your wallet balance if this is a paid event.'
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = (platform) => {
    if (!event) return;
    const url = window.location.href;
    const text = `Check out this event: ${event.title}`;
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
      case 'copy':
        navigator.clipboard
          .writeText(url)
          .then(() => {
            alert('Link copied to clipboard!');
          })
          .catch(() => {
            setError('Failed to copy link. Please copy it manually from the address bar.');
          });
        return;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) return <LoadingSpinner />;

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400 text-lg">Event not found</p>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 text-blue-400 hover:underline"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/events')}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition"
      >
        <ArrowLeft size={20} />
        Back to Events
      </button>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Header Image */}
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg h-96 flex items-center justify-center bg-cover bg-center relative"
            style={{
              backgroundImage: `url(${
                event.imageUrl ||
                'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'
              })`,
            }}
          >
            <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
            <div className="text-center text-white relative z-10">
              <Calendar size={64} className="mx-auto mb-4" />
              <h1 className="text-4xl font-bold">{event.title}</h1>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Event Details</h2>
            <div className="space-y-4 text-slate-300">
              <p className="flex items-start gap-3">
                <Calendar className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                <span>
                  <strong>Date:</strong> {new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString()}
                </span>
              </p>
              <p className="flex items-start gap-3">
                <MapPin className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                <span>
                  <strong>Location:</strong> {event.meetingLink || 'Online Event'}
                </span>
              </p>
              <p className="flex items-start gap-3">
                <Users className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                <span>
                  <strong>Attendees:</strong> {attendeeCount} / {event.capacity || 'Unlimited'}
                </span>
              </p>
              <p className="flex items-start gap-3">
                <DollarSign className="text-blue-400 mt-1 flex-shrink-0" size={20} />
                <span>
                  <strong>Price:</strong> ${minTicketPrice}
                </span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
            <p className="text-slate-300 leading-relaxed">{event.description}</p>
          </div>

          {event.agenda && (
            <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Agenda</h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {event.agenda}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 sticky top-24">
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-2">Price per ticket</p>
              <p className="text-4xl font-bold text-white">${minTicketPrice}</p>
            </div>

            {registered ? (
              <div className="bg-green-900 border border-green-700 rounded-lg p-4 text-green-200 text-center font-semibold">
                ✓ You're registered for this event
              </div>
            ) : event && new Date(event.startTime) <= new Date() ? (
              <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 text-slate-300 text-center font-semibold">
                Event has already started
              </div>
            ) : event && event.status !== 'published' ? (
              <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 text-yellow-200 text-center font-semibold">
                Event not yet published
              </div>
            ) : event && attendeeCount >= event.capacity ? (
              <div className="bg-red-900 border border-red-700 rounded-lg p-4 text-red-200 text-center font-semibold">
                Event is full
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering || !user}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition mb-4"
              >
                {registering ? 'Processing...' : !user ? 'Login to Register' : 'Register & Pay'}
              </button>
            )}

            <div className="space-y-3 text-sm text-slate-400 pt-6 border-t border-slate-700">
              <p>✓ Digital ticket via email</p>
              <p>✓ Instant confirmation</p>
              <p>✓ No hidden fees</p>
            </div>

            {/* Share section */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-400 text-sm mb-3 flex items-center gap-2">
                <Share2 size={16} className="text-blue-400" />
                Share this event
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleShare('twitter')}
                  className="px-3 py-1 text-xs bg-sky-600 hover:bg-sky-700 text-white rounded-full font-semibold transition"
                >
                  Twitter / X
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="px-3 py-1 text-xs bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold transition"
                >
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition"
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-full font-semibold transition flex items-center gap-1"
                >
                  <Link2 size={14} />
                  Copy Link
                </button>
              </div>
            </div>
          </div>

          {/* Event Info Card */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Event Info</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <p>
                <strong className="text-slate-300">Status:</strong>{' '}
                {new Date(event.startTime) > new Date() ? 'Upcoming' : 'Past'}
              </p>
              <p>
                <strong className="text-slate-300">Category:</strong> {event.category?.name || 'General'}
              </p>
              <p>
                <strong className="text-slate-300">Organizer:</strong> {event.organizer?.name || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;