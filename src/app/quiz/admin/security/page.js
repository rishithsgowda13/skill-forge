"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { 
  ShieldCheck, 
  Lock,
  Eye,
  ShieldAlert,
  Fingerprint,
  Radio,
  EyeOff,
  ClipboardX,
  RefreshCcw,
  MousePointer2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSecurityPage() {
  const [safeguards, setSafeguards] = useState([
    { 
      id: "tab-lock",
      label: "Zero-Latency Tab Lock", 
      desc: "Blocks user from switching tabs or minimzing browser during session.",
      restriction: "NO_TAB_SWITCHING",
      enabled: true,
      icon: EyeOff
    },
    { 
      id: "input-shield",
      label: "Input Buffer Shield", 
      desc: "Disables right-click, copy, paste, and unauthorized input commands.",
      restriction: "NO_COPY_PASTE",
      enabled: true,
      icon: ClipboardX
    },
    { 
      id: "neural-sync",
      label: "Neural Focus Sync", 
      desc: "Enforces continuous full-screen mode and detects multi-monitor outputs.",
      restriction: "STRICT_FULLSCREEN",
      enabled: true,
      icon: Radio
    },
    { 
      id: "peripheral-block",
      label: "Peripheral Lockdown", 
      desc: "Disables print-screen, recording software, and screen-share protocols.",
      restriction: "NO_SCREEN_CAPTURE",
      enabled: false,
      icon: MousePointer2
    }
  ]);

  const toggleSafeguard = (id) => {
    setSafeguards(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const securityLogs = [
    { event: "Unauthorized Access Attempt", node: "NODE-742", time: "2m ago", status: "Blocked" },
    { event: "Protocol Bypass Detected", node: "NODE-112", time: "14m ago", status: "Flagged" },
    { event: "Neural Sync Violation", node: "NODE-891", time: "1h ago", status: "Resolved" }
  ];

  return (
    <div className="p-10 space-y-10 flex flex-col min-h-full">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tighter">Security Perimeter</h1>
          <p className="text-meta">ACTIVE PROTOCOL ENFORCEMENT & RESTRICTIONS</p>
        </motion.div>
        
        <div className="flex items-center gap-3 bg-[#F0F7FF] px-5 py-2.5 rounded-2xl border border-[#2563EB]/10 shadow-sm">
          <Radio size={16} className="text-[#2563EB] animate-pulse" />
          <span className="text-[11px] font-black text-[#2563EB] uppercase tracking-[0.2em]">Live Monitoring Synchronized</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         {/* Active Safeguards */}
         <div className="dashboard-card space-y-8 shadow-xl border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b pb-6">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#F0F7FF] rounded-xl">
                     <Lock size={22} className="text-[#2563EB]" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-tight">Active Restrictions</h3>
                     <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Toggle candidate constraints</p>
                  </div>
               </div>
               <div className="px-3 py-1 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-[9px] font-black text-[#10B981] uppercase tracking-widest">Global Secure</span>
               </div>
            </div>
            
            <div className="space-y-4">
               {safeguards.map((s, i) => (
                 <motion.div 
                   key={s.id}
                   className="flex items-center justify-between p-6 rounded-[24px] border-2 bg-white border-[#2563EB]/10 shadow-lg shadow-blue-50/50"
                 >
                    <div className="flex items-center gap-5">
                       <div className="p-4 rounded-2xl bg-[#F0F7FF] text-[#2563EB]">
                          <s.icon size={24} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[11px] font-black text-[#2563EB] uppercase tracking-widest leading-none mb-1">{s.restriction}</p>
                          <h4 className="text-base font-black text-[#0F172A] leading-tight">{s.label}</h4>
                          <p className="text-[11px] font-medium text-[#64748B] leading-snug max-w-[280px]">{s.desc}</p>
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                       <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2 shadow-sm">
                          <Lock size={12} className="text-[#2563EB]" />
                          <span className="text-[9px] font-black text-[#2563EB] uppercase tracking-widest">Enforced</span>
                       </div>
                       <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-[0.2em] text-right">Node Restriction Active</p>
                    </div>
                 </motion.div>
               ))}
            </div>
         </div>

         {/* Security Logs */}
         <div className="dashboard-card space-y-8 shadow-xl border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b pb-6">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#FFF1F2] rounded-xl">
                     <ShieldAlert size={22} className="text-[#EF4444]" />
                  </div>
                  <div>
                     <h3 className="text-lg font-black text-[#0F172A] uppercase tracking-tight">Real-time Feed</h3>
                     <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Synchronized violation logs</p>
                  </div>
               </div>
               <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                  <RefreshCcw size={18} className="text-[#94A3B8]" />
               </button>
            </div>

            <div className="space-y-4">
               {securityLogs.map((log, i) => (
                 <motion.div 
                   key={i} 
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                   className="flex items-center justify-between p-6 rounded-[24px] border border-[#F1F5F9] hover:border-[#2563EB]/20 hover:shadow-xl transition-all group"
                 >
                    <div className="flex items-center gap-5">
                       <div className="w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-ping shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                       <div>
                          <p className="text-xs font-black text-[#0F172A] mb-0.5">{log.event}</p>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-white bg-[#0F172A] px-2 py-0.5 rounded-md uppercase tracking-widest">{log.node}</span>
                             <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">• Detected via {log.status}</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[11px] font-black text-[#0F172A] uppercase tracking-widest block">{log.time}</span>
                       <span className="text-[9px] font-bold text-[#94A3B8] uppercase">Critical Trace</span>
                    </div>
                 </motion.div>
               ))}
            </div>

            <button className="w-full py-5 border-2 border-dashed border-[#E2E8F0] rounded-[24px] text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] hover:text-[#2563EB] hover:border-[#2563EB] transition-all">
               Generate Detailed Security Report
            </button>
         </div>
      </div>
    </div>
  );
}
