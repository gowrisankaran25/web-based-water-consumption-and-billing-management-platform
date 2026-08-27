import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Droplet, LayoutDashboard, FileText, Settings, 
  Bell, Calendar, ArrowRight, CreditCard, Activity, AlertTriangle, Wrench, X, CheckCircle, Clock, ChevronDown, Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import { useRazorpay } from 'react-razorpay';
import { communityAdminApi, paymentApi, ticketApi, notificationApi, invoiceApi } from '../../api';

const DUMMY_COMMUNITY_ID = "COMM-12345";
const RESIDENT_FLAT = "H-101";

const CHART_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'];

const ModernResidentDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [invoices, setInvoices] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [meterReadings, setMeterReadings] = useState([]);
  const [allMeterReadings, setAllMeterReadings] = useState([]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [timeFilter, setTimeFilter] = useState('3_months_plus_current');
  
  const [ticketIssueType, setTicketIssueType] = useState('METER_BROKEN');
  const [ticketDescription, setTicketDescription] = useState('');
  
  const communityId = localStorage.getItem('communityId');

  useEffect(() => {
    fetchInvoices();
    fetchTickets();
    fetchNotifications();
    fetchMeterReadings();
    
    // Completely removed Dark Mode logic per user request
    document.documentElement.classList.remove('dark');
  }, []);

  const fetchMeterReadings = () => {
    if (!communityId) return;
    communityAdminApi.getMeterReadings(communityId)
      .then((data) => {
        setMeterReadings(data.filter(m => m.flatNumber === RESIDENT_FLAT));
      })
      .catch(console.error);
  };

  const fetchInvoices = () => {
    if (!communityId) return;
    communityAdminApi.getInvoices(communityId)
      .then((allInvoices) => {
        setInvoices(allInvoices.filter(inv => inv.flatNumber === RESIDENT_FLAT));
      })
      .catch(console.error);
  };

  const fetchTickets = () => {
    ticketApi.getByFlat(RESIDENT_FLAT)
      .then(setTickets)
      .catch(console.error);
  };

  const fetchNotifications = () => {
    if (!communityId) return;
    notificationApi.getByCommunity(communityId)
      .then((notifs) => {
        const myNotifs = notifs.filter(n => n.flatNumber === RESIDENT_FLAT || n.flatNumber === 'ALL' || !n.flatNumber);
        setNotifications(myNotifs);
      })
      .catch(console.error);
  };

  const { Razorpay } = useRazorpay();

  const handlePayment = async (invoiceId) => {
    try {
      const orderData = await paymentApi.createOrder(invoiceId);
      const options = {
        key: "rzp_test_TO7prfOwJ2tD8k",
        amount: orderData.amount * 100,
        currency: "INR",
        name: "Water Billing Platform",
        description: "Invoice Payment",
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentApi.verifySignature({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            alert("Payment successful!");
            fetchInvoices();
          } catch (err) {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: "Resident User",
          email: "resident@greenvalley.com",
          contact: "9999999999",
        },
        theme: {
          color: "#6366f1", // Indigo theme
        },
      };

      const rzp1 = new Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        alert("Payment Failed: " + response.error.description);
      });
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert("Failed to initiate payment. Please use Mock Pay if Razorpay is not configured.");
    }
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

  const handleMockPayment = async (invoiceId) => {
    try {
      await paymentApi.mockPay(invoiceId);
      alert("Test payment successful!");
      fetchInvoices();
    } catch (err) {
      alert("Mock payment failed: " + err.message);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    try {
      await ticketApi.create({
        communityId,
        flatNumber: RESIDENT_FLAT,
        issueType: ticketIssueType,
        description: ticketDescription
      });
      alert('Ticket submitted successfully!');
      setShowTicketModal(false);
      setTicketDescription('');
      fetchTickets();
    } catch (err) {
      alert('Failed to submit ticket: ' + err.message);
    }
  };

  const getFullChartData = () => {
    const mockData = [
      { name: 'Feb', value: 19 },
      { name: 'Mar', value: 34 },
      { name: 'Apr', value: 15 },
      { name: 'May', value: 28 },
      { name: 'Jun', value: 23 },
      { name: 'Jul', value: 10 },
    ];
    
    if (meterReadings.length === 0) return mockData;
    
    // Sort by date ascending
    const sorted = [...meterReadings].sort((a, b) => new Date(a.readingDate) - new Date(b.readingDate));
    
    // Take the last 6 entries (or map all and slice later)
    return sorted.map(reading => {
      const date = new Date(reading.readingDate);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        name: monthNames[date.getMonth()],
        yourValue: reading.readingValue,
        avgValue: parseFloat((allMeterReadings.filter(r => new Date(r.readingDate).getMonth() === date.getMonth()).reduce((a,b)=>a+b.readingValue,0) / (allMeterReadings.filter(r => new Date(r.readingDate).getMonth() === date.getMonth()).length || 1)).toFixed(1))
      };
    });
  };

  const fullChartData = getFullChartData();

  const getFilteredChartData = () => {
    if (timeFilter === 'current_month') return fullChartData.slice(-1);
    if (timeFilter === '3_months_plus_current') return fullChartData.slice(-4);
    return fullChartData.slice(-6);
  };

  const getFilterLabel = () => {
    if (timeFilter === 'current_month') return "August 2026 (Current)";
    if (timeFilter === '3_months_plus_current') return "Last 3 Months + Current";
    return "Last 6 Months";
  };

  const renderCustomBarLabel = ({ x, y, width, value }) => (
    <text x={x + width / 2} y={y - 12} fill="#6366f1" textAnchor="middle" fontSize="13" fontWeight="bold">
      {value} L
    </text>
  );

  const NavItem = ({ id, icon: Icon, label }) => {
    const isActive = activeTab === id;
    return (
      <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
          isActive 
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20' 
            : 'text-slate-500 hover:bg-slate-100/80 hover:text-indigo-600'
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <div className="flex h-screen overflow-hidden">
        
        {/* Soft Modern Sidebar */}
        <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex flex-col z-10">
          <div className="h-24 flex items-center px-8 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
              <Droplet className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">GrokSync</span>
          </div>
          
          <div className="py-6 px-8">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Resident Portal</div>
            <div className="text-base font-bold text-slate-800">Flat {RESIDENT_FLAT}</div>
          </div>

          <nav className="flex-1 py-2 px-4 space-y-2 overflow-y-auto">
            <NavItem id="overview" icon={LayoutDashboard} label="Dashboard" />
            <NavItem id="usage" icon={Activity} label="Usage Analytics" />
            <NavItem id="bills" icon={FileText} label="Billing Center" />
            <NavItem id="payment" icon={CreditCard} label="Payment Ledger" />
            <NavItem id="tickets" icon={Wrench} label="Help & Support" />
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
          
          {/* Subtle Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3"></div>

          {/* Clean Top Navbar */}
          <header className="h-24 flex items-center justify-between px-10 z-30">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Welcome back, Resident!</h2>
            </div>
            <div className="flex items-center space-x-4">
              
              {/* Notification Bell */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-12 h-12 flex items-center justify-center bg-white rounded-full text-slate-500 hover:text-indigo-600 shadow-sm border border-slate-100 transition-all hover:shadow-md focus:outline-none"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm font-medium">No new alerts</div>
                      ) : notifications.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer flex items-start last:border-b-0">
                          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">{notif.title}</h4>
                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-2 block font-bold uppercase">{new Date(notif.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center p-1.5 bg-white rounded-full shadow-sm border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm mr-3">
                  R
                </div>
                <button 
                  onClick={() => { localStorage.clear(); navigate('/resident-login'); }} 
                  className="pr-4 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable Dashboard Area */}
          <div className="flex-1 overflow-auto px-10 pb-10">
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">My Dashboard</h1>
                <p className="text-sm text-slate-500 font-medium">Here's your water usage and billing summary.</p>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className="flex items-center px-5 py-2.5 bg-white hover:bg-slate-50 text-indigo-600 rounded-xl text-sm font-bold shadow-sm border border-slate-200 transition-all focus:outline-none"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {getFilterLabel()}
                  <ChevronDown className="w-4 h-4 ml-3 opacity-60" />
                </button>
                
                {showDateDropdown && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-20 p-2">
                    <button onClick={() => { setTimeFilter('current_month'); setShowDateDropdown(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                      August 2026 (Current)
                    </button>
                    <button onClick={() => { setTimeFilter('3_months_plus_current'); setShowDateDropdown(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                      Last 3 Months + Current
                    </button>
                    <button onClick={() => { setTimeFilter('6_months'); setShowDateDropdown(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
                      Last 6 Months
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* 4 Summary Cards - Soft & Modern */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-between hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold">Due Soon</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Bill</div>
                      <div className="text-3xl font-extrabold text-slate-900">₹850</div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-between hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                        <Activity className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Usage</div>
                      <div className="text-3xl font-extrabold text-slate-900">
                        {getFilteredChartData().reduce((acc, curr) => acc + (curr.yourValue || 0), 0).toFixed(1)} <span className="text-lg text-slate-400">kL</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col justify-between hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">System Alerts</div>
                      <div className="text-3xl font-extrabold text-slate-900">{notifications.length}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-[24px] shadow-lg shadow-indigo-500/30 border border-indigo-400/30 flex flex-col justify-between hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white">
                        <Droplet className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 bg-white/20 text-white rounded-lg text-xs font-bold backdrop-blur-sm">-8% WoW</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">Avg Daily</div>
                      <div className="text-3xl font-extrabold text-white">322 <span className="text-lg text-indigo-200">L</span></div>
                    </div>
                  </div>
                </div>

                {/* Chart & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:col-span-2">
                    <div className="mb-10 flex justify-between items-end">
                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Usage Analytics</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">Monitored over {getFilterLabel()}</p>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getFilteredChartData()} margin={{ top: 20, right: 0, left: -25, bottom: 0 }} barSize={32}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} dy={12} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#fff', color: '#0f172a', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 20px' }} />
                          <Legend verticalAlign="top" height={36}/><Bar dataKey="yourValue" name="Your Usage" fill="#6366f1" radius={[4, 4, 0, 0]} />
<Bar dataKey="avgValue" name="Community Avg" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                          <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={1}/>
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={1}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
                    <div className="mb-8">
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Quick Links</h2>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      <button onClick={() => setActiveTab('payment')} className="w-full flex items-center p-5 bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-2xl transition-all text-left group">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mr-4 text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-900 transition-colors">Settle Dues</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Pay outstanding invoices</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors group-hover:translate-x-1 transform" />
                      </button>
                      
                      <button onClick={() => setShowTicketModal(true)} className="w-full flex items-center p-5 bg-slate-50 hover:bg-purple-50 border border-transparent hover:border-purple-100 rounded-2xl transition-all text-left group">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mr-4 text-slate-400 group-hover:text-purple-600 transition-colors">
                          <Wrench className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-purple-900 transition-colors">Support</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Report an issue</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-purple-400 transition-colors group-hover:translate-x-1 transform" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Invoices Table */}
                <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recent Invoices</h2>
                    </div>
                    <button onClick={() => setActiveTab('bills')} className="text-indigo-600 font-bold text-sm hover:text-indigo-700 transition-colors">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Billing Period</th>
                          <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                          <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount (₹)</th>
                          <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                          <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {invoices.length === 0 ? (
                          <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-medium">No records found.</td></tr>
                        ) : invoices.map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6 font-bold text-slate-800">{inv.billingPeriodStart} to {inv.billingPeriodEnd}</td>
                            <td className="px-8 py-6 text-slate-500 font-medium">{inv.dueDate}</td>
                            <td className="px-8 py-6 font-extrabold text-slate-900 text-right">{inv.amount.toFixed(2)}</td>
                            <td className="px-8 py-6 text-center">
                              <span className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-bold ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDownloadInvoice(inv.id)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Download PDF">
                                  <Download className="w-5 h-5" />
                                </button>
                                {inv.status !== 'PAID' && (
                                  <button onClick={() => handlePayment(inv.id)} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-indigo-500/20">
                                    PAY NOW
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* USAGE ANALYTICS TAB */}
            {activeTab === 'usage' && (
              <div className="bg-white p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10">
                <div className="mb-10 flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Usage Analytics</h2>
                    <p className="text-sm text-slate-400 font-medium mt-1">Monitored over {getFilterLabel()}</p>
                  </div>
                </div>
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getFilteredChartData()} margin={{ top: 20, right: 0, left: -25, bottom: 0 }} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 700 }} dy={12} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 600 }} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#fff', color: '#0f172a', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 20px' }} />
                      <Legend verticalAlign="top" height={36}/><Bar dataKey="yourValue" name="Your Usage" fill="#6366f1" radius={[4, 4, 0, 0]} />
<Bar dataKey="avgValue" name="Community Avg" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                      <defs>
                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={1}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* MY BILLS & PAYMENT HISTORY TAB */}
            {(activeTab === 'bills' || activeTab === 'payment') && (
              <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{activeTab === 'bills' ? 'Billing Records' : 'Payment Ledger'}</h2>
                  </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Billing Period</th>
                          <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
                          <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount (₹)</th>
                          <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                          <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {invoices.filter(inv => activeTab === 'payment' ? inv.status === 'PAID' : true).length === 0 ? (
                          <tr><td colSpan="5" className="px-8 py-10 text-center text-slate-400 font-medium">No records found.</td></tr>
                        ) : invoices.filter(inv => activeTab === 'payment' ? inv.status === 'PAID' : true).map(inv => (
                          <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-8 py-6 font-bold text-slate-800">{inv.billingPeriodStart} to {inv.billingPeriodEnd}</td>
                            <td className="px-8 py-6 text-slate-500 font-medium">{inv.dueDate}</td>
                            <td className="px-8 py-6 font-extrabold text-slate-900 text-right">{inv.amount.toFixed(2)}</td>
                            <td className="px-8 py-6 text-center">
                              <span className={`inline-flex px-3 py-1.5 rounded-xl text-xs font-bold ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDownloadInvoice(inv.id)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors" title="Download PDF">
                                  <Download className="w-5 h-5" />
                                </button>
                                {inv.status !== 'PAID' && (
                                  <button onClick={() => handlePayment(inv.id)} className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-indigo-500/20">
                                    PAY NOW
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            )}

            {/* TICKETS TAB */}
            {activeTab === 'tickets' && (
              <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-8">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Service Requests</h2>
                  </div>
                  <button 
                    onClick={() => setShowTicketModal(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-600 transition-colors flex items-center"
                  >
                    <Wrench className="w-4 h-4 mr-2" /> New Request
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Request ID</th>
                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Issue Category</th>
                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Logged Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tickets.length === 0 ? (
                        <tr><td colSpan="4" className="px-8 py-10 text-center text-slate-400 font-medium">No service requests found.</td></tr>
                      ) : tickets.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 font-extrabold text-indigo-600">REQ-{t.id.substring(t.id.length - 6).toUpperCase()}</td>
                          <td className="px-8 py-6 text-slate-800 font-bold">{t.issueType.replace('_', ' ')}</td>
                          <td className="px-8 py-6 text-center">
                            <span className={`inline-flex px-3 py-1.5 rounded-xl text-[11px] font-bold items-center ${t.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : t.status === 'IN_PROGRESS' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-500'}`}>
                              {t.status === 'RESOLVED' ? <CheckCircle className="w-4 h-4 mr-1.5" /> : <Clock className="w-4 h-4 mr-1.5" />}
                              {t.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-slate-500 font-medium">{new Date(t.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Modal for New Ticket */}
        {showTicketModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative overflow-hidden">
              <div className="px-8 py-6 flex justify-between items-center bg-slate-50/50 border-b border-slate-100">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">File Service Request</h2>
                <button onClick={() => setShowTicketModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors focus:outline-none">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmitTicket} className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                    <select 
                      value={ticketIssueType} 
                      onChange={(e) => setTicketIssueType(e.target.value)}
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    >
                      <option value="METER_BROKEN">Meter Malfunction</option>
                      <option value="PIPE_LEAK">Plumbing / Leak</option>
                      <option value="BILLING_DISPUTE">Billing Inquiry</option>
                      <option value="OTHER">General Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Details</label>
                    <textarea 
                      value={ticketDescription} 
                      onChange={(e) => setTicketDescription(e.target.value)}
                      required
                      rows="4"
                      placeholder="Provide detailed information regarding the request..."
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none placeholder:text-slate-400"
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowTicketModal(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-bold hover:from-indigo-600 hover:to-purple-600 transition-colors shadow-md shadow-indigo-500/20">
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ModernResidentDashboard;

