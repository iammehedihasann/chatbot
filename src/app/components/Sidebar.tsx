import React from 'react';
import { MessageSquare, FileText, BarChart2, Plus, ChevronLeft, ChevronRight, User, LogOut, Sun, Moon, Settings, ChevronDown, MessageCircle } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { SystemUiconsCreate } from "../../imports/SystemUiconsCreate";
import { useTheme } from '../context/ThemeContext';

const LOGO_SRC = '/gplogo.png';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

interface SidebarProps {
  className?: string;
  onHistorySelect: (id: string) => void;
  onFileUpload: (file: File) => void;
  onNewChat: () => void;
  onWorkspaceSelect: () => void;
  activeSessionId: string | null;
  currentView?: 'chat' | 'workspace';
  searchHistory?: SearchHistoryItem[];
}

export function Sidebar({ className, onHistorySelect, onFileUpload, onNewChat, onWorkspaceSelect, activeSessionId, currentView = 'chat', searchHistory = [] }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);
  const [showSettings, setShowSettings] = React.useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={cn(
      "group flex flex-col h-full text-slate-300 border-r transition-all duration-300 relative",
      theme === 'dark' ? "bg-[#0D1117] border-slate-800/60" : "bg-white border-slate-200",
      isCollapsed ? "w-[70px]" : "w-[280px]",
      className
    )}>
      {/* Floating Collapse/Expand Button on Logo - Shows on Hover in Collapsed Mode */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute z-50 top-4 left-4 p-2 rounded-lg hover:text-blue-400 transition-all shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100",
            theme === 'dark' 
              ? "bg-slate-800/80 hover:bg-slate-700 text-slate-400 border border-slate-700/50" 
              : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300"
          )}
          title="Expand sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Header / Logo Area - Hides on Hover */}
      <div 
        className={cn(
          "p-4 border-b flex items-center gap-3 cursor-pointer transition-all relative min-h-[72px]",
          theme === 'dark' ? "border-slate-800/60 hover:bg-slate-900/30" : "border-slate-200 hover:bg-slate-50",
          isCollapsed && "group-hover:opacity-0 justify-center"
        )}
        onClick={onNewChat}
      >
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 shrink-0 overflow-hidden">
          <ImageWithFallback src={LOGO_SRC} alt="Grameenphone Logo" className="w-full h-full object-contain p-0.5" />
        </div>
        {!isCollapsed && (
          <>
            <div className="flex-1 overflow-hidden">
              <h1 className="font-semibold text-white tracking-tight">Grameenphone</h1>
              <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Enterprise AI</p>
            </div>
            {/* Collapse Button - Always visible in expanded mode */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCollapsed(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-all border border-slate-700/50"
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        )}
      </div>

      {/* Main Navigation - History */}
      <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <div className="mb-8">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 mb-3">
              <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Recent Analysis</h2>
              <button 
                onClick={() => onHistorySelect('capacity-plan')}
                className="text-slate-500 hover:text-blue-400 transition-colors"
                title="New Analysis"
              >
                <SystemUiconsCreate className="w-6 h-6" />
              </button>
            </div>
          )}
          {isCollapsed && (
            <div className="mb-3 flex justify-center">
              <button 
                onClick={() => onHistorySelect('capacity-plan')}
                className={cn(
                  "text-slate-500 hover:text-blue-400 transition-colors w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  theme === 'dark' ? "hover:bg-slate-900" : "hover:bg-slate-100"
                )}
                title="New Analysis"
              >
                <SystemUiconsCreate className="w-5 h-5 shrink-0 block" />
              </button>
            </div>
          )}
          <div className="space-y-0.5">
            <NavItem 
              icon={<BarChart2 size={15} className="text-blue-400" />} 
              label="4G Capacity Plan" 
              active={currentView === 'chat' && activeSessionId === 'capacity-plan'} 
              onClick={() => onHistorySelect('capacity-plan')}
              isCollapsed={isCollapsed}
              theme={theme}
            />
            
            {!isCollapsed && <div className="h-px bg-slate-200/50 dark:bg-slate-800/50 my-2 mx-2" />}

            <NavItem 
              icon={<FileText size={15} />} 
              label="Q3 Network Latency Report" 
              active={currentView === 'chat' && activeSessionId === 'q3-report'} 
              onClick={() => onHistorySelect('q3-report')}
              isCollapsed={isCollapsed}
              theme={theme}
            />
            <NavItem 
              icon={<FileText size={15} />} 
              label="5G Tower Anomaly Scan" 
              active={currentView === 'chat' && activeSessionId === '5g-scan'} 
              onClick={() => onHistorySelect('5g-scan')}
              isCollapsed={isCollapsed}
              theme={theme}
            />
            <NavItem 
              icon={<FileText size={15} />} 
              label="Bandwidth Allocation Prep" 
              active={currentView === 'chat' && activeSessionId === 'bandwidth'} 
              onClick={() => onHistorySelect('bandwidth')}
              isCollapsed={isCollapsed}
              theme={theme}
            />
            <NavItem 
              icon={<FileText size={15} />} 
              label="Customer Churn Prediction" 
              active={currentView === 'chat' && activeSessionId === 'churn'} 
              onClick={() => onHistorySelect('churn')}
              isCollapsed={isCollapsed}
              theme={theme}
            />

            {searchHistory.length > 0 && !isCollapsed && (
              <>
                <div className="h-px bg-slate-200/50 dark:bg-slate-800/50 my-2 mx-2" />
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest px-2 mb-2">Recent chats</p>
                {searchHistory.slice(0, 20).map((item) => (
                  <NavItem
                    key={item.id}
                    icon={<MessageCircle size={15} className="text-slate-500" />}
                    label={item.query.length > 36 ? item.query.slice(0, 36) + '…' : item.query}
                    active={currentView === 'chat' && activeSessionId === item.id}
                    onClick={() => onHistorySelect(item.id)}
                    isCollapsed={false}
                    theme={theme}
                    title={item.query}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Profile Card */}
      <div className={cn(
        "p-4 border-t",
        theme === 'dark' ? "border-slate-800/60 bg-[#0D1117]" : "border-slate-200 bg-slate-50"
      )}>
        {isLoggedIn ? (
          <div className="space-y-2">
            {/* Profile Info */}
            <div 
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                theme === 'dark' 
                  ? "bg-slate-900/50 border-slate-800/60 hover:bg-slate-900" 
                  : "bg-white border-slate-200 hover:bg-slate-50",
                isCollapsed && "justify-center p-2 w-10 h-10 border-0 bg-transparent hover:bg-slate-900"
              )}
              onClick={() => !isCollapsed && setShowSettings(!showSettings)}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg shrink-0">
                JD
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-white text-sm truncate">John Doe</p>
                    <p className="text-xs text-slate-400 truncate">john.doe@grameenphone.com</p>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={cn(
                      "text-slate-400 transition-transform",
                      showSettings && "rotate-180"
                    )}
                  />
                </>
              )}
            </div>

            {/* Settings Menu - Expandable */}
            {showSettings && !isCollapsed && (
              <div className="space-y-1 pl-1">
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-slate-900 text-slate-300 hover:text-blue-100 group"
                >
                  <div className="p-1 rounded-md transition-colors shrink-0 text-amber-400 group-hover:text-amber-300">
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  </div>
                  <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>

                {/* Settings */}
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-slate-900 text-slate-300 hover:text-blue-100 group"
                >
                  <div className="p-1 rounded-md transition-colors shrink-0 text-slate-400 group-hover:text-blue-400">
                    <Settings size={16} />
                  </div>
                  <span className="font-medium">Settings</span>
                </button>

                {/* Logout */}
                <button 
                  onClick={() => {
                    setIsLoggedIn(false);
                    setShowSettings(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-red-600/10 text-slate-300 hover:text-red-100 group"
                >
                  <div className="p-1 rounded-md transition-colors shrink-0 text-red-400 group-hover:text-red-300">
                    <LogOut size={16} />
                  </div>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}

            {/* Collapsed mode - Settings popup on click */}
            {isCollapsed && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full p-2 rounded-lg hover:bg-slate-900 transition-all"
                title="Settings"
              >
                <Settings size={16} className="mx-auto text-slate-400" />
              </button>
            )}
          </div>
        ) : (
          /* Login Prompt */
          <button 
            onClick={() => setIsLoggedIn(true)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-lg border transition-all text-sm group shadow-sm",
              "bg-slate-900 hover:bg-blue-600/10 border-slate-800 hover:border-blue-500/30 text-slate-300 hover:text-blue-100",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Login" : undefined}
          >
            <div className="p-1.5 rounded-md transition-colors shrink-0 bg-slate-800 text-blue-400 group-hover:bg-blue-500 group-hover:text-white">
              <User size={16} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <p className="font-semibold">Sign In</p>
                <p className="text-xs text-slate-400">Access your account</p>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick, isCollapsed = false, theme, title: titleProp }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, isCollapsed?: boolean, theme: 'dark' | 'light'; title?: string }) {
  return (
    <button 
      onClick={onClick}
      title={titleProp ?? (isCollapsed ? label : undefined)}
      className={cn(
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left truncate group relative",
      active 
        ? "bg-blue-500/10 text-blue-300 font-medium" 
        : theme === 'dark'
          ? "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
      isCollapsed && "justify-center px-0 w-10 h-10 mx-auto"
    )}
    >
      {active && !isCollapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-500 rounded-r-full" />}
      <span className={cn("transition-colors shrink-0 flex items-center justify-center", active ? "text-blue-400" : theme === 'dark' ? "text-slate-500 group-hover:text-slate-300" : "text-slate-500 group-hover:text-slate-700")}>{icon}</span>
      {!isCollapsed && <span className="truncate">{label}</span>}
    </button>
  );
}