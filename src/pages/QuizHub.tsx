import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

const QuizHub: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const navigate = useNavigate();

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setError('');
    if (accessCode === '999' || accessCode === 'IVC2026' || accessCode === '1234') {
      setTimeout(() => navigate('/quiz'), 800);
    } else {
      setError('INVALID_SECURITY_KEY');
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f8fafc]">
      
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 opacity-[0.25] pointer-events-none"
           style={{ 
             backgroundImage: `radial-gradient(#6366f1 0.5px, transparent 0.5px)`, 
             backgroundSize: '24px 24px' 
           }} />
      
      {/* Accent Overlays */}
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#ef4444]/[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-[#6366f1]/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex flex-col items-center justify-center px-12 relative">
          <div className="w-full max-w-xl flex flex-col items-center">
            
            {/* Minimal Title Row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full flex items-center justify-center gap-6 mb-4"
            >
              <div className="h-[1px] grow max-w-[80px] bg-[#e2e8f0]" />
              <h1 className="font-display text-sm sm:text-lg font-bold tracking-[0.2em] text-[#0f172a] uppercase text-center">
                SECURITY AUTHENTICATION
              </h1>
              <div className="h-[1px] grow max-w-[80px] bg-[#e2e8f0]" />
            </motion.div>
            
            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="font-display text-[10px] tracking-[0.4em] text-[#64748b] font-bold uppercase mb-12"
            >
              MISSION_ACCESS_PORTAL
            </motion.p>

            {/* Access Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="bg-white border border-[#e2e8f0] rounded-[48px] p-16 w-full shadow-[0_40px_100px_rgba(0,0,0,0.06)] relative overflow-hidden"
            >
               {/* Accent decoration */}
               <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#2563eb] via-[#8b5cf6] to-[#f59e0b]" />

              <div className="flex flex-col items-center gap-14">
                <div className="text-center group">
                  <div className="w-20 h-20 bg-[#f8fafc] border border-[#e2e8f0] rounded-[24px] flex items-center justify-center mb-8 mx-auto group-hover:scale-110 group-hover:bg-[#2563eb] group-hover:text-white group-hover:border-[#2563eb] transition-all transform duration-500 text-[#2563eb] shadow-sm">
                     <span className="text-3xl font-black font-display">#</span>
                  </div>
                  <p className="font-display text-base tracking-[0.6em] text-[#0f172a] font-black uppercase mb-3">
                    AUTHORIZATION KEY
                  </p>
                  <p className="text-[11px] tracking-[0.1em] text-[#94a3b8] font-bold uppercase">SECURED TERMINAL ACCESS REQUIRED</p>
                </div>

                <form onSubmit={handleStartQuiz} className="w-full flex flex-col items-center gap-12">
                  <input
                    type="text"
                    autoFocus
                    placeholder="KEY-XXXX-XXXX"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#f8fafc] border-2 border-[#e2e8f0] px-10 py-8 text-4xl text-center text-[#0f172a] font-display font-black tracking-[0.3em] rounded-[24px] outline-none focus:border-[#2563eb]/40 focus:bg-white focus:shadow-[0_20px_50px_rgba(37,99,235,0.08)] transition-all duration-500 placeholder:text-[#cbd5e1] placeholder:text-base placeholder:tracking-[0.2em] placeholder:font-bold"
                  />
                  
                  <button
                    type="submit"
                    disabled={isValidating}
                    className="w-full py-8 bg-[#0f172a] text-white font-display text-lg tracking-[0.3em] font-black uppercase rounded-[24px] hover:bg-[#1e293b] hover:shadow-[0_30px_60px_rgba(15,23,42,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 cursor-pointer disabled:opacity-40"
                  >
                    {isValidating ? 'SYNCHRONIZING...' : 'AUTHORIZE ACCESS'}
                  </button>
                </form>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 font-display text-[10px] tracking-[0.2em] font-extrabold uppercase px-6 py-2 bg-red-50 rounded-lg animate-pulse"
                    >
                      ⚠ SIGNAL_ERR: {error}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
            
            {/* Minimal Help Hints */}
            <div className="mt-12 flex items-center gap-8 text-[9px] tracking-[0.3em] text-[#94a3b8] uppercase font-bold">
               <span className="flex items-center gap-2 underline underline-offset-4 decoration-[#6366f1]/30 decoration-2">SYSTEM_VER_9.4</span>
               <span className="text-[#e2e8f0]">/</span>
               <span className="flex items-center gap-2 underline underline-offset-4 decoration-[#10b981]/30 decoration-2">SECURE_CHANNEL</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default QuizHub;
