import React from 'react';
import { createPortal } from 'react-dom';
import { Mic } from 'lucide-react';

interface VoiceRecordingModalProps {
  isRecording: boolean;
}

export function VoiceRecordingModal({ isRecording }: VoiceRecordingModalProps) {
  if (!isRecording) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden p-8 flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-40 h-40">
          {/* Heartbeat Circle Animation - Large background circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full bg-red-500/20 rounded-full animate-heartbeat" />
          </div>
          
          {/* Microphone Icon */}
          <div className="relative z-10 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
            <Mic size={32} className="text-white" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-1">Listening...</p>
          <p className="text-slate-400 text-sm">Release to process voice input</p>
        </div>
      </div>

      <style>{`
        @keyframes heartbeat {
          0% {
            transform: scale(0.75);
            opacity: 0.8;
          }
          25% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(0.75);
            opacity: 0.8;
          }
          75% {
            transform: scale(1);
            opacity: 0.4;
          }
          100% {
            transform: scale(0.75);
            opacity: 0.8;
          }
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>,
    document.body
  );
}
