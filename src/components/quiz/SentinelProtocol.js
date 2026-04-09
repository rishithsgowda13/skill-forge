"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, AlertTriangle, XCircle, MonitorOff } from "lucide-react";

export default function SentinelProtocol({ onViolation, onTermination, active = true }) {
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [lastViolationType, setLastViolationType] = useState("");
  
  const MAX_VIOLATIONS = 3;

  useEffect(() => {
    if (!active) return;

    // 1. Tab Switching Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation("Tab Switching / Background Activity Detected");
      }
    };

    // 2. Window Blur Detection
    const handleBlur = () => {
      triggerViolation("Interface Focus Lost / External Application Interaction");
    };

    // 3. Right Click Restriction
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerViolation("Unauthorized Signature Request (Right Click)");
    };

    // 4. Keyboard Restrictions (Copy, Paste, DevTools)
    const handleKeyDown = (e) => {
      // Block Ctrl/Cmd + C, V, X, A, J, I, U, F12
      const forbiddenKeys = ["c", "v", "x", "a", "j", "i", "u"];
      if ((e.ctrlKey || e.metaKey) && forbiddenKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
        triggerViolation(`Unauthorized Protocol Command (${e.key.toUpperCase()})`);
      }
      
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C"))) {
        e.preventDefault();
        triggerViolation("Unauthorized Terminal Access (DevTools)");
      }
    };

    // 5. Copy/Paste Events
    const handleCopyPaste = (e) => {
      e.preventDefault();
      triggerViolation("Integrity Violation (Copy/Paste Attempt)");
    };

    const triggerViolation = (type) => {
      setViolations(prev => {
        const nextCount = prev + 1;
        setLastViolationType(type);
        setShowWarning(true);
        
        if (onViolation) onViolation(nextCount, type);
        
        if (nextCount >= MAX_VIOLATIONS) {
          if (onTermination) onTermination();
        }
        
        return nextCount;
      });
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("copy", handleCopyPaste);
    window.addEventListener("paste", handleCopyPaste);
    window.addEventListener("cut", handleCopyPaste);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("copy", handleCopyPaste);
      window.removeEventListener("paste", handleCopyPaste);
      window.removeEventListener("cut", handleCopyPaste);
    };
  }, [active]);

  return (
    <>
      <AnimatePresence>
        {showWarning && violations < MAX_VIOLATIONS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-xl p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-white rounded-[40px] p-10 text-center space-y-8 shadow-[0_50px_100px_-20px_rgba(37,99,235,0.3)] border-4 border-amber-400"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto relative">
                <AlertTriangle className="text-amber-500 w-10 h-10 animate-bounce" />
                <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">Security Alert</h2>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] leading-loose">Integrity Compromised: {lastViolationType}</p>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Violations</span>
                    <span className="text-sm font-black text-rose-500 uppercase">{violations} / {MAX_VIOLATIONS}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(violations / MAX_VIOLATIONS) * 100}%` }}
                      className="h-full bg-rose-500 shadow-glow-blue" 
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.2em] leading-relaxed">
                The Sentinel proctoring node has detected an unauthorized protocol interaction. Repeated violations will result in immediate session termination.
              </p>

              <button
                onClick={() => setShowWarning(false)}
                className="w-full py-5 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
              >
                Acknowledge Protocol
              </button>
            </motion.div>
          </motion.div>
        )}

        {violations >= MAX_VIOLATIONS && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[1001] flex items-center justify-center bg-rose-600 p-6"
          >
            <div className="text-center space-y-10 text-white max-w-lg">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-white/40">
                <XCircle size={64} className="text-white" />
              </div>
              <div className="space-y-4">
                <h1 className="text-6xl font-black tracking-tighter uppercase leading-none">Access Revoked</h1>
                <p className="text-[12px] font-black opacity-60 uppercase tracking-[0.6em]">Session Terminated Due to Integrity Breach</p>
              </div>
              <p className="text-lg font-black opacity-80 leading-relaxed uppercase tracking-tight">
                Your authorization has been permanently revoked for this session. A detailed report of the detected violations ({violations}/{MAX_VIOLATIONS}) has been synchronized with the administration node.
              </p>
              <div className="p-8 bg-white/10 rounded-[32px] border border-white/20">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2">Final Violation Flag</p>
                <p className="text-xl font-black uppercase tracking-widest">{lastViolationType}</p>
              </div>
              <button
                onClick={() => window.location.href = "/"}
                className="px-12 py-6 bg-white text-rose-600 rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-rose-50 transition-all shadow-2xl"
              >
                Exit Terminal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sentinel Indicator */}
      <div className="fixed top-6 right-6 z-[500] flex items-center gap-4">
        <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 shadow-xl flex items-center gap-4">
          <div className="relative">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_#10B981]" />
             <div className="absolute inset-0 bg-emerald-500/40 rounded-full animate-ping" />
          </div>
          <div className="flex flex-col">
             <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">Sentinel Active</span>
             <span className="text-[8px] font-black text-[#94A3B8] uppercase tracking-[0.2em] leading-none">Full Proctoring Mode Alpha</span>
          </div>
        </div>
      </div>
    </>
  );
}
