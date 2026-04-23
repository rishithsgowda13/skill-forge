"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import SentinelProtocol from "@/components/quiz/SentinelProtocol";
import { 
  Zap, 
  Lock, 
  Clock, 
  Trophy, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Fingerprint,
  Monitor,
  MonitorOff
} from "lucide-react";

export default function CandidatePlayPage() {
  const { code } = useParams();
  const router = useRouter();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [user, setUser] = useState(null);
  const [resultsActive, setResultsActive] = useState(false);
  const [score, setScore] = useState(0);

  const [lastAnswerStatus, setLastAnswerStatus] = useState(null); // 'correct' | 'incorrect' | null

  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const mockSession = document.cookie
          .split("; ")
          .find((row) => row.startsWith("mock_session="))
          ?.split("=")[1];
        
        const sessionUser = user || { 
          id: `guest-${Math.random().toString(36).substr(2, 9)}`, 
          email: "guest@skillforge.io" 
        };
        setUser(sessionUser);

        const { data: quizData, error: qErr } = await supabase
          .from("quizzes")
          .select("*, questions(*)")
          .eq("access_code", code?.toUpperCase())
          .single();
        
        if (qErr || !quizData) {
          console.error("Quiz retrieval failure:", qErr);
          router.push("/quiz/access");
          return;
        }
        
        setQuiz(quizData);

        // Fetch profile if exists
        let sessionName = "Candidate";
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          if (profile?.full_name) sessionName = profile.full_name;
        } else {
          sessionName = `Guest-${sessionUser.id.split('-')[1]}`;
        }

        // FORCE CLEANUP: Ensure absolute neural slate cleanliness
        await supabase.removeAllChannels();

        const channel = supabase
          .channel(`quiz_session_${code.toUpperCase()}`)
          .on(
            'postgres_changes', 
            { event: '*', schema: 'public', table: 'quizzes', filter: `id=eq.${quizData.id}` },
            (payload) => {
              const updatedQuiz = payload.new;
              setQuiz(prev => {
                // Only reset selection if it's actually a NEW question
                if (prev.current_question_index !== updatedQuiz.current_question_index) {
                  setSelectedOption(null);
                  setLastAnswerStatus(null);
                }
                return { ...prev, ...updatedQuiz };
              });
              setResultsActive(false);
            }
          )
          .on(
            'broadcast',
            { event: 'state_update' },
            (payload) => {
              const updatedQuiz = payload.payload;
              setQuiz(prev => {
                // Only reset selection if it's actually a NEW question
                if (prev.current_question_index !== updatedQuiz.current_question_index) {
                  setSelectedOption(null);
                  setLastAnswerStatus(null);
                }
                return { ...prev, ...updatedQuiz };
              });
              setResultsActive(false);
            }
          )
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              console.log("SYNCHRONIZED WITH NODE CHANNEL");
              await channel.track({
                user_id: sessionUser.id,
                full_name: sessionName,
                online_at: new Date().toISOString(),
              });
            }
          });

        setLoading(false);

        return () => {
          if (channel) {
             supabase.removeChannel(channel);
          }
        };
      } catch (err) {
        console.error("CRITICAL SYNC ERROR:", err);
        setLoading(false);
      }
    }
    if (code) init();
  }, [code]);

  useEffect(() => {
    if (quiz && quiz.questions && quiz.current_question_index !== undefined) {
      const q = quiz.questions.find(qt => qt.order_index === quiz.current_question_index);
      setCurrentQuestion(q);
    }
  }, [quiz]);

  const [startTime, setStartTime] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (quiz?.status === 'showing-question') {
      setShowOptions(false);
      const timer = setTimeout(() => {
        setShowOptions(true);
        setStartTime(Date.now());
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowOptions(false);
    }
  }, [quiz?.status, quiz?.current_question_index]);

  const handleSelect = async (optionIndex) => {
    if (selectedOption !== null || quiz?.status !== 'showing-question' || !currentQuestion) return;
    
    const elapsed = (Date.now() - startTime) / 1000;
    setSelectedOption(optionIndex);
    
    const answer = String.fromCharCode(65 + optionIndex); // A, B, C, D
    const isCorrect = answer === currentQuestion.correct_answer;
    
    setLastAnswerStatus(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      const timeLimit = currentQuestion.time_limit || 15;
      const maxPoints = 1000;
      const minPoints = 500;
      // Linear decay: from 1000 at 0s to 500 at timeLimit
      let pointsEarned = Math.round(maxPoints - ((maxPoints - minPoints) * (elapsed / timeLimit)));
      // Clamp between minPoints and maxPoints
      pointsEarned = Math.max(minPoints, Math.min(maxPoints, pointsEarned));
      
      setScore(prev => prev + pointsEarned);

      await supabase.from('submissions').insert([{
        quiz_id: quiz.id,
        user_id: user.id,
        question_id: currentQuestion.id,
        answer: answer,
        is_correct: true,
        points: pointsEarned,
        time_taken: elapsed
      }]);
    } else {
      await supabase.from('submissions').insert([{
        quiz_id: quiz.id,
        user_id: user.id,
        question_id: currentQuestion.id,
        answer: answer,
        is_correct: false,
        points: 0,
        time_taken: elapsed
      }]);
    }
  };

  if (loading) {
     return (
       <div className="h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mb-6" />
          <p className="text-[15px] font-black uppercase tracking-[0.3em] text-[#94A3B8]">Decrypting Signal...</p>
       </div>
     );
  }

  if (quiz?.status === 'lobby') {
    return (
      <div className="h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-8 text-center space-y-10">
         <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="w-24 h-24 bg-white rounded-[32px] shadow-2xl flex items-center justify-center relative overflow-hidden"
         >
            <Fingerprint className="text-primary-blue w-12 h-12 relative z-10" />
            <div className="absolute inset-0 bg-primary-blue/5 animate-pulse" />
         </motion.div>
         
         <div className="space-y-4">
            <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">{quiz.title}</h1>
            <p className="text-[16.5px] font-black text-[#94A3B8] uppercase tracking-[0.4em]">Ready for Synchronous Deployment</p>
         </div>

         <AnimatePresence>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] bg-white border border-[#E2E8F0] shadow-2xl rounded-[32px] px-10 py-6 flex items-center gap-6"
            >
               <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping" />
                  <Clock className="text-primary-blue w-6 h-6 relative z-10" />
               </div>
               <div className="text-left">
                  <p className="text-[15px] font-black text-primary-blue uppercase tracking-[0.3em] leading-none mb-1.5">Waiting Room Protocol</p>
                  <p className="text-sm font-black text-[#0F172A] uppercase tracking-tight">Waiting for admin to start the quiz</p>
               </div>
            </motion.div>
         </AnimatePresence>
      </div>
    );
  }

  if (quiz?.status === 'finished') {
    return (
      <div className="h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-10 text-center space-y-12">
         <div className="space-y-4">
            <Trophy className="text-amber-400 w-20 h-20 mx-auto" />
            <h1 className="text-4xl font-black tracking-tighter uppercase">Signal Terminated</h1>
            <p className="text-[16.5px] font-black text-white/40 uppercase tracking-[0.4em]">Final Registry Score Synchronized</p>
         </div>
         <div className="text-6xl font-black tabular-nums">{score}</div>
         <button 
           onClick={() => router.push('/quiz/admin')}
           className="px-12 py-5 bg-white text-[#0F172A] rounded-2xl font-black text-[15px] uppercase tracking-widest"
         >
           Close Data Node
         </button>
      </div>
    );
  }

  // Active Play Mode
  return (
    <div className="h-screen bg-[#F0F2F5] flex flex-col p-6 space-y-6 overflow-hidden relative">
      <SentinelProtocol 
         active={quiz?.status === 'showing-question'} 
         onViolation={(count, type) => {
           console.warn(`INTEGRITY ALERT: ${type} breach count ${count}`);
         }}
       />
       
       <div className="flex items-center justify-between p-6 bg-white rounded-[32px] border border-[#E2E8F0] shadow-sm relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-primary-blue/10 rounded-xl flex items-center justify-center text-primary-blue">
                <Zap size={20} />
             </div>
             <div>
                <p className="text-[13.5px] font-black text-[#94A3B8] uppercase tracking-widest leading-none mb-1">Session Active</p>
                <p className="text-sm font-black text-[#0F172A] uppercase">Node Sync Point {quiz.current_question_index + 1}</p>
             </div>
          </div>
          <div className="bg-[#0F172A] text-white px-6 py-2.5 rounded-2xl text-xs font-black tracking-widest tabular-nums">
             {score}
          </div>
       </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
           <AnimatePresence mode="wait">
              {quiz?.status === 'showing-question' && showOptions ? (
                 <>
                     {[0, 1, 2, 3].map((idx) => {
                       const isSelected = selectedOption === idx;
                       const hasSelected = selectedOption !== null;
                       
                       // Default Blue, Selected Orange
                       let bgColor = 'bg-[#2563EB] shadow-blue-200';
                       if (isSelected) {
                         bgColor = 'bg-[#F97316] shadow-orange-200'; // Orange
                       }

                       const labels = ['A', 'B', 'C', 'D'];
                       const optionText = currentQuestion?.options?.[idx] || labels[idx];
                       
                       return (
                         <motion.button
                           key={idx}
                           initial={{ scale: 0.9, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           exit={{ scale: 0.9, opacity: 0 }}
                           whileTap={{ scale: 0.95 }}
                           disabled={hasSelected}
                           onClick={() => handleSelect(idx)}
                           className={`relative rounded-[40px] flex flex-col items-center justify-center text-white transition-all overflow-hidden p-8 text-center group/opt ${
                             isSelected ? 'ring-8 ring-orange-500/20 scale-[0.98]' : 
                             hasSelected ? 'opacity-30 grayscale-[30%]' : 'hover:bg-blue-600'
                           } ${bgColor} shadow-2xl`}
                         >
                            <span className="text-8xl font-black opacity-10 absolute inset-0 flex items-center justify-center scale-[3] pointer-events-none group-hover/opt:scale-[4] transition-transform duration-700">
                              {labels[idx]}
                            </span>
                            
                            <div className="relative z-10 flex flex-col items-center gap-4">
                               <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl font-black mb-2 border border-white/30">
                                  {labels[idx]}
                               </div>
                               <span className="text-xl md:text-2xl font-extrabold tracking-tight leading-tight max-w-[280px]">
                                 {optionText}
                               </span>
                            </div>

                            {selectedOption === idx && (
                               <div className="absolute top-8 right-8">
                                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                     <CheckCircle2 className="w-10 h-10 text-white" />
                                  </motion.div>
                               </div>
                            )}
                         </motion.button>
                       );
                     })}
                 </>
              ) : quiz?.status === 'showing-question' ? (
                <div className="col-span-full bg-white/50 backdrop-blur-md rounded-[40px] border-4 border-dashed border-primary-blue/20 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden animate-pulse">
                   <div className="absolute top-0 left-0 w-full h-1 bg-primary-blue/20">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: '100%' }} 
                        transition={{ duration: 3, ease: 'linear' }} 
                        className="h-full bg-primary-blue shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                      />
                   </div>
                   <div className="w-20 h-20 bg-primary-blue/10 rounded-full flex items-center justify-center mb-6">
                      <Clock className="text-primary-blue w-10 h-10 animate-spin-slow" />
                   </div>
                   <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tighter mb-4">Read the Question</h2>
                   <p className="text-[18px] font-black text-[#94A3B8] uppercase tracking-[0.4em] max-w-sm">Data Injection sequence initialized. Synchronize with the primary broadcast terminal for intelligence gathering.</p>
                </div>
              ) : quiz?.status === 'showing-results' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`col-span-full rounded-[40px] flex flex-col items-center justify-center p-12 text-center shadow-2xl relative overflow-hidden ${
                    lastAnswerStatus === 'correct' ? 'bg-emerald-500 text-white' : 
                    lastAnswerStatus === 'incorrect' ? 'bg-rose-500 text-white' : 
                    'bg-[#0F172A] text-white'
                  }`}
                >
                   <div className="absolute inset-0 bg-white/5 animate-pulse" />
                   <div className="relative z-10 space-y-6">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[32px] flex items-center justify-center mx-auto mb-4 border border-white/30">
                        {lastAnswerStatus === 'correct' ? <CheckCircle2 size={48} /> : 
                         lastAnswerStatus === 'incorrect' ? <XCircle size={48} /> : 
                         <AlertCircle size={48} />}
                      </div>
                      <h2 className="text-5xl font-black uppercase tracking-tighter">
                        {lastAnswerStatus === 'correct' ? 'Protocol Success' : 
                         lastAnswerStatus === 'incorrect' ? 'Protocol Breach' : 
                         'Scrutiny Active'}
                      </h2>
                      <p className="text-[18px] font-black uppercase tracking-[0.4em] opacity-70">
                        {lastAnswerStatus === 'correct' ? 'Data validated successfully' : 
                         lastAnswerStatus === 'incorrect' ? 'Sequence mismatched' : 
                         'Synchronizing next node'}
                      </p>
                      {lastAnswerStatus === 'correct' && (
                        <div className="mt-8 bg-black/20 px-8 py-4 rounded-2xl text-xs font-black tracking-widest uppercase">
                          + Efficiency Bonus Applied
                        </div>
                      )}
                   </div>
                </motion.div>
              ) : (
                <div className="col-span-full bg-white rounded-[40px] border border-[#E2E8F0] border-dashed flex flex-col items-center justify-center p-12 text-center">
                   <MonitorOff className="text-[#94A3B8] w-16 h-16 mb-6 animate-pulse" />
                   <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tighter">Waiting Terminal</h2>
                   <p className="text-[15px] font-black text-[#94A3B8] uppercase tracking-[0.3em] mt-2">Analysis broadcast on main display terminal</p>
                </div>
              )}
           </AnimatePresence>
        </div>

       {/* Bottom Identity Node */}
       <div className="p-4 flex items-center justify-center gap-3">
          <div className="w-6 h-px bg-[#E2E8F0]" />
          <span className="text-[13.5px] font-black text-[#94A3B8] uppercase tracking-[0.5em]">{user?.email || "CONNECTED_NODE"}</span>
          <div className="w-6 h-px bg-[#E2E8F0]" />
       </div>
    </div>
  );
}
