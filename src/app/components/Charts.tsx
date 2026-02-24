import React from 'react';
import { createPortal } from 'react-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, Cell, ComposedChart, ReferenceLine, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList
} from 'recharts';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Maximize2, Download, X } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data
const latencyData = [
  { time: '08:00', latency: 24, jitter: 2 },
  { time: '10:00', latency: 28, jitter: 3 },
  { time: '12:00', latency: 45, jitter: 12 }, // Anomaly
  { time: '14:00', latency: 32, jitter: 5 },
  { time: '16:00', latency: 26, jitter: 2 },
  { time: '18:00', latency: 29, jitter: 4 },
  { time: '20:00', latency: 25, jitter: 2 },
];

const dataPerformanceData = [
  { date: '1-Jan', volume: 117.9, throughput: 12.2 },
  { date: '2-Jan', volume: 120.3, throughput: 11.8 },
  { date: '3-Jan', volume: 111.8, throughput: 12.5 },
  { date: '4-Jan', volume: 113.7, throughput: 12.5 },
  { date: '5-Jan', volume: 114.5, throughput: 12.5 },
  { date: '6-Jan', volume: 111.8, throughput: 12.8 },
  { date: '7-Jan', volume: 111.7, throughput: 12.3 },
  { date: '8-Jan', volume: 113.4, throughput: 12.0 },
  { date: '9-Jan', volume: 121.5, throughput: 11.7 },
  { date: '10-Jan', volume: 114.4, throughput: 12.1 },
  { date: '11-Jan', volume: 115.8, throughput: 12.0 },
  { date: '12-Jan', volume: 115.6, throughput: 12.0 },
  { date: '13-Jan', volume: 112.9, throughput: 12.2 },
  { date: '14-Jan', volume: 117.1, throughput: 12.0 },
  { date: '15-Jan', volume: 116.0, throughput: 12.1 },
  { date: '16-Jan', volume: 124.1, throughput: 11.4 },
  { date: '17-Jan', volume: 118.8, throughput: 11.2 },
];

const anomalyData = [
  { time: 'Day 1', baseline: 400, actual: 410 },
  { time: 'Day 2', baseline: 420, actual: 415 },
  { time: 'Day 3', baseline: 410, actual: 680 }, // Anomaly
  { time: 'Day 4', baseline: 430, actual: 440 },
  { time: 'Day 5', baseline: 415, actual: 425 },
];

interface ChartCardProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  images?: string[];
}

