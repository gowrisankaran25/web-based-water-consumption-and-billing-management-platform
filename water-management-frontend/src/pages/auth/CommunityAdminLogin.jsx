import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight, Droplet, Users } from 'lucide-react';
import { authApi } from '../../api';

const CommunityAdminLogin = () => {
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
      
      if (res.role !== 'COMMUNITY_ADMIN') {
        setError('Access Denied: You do not have Community Admin privileges.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);
      if (res.communityId) localStorage.setItem('communityId', res.communityId);
      
      navigate('/communityadmin');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or server error.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-teal-100 rounded-full mb-4 shadow-sm border border-teal-200">
          <Building2 className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Community Manager</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">Log in to manage your building's water network.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl sm:px-10 border border-slate-100">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Work Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                  placeholder="admin@mycommunity.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all disabled:opacity-50 mt-6 shadow-md shadow-teal-500/30 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6 space-y-4">
            <div className="text-center text-sm font-medium text-slate-500">
              New manager? <button onClick={() => navigate('/register?role=communityadmin')} className="text-teal-600 font-bold hover:text-teal-700 transition-colors">Register your community</button>
            </div>
            <button onClick={() => navigate('/')} className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Return to Landing Page
            </button>
          </div>
        </div>
        
        {/* Features banner below form */}
        <div className="mt-8 flex justify-center space-x-6 text-slate-500 text-xs font-semibold">
          <div className="flex items-center"><Droplet className="w-4 h-4 mr-1 text-teal-500" /> Monitor NRW</div>
          <div className="flex items-center"><Users className="w-4 h-4 mr-1 text-blue-500" /> Manage Residents</div>
        </div>
      </div>
    </div>
  );
};

export default CommunityAdminLogin;
