import React from 'react';
import { LatencyChart, RegionalTrafficChart, AnomalyChart, NetworkHeatmap } from './Charts';
import { Activity, Server, Wifi, AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Workspace() {
  const { theme } = useTheme();
  
  return (
    <div className={`flex flex-col h-full text-slate-300 overflow-y-auto custom-scrollbar ${
      theme === 'dark' ? 'bg-[#0B1120]' : 'bg-white'
    }`}>
      {/* Workspace Header */}
      <div className={`p-6 border-b flex items-center justify-between sticky top-0 backdrop-blur-sm z-20 ${
        theme === 'dark' ? 'border-slate-800/60 bg-[#0B1120]/95' : 'border-slate-200 bg-white/95'
      }`}>
        <div>
          <h2 className={`text-xl font-semibold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-slate-900'
          }`}>Analytics Workspace</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time network monitoring dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Normal
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Active Nodes" value="1,248" change="+12%" icon={<Server size={18} />} trend="up" />
            <KpiCard title="Network Load" value="78%" change="+5%" icon={<Activity size={18} />} trend="up" alert />
            <KpiCard title="Avg Latency" value="24ms" change="-2ms" icon={<Wifi size={18} />} trend="down" />
            <KpiCard title="Anomalies (24h)" value="3" change="0" icon={<AlertTriangle size={18} />} trend="neutral" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <LatencyChart />
            <RegionalTrafficChart />
        </div>

        {/* Full Width Charts */}
        <div className="grid grid-cols-1 gap-6">
            <NetworkHeatmap />
            <AnomalyChart />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, icon, trend, alert }: any) {
    const { theme } = useTheme();
    
    return (
        <div className={`border p-4 rounded-lg shadow-lg relative overflow-hidden group ${
            theme === 'dark' ? 'bg-[#0f172a] border-slate-800/60' : 'bg-white border-slate-200'
        }`}>
            {alert && <div className="absolute right-0 top-0 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent blur-xl -mr-4 -mt-4" />}
            
            <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-md group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-colors ${
                    theme === 'dark' ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}>
                    {icon}
                </div>
                <div className={`text-xs font-medium px-2 py-0.5 rounded ${
                    trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 
                    trend === 'down' ? 'text-indigo-400 bg-indigo-500/10' : 
                    theme === 'dark' ? 'text-slate-400 bg-slate-800' : 'text-slate-600 bg-slate-100'
                }`}>
                    {change}
                </div>
            </div>
            
            <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-0.5">{title}</h3>
            <p className={`text-2xl font-bold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}>{value}</p>
        </div>
    )
}