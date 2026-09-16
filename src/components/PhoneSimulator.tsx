import { useEffect, useState } from 'react';
import { MessageCircle, MessageSquare, X, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export type SimulationMessage = {
  id: string;
  app: 'whatsapp' | 'sms';
  title: string;
  content: string;
};

interface PhoneSimulatorProps {
  messages: SimulationMessage[];
  onDismiss: (id: string) => void;
}

export function PhoneSimulator({ messages, onDismiss }: PhoneSimulatorProps) {
  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-80 space-y-3 flex flex-col items-end">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className="w-full bg-white/95 backdrop-blur-md border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-right-8 slide-in-from-bottom-4 duration-300 pointer-events-auto hover:shadow-indigo-500/10 transition-all"
        >
          {/* Header */}
          <div className="bg-slate-50/80 px-4 py-2.5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              {msg.app === 'whatsapp' ? (
                <div className="w-5 h-5 bg-[#25D366] rounded-md flex items-center justify-center shadow-sm">
                  <MessageCircle size={12} className="text-white fill-white" />
                </div>
              ) : (
                <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center shadow-sm">
                  <MessageSquare size={12} className="text-white fill-white" />
                </div>
              )}
              <span className="text-[11px] font-extrabold tracking-wider text-slate-700 uppercase">
                {msg.app === 'whatsapp' ? 'WhatsApp Bot' : 'SMS Alert (2G)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold">just now</span>
              <button 
                onClick={(e) => {
                   e.stopPropagation();
                   onDismiss(msg.id);
                }}
                className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded-full hover:bg-slate-200/50"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          
          {/* Body */}
          <div className="p-4 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{msg.title}</h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
            
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link 
                href="/whatsapp" 
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
              >
                <span>Open Bot Simulator</span>
                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button 
                onClick={() => onDismiss(msg.id)}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
