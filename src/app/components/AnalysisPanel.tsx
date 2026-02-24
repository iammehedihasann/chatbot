import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, Loader2, CheckCircle, Database, FileSearch, BrainCircuit, Lightbulb, Activity } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface AnalysisStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'complete';
  details?: string;
}

interface AnalysisPanelProps {
  isAnalyzing: boolean;
  onComplete?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
}

const STEPS: AnalysisStep[] = [
  { id: 'ingest', label: 'Data Ingestion & Parsing', status: 'pending', details: 'Loading CSV dataset, mapping columns...' },
  { id: 'clean', label: 'Data Cleaning & Normalization', status: 'pending', details: 'Removing null values, normalizing timestamps...' },
  { id: 'model', label: 'Statistical Modeling', status: 'pending', details: 'Running regression analysis, identifying anomalies...' },
  { id: 'insights', label: 'Insight Generation', status: 'pending', details: 'Synthesizing key findings and visualizations...' },
];

export function AnalysisPanel({ isAnalyzing, onComplete, isExpanded: externalIsExpanded, onToggleExpand }: AnalysisPanelProps) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(true);
  const [steps, setSteps] = useState<AnalysisStep[]>(STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Use external control if provided, otherwise use internal state
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  
  const handleToggle = () => {
    const newExpanded = !isExpanded;
    if (onToggleExpand) {
      onToggleExpand(newExpanded);
    } else {
      setInternalIsExpanded(newExpanded);
    }
  };

  useEffect(() => {
    if (!isAnalyzing) return;

    let currentIndex = 0;
    
    // Reset steps
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })));

    const runStep = () => {
      if (currentIndex >= STEPS.length) {
        if (onComplete) onComplete();
        return;
      }

      setSteps(prev => prev.map((s, i) => {
        if (i === currentIndex) return { ...s, status: 'running' };
        if (i < currentIndex) return { ...s, status: 'complete' };
        return s;
      }));

      // Simulate step duration
      setTimeout(() => {
        currentIndex++;
        runStep();
      }, 1500); // 1.5s per step
    };

    runStep();

  }, [isAnalyzing]);

  // If complete, show all as complete
  useEffect(() => {
    if (!isAnalyzing && currentStepIndex === 0) {
        // If passed as not analyzing initially (e.g. historical message), show all complete
        setSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));
    }
  }, []);

  const currentStep = steps.find(s => s.status === 'running') || steps[steps.length - 1];
  const isAllComplete = steps.every(s => s.status === 'complete');

  return (
    <div className="border border-slate-800/60 bg-[#0f172a] rounded-lg overflow-hidden my-4 w-full max-w-2xl shadow-xl shadow-black/20">
      {/* Header - Always visible */}
      <button 
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3.5 bg-slate-900/50 hover:bg-slate-900 transition-colors text-left group"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center justify-center w-6 h-6 rounded-md shadow-inner",
            isAllComplete 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
          )}>
            {isAllComplete ? <CheckCircle size={14} /> : <Activity size={14} className="animate-pulse" />}
          </div>
          <span className="text-sm font-semibold text-slate-200 tracking-tight group-hover:text-white transition-colors">
            {isAllComplete ? "Analysis Complete" : "Analyzing Data..."}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
            <span className="text-[10px] font-mono tracking-wider uppercase opacity-70">{isAllComplete ? "DONE" : "RUNNING"}</span>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </button>

      {/* Expandable Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[#0B1120] space-y-4 border-t border-slate-800/60 relative">
                {/* Connector Line */}
                <div className="absolute left-[27px] top-6 bottom-8 w-px bg-slate-800/50" />

              {steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3 relative z-10">
                  <div className="mt-0.5 min-w-[20px] flex justify-center">
                    {step.status === 'complete' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center">
                            <CheckCircle size={12} className="text-emerald-400" />
                        </div>
                    )}
                    {step.status === 'running' && (
                        <div className="w-5 h-5 rounded-full bg-indigo-900/30 border border-indigo-500/30 flex items-center justify-center">
                             <Loader2 size={12} className="text-indigo-400 animate-spin" />
                        </div>
                    )}
                    {step.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-700 mt-1.5 ring-4 ring-[#0B1120]" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      step.status === 'running' ? "text-indigo-300" : 
                      step.status === 'complete' ? "text-slate-400" : "text-slate-600"
                    )}>
                      {step.label}
                    </p>
                    {(step.status === 'running' || step.status === 'complete') && (
                      <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-slate-500 mt-1 font-mono tracking-tight"
                      >
                        {step.details}
                      </motion.p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}