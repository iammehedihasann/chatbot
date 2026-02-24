import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Paperclip, FileText, Database, Lightbulb, Upload, Zap, X, ArrowRight, Mic } from 'lucide-react';
import { AnalysisPanel } from './AnalysisPanel';
import { 
  LatencyChart, 
  RegionalTrafficChart, 
  AnomalyChart, 
  NetworkHeatmap,
  CellUtilizationChart,
  RegionalUtilizationChart,
  SylhetBreakdownChart,
  MinisterExperienceChart,
  CellSpeedUtilizationChart,
  DeviceDistributionChart,
  CircleWiseDataGrowthChart,
  ThroughputChangeChart,
  CellAvailabilityChart,
  HighUtilizedSectorChart,
  SectorSolutionChart,
  SolutionTable,
  PranGroupOverviewChart,
  SimCompatibilityChart,
  UserSolutionTable
} from './Charts';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { createPortal } from 'react-dom';
import { querySse } from '../api/chatApi';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: React.ReactNode;
  isAnalyzing?: boolean;
  chartType?: 'latency' | 'traffic' | 'anomaly' | 'heatmap' | 'cell-utilization' | 'regional-utilization' | 'sylhet-breakdown' | 'minister-experience' | 'cell-speed' | 'device-distribution' | 'circle-growth' | 'throughput-change' | 'cell-availability' | 'high-utilized-sector' | 'sector-solution' | 'solution-table' | 'pran-group-overview' | 'sim-compatibility' | 'user-solution-table';
  suggestions?: string[];
  timestamp: string;
}

type ChartType = 'latency' | 'traffic' | 'anomaly' | 'heatmap' | 'cell-utilization' | 'regional-utilization' | 'sylhet-breakdown' | 'minister-experience' | 'cell-speed' | 'device-distribution' | 'circle-growth' | 'throughput-change' | 'cell-availability' | 'high-utilized-sector' | 'sector-solution' | 'solution-table' | 'pran-group-overview' | 'sim-compatibility' | 'user-solution-table';

const INITIAL_MESSAGE: Message = {
    id: 'intro',
    role: 'ai',
    content: (
        <div>
            <p className="font-medium text-slate-200 mb-2">System Ready.</p>
            <p>I have access to the internal data warehouse and can analyze uploaded logs. Please upload a dataset or ask a specific question about network performance.</p>
        </div>
    ),
    timestamp: '09:41 AM'
};

interface ChatAreaProps {
    activeSessionId: string | null;
    uploadedFile: File | null;
    onSearchSent?: (query: string) => void;
}

interface FeedbackState {
  messageId: string;
  incorrectAnswer: boolean;
  visualizationIssue: boolean;
}

