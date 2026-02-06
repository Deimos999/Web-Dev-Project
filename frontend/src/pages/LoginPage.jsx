import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Wallet } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import ErrorAlert from '../components/ErrorAlert';
import LoadingSpinner from '../components/LoadingSpinner';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
       <div className="container section">
         <div className="w-full max-w-md mx-auto">
           <div className="ds-card">
             <div className="flex flex-col items-center justify-center mb-6 space-y-2">
               <div className="flex items-center gap-2">
                 <LogIn className="text-primary" size={28} />
                 <h2 className="text-2xl font-semibold text-primary">Login</h2>
               </div>
               <div className="flex items-center gap-2 text-sm text-secondary bg-white/5 px-3 py-1 rounded-full">
                 <Wallet className="text-success" size={16} />
                 <span className="text-secondary">Wallet-friendly events • Top up & pay from your account</span>
               </div>
             </div>
 
             <ErrorAlert message={error} onClose={() => setError('')} />
 
             <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Email Address
              </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="ds-input" required />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>

              <button type="submit" disabled={loading} className="ds-btn ds-btn-primary w-full">{loading ? 'Logging in...' : 'Login'}</button>
          </form>

            <p className="text-secondary mt-6 text-center text-sm">Don't have an account? <Link to="/register" className="text-primary font-semibold">Register here</Link></p>

            <p className="text-secondary mt-4 text-center text-sm"><Link to="#" className="text-primary">Forgot password?</Link></p>
          </div>
        </div>
      </div>
  );
}

export default LoginPage;