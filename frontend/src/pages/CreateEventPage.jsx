import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService.js';
import { categoryService } from '../services/categoryService.js';
import ErrorAlert from '../components/ErrorAlert.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

function CreateEventPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
        tickets: [{ price: Number(price) }],
      };

      const event = await eventService.createEvent(eventData);
      alert('Event created successfully!');
      navigate(`/events/${event.id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-800 rounded-lg border border-slate-700">
      <h1 className="text-3xl font-bold text-white mb-6">Create New Event</h1>
      <ErrorAlert message={error} onClose={() => setError('')} />
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600" required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600" rows={4} required />
        <input type="text" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="datetime-local" placeholder="Start Time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600" required />
          <input type="datetime-local" placeholder="End Time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600" required />
        </div>
        <input type="number" placeholder="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600" required />
        <input type="number" placeholder="Ticket Price" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600" required />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600" required>
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition">
          Create Event
        </button>
      </form>
    </div>
  );
}

export default CreateEventPage;
