import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/auth/Register';
import SuperAdminLogin from './pages/auth/SuperAdminLogin';
import CommunityAdminLogin from './pages/auth/CommunityAdminLogin';
import ResidentLogin from './pages/auth/ResidentLogin';
import SuperAdminDashboard from './pages/dashboard/SuperAdmin';
import CommunityAdminDashboard from './pages/dashboard/CommunityAdmin';
import ResidentDashboard from './pages/dashboard/Resident';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/superadmin-login" element={<SuperAdminLogin />} />
        <Route path="/communityadmin-login" element={<CommunityAdminLogin />} />
        <Route path="/resident-login" element={<ResidentLogin />} />

        {/* Dashboard Routes */}
        <Route path="/superadmin/*" element={<SuperAdminDashboard />} />
        <Route path="/communityadmin/*" element={<CommunityAdminDashboard />} />
        <Route path="/resident/*" element={<ResidentDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