function ChartCard({ title, children, className, images }: ChartCardProps) {
  const [modalImage, setModalImage] = React.useState<string | null>(null);

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `chart-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className={cn("bg-[#0f172a] border border-slate-800/60 rounded-lg p-5 mt-4 mb-6 shadow-xl shadow-black/20", className)}>
        <h3 className="text-sm font-semibold text-slate-300 mb-6 tracking-wide uppercase flex items-center gap-2">
          <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
          {title}
        </h3>
        {images && images.length > 0 ? (
          <div className={cn(
            "grid gap-4 w-full",
            images.length === 1 ? "grid-cols-1" : 
            images.length === 2 ? "grid-cols-2" : 
            "grid-cols-2 lg:grid-cols-3"
          )}>
            {images.map((img, idx) => (
              <div key={idx} className="relative rounded-lg overflow-hidden bg-slate-900/50 border border-slate-800/40 group">
                <img 
                  src={img} 
                  alt={`Chart ${idx + 1}`} 
                  className="w-full h-full object-contain"
                />
                {/* Hover Overlay with Icons */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setModalImage(img)}
                    className="p-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg hover:scale-110"
                    title="View Full Screen"
                  >
                    <Maximize2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDownload(img, idx)}
                    className="p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-all shadow-lg hover:scale-110"
                    title="Download Image"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[280px] w-full">
            {children}
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {modalImage && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-lg z-[100000]"
            title="Close"
          >
            <X size={24} />
          </button>
          <img 
            src={modalImage} 
            alt="Full screen view" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  );
}

export function LatencyChart() {
  return (
    <ChartCard 
      title="Network Latency & Jitter Analysis"
      images={[
        "https://images.unsplash.com/photo-1762427354251-f008b64dbc32?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMGNoYXJ0fGVufDF8fHx8MTc2NjQxNzcyNHww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1759661966728-4a02e3c6ed91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmFseXRpY3MlMjBkYXNoYm9hcmQlMjBncmFwaHxlbnwxfHx8fDE3NjY0MzkxODR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1762279389083-abf71f22d338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXR3b3JrJTIwYW5hbHl0aWNzJTIwdmlzdWFsaXphdGlvbnxlbnwxfHx8fDE3NjY0NzEwMTB8MA&ixlib=rb-4.1.0&q=80&w=1080"
      ]}
    />
  );
}

export function RegionalTrafficChart() {
  return (
    <ChartCard title="Chart 2 Data Performance">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={dataPerformanceData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            dy={10}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            yAxisId="left"
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
            label={{ value: 'Data Volume (TB)', angle: -90, position: 'insideLeft', fill: '#60a5fa', fontSize: 10, dy: 50 }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={10}
            domain={[10, 14]}
            label={{ value: 'DL User Throughputs (Mbps)', angle: 90, position: 'insideRight', fill: '#f97316', fontSize: 10, dy: 50 }}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar yAxisId="left" dataKey="volume" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Data Volume(TB)" maxBarSize={30} />
          <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#f97316" strokeWidth={3} dot={false} name="DL User Throughputs (Mbps)" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function AnomalyChart() {
  return (
    <ChartCard title="Traffic Anomaly Detection">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={anomalyData}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#475569" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
             itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Area 
            type="monotone" 
            dataKey="baseline" 
            stroke="#60a5fa" 
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1} 
            fill="url(#colorBaseline)" 
            name="Predicted Baseline" 
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="#f43f5e" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorActual)" 
            name="Actual Traffic" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const HEATMAP_DATA = Array.from({ length: 7 * 24 }, (_, i) => {
    const day = Math.floor(i / 24);
    const hour = i % 24;
    // Simulate peak hours (9-17) and random noise
    const isPeak = hour >= 9 && hour <= 17;
    const baseLoad = isPeak ? 70 : 30;
    const value = Math.min(100, Math.max(0, baseLoad + (Math.random() * 40 - 20)));
    return { day, hour, value };
});

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function NetworkHeatmap() {
    return (
        <ChartCard title="Network Load Heatmap (7 Days)">
            <div className="flex h-full flex-col">
                <div className="flex-1 grid grid-cols-24 gap-1 min-h-0">
                    {HEATMAP_DATA.map((cell, i) => (
                        <div 
                            key={i}
                            title={`${DAYS[cell.day]} ${cell.hour}:00 - Load: ${Math.round(cell.value)}%`}
                            className="rounded-[1px] transition-all hover:ring-1 hover:ring-white/50"
                            style={{
                                backgroundColor: `hsla(226, 70%, 60%, ${cell.value / 100})`
                            }}
                        />
                    ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-mono uppercase">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:00</span>
                </div>
                 <div className="absolute left-0 top-[60px] bottom-[40px] -ml-6 flex flex-col justify-between text-[10px] text-slate-500 font-mono hidden">
                    {DAYS.map(d => <span key={d}>{d}</span>)}
                </div>
            </div>
        </ChartCard>
    );
}

// Telecom-specific charts for demo Q&A
const cellUtilizationData = [
  { category: 'Low (<40%)', cells: 3800, percentage: 70 },
  { category: 'Medium (40-70%)', cells: 764, percentage: 14 },
  { category: 'High (>70%)', cells: 872, percentage: 16 }
];

export function CellUtilizationChart() {
  return (
    <ChartCard title="4G Cell Utilization Distribution">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cellUtilizationData} layout="vertical" barGap={8}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
          <XAxis 
            type="number"
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
          />
          <YAxis 
            dataKey="category"
            type="category"
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            width={120}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
            formatter={(value: number, name: string) => {
              if (name === 'cells') return [value, 'Cells'];
              return [value + '%', 'Percentage'];
            }}
          />
          <Bar dataKey="cells" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={40}>
            {cellUtilizationData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index === 2 ? '#ef4444' : index === 1 ? '#f59e0b' : '#10b981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const regionalUtilizationData = [
  { region: 'Dhaka', ratio: 18.2 },
  { region: 'Chittagong', ratio: 15.6 },
  { region: 'Sylhet', ratio: 20.8 },
  { region: 'Rajshahi', ratio: 12.4 },
  { region: 'Khulna', ratio: 14.1 },
  { region: 'Barisal', ratio: 11.9 }
];

export function RegionalUtilizationChart() {
  return (
    <ChartCard title="Regional High Utilization Ratio (%)">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={regionalUtilizationData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="region" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
            domain={[0, 25]}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
            formatter={(value: number) => [value + '%', 'High Utilization Ratio']}
          />
          <Bar dataKey="ratio" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {regionalUtilizationData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.region === 'Sylhet' ? '#ef4444' : '#60a5fa'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const sylhetBreakdownData = [
  { area: 'Fenchuganj', cells: 10 },
  { area: 'Balaganj', cells: 23 },
  { area: 'Beani Bazar', cells: 11 },
  { area: 'Bishwanath', cells: 8 },
  { area: 'Companiganj', cells: 3 },
  { area: 'Dakshin Surma', cells: 2 },
  { area: 'Golabganj', cells: 5 },
  { area: 'Gowainghat', cells: 7 },
  { area: 'Jaintiapur', cells: 15 },
  { area: 'Kanaighat', cells: 2 },
  { area: 'Sylhet Sadar', cells: 87 },
  { area: 'Zakiganj', cells: 4 },
];

export function SylhetBreakdownChart() {
  return (
    <ChartCard title="Chart 8 Thana of Sylhet District High Utilized Sector">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sylhetBreakdownData} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="area" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
            formatter={(value: number) => [value, 'High Utilized Sectors']}
          />
          <Bar dataKey="cells" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {sylhetBreakdownData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.area === 'Sylhet Sadar' ? '#336791' : '#336791'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const ministerExperienceData = [
  { date: '20-Dec', cei: 4.8 },
  { date: '21-Dec', cei: 4.6 },
  { date: '22-Dec', cei: 4.7 },
  { date: '23-Dec', cei: 4.5 },
  { date: '24-Dec', cei: 4.6 },
  { date: '25-Dec', cei: 4.4 },
  { date: '26-Dec', cei: 2.3 },
  { date: '27-Dec', cei: 4.5 }
];

export function MinisterExperienceChart() {
  return (
    <ChartCard title="Minister CEI (Customer Experience Index) - Last 7 Days">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={ministerExperienceData}>
          <defs>
            <linearGradient id="colorCEI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
            domain={[0, 5]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
            formatter={(value: number) => [value.toFixed(1), 'CEI Score']}
          />
          <Line 
            type="monotone" 
            dataKey="cei" 
            stroke="#60a5fa" 
            strokeWidth={3}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={payload.cei < 3 ? 6 : 4} 
                  fill={payload.cei < 3 ? '#ef4444' : '#60a5fa'}
                  stroke="#fff"
                  strokeWidth={2}
                />
              );
            }}
            name="CEI Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const cellSpeedData = [
  { time: '08:00', speed: 45, utilization: 45 },
  { time: '12:00', speed: 38, utilization: 58 },
  { time: '16:00', speed: 42, utilization: 52 },
  { time: '18:00', speed: 25, utilization: 72 },
  { time: '20:00', speed: 8, utilization: 88 },
  { time: '22:00', speed: 1.5, utilization: 95 },
  { time: '23:00', speed: 12, utilization: 82 }
];

export function CellSpeedUtilizationChart() {
  return (
    <ChartCard title="Cell CTCX02L18A - Speed vs Utilization (27-Dec)">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={cellSpeedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dy={10}
          />
          <YAxis 
            yAxisId="left"
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
            label={{ value: 'Speed (Mbps)', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10 }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={10}
            label={{ value: 'Utilization (%)', angle: 90, position: 'insideRight', fill: '#ef4444', fontSize: 10 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="speed" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            name="Speed (Mbps)"
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="utilization" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ fill: '#ef4444', r: 4 }}
            name="Utilization (%)"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const deviceDistributionData = [
  { type: '2G 3G 4G 5G', count: 600, fill: '#22c55e' },
  { type: '2G 3G 4G', count: 350, fill: '#3b82f6' },
  { type: '2G 3G', count: 25, fill: '#eab308' },
  { type: '2G', count: 25, fill: '#ef4444' }
];

export function DeviceDistributionChart() {
  return (
    <ChartCard title="Handset Compatibility (Tech Support)">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={deviceDistributionData} layout="vertical" margin={{ left: 40, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis 
            dataKey="type" 
            type="category" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            width={100}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
            {deviceDistributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList dataKey="count" position="right" fill="#94a3b8" fontSize={11} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const pranGroupOverviewData = [
  { label: 'Total User', value: '1000' },
  { label: 'Voice Call/Week', value: '70000' },
  { label: 'Call Setup Success Rate', value: '99.50%', color: 'text-green-400' },
  { label: 'Call Drop Rate', value: '99.80%', color: 'text-green-400' },
  { label: 'VoLTE Usage Ratio', value: '40%', color: 'text-yellow-400' },
  { label: '2G Fallback User Ratio', value: '5%', color: 'text-red-400' },
  { label: 'Data Consumption GB/Day', value: '30 GB' },
  { label: 'Avg User Throughput', value: '15Mbps' },
];

export function PranGroupOverviewChart() {
  return (
    <ChartCard title="Pran Group Experience Report">
      <div className="grid grid-cols-2 gap-3 h-full overflow-y-auto p-1 content-start">
         {pranGroupOverviewData.map((item, index) => (
            <div key={index} className="bg-slate-800/40 p-3 rounded border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
               <div className="text-slate-400 text-[10px] uppercase tracking-wider mb-1 font-medium">
                 {item.label}
               </div>
               <div className={cn("text-lg font-bold text-white", item.color)}>{item.value}</div>
            </div>
         ))}
      </div>
    </ChartCard>
  );
}

const simCompatibilityData = [
  { name: 'USIM', value: 980, color: '#22c55e' },
  { name: 'Normal SIM', value: 20, color: '#ef4444' }
];

export function SimCompatibilityChart() {
  return (
    <ChartCard title="SIM Compatibility Status">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={simCompatibilityData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {simCompatibilityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <LabelList 
               dataKey="value" 
               position="center" 
               className="fill-white text-xl font-bold" 
               formatter={(val: number) => val === 980 ? '98%' : ''}
            />
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// Generate 20 users with normal SIMs
const userSolutionData = Array.from({ length: 20 }).map((_, i) => ({
    sim: `01711****`, // Masked as per image
    type: 'Normal SIM'
}));

export function UserSolutionTable() {
  return (
    <ChartCard title="User Wise Solution (Normal SIM List)">
      <div className="h-full overflow-hidden flex flex-col">
        <div className="flex bg-slate-800/50 py-2 px-4 text-xs font-semibold text-slate-300 border-b border-slate-700">
          <div className="w-1/2">MSISDN</div>
          <div className="w-1/2">Issue Type</div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {userSolutionData.map((item, index) => (
            <div key={index} className="flex py-2 px-4 text-xs text-slate-400 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              <div className="w-1/2 font-mono text-slate-300">{item.sim}</div>
              <div className="w-1/2 text-red-400">{item.type}</div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

const circleGrowthData = [
  { circle: 'Chittagong Circle', jan17: 15.5, jan10: 14.9 },
  { circle: 'Dhaka Circle', jan17: 21.3, jan10: 20.3 },
  { circle: 'Khulna Circle', jan17: 22.6, jan10: 22.0 },
  { circle: 'Mymensingh Circle', jan17: 14.5, jan10: 14.0 },
  { circle: 'Rajshahi Circle', jan17: 26.1, jan10: 25.2 },
  { circle: 'Sylhet Circle', jan17: 18.8, jan10: 18.1 },
];

export function CircleWiseDataGrowthChart() {
  return (
    <ChartCard title="Chart 3 Circle Wise Data Growth">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={circleGrowthData} barGap={0}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="circle" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            dy={10}
            interval={0}
            angle={0}
            tickFormatter={(value) => value.replace(' Circle', '')}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="jan17" fill="#1e6b91" radius={[0, 0, 0, 0]} name="17-Jan" />
          <Bar dataKey="jan10" fill="#e07e41" radius={[0, 0, 0, 0]} name="10-Jan" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const throughputChangeData = [
  { circle: 'Chittagong Circle', change: 0.04 },
  { circle: 'Dhaka Circle', change: 0.03 },
  { circle: 'Khulna Circle', change: -0.01 },
  { circle: 'Mymensingh Circle', change: -0.15 },
  { circle: 'Rajshahi Circle', change: 0.01 },
  { circle: 'Sylhet Circle', change: -0.02 },
];

export function ThroughputChangeChart() {
  return (
    <ChartCard title="Chart 4 Throughput Change">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={throughputChangeData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="circle" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            dy={10}
            interval={0}
            tickFormatter={(value) => value.replace(' Circle', '')}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
            formatter={(value: number) => [(value * 100).toFixed(0) + '%', 'Difference']}
          />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Bar dataKey="change" radius={[2, 2, 0, 0]}>
            {throughputChangeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#4bb4e6" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const cellAvailabilityData = [
  { circle: 'Chittagong Circle', availability: 99.89 },
  { circle: 'Dhaka Circle', availability: 99.96 },
  { circle: 'Khulna Circle', availability: 99.80 },
  { circle: 'Mymensingh Circle', availability: 99.00 },
  { circle: 'Rajshahi Circle', availability: 99.99 },
  { circle: 'Sylhet Circle', availability: 99.96 },
];

export function CellAvailabilityChart() {
  return (
    <ChartCard title="Chart 5 Cell Availability %">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={cellAvailabilityData} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="circle" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            dy={10}
            interval={0}
            tickFormatter={(value) => value.replace(' Circle', '')}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
            domain={[98, 100.5]}
            ticks={[98.4, 98.6, 98.8, 99.0, 99.2, 99.4, 99.6, 99.8, 100.0, 100.2]}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
            formatter={(value: number) => [value.toFixed(2) + '%', 'Availability']}
          />
          <Bar dataKey="availability" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {cellAvailabilityData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.circle === 'Mymensingh Circle' ? '#ef4444' : '#336791'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const highUtilizedSectorData = [
  { circle: 'Chittagong Circle', sectors: 116 },
  { circle: 'Dhaka Circle', sectors: 134 },
  { circle: 'Khulna Circle', sectors: 211 },
  { circle: 'Mymensingh Circle', sectors: 144 },
  { circle: 'Rajshahi Circle', sectors: 191 },
  { circle: 'Sylhet Circle', sectors: 511 },
];

export function HighUtilizedSectorChart() {
  return (
    <ChartCard title="Chart 7 Circle wise High Utilized Sector">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={highUtilizedSectorData} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
          <XAxis 
            dataKey="circle" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            dy={10}
            interval={0}
            tickFormatter={(value) => value.replace(' Circle', '')}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: '#1e293b', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
            formatter={(value: number) => [value, 'High Utilized Sectors']}
          />
          <Bar dataKey="sectors" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {highUtilizedSectorData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.circle === 'Sylhet Circle' ? '#ef4444' : '#336791'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

const sectorSolutionData = [
  { name: 'L26 8T>MM', value: 16, color: '#336791' },
  { name: 'L26 8T', value: 35, color: '#ea580c' },
  { name: 'L18 L21 4T4R', value: 7, color: '#15803d' },
  { name: 'L21 2T', value: 9, color: '#3b82f6' },
  { name: 'Load Balancing (Between Layers)', value: 15, color: '#9333ea' },
  { name: 'Load Balancing (Between NBRs)', value: 5, color: '#84cc16' },
];

export function SectorSolutionChart() {
  return (
    <ChartCard title="Chart 9 Sector wise Solution">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sectorSolutionData}
            cx="40%"
            cy="50%"
            labelLine={false}
            label={({ name, percent, value }) => `${value} (${(percent * 100).toFixed(1)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {sectorSolutionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// Helper to generate list data based on distribution
const generateSolutionList = () => {
  const distribution = [
    { solution: 'L26 8T>MM', count: 16 },
    { solution: 'L26 8T', count: 35 },
    { solution: 'L18 L21 4T4R', count: 7 },
    { solution: 'L21 2T', count: 9 },
    { solution: 'Load Balancing (Between Layers)', count: 15 },
    { solution: 'Load Balancing (Between NBRs)', count: 5 },
  ];

  let idCounter = 1;
  const list: { id: string; solution: string }[] = [];

  distribution.forEach(group => {
    for (let i = 0; i < group.count; i++) {
      // Generate a realistic ID like SYZST1C, SYZIN9A, etc.
      // We'll just use a simple sequence for now to ensure uniqueness and simplicity
      // but try to mimic the look: SY + 3 letters + number + sector(A/B/C)
      const siteNum = Math.floor((idCounter + 2) / 3);
      const sector = ['A', 'B', 'C'][idCounter % 3];
      // Randomize the 3 middle letters for variety to match screenshot "ZST", "ZIN", "ZAK"
      const codes = ['ZST', 'ZIN', 'ZAK', 'WTV', 'VOL', 'VAD', 'UTN', 'UTH', 'UTB', 'UPS'];
      const code = codes[Math.floor(Math.random() * codes.length)];
      
      list.push({
        id: `SY${code}${siteNum}${sector}`,
        solution: group.solution
      });
      idCounter++;
    }
  });

  return list;
};

const solutionListData = generateSolutionList();

export function SolutionTable() {
  return (
    <ChartCard title="Detailed Sector Solution List">
      <div className="h-full overflow-hidden flex flex-col">
        <div className="flex bg-slate-800/50 py-2 px-4 text-xs font-semibold text-slate-300 border-b border-slate-700">
          <div className="w-1/3">Sector ID</div>
          <div className="w-2/3">Suggested Solution</div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {solutionListData.map((item, index) => (
            <div key={index} className="flex py-2 px-4 text-xs text-slate-400 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
              <div className="w-1/3 font-mono text-slate-300">{item.id}</div>
              <div className="w-2/3">{item.solution}</div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}