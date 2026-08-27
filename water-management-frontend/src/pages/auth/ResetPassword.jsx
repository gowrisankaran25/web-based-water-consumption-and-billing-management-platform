import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Droplet, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import { authApi } from '../../api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to reset password. The token may be invalid or expired.');
    } finally {
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
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Create New Password</h1>
          <p className="text-slate-500 font-medium">Please enter your new password below.</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Password Reset Successful</h3>
              <p className="text-slate-500 text-sm mb-6">Your password has been successfully updated. You can now log in with your new password.</p>
              <button
                onClick={() => navigate('/resident-login')}
                className="w-full py-4 px-4 rounded-2xl text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 transition-colors shadow-lg shadow-sky-500/30"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
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
                    disabled={!token}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-sky-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                    placeholder="••••••••"
                    required
                    disabled={!token}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full flex items-center justify-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-500/30 transition-all disabled:opacity-50 mt-8 shadow-lg shadow-sky-500/30 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
