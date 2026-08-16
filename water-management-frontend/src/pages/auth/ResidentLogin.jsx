import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Mail, Lock, ArrowRight, Home } from 'lucide-react';
import { authApi } from '../../api';

const ResidentLogin = () => {
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
      
      if (res.role !== 'RESIDENT') {
        setError('Login Failed: This portal is for residents only.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);
      if (res.communityId) localStorage.setItem('communityId', res.communityId);
      if (res.householdId) localStorage.setItem('householdId', res.householdId);
      
      navigate('/resident');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or server error.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-sky-200 rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[100px] opacity-60"></div>

      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-xl shadow-sky-100/50 mb-6 border border-sky-50">
            <Droplet className="w-10 h-10 text-sky-500 fill-sky-100" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Welcome Home</h1>
          <p className="text-slate-500 font-medium">Log in to track your usage and view bills.</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-sky-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-sky-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-500/30 transition-all disabled:opacity-50 mt-8 shadow-lg shadow-sky-500/30 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm font-medium text-slate-500 border-t border-slate-100 pt-6">
            Don't have an account? <button onClick={() => navigate('/register?role=resident')} className="text-sky-500 font-bold hover:text-sky-600 transition-colors">Sign up as a resident</button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/')} className="inline-flex items-center text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white">
            <Home className="w-4 h-4 mr-2" />
            Back to main site
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResidentLogin;
