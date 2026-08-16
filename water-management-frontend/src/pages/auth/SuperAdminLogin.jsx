import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Server, Activity } from 'lucide-react';
import { authApi } from '../../api';

const SuperAdminLogin = () => {
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
      
      if (res.role !== 'SUPER_ADMIN') {
        setError('Access Denied: You do not have Super Admin privileges.');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.role);
      
      navigate('/superadmin');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or server error.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Dark mode background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-purple-900 rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
      
      <div className="w-full max-w-5xl bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 flex overflow-hidden shadow-2xl relative z-10">
        
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12">
          <div className="flex items-center space-x-3 mb-12">
            <div className="bg-purple-600/20 p-2 rounded-xl border border-purple-500/30">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">SuperAdmin Portal</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">System Access</h1>
          <p className="text-slate-400 text-sm font-medium mb-8">Authenticate to access the global management console.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-900/50 text-red-400 text-sm rounded-xl font-medium flex items-center">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-purple-600/50 focus:border-purple-500 transition-all placeholder-slate-600"
                  placeholder="admin@watermanagement.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-purple-600/50 focus:border-purple-500 transition-all placeholder-slate-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-50 mt-8 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Authenticate
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Don't have an account? <button onClick={() => navigate('/register?role=communityadmin')} className="text-purple-400 font-bold hover:text-purple-300 transition-colors">Sign up your community</button>
          </div>
          
          <button onClick={() => navigate('/')} className="mt-6 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors w-full text-center block">
            ← Back to Home
          </button>
        </div>

        {/* Right Side: Visuals */}
        <div className="hidden lg:flex w-1/2 bg-slate-950 border-l border-slate-800 flex-col justify-center p-12 relative overflow-hidden">
          {/* Animated grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <Server className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="text-white font-bold text-sm">Global Infrastructure</h3>
                <p className="text-slate-400 text-xs mt-1">Manage all multitenant databases securely.</p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center space-x-4">
              <Activity className="w-8 h-8 text-indigo-500" />
              <div>
                <h3 className="text-white font-bold text-sm">Real-time Telemetry</h3>
                <p className="text-slate-400 text-xs mt-1">Monitor high-level MRR and platform uptime.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminLogin;
