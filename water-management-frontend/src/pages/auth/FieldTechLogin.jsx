import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { authApi } from '../../api';

const FieldTechLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.login({ username: email, password });
      
      if (res.role !== 'FIELD_TECH') {
        setError('Access Denied: Tech credentials required.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);
      
      navigate('/fieldtech');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-mono">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-4 bg-amber-500 rounded-2xl mb-6 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
          <Wrench className="w-10 h-10 text-zinc-900" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-wider">Field Ops</h2>
        <p className="mt-2 text-sm text-zinc-400">Mobile Ticketing & Disconnection Unit</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border-2 border-zinc-800 relative overflow-hidden">
          
          {/* Danger stripes at top */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,#000_10px,#000_20px)]"></div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border-l-4 border-red-500 text-red-400 text-sm font-medium flex items-center">
              <AlertTriangle className="w-5 h-5 mr-3" />
              {error}
            </div>
          )}

          <form className="space-y-6 mt-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Tech ID (Email)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-white text-sm focus:ring-0 focus:border-amber-500 transition-colors placeholder-zinc-600"
                  placeholder="tech@watermanagement.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Passcode</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-white text-sm focus:ring-0 focus:border-amber-500 transition-colors placeholder-zinc-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-sm font-black uppercase tracking-widest text-zinc-950 bg-amber-500 hover:bg-amber-400 focus:outline-none transition-colors disabled:opacity-50 mt-8"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin"></div>
              ) : (
                <>
                  Engage
                  <ArrowRight className="ml-3 w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => navigate('/')} className="text-xs font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest transition-colors">
              [ Abort / Home ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldTechLogin;