export function ChatArea({ activeSessionId, uploadedFile, onSearchSent }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isDeepAnalysisActive, setIsDeepAnalysisActive] = useState(false);
  const [feedbackState, setFeedbackState] = useState<FeedbackState | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [analysisPanelExpanded, setAnalysisPanelExpanded] = useState<Record<string, boolean>>({});
  const [apiThreadId, setApiThreadId] = useState<string | null>(null);
  const [apiMemoryKey, setApiMemoryKey] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // 15 predefined questions for voice demo
  const VOICE_DEMO_QUESTIONS = [
    "What the data network health",
    "What is Circle wise health in Data",
    "What is circle wise throughput performance",
    "What is circle wise data traffic growth?",
    "What is the root cause of throughput degradation",
    "What is network data utilization status?",
    "Which circle is highly utilized?",
    "Share me more granular status?",
    "What is the solution?",
    "Share me cell list with solution",
    "I am visiting pran group. What is the experience report of pran group",
    "Share me handset compatibility of these user",
    "Share me worst SIM compatibility of these user",
    "Share me recommendation",
    "I am visiting minister house. What is the experience?"
  ];

  // Load History – all responses come from API; reset thread when session changes
  useEffect(() => {
    setMessages([INITIAL_MESSAGE]);
    setApiThreadId(null);
    setApiMemoryKey(undefined);
  }, [activeSessionId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };

    if (showAttachMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttachMenu]);

  // Handle File Upload Injection
  useEffect(() => {
    if (uploadedFile) {
        const fileMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: (
                <div className="flex items-center gap-3 bg-slate-700/50 p-3 rounded-lg border border-slate-600/50">
                    <FileText size={20} className="text-blue-400" />
                    <div>
                        <p className="font-medium text-sm text-white">Uploaded: {uploadedFile.name}</p>
                        <p className="text-xs text-slate-400">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                </div>
            ),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, fileMsg]);
        
        // AI Acknowledgement
        setTimeout(() => {
             const aiAck: Message = {
                id: Date.now().toString() + 'ack',
                role: 'ai',
                content: `I've ingested "${uploadedFile.name}". Would you like me to analyze it for anomalies, performance trends, or traffic patterns?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiAck]);
        }, 1000);
    }
  }, [uploadedFile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    const question = input;
    setInput('');
    setIsProcessing(true);
    if (activeSessionId === null) onSearchSent?.(question);

    const aiMsgId = Date.now().toString() + '-ai';
    const aiResponsePlaceholder: Message = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      isAnalyzing: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiResponsePlaceholder]);

    querySse(
      {
        user_id: 'default',
        question,
        thread_id: apiThreadId ?? activeSessionId ?? 'default',
        memory_key: apiMemoryKey,
      },
      {
        onThreadId: (info) => {
          setApiThreadId(info.thread_id);
          if (info.memory_key) setApiMemoryKey(info.memory_key);
        },
        onChunk: (text) => setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: text } : m)),
        onComplete: (full, metadata) => {
          const chartType = metadata?.chart_type as ChartType | undefined;
          const suggestions = metadata?.suggestions;
          setMessages(prev => prev.map(m =>
            m.id === aiMsgId
              ? { ...m, content: full || 'No response.', isAnalyzing: false, chartType, suggestions }
              : m
          ));
          setIsProcessing(false);
        },
        onError: (err) => {
          setMessages(prev => prev.map(m =>
            m.id === aiMsgId
              ? { ...m, content: `Something went wrong. ${err.message} Please try again.`, isAnalyzing: false }
              : m
          ));
          
        }
      }
    ).catch(() => {
      setIsProcessing(false);
      toast.error('Failed to get response from server.');
    });
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          toast.info("File uploaded locally to chat context");
          // Re-use logic or just simple toast for now since we have the main sidebar upload
      }
  };

  const handleDeepAnalysis = () => {
    setShowAttachMenu(false);
    toast.info("Starting deep analysis mode...");
    // Add deep analysis logic here
    const analysisMsg: Message = {
      id: Date.now().toString(),
      role: 'ai',
      content: "Deep analysis mode activated. Please describe the dataset or analysis parameters you'd like me to process.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, analysisMsg]);
    setIsDeepAnalysisActive(true);
  };

  const handleAddFiles = () => {
    setShowAttachMenu(false);
    fileInputRef.current?.click();
  };

  const handleSuggestionClick = (suggestion: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestion,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    if (activeSessionId === null) onSearchSent?.(suggestion);

    const aiMsgId = Date.now().toString() + '-ai';
    const aiResponsePlaceholder: Message = {
      id: aiMsgId,
      role: 'ai',
      content: '',
      isAnalyzing: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, aiResponsePlaceholder]);
    setAnalysisPanelExpanded(prev => ({ ...prev, [aiMsgId]: true }));

    querySse(
      {
        user_id: 'default',
        question: suggestion,
        thread_id: apiThreadId ?? activeSessionId ?? 'default',
        memory_key: apiMemoryKey,
      },
      {
        onThreadId: (info) => {
          setApiThreadId(info.thread_id);
          if (info.memory_key) setApiMemoryKey(info.memory_key);
        },
        onChunk: (text) => setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: text } : m)),
        onComplete: (full, metadata) => {
          const chartType = metadata?.chart_type as ChartType | undefined;
          const suggestionsList = metadata?.suggestions;
          setMessages(prev => prev.map(m =>
            m.id === aiMsgId
              ? { ...m, content: full || 'No response.', isAnalyzing: false, chartType, suggestions: suggestionsList }
              : m
          ));
          setIsProcessing(false);
        },
        onError: (err) => {
          setMessages(prev => prev.map(m =>
            m.id === aiMsgId
              ? { ...m, content: `Something went wrong. ${err.message} Please try again.`, isAnalyzing: false }
              : m
          ));
          setIsProcessing(false);
          toast.error('Failed to get response from server.');
        }
      }
    ).catch(() => {
      setIsProcessing(false);
      toast.error('Failed to get response from server.');
    });
  };

  const handleFeedbackCheckboxChange = (messageId: string, type: 'incorrect' | 'visualization' | 'both', checked: boolean) => {
    if (checked) {
      const incorrectAnswer = type === 'incorrect' || type === 'both';
      const visualizationIssue = type === 'visualization' || type === 'both';
      setFeedbackState({ messageId, incorrectAnswer, visualizationIssue });
      setShowFeedbackModal(true);
    }
  };

  const handleFeedbackSubmit = () => {
    if (feedbackState && feedbackText.trim()) {
      const issues: string[] = [];
      if (feedbackState.incorrectAnswer) issues.push('Incorrect answer');
      if (feedbackState.visualizationIssue) issues.push('Visualization issue');
      
      toast.success(`Feedback submitted: ${issues.join(' & ')}`);
      console.log('Feedback:', {
        messageId: feedbackState.messageId,
        issues,
        feedback: feedbackText
      });
      
      setFeedbackState(null);
      setShowFeedbackModal(false);
      setFeedbackText('');
    }
  };

  const handleFeedbackCancel = () => {
    setFeedbackState(null);
    setShowFeedbackModal(false);
    setFeedbackText('');
  };

  // Voice recording handlers
  const handleVoiceStart = () => {
    setIsRecording(true);
  };

  const handleVoiceEnd = () => {
    // Keep the modal visible for 3-4 seconds while processing
    setTimeout(() => {
      setIsRecording(false);
      // Simulate voice input by selecting random question
      const randomQuestion = VOICE_DEMO_QUESTIONS[Math.floor(Math.random() * VOICE_DEMO_QUESTIONS.length)];
      setInput(randomQuestion);
    }, 3500); // 3.5 second delay to show the animation
  };

  return (
    <div className={cn(
      "flex flex-col h-full text-slate-300 relative",
      theme === 'dark' ? 'bg-[#0B0F19]' : 'bg-slate-50'
    )}>
      {/* Background Grid Pattern - Subtle */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none" />
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth z-10 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-5 max-w-5xl mx-auto group", msg.role === 'ai' ? "" : "flex-row-reverse")}>
            {/* Avatar */}
            <div className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-lg ring-1 ring-inset",
              msg.role === 'ai' 
                ? "bg-blue-600 text-white ring-blue-500/50 shadow-blue-500/20" 
                : "bg-slate-800 text-slate-400 ring-slate-700 shadow-black/20"
            )}>
              {msg.role === 'ai' ? <Bot size={18} /> : <User size={18} />}
            </div>

            {/* Content Bubble */}
            <div className={cn(
              "flex-1 min-w-0",
              msg.role === 'user' ? "text-right" : "text-left"
            )}>
                <div className={cn(
                    "flex items-center gap-2 mb-1.5 text-[10px] tracking-wider uppercase font-medium",
                     msg.role === 'user' ? "justify-end text-slate-500" : "text-blue-400/70"
                )}>
                    <span>{msg.role === 'ai' ? 'TelcoInsight AI' : 'Analyst'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                </div>

                <div className={cn(
                    "inline-block text-left relative",
                    msg.role === 'user' 
                        ? "bg-slate-800/80 p-4 rounded-2xl rounded-tr-none text-slate-100 border border-slate-700/50 shadow-sm backdrop-blur-sm" 
                        : "w-full pl-1"
                )}>
                    {/* Analysis Panel (AI Only) */}
                    {msg.role === 'ai' && (msg.isAnalyzing || msg.chartType) && (
                        <AnalysisPanel 
                            isAnalyzing={!!msg.isAnalyzing} 
                            isExpanded={analysisPanelExpanded[msg.id] ?? true}
                            onToggleExpand={(expanded) => {
                                setAnalysisPanelExpanded(prev => ({ ...prev, [msg.id]: expanded }));
                            }}
                        />
                    )}

                    {msg.content}

                    {/* Chart (AI Only) */}
                    <div className="mt-2">
                        {!msg.isAnalyzing && msg.chartType === 'latency' && <LatencyChart />}
                        {!msg.isAnalyzing && msg.chartType === 'traffic' && <RegionalTrafficChart />}
                        {!msg.isAnalyzing && msg.chartType === 'anomaly' && <AnomalyChart />}
                        {!msg.isAnalyzing && msg.chartType === 'heatmap' && <NetworkHeatmap />}
                        {!msg.isAnalyzing && msg.chartType === 'cell-utilization' && <CellUtilizationChart />}
                        {!msg.isAnalyzing && msg.chartType === 'regional-utilization' && <RegionalUtilizationChart />}
                        {!msg.isAnalyzing && msg.chartType === 'sylhet-breakdown' && <SylhetBreakdownChart />}
                        {!msg.isAnalyzing && msg.chartType === 'minister-experience' && <MinisterExperienceChart />}
                        {!msg.isAnalyzing && msg.chartType === 'cell-speed' && <CellSpeedUtilizationChart />}
                        {!msg.isAnalyzing && msg.chartType === 'device-distribution' && <DeviceDistributionChart />}
                        {!msg.isAnalyzing && msg.chartType === 'circle-growth' && <CircleWiseDataGrowthChart />}
                        {!msg.isAnalyzing && msg.chartType === 'throughput-change' && <ThroughputChangeChart />}
                        {!msg.isAnalyzing && msg.chartType === 'cell-availability' && <CellAvailabilityChart />}
                        {!msg.isAnalyzing && msg.chartType === 'high-utilized-sector' && <HighUtilizedSectorChart />}
                        {!msg.isAnalyzing && msg.chartType === 'sector-solution' && <SectorSolutionChart />}
                        {!msg.isAnalyzing && msg.chartType === 'solution-table' && <SolutionTable />}
                        {!msg.isAnalyzing && msg.chartType === 'pran-group-overview' && <PranGroupOverviewChart />}
                        {!msg.isAnalyzing && msg.chartType === 'sim-compatibility' && <SimCompatibilityChart />}
                        {!msg.isAnalyzing && msg.chartType === 'user-solution-table' && <UserSolutionTable />}
                    </div>

                    {/* Suggestions Chips (AI Only) */}
                    {msg.role === 'ai' && !msg.isAnalyzing && msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                            <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                <Zap size={12} className="text-amber-400" />
                                Suggested Follow-up
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {msg.suggestions.map((suggestion, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="text-xs text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg transition-all duration-200 text-slate-300 hover:text-white group flex items-center gap-2"
                                    >
                                        <span>{suggestion}</span>
                                        <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Feedback Checkboxes (AI Only) */}
                {msg.role === 'ai' && !msg.isAnalyzing && msg.id !== 'intro' && (
                    <div className="mt-3 flex items-center gap-4 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/30 px-2 py-1.5 rounded-md transition-colors">
                            <input 
                                type="checkbox" 
                                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-red-500 focus:ring-red-500/20 focus:ring-offset-0 cursor-pointer"
                                onChange={(e) => handleFeedbackCheckboxChange(msg.id, 'incorrect', e.target.checked)}
                            />
                            <span className="text-red-400 font-medium">Incorrect answer</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/30 px-2 py-1.5 rounded-md transition-colors">
                            <input 
                                type="checkbox" 
                                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 cursor-pointer"
                                onChange={(e) => handleFeedbackCheckboxChange(msg.id, 'visualization', e.target.checked)}
                            />
                            <span className="text-amber-400 font-medium">Visualization issue</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/30 px-2 py-1.5 rounded-md transition-colors">
                            <input 
                                type="checkbox" 
                                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500/20 focus:ring-offset-0 cursor-pointer"
                                onChange={(e) => handleFeedbackCheckboxChange(msg.id, 'both', e.target.checked)}
                            />
                            <span className="text-orange-400 font-medium">Both</span>
                        </label>
                    </div>
                )}
            </div>
          </div>
        ))}
        {isProcessing && <div className="h-8" />} {/* Spacer */}
      </div>

      {/* Input Area */}
      <div className={`p-6 bg-gradient-to-t backdrop-blur-md z-20 ${
        theme === 'dark' 
          ? 'from-[#0B1120]/70 via-[#0B1120]/40 to-[#0B1120]/10' 
          : 'from-slate-50/70 via-slate-50/40 to-slate-50/10'
      }`}>
        <div className="max-w-4xl mx-auto">
            <div className={`relative rounded-xl border focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all shadow-xl backdrop-blur-lg ${
              theme === 'dark' 
                ? 'bg-slate-900/10 border-slate-800/30 shadow-black/20' 
                : 'bg-white border-slate-300 shadow-slate-200/50'
            }`}>
                <div className="relative">
                  <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSend();
                          }
                      }}
                      placeholder="Describe your analysis request or ask a question..."
                      className={`w-full bg-transparent p-4 pr-12 min-h-[60px] max-h-[200px] resize-none focus:outline-none ${
                        theme === 'dark' 
                          ? 'text-slate-200 placeholder-slate-600' 
                          : 'text-slate-900 placeholder-slate-400'
                      }`}
                  />
                  
                  {/* Voice Input Button */}
                  <div className="absolute right-3 top-4">
                    <button
                      onMouseDown={handleVoiceStart}
                      onMouseUp={handleVoiceEnd}
                      onMouseLeave={() => {
                        if (isRecording) handleVoiceEnd();
                      }}
                      onTouchStart={handleVoiceStart}
                      onTouchEnd={handleVoiceEnd}
                      className={cn(
                        "relative p-2 rounded-lg transition-all z-10",
                        isRecording 
                          ? "text-blue-400" 
                          : "text-slate-500 hover:text-blue-400 hover:bg-blue-500/10"
                      )}
                      title="Hold to record voice"
                    >
                      {/* Glowing Wave Animation */}
                      {isRecording && (
                        <>
                          {/* Animated Glowing Border */}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none animate-glow-border" viewBox="0 0 100 100">
                            <defs>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                              <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                                <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                              </linearGradient>
                            </defs>
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="url(#borderGradient)"
                              strokeWidth="3"
                              filter="url(#glow)"
                              className="animate-morph-border"
                            />
                          </svg>
                          
                          {/* Subtle Glow Layer */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-full rounded-lg animate-pulse-glow" 
                                 style={{
                                   background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 70%)',
                                 }} 
                            />
                          </div>
                        </>
                      )}
                      <Mic size={18} className="relative z-10" />
                    </button>
                  </div>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleLocalFileUpload} 
                />

                <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-1 relative">
                        <div className="relative" ref={attachMenuRef}>
                            <button 
                                onClick={() => setShowAttachMenu(!showAttachMenu)}
                                className={cn(
                                    "p-2 rounded-lg transition-colors group relative",
                                    showAttachMenu 
                                        ? "text-blue-400 bg-blue-500/10" 
                                        : "text-slate-500 hover:text-blue-400 hover:bg-blue-500/10"
                                )} 
                            >
                                <Paperclip size={16} />
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    Attach Files
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {showAttachMenu && (
                                <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-800/95 backdrop-blur-xl border border-slate-700/70 rounded-lg shadow-2xl overflow-hidden z-50">
                                    <button
                                        onClick={handleAddFiles}
                                        className="w-full px-4 py-3 flex items-center gap-3 text-left text-slate-200 hover:bg-slate-700/70 transition-colors"
                                    >
                                        <Upload size={16} className="text-blue-400" />
                                        <div>
                                            <p className="font-medium text-sm">Add Files</p>
                                            <p className="text-xs text-slate-400">Upload documents or logs</p>
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* Deep Analysis Toggle Button */}
                        <button 
                            onClick={() => {
                                setIsDeepAnalysisActive(!isDeepAnalysisActive);
                                toast.info(isDeepAnalysisActive ? "Deep analysis mode deactivated" : "Deep analysis mode activated");
                            }}
                            className={cn(
                                "p-2 rounded-lg transition-colors group relative",
                                isDeepAnalysisActive 
                                    ? "text-yellow-400 bg-yellow-500/10" 
                                    : "text-slate-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                            )} 
                        >
                            <Zap size={16} />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-slate-200 text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Deep Analysis
                            </span>
                        </button>
                        
                        {/* Deep Analysis Status Indicator */}
                        {isDeepAnalysisActive && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                <Zap size={14} className="text-yellow-400 animate-pulse" />
                                <span className="text-xs font-medium text-yellow-300">Deep Analysis Active</span>
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isProcessing}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                            input.trim() && !isProcessing
                                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40" 
                                : "bg-slate-800 text-slate-600 cursor-not-allowed"
                        )}
                    >
                        <span>Analyze</span>
                        <Send size={14} />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && feedbackState && (
        createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden w-full max-w-lg">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Send Feedback</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Help us improve by providing details about the issue{feedbackState.incorrectAnswer && feedbackState.visualizationIssue ? 's' : ''}:
                </p>
                
                {/* Issue Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {feedbackState.incorrectAnswer && (
                    <span className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-red-400 text-xs font-medium">
                      Incorrect answer
                    </span>
                  )}
                  {feedbackState.visualizationIssue && (
                    <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-xs font-medium">
                      Visualization issue
                    </span>
                  )}
                </div>

                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Please describe the issue in detail..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 min-h-[120px] max-h-[200px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-slate-200 placeholder-slate-500 transition-all"
                  autoFocus
                />
                
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={handleFeedbackCancel}
                    className="px-5 py-2.5 rounded-lg font-medium text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackText.trim()}
                    className={cn(
                      "px-5 py-2.5 rounded-lg font-medium text-sm transition-all",
                      feedbackText.trim()
                        ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                        : "bg-slate-800 text-slate-600 cursor-not-allowed"
                    )}
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
}