import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Download, Send } from 'lucide-react';
import { ticketService } from '../services/ticketService';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [resendingId, setResendingId] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getUserTickets();
      setTickets(data);
    } catch (err) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (ticketId) => {
    setDownloadingId(ticketId);
    try {
      const blob = await ticketService.downloadTicket(ticketId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download ticket');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleResendTicket = async (ticketId) => {
    setResendingId(ticketId);
    try {
      await ticketService.resendTicket(ticketId);
      alert('Ticket has been resent to your email');
    } catch (err) {
      setError('Failed to resend ticket');
    } finally {
      setResendingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">My Tickets</h1>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden hover:border-blue-500 transition"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <h3 className="text-xl font-bold">{ticket.event?.title || 'Event Ticket'}</h3>
                <p className="text-blue-100 text-sm mt-1">Code: {ticket.ticketCode}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-2 text-slate-300 text-sm">
                  <p className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-400" />
                    {ticket.event?.startTime ? new Date(ticket.event.startTime).toLocaleDateString() : 'Date TBA'}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-blue-400" />
                    {ticket.event?.meetingLink || 'Online Event'}
                  </p>
                </div>

                <div className="py-4 border-t border-b border-slate-700">
                  <p className="text-slate-400 text-sm mb-2">Status</p>
                  <p className="text-white font-semibold capitalize">
                    {ticket.status || 'Confirmed'}
                  </p>
                </div>

                {ticket.qrCodeUrl && (
                  <div className="p-4 bg-slate-700 rounded-lg flex items-center justify-center">
                    <div className="bg-white p-2 rounded">
                      <img
                        src={ticket.qrCodeUrl}
                        alt="QR Code"
                        className="w-24 h-24"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs text-slate-400">
                  <p>Ticket Type: {ticket.ticket?.name || 'Standard'}</p>
                  <p>Price: ${ticket.ticket?.price || '0'}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={true}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-slate-400 rounded-lg font-semibold cursor-not-allowed"
                    title="Download coming soon"
                  >
                    <Download size={18} />
                    Download
                  </button>
                  <button
                    disabled={true}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-slate-400 rounded-lg font-semibold cursor-not-allowed"
                    title="Resend coming soon"
                  >
                    <Send size={18} />
                    Resend
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-lg">No tickets yet</p>
          <p className="text-slate-500 text-sm mt-2">Register for an event to get your ticket</p>
        </div>
      )}
    </div>
  );
}

export default TicketsPage;