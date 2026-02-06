import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';

function EventProposalsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/events', { replace: true });
      return;
    }

    const loadProposals = async () => {
      try {
        setLoading(true);
        const data = await eventService.getProposals();
        setProposals(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load event proposals');
      } finally {
        setLoading(false);
      }
    };

    loadProposals();
  }, [user, navigate]);

  const refreshProposals = async () => {
    try {
      const data = await eventService.getProposals();
      setProposals(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to refresh event proposals');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this event proposal? This will create a live event visible on the Events page.')) {
      return;
    }

    try {
      setProcessingId(id);
      await eventService.approveProposal(id);
      await refreshProposals();
      alert('Event proposal approved and published.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to approve proposal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Optional: Provide a reason for rejection (shown to organizer):');

    if (!window.confirm('Are you sure you want to reject this proposal?')) {
      return;
    }

    try {
      setProcessingId(id);
      await eventService.rejectProposal(id, reason || '');
      await refreshProposals();
      alert('Event proposal rejected.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reject proposal');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Event Approvals</h1>
        <p className="text-slate-400 text-sm">
          Review and approve or reject event proposals submitted by organizers.
        </p>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {proposals.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          No event proposals awaiting review.
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex flex-col md:flex-row gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold text-white">{proposal.title}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      proposal.status === 'PENDING'
                        ? 'bg-yellow-600 text-white'
                        : proposal.status === 'APPROVED'
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {proposal.status}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{proposal.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-300 mt-2">
                  <div>
                    <span className="font-semibold">Organizer:</span>{' '}
                    {proposal.organizer?.name || proposal.organizer?.email}
                  </div>
                  <div>
                    <span className="font-semibold">Category:</span>{' '}
                    {proposal.category?.name || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Capacity:</span> {proposal.capacity}
                  </div>
                  <div>
                    <span className="font-semibold">Ticket Price:</span> ${proposal.ticketPrice}
                  </div>
                  <div>
                    <span className="font-semibold">Start:</span>{' '}
                    {new Date(proposal.startTime).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-semibold">End:</span>{' '}
                    {new Date(proposal.endTime).toLocaleString()}
                  </div>
                </div>
                {proposal.rejectionReason && (
                  <p className="text-xs text-red-400 mt-2">
                    Rejection reason: {proposal.rejectionReason}
                  </p>
                )}
              </div>
              <div className="flex md:flex-col gap-2 items-stretch md:items-end">
                <button
                  onClick={() => handleApprove(proposal.id)}
                  disabled={processingId === proposal.id || proposal.status !== 'PENDING'}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition w-full md:w-auto"
                >
                  {processingId === proposal.id ? 'Processing...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleReject(proposal.id)}
                  disabled={processingId === proposal.id || proposal.status !== 'PENDING'}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition w-full md:w-auto"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventProposalsPage;



