import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventService } from '../services/eventService.js';
import { categoryService } from '../services/categoryService.js';
import ErrorAlert from '../components/ErrorAlert.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function EditEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const [event, cats] = await Promise.all([
          eventService.getEventById(id),
          categoryService.getAllCategories(),
        ]);

        setCategories(cats);
        setTitle(event.title || '');
        setDescription(event.description || '');
        setImageUrl(event.imageUrl || '');
        setStartTime(event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '');
        setEndTime(event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '');
        setCapacity(event.capacity?.toString() || '');
        setCategoryId(event.categoryId || '');

        const minTicketPrice =
          event.tickets && event.tickets.length
            ? Math.min(...event.tickets.map((t) => t.price))
            : 0;
        setPrice(minTicketPrice.toString());
      } catch (err) {
        console.error('Failed to load event for editing', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load event for editing'
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (!categoryId) throw new Error('Category is required');

      const eventData = {
        title,
        description,
        imageUrl,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        capacity: Number(capacity),
        categoryId,
        // For now we only update a single ticket price similar to create page
        tickets: [{ price: Number(price) }],
      };

      const updated = await eventService.updateEvent(id, eventData);
      alert('Event updated successfully!');
      navigate(`/events/${updated.id}`);
    } catch (err) {
      console.error('Failed to update event', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update event'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-800 rounded-lg border border-slate-700">
      <h1 className="text-3xl font-bold text-white mb-6">Edit Event</h1>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
          rows={4}
          required
        />
        <input
          type="text"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="datetime-local"
            placeholder="Start Time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
            required
          />
          <input
            type="datetime-local"
            placeholder="End Time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
            required
          />
        </div>
        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
          required
        />
        <input
          type="number"
          placeholder="Ticket Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
          required
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

export default EditEventPage;


