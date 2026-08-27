import React, { useState, useEffect } from 'react';
import { 
  Droplet, LayoutDashboard, List, Home, RefreshCw, 
  Bell, FileText, BarChart2, Settings, User, AlertTriangle, Activity, Wrench, Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { communityAdminApi, invoiceApi, bulkWaterPurchaseApi } from '../../api';
import TariffPlan from './TariffPlan';

// Fetch dynamic community ID from logged-in user
const CHART_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F97316', '#8B5CF6', '#22C55E'];

const AquaTrackDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data State
  const [meterReadings, setMeterReadings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [bulkPurchases, setBulkPurchases] = useState([]);
  const [households, setHouseholds] = useState([]);
  
  // Form States
  const [mFlatNumber, setMFlatNumber] = useState('');
  const [readingValue, setReadingValue] = useState('');
  const [tariffRate, setTariffRate] = useState('');
  const [residentName, setResidentName] = useState('');
  const [rFlatNumber, setRFlatNumber] = useState('');
  const [residentEmail, setResidentEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Bulk Purchase Form States (Pre-filled with mock data)
  const [bpVolumeLiters, setBpVolumeLiters] = useState('15000');
  const [bpCostINR, setBpCostINR] = useState('2500');
  const [bpVendorName, setBpVendorName] = useState('AquaTankers Inc');
  const [bpPurchaseDate, setBpPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  // Get dynamic Community ID from login session
  const communityId = localStorage.getItem('communityId');

  // Fetch Data
  const fetchData = () => {
    if (!communityId) return;
    communityAdminApi.getMeterReadings(communityId).then(setMeterReadings).catch(console.error);
    communityAdminApi.getInvoices(communityId).then(setInvoices).catch(console.error);
    communityAdminApi.getInvitations(communityId).then(setInvitations).catch(console.error);
    bulkWaterPurchaseApi.getByCommunity(communityId).then(setBulkPurchases).catch(console.error);
    communityAdminApi.getHouseholds(communityId).then(setHouseholds).catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
  const handleMeterSubmit = (e) => {
    e.preventDefault();
    communityAdminApi.submitMeterReading({
      communityId: communityId,
      flatNumber: mFlatNumber,
      readingValue: parseFloat(readingValue)
    }).then(() => {
      setMFlatNumber(''); setReadingValue('');
      fetchData();
      alert('Reading saved successfully!');
    }).catch(err => alert('Failed: ' + err.message));
  };

  const handleTariffUpdate = (e) => {
    e.preventDefault();
    import('../../api').then(({ tariffPlanApi }) => {
      tariffPlanApi.create({
        communityId: communityId,
        name: "Standard Tier Plan",
        waterTiers: [
          { maxVolumeKL: 10.0, ratePerKL: parseFloat(tariffRate) },
          { maxVolumeKL: 20.0, ratePerKL: parseFloat(tariffRate) * 1.5 },
          { maxVolumeKL: null, ratePerKL: parseFloat(tariffRate) * 2.0 }
        ],
        baselineMinimumCharge: 200.0
      })
      .then(() => alert('Tiered Tariff Plan created starting at ₹' + tariffRate))
      .catch(err => alert('Update failed: ' + err.message));
    });
  };

  const handleGenerateInvoices = () => {
    setIsGenerating(true);
    communityAdminApi.generateInvoices(communityId)
      .then(() => {
        alert('Invoices generated successfully!');
        fetchData();
      })
      .catch(err => alert('Generation failed: ' + err.message))
      .finally(() => setIsGenerating(false));
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const blob = await invoiceApi.downloadPdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Failed to download invoice");
      console.error(err);
    }
  };

  const handleInvite = (e) => {
    e.preventDefault();
    communityAdminApi.inviteResident({
      communityId: communityId,
      residentName, flatNumber: rFlatNumber, residentEmail
    }).then(() => {
      setResidentName(''); setRFlatNumber(''); setResidentEmail('');
      fetchData();
      alert('Invitation Generated!');
    }).catch(err => alert('Failed: ' + err.message));
  };

  const handleBulkPurchaseSubmit = (e) => {
    e.preventDefault();
    bulkWaterPurchaseApi.create({
      communityId,
      volumeLiters: parseFloat(bpVolumeLiters),
      costINR: parseFloat(bpCostINR),
      vendorName: bpVendorName,
      purchaseDate: bpPurchaseDate
    }).then(() => {
      setBpVolumeLiters(''); setBpCostINR(''); setBpVendorName(''); setBpPurchaseDate('');
      fetchData();
      alert('Bulk Purchase Logged!');
    }).catch(err => alert('Failed: ' + err.message));
  };

  const handleMeterAction = (readingId, status) => {
    communityAdminApi.updateMeterStatus(readingId, status)
      .then(() => {
        fetchData();
      })
      .catch(err => alert('Failed to update status: ' + err.message));
  };

  // Derived Data for Overview Chart
  const topConsumers = [...meterReadings]
    .sort((a, b) => b.readingValue - a.readingValue)
    .slice(0, 6)
    .map((m, idx) => ({
      name: m.flatNumber,
      value: m.readingValue,
      color: CHART_COLORS[idx % CHART_COLORS.length]
    }));

  const totalConsumption = meterReadings.reduce((sum, m) => sum + m.readingValue, 0);
  const avgDaily = meterReadings.length > 0 ? (totalConsumption / 30).toFixed(0) : 0; // Rough approx for 30 days

  const renderCustomBarLabel = ({ x, y, width, value }) => (
    <text x={x + width / 2} y={y - 10} fill="#64748b" textAnchor="middle" fontSize="12" fontWeight="600">
      {parseFloat(Number(value).toFixed(1))} L
    </text>
  );

  const NavItem = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
          isActive ? 'bg-purple-50 text-purple-700 relative font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
        }`}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r-full"></div>}
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-purple-600' : ''}`} />
        {label}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC] font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-50">
          <Droplet className="w-6 h-6 text-purple-600 mr-3 fill-purple-600" />
          <span className="text-xl font-bold text-slate-900 tracking-tight">GrokSync</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <NavItem id="overview" icon={LayoutDashboard} label="Overview" />
          <NavItem id="logs" icon={List} label="Usage Logs" />
          <NavItem id="households" icon={Home} label="Households" />
          <NavItem id="billing" icon={RefreshCw} label="Billing Cycles" />
          <NavItem id="settings" icon={Settings} label="Tariff Plan" />
          <NavItem id="invoices" icon={FileText} label="Invoices" />
          <NavItem id="bulk" icon={Droplet} label="Bulk Purchases" />
          <NavItem id="exceptions" icon={AlertTriangle} label="Exception Queue" />
          <NavItem id="analytics" icon={Activity} label="NRW Analytics" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 z-0">
          <div className="flex items-center">
             <h2 className="text-lg font-bold text-slate-800 tracking-tight">Community Dashboard</h2>
          </div>
          <div className="flex items-center space-x-6">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
              AD
            </div>
            <button onClick={() => { localStorage.clear(); navigate('/communityadmin-login'); }} className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">
              Sign Out
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Dashboard Overview</h1>
                  <p className="text-sm text-slate-400 font-medium">Water Usage & Conservation Monitoring System</p>
                </div>
                <div className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold border border-purple-100 shadow-sm">
                  Live Data
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col justify-between">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-2 h-2 bg-blue-500"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flats Logged</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{meterReadings.length}</div>
                    <div className="text-xs text-slate-400 font-medium">Readings submitted</div>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col justify-between">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-2 h-2 bg-purple-500"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoices</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{invoices.length}</div>
                    <div className="text-xs text-slate-400 font-medium">Bills generated</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col justify-between">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-2 h-2 bg-orange-500"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Alerts</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">8</div>
                    <div className="text-xs text-slate-400 font-medium">Hardcoded placeholder</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col justify-between">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-2 h-2 bg-teal-500"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Daily Usage</span>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{avgDaily} L</div>
                    <div className="text-xs text-slate-400 font-medium">Across community</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 lg:col-span-2">
                  <div className="mb-8">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Top Consuming Households (Liters)</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">Dynamically pulled from MongoDB Meter Readings</p>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topConsumers.length ? topConsumers : [{name: 'No Data', value: 0}]} margin={{ top: 20, right: 0, left: -25, bottom: 0 }} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} label={renderCustomBarLabel}>
                          {topConsumers.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Alerts</h2>
                    <span className="px-2.5 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] font-bold uppercase tracking-wider">4 alerts</span>
                  </div>
                  
                  <div className="space-y-4 flex-1 opacity-70">
                    <div className="flex items-start justify-between pb-4 border-b border-slate-50">
                      <div className="flex items-start">
                        <div className="w-1 h-10 bg-red-400 rounded-full mr-3 mt-0.5"></div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800">H-204 — Block B</h3>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">Placeholder</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-red-50 text-red-500 rounded text-xs font-bold border border-red-100">Overuse</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-50">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Usage Logs</h2>
                  <p className="text-xs text-slate-400 font-medium mt-1">Live from MongoDB</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Log ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Household</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reading (L)</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {meterReadings.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-4 text-center italic text-slate-400">No logs found.</td></tr>
                      ) : meterReadings.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-purple-600">{m.id.substring(m.id.length - 6)}</td>
                          <td className="px-6 py-4 font-semibold text-slate-700">{m.flatNumber}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium">{m.readingDate}</td>
                          <td className="px-6 py-4 text-slate-700 font-medium font-bold">{parseFloat(Number(m.readingValue).toFixed(1))} L</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded text-[11px] font-bold border border-green-100">{m.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* USAGE LOGS TAB (Form) */}
          {activeTab === 'logs' && (
            <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 max-w-xl">
              <h2 className="text-xl font-bold mb-6">Log Manual Meter Reading</h2>
              <form onSubmit={handleMeterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Flat / Unit Number</label>
                  <input type="text" value={mFlatNumber} onChange={e => setMFlatNumber(e.target.value)} required className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Reading (Liters)</label>
                  <input type="number" step="0.01" value={readingValue} onChange={e => setReadingValue(e.target.value)} required className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-purple-500" />
                </div>
                <button type="submit" className="w-full py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition">
                  Submit Reading to Database
                </button>
              </form>
            </div>
          )}

          {/* SETTINGS (Tariff) TAB */}
          {activeTab === 'settings' && (
            <TariffPlan />
          )}

          {/* BILLING / INVOICES TAB */}
          {activeTab === 'billing' || activeTab === 'invoices' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Billing & Invoices</h2>
                  <p className="text-sm text-slate-500">Generate bills based on recent meter readings and tariff rates.</p>
                </div>
                <button 
                  onClick={handleGenerateInvoices}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition shadow-sm"
                >
                  {isGenerating ? 'Processing Engine...' : 'Generate Monthly Bills'}
                </button>
              </div>
              
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Flat</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Billing Period</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (₹)</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {invoices.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-4 text-center italic text-slate-400">No invoices generated.</td></tr>
                    ) : invoices.map(inv => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{inv.flatNumber}</td>
                        <td className="px-6 py-4 text-slate-500">{inv.billingPeriodStart} to {inv.billingPeriodEnd}</td>
                        <td className="px-6 py-4 font-bold text-green-600">₹{inv.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[11px] font-bold border ${inv.status === 'PAID' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDownloadInvoice(inv.id)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Download PDF">
                            <Download className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* HOUSEHOLDS TAB (Invitations & Directory) */}
          {activeTab === 'households' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50">
                <h2 className="text-xl font-bold mb-6">Invite Resident / Register Household</h2>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Resident Name</label>
                    <input type="text" value={residentName} onChange={e => setResidentName(e.target.value)} required className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Flat / Unit Number</label>
                    <input type="text" value={rFlatNumber} onChange={e => setRFlatNumber(e.target.value)} required className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                    <input type="email" value={residentEmail} onChange={e => setResidentEmail(e.target.value)} required className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-purple-500" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition">
                    Generate Invite Code
                  </button>
                </form>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50">
                <h2 className="text-xl font-bold mb-6">Registered Households Directory</h2>
                {households && households.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Flat</th>
                          <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                          <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {households.map((h, idx) => (
                          <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                            <td className="py-4 px-4 font-bold text-slate-700">{h.flatNumber}</td>
                            <td className="py-4 px-4 text-slate-600 font-medium">{h.residentName}</td>
                            <td className="py-4 px-4 text-slate-500">{h.residentEmail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No households found.</p>
                )}
              </div>
            </div>
          )}
          
          {/* BULK PURCHASES TAB */}
          {activeTab === 'bulk' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50">
                <h2 className="text-xl font-bold mb-6">Log Bulk Water Purchase</h2>
                <form onSubmit={handleBulkPurchaseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Volume (Liters)</label>
                    <input type="number" step="0.01" value={bpVolumeLiters} onChange={e => setBpVolumeLiters(e.target.value)} required className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Total Cost (₹)</label>
                    <input type="number" step="0.01" value={bpCostINR} onChange={e => setBpCostINR(e.target.value)} required className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vendor Name</label>
                    <input type="text" value={bpVendorName} onChange={e => setBpVendorName(e.target.value)} required className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-purple-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Purchase Date</label>
                    <input type="date" value={bpPurchaseDate} onChange={e => setBpPurchaseDate(e.target.value)} required className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-purple-500" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition mt-2">
                    Record Purchase
                  </button>
                </form>
              </div>
              
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Purchases</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Vendor</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Volume (L)</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bulkPurchases.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-4 text-center italic text-slate-400">No bulk purchases recorded.</td></tr>
                      ) : bulkPurchases.map(bp => (
                        <tr key={bp.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 text-slate-500">{bp.purchaseDate}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{bp.vendorName}</td>
                          <td className="px-6 py-4 font-bold text-slate-600">{bp.volumeLiters} L</td>
                          <td className="px-6 py-4 font-bold text-green-600">₹{bp.costINR.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* EXCEPTION QUEUE TAB */}
          {activeTab === 'exceptions' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Exception & Anomaly Queue</h2>
                  <p className="text-sm text-slate-500">Review flagged smart meter readings for potential leaks, dead meters, or massive spikes.</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-red-50/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-red-600 uppercase tracking-wider">Flat</th>
                      <th className="px-6 py-4 text-xs font-bold text-red-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-red-600 uppercase tracking-wider">Reading (L)</th>
                      <th className="px-6 py-4 text-xs font-bold text-red-600 uppercase tracking-wider">Anomaly Reason</th>
                      <th className="px-6 py-4 text-xs font-bold text-red-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {meterReadings.filter(m => m.isAnomaly || m.status === 'PENDING_REVIEW').length === 0 ? (
                      <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium flex flex-col items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-slate-300 mb-2" />
                        No anomalies detected in recent meter reads.
                      </td></tr>
                    ) : meterReadings.filter(m => m.isAnomaly || m.status === 'PENDING_REVIEW').map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{m.flatNumber}</td>
                        <td className="px-6 py-4 text-slate-500">{m.readingDate}</td>
                        <td className="px-6 py-4 font-bold text-orange-600">{Number(m.readingValue).toFixed(1)} L</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center inline-flex">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {m.anomalyReason || 'Flagged for review'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <button onClick={() => handleMeterAction(m.id, 'VERIFIED')} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-200 hover:bg-green-100">Approve</button>
                          <button onClick={() => handleMeterAction(m.id, 'REJECTED')} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-200 hover:bg-slate-200">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NRW ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50">
              <h2 className="text-xl font-bold mb-2 text-slate-900">Non-Revenue Water (NRW) Analytics</h2>
              <p className="text-sm text-slate-500 mb-6">Compare master supply meter vs aggregated household billing meters.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-800 mb-1">Total Supplied (Master)</h3>
                  <p className="text-3xl font-extrabold text-blue-600">12,500 L</p>
                </div>
                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <h3 className="text-sm font-bold text-emerald-800 mb-1">Total Billed (Households)</h3>
                  <p className="text-3xl font-extrabold text-emerald-600">11,200 L</p>
                </div>
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                  <h3 className="text-sm font-bold text-red-800 mb-1">System Loss (NRW)</h3>
                  <p className="text-3xl font-extrabold text-red-600">1,300 L (10.4%)</p>
                </div>
              </div>
              
              <div className="h-[250px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Supply vs Billed', supplied: 12500, billed: 11200}]} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="supplied" fill="#3B82F6" name="Supplied" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="billed" fill="#10B981" name="Billed" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* FIELD OPERATIONS TAB */}
          {activeTab === 'fieldops' && (
            <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold mb-2 text-slate-900">Field Operations & Disconnections</h2>
                  <p className="text-sm text-slate-500">Dispatch field technicians for physical meter reads or water disconnections.</p>
                </div>
                <button className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-red-700 transition">
                  + Create Disconnection Order
                </button>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Work Order ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Target Flat</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Assigned To</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-700">TKT-002</td>
                      <td className="px-6 py-4 text-red-600 font-bold">DISCONNECTION</td>
                      <td className="px-6 py-4 font-semibold">B-305</td>
                      <td className="px-6 py-4 text-slate-500 font-semibold">John (Field Tech)</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold border border-amber-100">PENDING</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AquaTrackDashboard;
