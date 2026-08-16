import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplet, LayoutDashboard, Building2, Settings, 
  Bell, ArrowRight, ShieldCheck, Activity, Users, 
  DollarSign, Server, Search, CheckCircle, XCircle,
  FileText, BarChart2, Home, MessageSquare, AlertTriangle, List, Download
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { superAdminApi, invoiceApi } from '../../api';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('communityAdmins');
  
  // Data States
  const [communities, setCommunities] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [meterReadings, setMeterReadings] = useState([]);
  const [tickets, setTickets] = useState([]);
  
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [comms, houses, invs, meters, ticks] = await Promise.all([
        superAdminApi.getAllCommunities().catch(() => []),
        superAdminApi.getAllHouseholds().catch(() => []),
        superAdminApi.getAllInvoices().catch(() => []),
        superAdminApi.getAllMeterReadings().catch(() => []),
        superAdminApi.getAllServiceTickets().catch(() => [])
      ]);
      setCommunities(comms || []);
      setHouseholds(houses || []);
      setInvoices(invs || []);
      setMeterReadings(meters || []);
      setTickets(ticks || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApproveCommunity = (id) => {
    superAdminApi.approveCommunity(id)
      .then(fetchAllData)
      .catch(err => alert('Approval failed: ' + err.message));
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

  // --- Derived Metrics ---
  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0);
  const activeAlerts = tickets.filter(t => t.status !== 'RESOLVED');
  const pendingComms = communities.filter(c => c.status === 'PENDING');
  
  // Chart Data
  const growthData = [
    { name: 'Jan', revenue: 15000 },
    { name: 'Feb', revenue: 28000 },
    { name: 'Mar', revenue: 45000 },
    { name: 'Apr', revenue: 80000 },
    { name: 'May', revenue: 120000 },
    { name: 'Jun', revenue: Math.max(totalRevenue, 150000) },
  ];

  const NavItem = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
          isActive ? 'bg-purple-600 shadow-md shadow-purple-500/20 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        {label}
      </button>
    );
  };

  // Sub-components for cleaner render block
  const TabHeader = ({ title, subtitle }) => (
    <div className="mb-8">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-1">{title}</h1>
      <p className="text-base text-slate-500 font-medium">{subtitle}</p>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* Sidebar - GrokSync Premium Dark Theme */}
      <aside className="w-64 bg-slate-900 flex flex-col z-10 shadow-2xl shrink-0 border-r border-slate-800">
        <div className="h-24 flex items-center px-6 border-b border-slate-800/50">
          <div className="bg-purple-600 p-2 rounded-xl mr-3 shadow-lg shadow-purple-500/30">
            <Droplet className="w-6 h-6 text-white fill-white" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">GrokSync</span>
        </div>
        
        <div className="px-6 py-4 border-b border-slate-800/50">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400 font-bold">
                 SA
              </div>
              <div>
                 <p className="text-sm font-bold text-white">Super Admin</p>
                 <p className="text-xs font-medium text-slate-400">Global Operations</p>
              </div>
           </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem id="overview" icon={BarChart2} label="Overview" />
          <NavItem id="usageLogs" icon={List} label="Usage Logs" />
          <NavItem id="billingCycle" icon={FileText} label="Billing Cycle" />
          <NavItem id="payments" icon={DollarSign} label="Payments" />
          <NavItem id="alertCenter" icon={Bell} label="Alert Center" />
          <NavItem id="invoices" icon={FileText} label="Invoices" />
          <NavItem id="complaints" icon={MessageSquare} label="Complaints" />
          <NavItem id="reports" icon={Activity} label="Reports" />
          <NavItem id="communityAdmins" icon={Users} label="Community Admins" />
          <NavItem id="residents" icon={Home} label="Residents" />
          <NavItem id="settings" icon={Settings} label="Settings" />
        </nav>
        
        <div className="p-4 border-t border-slate-800/50">
          <button onClick={() => { localStorage.clear(); navigate('/superadmin-login'); }} className="w-full flex items-center justify-center py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold text-sm">
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-10 relative">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {loading && (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
             <div className="text-slate-500 font-bold animate-pulse">Synchronizing Global Databases...</div>
          </div>
        )}

        {!loading && (
          <div className="relative z-10">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="max-w-7xl mx-auto">
                <TabHeader title="Global Overview" subtitle="System-wide metrics and platform health" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl"><Building2 className="w-6 h-6" /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Communities</span>
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-slate-900 leading-none mb-1">{communities.length}</div>
                      <div className="text-sm text-amber-500 font-bold">{pendingComms.length} pending approval</div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2.5 bg-indigo-50 text-indigo-500 rounded-2xl"><Home className="w-6 h-6" /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Households</span>
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-slate-900 leading-none mb-1">{households.length}</div>
                      <div className="text-sm text-slate-400 font-semibold">Registered units</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-2xl"><DollarSign className="w-6 h-6" /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-slate-900 leading-none mb-1">₹{totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-emerald-500 font-bold">Processed via invoices</div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-40 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl"><AlertTriangle className="w-6 h-6" /></div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Tickets</span>
                    </div>
                    <div>
                      <div className="text-4xl font-extrabold text-slate-900 leading-none mb-1">{activeAlerts.length}</div>
                      <div className="text-sm text-rose-500 font-bold">Require attention</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
                  <div className="mb-8">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Platform Revenue Growth</h2>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                        <Tooltip cursor={{stroke: '#f1f5f9', strokeWidth: 2}} contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#9333ea" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* USAGE LOGS TAB */}
            {activeTab === 'usageLogs' && (
              <div className="max-w-6xl mx-auto">
                <TabHeader title="Global Usage Logs" subtitle="Aggregated meter readings across all communities" />
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Community ID</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Flat</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Reading (L)</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {meterReadings.length === 0 ? (
                        <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">No usage logs found.</td></tr>
                      ) : (
                        meterReadings.map((m, i) => (
                          <tr key={m.id || i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 font-semibold text-slate-500">{m.communityId?.substring(0,8) || 'N/A'}</td>
                            <td className="px-6 py-5 font-bold text-slate-900">{m.flatNumber}</td>
                            <td className="px-6 py-5 font-bold text-purple-600">{m.readingValue} L</td>
                            <td className="px-6 py-5 text-slate-500">{m.readingDate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BILLING CYCLE TAB */}
            {activeTab === 'billingCycle' && (
              <div className="max-w-4xl mx-auto">
                <TabHeader title="Billing Cycle Configurations" subtitle="Global defaults for automated invoicing" />
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Auto-Generate Invoices</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Automatically draft invoices on the 1st of every month</p>
                      </div>
                      <div className="w-14 h-7 bg-purple-600 rounded-full relative cursor-pointer shadow-inner">
                        <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Grace Period (Days)</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Default days allowed before late fees apply</p>
                      </div>
                      <input type="number" defaultValue={15} className="w-24 px-4 py-2 bg-white border border-slate-200 rounded-xl text-center font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="max-w-6xl mx-auto">
                <TabHeader title="Verified Payments" subtitle="Global ledger of settled invoices" />
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Comm ID</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Flat</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount Paid</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {invoices.filter(i => i.status === 'PAID').map((inv, i) => (
                        <tr key={inv.id || i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5 font-semibold text-slate-500">{inv.communityId?.substring(0,8)}</td>
                          <td className="px-6 py-5 font-bold text-slate-900">{inv.flatNumber}</td>
                          <td className="px-6 py-5 font-extrabold text-emerald-600">₹{inv.amount.toFixed(2)}</td>
                          <td className="px-6 py-5">
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wide">PAID</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ALERT CENTER & COMPLAINTS TAB */}
            {(activeTab === 'alertCenter' || activeTab === 'complaints') && (
              <div className="max-w-6xl mx-auto">
                <TabHeader 
                  title={activeTab === 'alertCenter' ? 'Global Alert Center' : 'Service Complaints'} 
                  subtitle="System anomalies and resident service tickets" 
                />
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Comm ID</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Flat</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Type</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tickets.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No active alerts/complaints.</td></tr>
                      ) : (
                        tickets.map((t, i) => (
                          <tr key={t.id || i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 font-semibold text-slate-500">{t.communityId?.substring(0,8)}</td>
                            <td className="px-6 py-5 font-bold text-slate-900">{t.flatNumber}</td>
                            <td className="px-6 py-5 font-bold text-rose-500">{t.issueType}</td>
                            <td className="px-6 py-5 text-slate-600 font-medium">{t.description}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide ${
                                t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* INVOICES TAB */}
            {activeTab === 'invoices' && (
              <div className="max-w-6xl mx-auto">
                <TabHeader title="All Invoices" subtitle="Global view of drafted, pending, and paid invoices" />
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Comm ID</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Flat</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Billing Period</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {invoices.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No invoices generated.</td></tr>
                      ) : (
                        invoices.map((inv, i) => (
                          <tr key={inv.id || i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 font-semibold text-slate-500">{inv.communityId?.substring(0,8)}</td>
                            <td className="px-6 py-5 font-bold text-slate-900">{inv.flatNumber}</td>
                            <td className="px-6 py-5 text-slate-500 font-medium">{inv.billingPeriodStart} to {inv.billingPeriodEnd}</td>
                            <td className="px-6 py-5 font-extrabold text-slate-900">₹{inv.amount.toFixed(2)}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide ${
                                inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <button onClick={() => handleDownloadInvoice(inv.id)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Download PDF">
                                <Download className="w-5 h-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="max-w-6xl mx-auto">
                <TabHeader title="System Reports & Analytics" subtitle="Global non-revenue water (NRW) and operational insights" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                     <h3 className="font-extrabold text-slate-900 mb-8 text-lg">Aggregate Water Consumption (Liters)</h3>
                     <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[{name: 'Supply vs Billed', supplied: 500000, billed: 420000}]} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 600 }} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="supplied" fill="#9333ea" name="Total Supplied (Master)" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="billed" fill="#14b8a6" name="Total Billed (Households)" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                     </div>
                   </div>
                   <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
                     <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="w-10 h-10 text-slate-300" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">Advanced Reporting</h3>
                     <p className="text-slate-500 font-medium max-w-sm mb-8">
                       Detailed CSV export and advanced financial reporting module is currently under development.
                     </p>
                     <button className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                       Download Raw Data Dump
                     </button>
                   </div>
                </div>
              </div>
            )}

            {/* COMMUNITY ADMINS TAB */}
            {activeTab === 'communityAdmins' && (
              <div className="max-w-4xl mx-auto">
                <TabHeader title="Community Admins" subtitle="Manage society administrators across the platform" />
                
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                  <div className="flex items-center justify-between mb-8">
                     <h2 className="text-lg font-extrabold text-slate-900">
                       Registered Communities ({communities.length})
                     </h2>
                     <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
                        <Search className="w-5 h-5" />
                     </button>
                  </div>
                  
                  <div className="space-y-4">
                    {communities.length === 0 ? (
                      <div className="p-10 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        No community admins found.
                      </div>
                    ) : (
                      communities.map(c => (
                        <div key={c.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group">
                          <div className="flex items-center space-x-5">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center font-bold">
                               {c.adminName ? c.adminName.charAt(0) : 'C'}
                            </div>
                            <div>
                               <p className="font-bold text-slate-900">{c.adminName || 'Admin'}</p>
                               <span className="text-sm font-medium text-slate-500">{c.adminEmail}</span>
                            </div>
                            <span className={`ml-4 px-3 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                              c.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          {c.status === 'PENDING' && (
                             <button onClick={() => handleApproveCommunity(c.id)} className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm shadow-purple-600/20">
                               Approve
                             </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* RESIDENTS TAB */}
            {activeTab === 'residents' && (
              <div className="max-w-6xl mx-auto">
                <TabHeader title="Global Resident Directory" subtitle="All households registered across communities" />
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Comm ID</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Flat</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {households.length === 0 ? (
                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No households registered.</td></tr>
                      ) : (
                        households.map((h, i) => (
                          <tr key={h.id || i} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 font-semibold text-slate-500">{h.communityId?.substring(0,8)}</td>
                            <td className="px-6 py-5 font-bold text-slate-900">{h.flatNumber}</td>
                            <td className="px-6 py-5 font-bold text-slate-700">{h.residentName}</td>
                            <td className="px-6 py-5 text-slate-500 font-medium">{h.residentEmail}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1.5 text-xs font-bold rounded-full uppercase tracking-wide ${
                                h.disconnectionStatus ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {h.disconnectionStatus ? 'DISCONNECTED' : 'ACTIVE'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto">
                <TabHeader title="Global Platform Settings" subtitle="System-wide access and feature toggles" />
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Maintenance Mode</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Temporarily block all logins except Super Admins</p>
                      </div>
                      <div className="w-14 h-7 bg-slate-300 rounded-full relative cursor-pointer shadow-inner">
                        <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Global SMS Gateway</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Enable outbound SMS for billing alerts across all platforms</p>
                      </div>
                      <div className="w-14 h-7 bg-purple-600 rounded-full relative cursor-pointer shadow-inner">
                        <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
