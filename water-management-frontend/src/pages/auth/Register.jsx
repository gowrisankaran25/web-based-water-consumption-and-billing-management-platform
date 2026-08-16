import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Building2, Home, ArrowRight, CheckCircle2, User, Phone, MapPin, Users, Calendar } from 'lucide-react';
import { authApi } from '../../api';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [role, setRole] = useState('RESIDENT');
  
  // Shared
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Community Admin
  const [communityName, setCommunityName] = useState('');
  const [totalFlats, setTotalFlats] = useState('');
  
  // Resident
  const [communities, setCommunities] = useState([]);
  const [communityId, setCommunityId] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [occupants, setOccupants] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Initialize
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'communityadmin') setRole('COMMUNITY_ADMIN');
    if (roleParam === 'resident') setRole('RESIDENT');
    
    // Fetch communities for the resident dropdown
    authApi.getCommunities()
      .then(setCommunities)
      .catch(console.error);
  }, [location]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        username: email,
        password,
        role,
        fullName,
        phone,
      };

      if (role === 'COMMUNITY_ADMIN') {
        payload.communityName = communityName;
        payload.totalFlats = parseInt(totalFlats) || 0;
      } else {
        payload.communityId = communityId;
        payload.flatNumber = flatNumber;
        payload.occupants = parseInt(occupants) || 1;
        payload.moveInDate = moveInDate;
      }

      await authApi.register(payload);
      
      setSuccess(true);
      setTimeout(() => {
        if (role === 'COMMUNITY_ADMIN') navigate('/communityadmin-login');
        else navigate('/resident-login');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Registration Complete!</h2>
          <p className="text-slate-500 font-medium mb-8">
            {role === 'COMMUNITY_ADMIN' 
              ? "Your community has been created and is pending Super Admin approval. You can log in now."
              : "Your resident account and household profile have been successfully created!"}
          </p>
          <div className="w-6 h-6 border-2 border-slate-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create an account</h2>
        <p className="mt-2 text-sm text-slate-500 font-medium">Join the smartest water management platform.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:px-10 border border-slate-100">
          
          {/* Role Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button 
              type="button"
              onClick={() => setRole('RESIDENT')}
              className={`flex-1 py-2.5 flex justify-center items-center rounded-lg text-sm font-bold transition-all ${role === 'RESIDENT' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Home className="w-4 h-4 mr-2" /> Resident
            </button>
            <button 
              type="button"
              onClick={() => setRole('COMMUNITY_ADMIN')}
              className={`flex-1 py-2.5 flex justify-center items-center rounded-lg text-sm font-bold transition-all ${role === 'COMMUNITY_ADMIN' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Building2 className="w-4 h-4 mr-2" /> Manager
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium flex items-center">
              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            
            {/* Shared Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm" placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                    className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm" placeholder="••••••••" />
              </div>
            </div>

            {/* Role-Specific Fields */}
            {role === 'COMMUNITY_ADMIN' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 mt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Community Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-4 w-4 text-slate-400" />
                    </div>
                    <input type="text" value={communityName} onChange={(e) => setCommunityName(e.target.value)} required
                      className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm" placeholder="Green Valley Estates" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Total Flats</label>
                  <div className="relative">
                    <input type="number" value={totalFlats} onChange={(e) => setTotalFlats(e.target.value)} required min="1"
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm" placeholder="e.g. 150" />
                  </div>
                </div>
              </div>
            )}

            {role === 'RESIDENT' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4 border-t border-slate-100 pt-5 mt-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Select Community</label>
                  <select 
                    value={communityId} onChange={(e) => setCommunityId(e.target.value)} required
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                  >
                    <option value="" disabled>-- Select your community --</option>
                    {communities.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center"><MapPin className="w-3 h-3 mr-1"/> Flat</label>
                    <input type="text" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required
                      className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm" placeholder="A-101" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center"><Users className="w-3 h-3 mr-1"/> Family Size</label>
                    <input type="number" value={occupants} onChange={(e) => setOccupants(e.target.value)} required min="1"
                      className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm" placeholder="3" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider flex items-center"><Calendar className="w-3 h-3 mr-1"/> Move-In</label>
                    <input type="date" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} required
                      className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm" />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-md focus:outline-none focus:ring-2 transition-all disabled:opacity-50 mt-8 group ${role === 'COMMUNITY_ADMIN' ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/30 focus:ring-teal-500' : 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/30 focus:ring-sky-500'}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="text-purple-600 font-bold hover:text-purple-700 transition-colors">Sign in here</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
