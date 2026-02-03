import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogOut, Wallet, ArrowUpRight, Clock } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';
import { walletService } from '../services/walletService';
import { registrationService } from '../services/registrationService';

function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [walletLoading, setWalletLoading] = useState(false);
  const [walletData, setWalletData] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const [registrations, setRegistrations] = useState([]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const loadWallet = async () => {
      if (activeTab !== 'wallet') return;
      setWalletLoading(true);
      setError('');
      try {
        const data = await walletService.getMyWallet();
        setWalletData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load wallet');
      } finally {
        setWalletLoading(false);
      }
    };

    loadWallet();
  }, [activeTab]);

  useEffect(() => {
    const loadHistory = async () => {
      if (activeTab !== 'history') return;
      setHistoryLoading(true);
      setError('');
      try {
        const data = await registrationService.getUserRegistrations();
        setRegistrations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load registration history', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load registration history'
        );
        setRegistrations([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [activeTab]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await authService.updateProfile(profileData);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setSuccessMessage('Password changed successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const amountNumber = parseFloat(topUpAmount);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setError('Please enter a valid top-up amount greater than 0');
      return;
    }

    setWalletLoading(true);
    try {
      const updatedWallet = await walletService.topUp(amountNumber);
      setWalletData(updatedWallet);
      setTopUpAmount('');
      setSuccessMessage('Wallet topped up successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to top up wallet');
    } finally {
      setWalletLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-white">Settings</h1>

      {error && <ErrorAlert message={error} onClose={() => setError('')} />}
      {successMessage && (
        <div className="p-4 bg-green-900 border border-green-700 rounded-lg text-green-200">
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'profile'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <User size={18} />
            Profile
          </div>
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'password'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lock size={18} />
            Password
          </div>
        </button>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'wallet'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wallet size={18} />
            Wallet
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-semibold border-b-2 transition ${
            activeTab === 'history'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={18} />
            History
          </div>
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 max-w-2xl">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
              />
              <p className="text-slate-500 text-sm mt-2">
                Email cannot be changed. Contact support for assistance.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 max-w-2xl">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 max-w-2xl space-y-8">
          {walletLoading && !walletData ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">My Wallet</h2>
                  <p className="text-slate-400 text-sm">
                    Add funds to your wallet and use them to pay for event registrations instantly.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm mb-1">Current Balance</p>
                  <p className="text-3xl font-bold text-green-400">
                    ${walletData?.balance?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleTopUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm font-semibold mb-2">
                    Top-up Amount (USD)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                      placeholder="Enter amount"
                    />
                    <button
                      type="submit"
                      disabled={walletLoading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-semibold transition flex items-center gap-2"
                    >
                      <ArrowUpRight size={18} />
                      {walletLoading ? 'Processing...' : 'Top Up'}
                    </button>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    Demo mode: funds are added instantly without real payment processing.
                  </p>
                </div>
              </form>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Recent Activity</h3>
                {walletData?.transactions?.length ? (
                  <div className="space-y-2">
                    {walletData.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between px-4 py-3 bg-slate-700 rounded-lg text-sm"
                      >
                        <div>
                          <p className="text-slate-200 font-semibold">
                            {tx.type === 'CREDIT_TOP_UP'
                              ? 'Wallet Top-up'
                              : tx.type === 'DEBIT_REGISTRATION'
                              ? 'Event Registration'
                              : tx.type}
                          </p>
                          <p className="text-slate-400 text-xs">
                            {tx.reference || 'No reference'} •{' '}
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`font-semibold ${
                            tx.type.startsWith('CREDIT') ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {tx.type.startsWith('CREDIT') ? '+' : '-'}${tx.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">
                    No wallet activity yet. Top up your wallet to get started.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Activity History</h2>
              <p className="text-slate-400 text-sm">
                Overview of your event registrations. Wallet payment activity is available in
                the Wallet tab.
              </p>
            </div>
          </div>

          {historyLoading ? (
            <LoadingSpinner />
          ) : registrations.length ? (
            <div className="space-y-3">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 bg-slate-700/70 rounded-lg border border-slate-600 text-sm"
                >
                  <div>
                    <p className="text-white font-semibold">
                      {reg.event?.title || 'Event'}
                    </p>
                    <p className="text-slate-400 text-xs">
                      Registered on{' '}
                      {reg.registeredAt
                        ? new Date(reg.registeredAt).toLocaleString()
                        : 'N/A'}
                      {' • '}
                      Ticket:{' '}
                      {reg.ticket?.name || 'Standard'} (
                      ${reg.ticket?.price != null ? reg.ticket.price : 0})
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        reg.status === 'confirmed'
                          ? 'bg-green-900 text-green-200'
                          : reg.status === 'pending'
                          ? 'bg-yellow-900 text-yellow-200'
                          : 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {reg.status || 'unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              No registrations yet. Browse events and register to see your history here.
            </p>
          )}
        </div>
      )}

      {/* Logout Section */}
      <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <LogOut size={24} className="text-red-400" />
          Logout
        </h2>
        <p className="text-slate-400 mb-6">
          Sign out from your account. You'll need to login again to access your registrations and tickets.
        </p>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default SettingsPage;