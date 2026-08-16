import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, ArrowRight, ShieldCheck, BarChart2, CheckCircle, X, Building2, Home, Wrench } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">
      {/* Navbar */}
      <header className="bg-white px-8 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 p-2 rounded-xl">
            <Droplet className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">GrokSync</span>
        </div>
        <div className="space-x-4">
          <button onClick={() => setShowModal(true)} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full shadow-sm transition-colors flex items-center">
            Sign In <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-6 bg-purple-100 text-purple-700 rounded-full text-sm font-bold tracking-wide">
            THE #1 WATER MANAGEMENT PLATFORM
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900 leading-tight">
            Smart water billing for <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-500">modern communities.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium">
            Automate your meter reading, streamline resident billing, and detect leaks in real-time. GrokSync brings enterprise-grade analytics to your residential society.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button onClick={() => setShowModal(true)} className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105 flex items-center text-lg">
              Access Platform <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-24">
          <div className="bg-white p-8 rounded-3xl shadow-sm text-left border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-6">
              <Droplet className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Resident Portal</h3>
            <p className="text-slate-500 font-medium">Self-service dashboard for residents to track usage, pay bills, and set conservation alerts.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm text-left border border-slate-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">Admin Analytics</h3>
            <p className="text-slate-500 font-medium">Track non-revenue water (NRW) loss and manage the entire billing cycle from one unified dashboard.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 font-medium text-sm mt-12 border-t border-slate-200">
        © {new Date().getFullYear()} GrokSync Technologies Inc. All rights reserved.
      </footer>

      {/* Login Portal Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-10 text-center border-b border-slate-100">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Select your portal</h2>
              <p className="text-slate-500 font-medium mt-2">How would you like to sign in today?</p>
            </div>

            <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
              
              {/* Resident Card */}
              <button onClick={() => navigate('/resident-login')} className="flex items-start text-left p-6 bg-white border border-sky-100 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all group">
                <div className="w-12 h-12 bg-sky-100 text-sky-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Home className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Resident</h3>
                  <p className="text-sm text-slate-500 font-medium">View bills, track usage, and make payments for your flat.</p>
                </div>
              </button>

              {/* Community Admin Card */}
              <button onClick={() => navigate('/communityadmin-login')} className="flex items-start text-left p-6 bg-white border border-teal-100 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all group">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Community Admin</h3>
                  <p className="text-sm text-slate-500 font-medium">Manage residents, generate bills, and view NRW analytics.</p>
                </div>
              </button>



              {/* Super Admin Card */}
              <button onClick={() => navigate('/superadmin-login')} className="flex items-start text-left p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:bg-slate-800 transition-all group">
                <div className="w-12 h-12 bg-purple-600/30 text-purple-400 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform border border-purple-500/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">Super Admin</h3>
                  <p className="text-sm text-slate-400 font-medium">Manage all communities and global platform settings.</p>
                </div>
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
