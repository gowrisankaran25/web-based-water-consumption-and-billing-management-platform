import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, Droplet, Camera, FileText, CheckCircle, 
  MapPin, Clock, Search, AlertCircle, Phone, X, Bell
} from 'lucide-react';

// Mobile-first PWA design for Field Technicians
const FieldTechDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  // Dummy Tasks (Mix of Meter Reads and Disconnections)
  const [tasks, setTasks] = useState([
    { id: 'TKT-001', type: 'METER_READ', flat: 'A-101', status: 'PENDING', location: 'Block A, Ground Floor', priority: 'NORMAL' },
    { id: 'TKT-002', type: 'DISCONNECTION', flat: 'B-305', status: 'PENDING', location: 'Block B, 3rd Floor', priority: 'HIGH', reason: 'Unpaid dues > 90 days' },
    { id: 'TKT-003', type: 'LEAK_INSPECTION', flat: 'C-202', status: 'PENDING', location: 'Block C, 2nd Floor', priority: 'HIGH', reason: 'Resident reported pipe leak' },
    { id: 'TKT-004', type: 'METER_READ', flat: 'A-102', status: 'COMPLETED', location: 'Block A, Ground Floor', priority: 'NORMAL' }
  ]);

  const handleCompleteTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'COMPLETED' } : t));
    setSelectedTask(null);
    alert('Task marked as completed! Synced to cloud.');
  };

  const getPriorityColor = (priority) => {
    return priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200';
  };

  const getIcon = (type) => {
    if (type === 'METER_READ') return <Droplet className="w-5 h-5" />;
    if (type === 'DISCONNECTION') return <AlertCircle className="w-5 h-5" />;
    return <Search className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Mobile Header */}
      <header className="bg-purple-700 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-xl font-bold tracking-tight">GrokSync Field</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
          FT
        </div>
      </header>

      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-64 bg-white h-full shadow-2xl flex flex-col transform transition-transform">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-purple-50">
              <span className="font-bold text-purple-700">Menu</span>
              <button onClick={() => setIsMenuOpen(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <button onClick={() => { setActiveTab('tasks'); setIsMenuOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold ${activeTab === 'tasks' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <CheckCircle className="w-5 h-5 mr-3" /> My Tasks
              </button>
              <button onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold ${activeTab === 'history' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <FileText className="w-5 h-5 mr-3" /> History
              </button>
            </nav>
            <div className="p-4 border-t border-slate-100">
              <button onClick={() => { localStorage.clear(); navigate('/fieldtech-login'); }} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Log Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-20">
        
        {/* Task List View */}
        {activeTab === 'tasks' && !selectedTask && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Today's Route</h1>
                <p className="text-sm text-slate-500 font-medium">{tasks.filter(t => t.status === 'PENDING').length} tasks pending</p>
              </div>
            </div>

            <div className="space-y-4">
              {tasks.filter(t => t.status === 'PENDING').map(task => (
                <div 
                  key={task.id} 
                  onClick={() => setSelectedTask(task)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${task.type === 'DISCONNECTION' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {getIcon(task.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Flat {task.flat}</h3>
                        <p className="text-xs text-slate-500 font-medium">{task.id} • {task.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-slate-500 bg-slate-50 p-2 rounded-lg">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    {task.location}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task Detail / Execution View */}
        {selectedTask && (
          <div className="animate-in slide-in-from-right-8 duration-300">
            <button 
              onClick={() => setSelectedTask(null)}
              className="mb-4 text-sm font-bold text-purple-600 flex items-center"
            >
              ← Back to Route
            </button>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
              <div className="flex items-center space-x-3 mb-4">
                 <div className={`p-3 rounded-xl ${selectedTask.type === 'DISCONNECTION' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {getIcon(selectedTask.type)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Flat {selectedTask.flat}</h2>
                    <p className="text-sm font-medium text-slate-500">{selectedTask.type.replace('_', ' ')}</p>
                  </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center p-3 bg-slate-50 rounded-xl">
                  <MapPin className="w-5 h-5 mr-3 text-slate-400" />
                  <span className="text-sm font-medium">{selectedTask.location}</span>
                </div>
                {selectedTask.reason && (
                  <div className="flex items-center p-3 bg-red-50 text-red-700 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
                    <span className="text-sm font-bold">{selectedTask.reason}</span>
                  </div>
                )}
              </div>

              {/* Action Form */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="font-bold text-slate-800 mb-4">Execute Workflow</h3>
                
                {selectedTask.type === 'METER_READ' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Meter Reading (Liters)</label>
                      <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold focus:outline-purple-500" placeholder="0.00" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600 font-medium">Please confirm that the water supply has been physically shut off at the mains.</p>
                  </div>
                )}

                {/* Shared Evidence Upload */}
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-500 mb-2">Photo Evidence</label>
                  <button className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 flex flex-col items-center justify-center hover:bg-slate-50 hover:border-purple-400 hover:text-purple-600 transition-colors">
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="text-sm font-bold">Tap to snap a photo</span>
                  </button>
                </div>

                <button 
                  onClick={() => handleCompleteTask(selectedTask.id)}
                  className="w-full mt-6 py-4 bg-purple-600 text-white font-bold rounded-xl shadow-md hover:bg-purple-700 active:bg-purple-800 transition-colors"
                >
                  Complete & Sync
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation (Mobile Tab Bar) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around py-3 px-6 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => { setActiveTab('tasks'); setSelectedTask(null); }}
          className={`flex flex-col items-center ${activeTab === 'tasks' ? 'text-purple-600' : 'text-slate-400'}`}
        >
          <CheckCircle className={`w-6 h-6 mb-1 ${activeTab === 'tasks' ? 'fill-purple-100' : ''}`} />
          <span className="text-[10px] font-bold tracking-wider">TASKS</span>
        </button>
        <button className="flex flex-col items-center text-slate-400 relative">
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
          <Bell className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold tracking-wider">ALERTS</span>
        </button>
      </nav>

    </div>
  );
};

export default FieldTechDashboard;
