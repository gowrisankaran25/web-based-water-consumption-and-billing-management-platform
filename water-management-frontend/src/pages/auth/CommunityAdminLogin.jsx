import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight, Droplet, Users } from 'lucide-react';
import { authApi } from '../../api';

const Css3DCityBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-30 z-0 bg-slate-50">
    <div className="relative w-full h-full" style={{ perspective: '1200px' }}>
      <div 
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -ml-[400px] -mt-[400px]"
        style={{ transform: 'rotateX(60deg) rotateZ(-45deg)', transformStyle: 'preserve-3d', animation: 'spinCity 40s linear infinite' }}
      >
        {[...Array(25)].map((_, i) => {
          const x = (i % 5) * 120 + 100;
          const y = Math.floor(i / 5) * 120 + 100;
          const height = 40 + Math.random() * 120;
          const delay = Math.random() * 5;
          return (
            <div 
              key={i} 
              className="absolute bg-teal-500/80 border-t border-l border-teal-300"
              style={{ 
                left: `${x}px`, top: `${y}px`, width: '60px', height: '60px', 
                transform: `translateZ(${height/2}px) scaleZ(${height/60})`,
                boxShadow: '20px 20px 30px rgba(0,0,0,0.2)',
                animation: `pulseBuilding 4s ease-in-out infinite ${delay}s alternate`
              }}
            ></div>
          );
        })}
      </div>
    </div>
    <style>{`
      @keyframes spinCity { 100% { transform: rotateX(60deg) rotateZ(315deg); } }
      @keyframes pulseBuilding { 0% { opacity: 0.5; } 100% { opacity: 1; transform: translateZ(60px) scaleZ(2); } }
    `}</style>
  </div>
);

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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <Css3DCityBackground />
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 opacity-0 animate-fade-in-up">
        <div className="inline-flex items-center justify-center p-3 bg-teal-100 rounded-full mb-4 shadow-sm border border-teal-200 animate-float-slow">
          <Building2 className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Community Manager</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">Log in to manage your building's water network.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:rounded-2xl sm:px-10 border border-slate-100 opacity-0 animate-fade-in-delay">
          
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


