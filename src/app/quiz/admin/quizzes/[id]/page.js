"use client";

import { useEffect, useState, use } from "react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/layout/Sidebar";
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  BookText, 
  Zap, 
  AlertCircle,
  Settings,
  Target,
  Hash,
  CheckCircle2,
  ArrowRight,
  Clock,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function QuizConfigurePage({ params }) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ 
    content: "", 
    correct_answer: "A",
    options: ["", "", "", ""],
    time_limit: 30,
    points: 100
  });
  
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    // Fetch Quiz Details
    const { data: quizData } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .single();
    setQuiz(quizData);

    // Fetch Participants Count
    const { count } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("quiz_id", id);
    setParticipantsCount(count || 0);

    // Fetch Questions
    const { data: questionData, error: qErr } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", id)
      .order("order_index", { ascending: true });
    
    if (qErr) console.error("Question retrieval error:", qErr);
    setQuestions(questionData || []);
    setLoading(false);
  };

  const handleAuthorizeNode = async (e) => {
    e.preventDefault();
    if (!newQuestion.content.trim()) return;

    setSubmitting(true);
    if (editingQuestionId) {
      // UPDATE PROTOCOL NODE
      const { error } = await supabase
        .from("questions")
        .update({
          content: newQuestion.content,
          options: newQuestion.options,
          correct_answer: newQuestion.correct_answer,
          time_limit: newQuestion.time_limit,
          points: newQuestion.points
        })
        .eq("id", editingQuestionId);

      if (error) {
        console.error("Critical Recalibration Error:", error);
        alert("PROTOCOL RECALIBRATION FAILED: " + error.message);
      } else {
        await loadData();
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    } else {
      // INJECT NEW PROTOCOL NODE
      const { error } = await supabase
        .from("questions")
        .insert([
          { 
            quiz_id: id, 
            content: newQuestion.content, 
            options: newQuestion.options,
            correct_answer: newQuestion.correct_answer,
            time_limit: newQuestion.time_limit || 30,
            points: newQuestion.points || 100,
            order_index: questions.length 
          }
        ]);

      if (error) {
        console.error("Critical Injection Error:", error);
        alert("PROTOCOL INJECTION FAILED: " + error.message);
      } else {
        setNewQuestion({ 
          content: "", 
          correct_answer: "A", 
          options: ["", "", "", ""],
          time_limit: 30,
          points: 100
        });
        await loadData();
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    }
    setSubmitting(false);
  };

  const handleDeleteQuestion = async (qId) => {
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", qId);
    
    if (!error) {
      setEditingQuestionId(null);
      setNewQuestion({ content: "", correct_answer: "A", options: ["", "", "", ""], time_limit: 30, points: 100 });
      loadData();
    }
  };

  if (loading) return null;

  return (
    <div className="p-6 md:p-14 space-y-10 flex flex-col min-h-full">
         {/* Breadcrumbs */}
         <button 
           onClick={() => router.push("/quiz/admin/quizzes")}
           className="flex items-center gap-2 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.3em] hover:text-[#2563EB] transition-colors w-fit"
         >
            <ChevronLeft size={14} />
            <span>Back to Protocols</span>
         </button>

         <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                    <Hash size={18} className="text-[#2563EB]" />
                    <span className="text-sm font-black text-[#0F172A] uppercase tracking-widest leading-none">
                       {questions.length} Nodes Registered
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-3 bg-white px-8 py-4 rounded-[24px] border border-[#E2E8F0] shadow-sm">
                    <Users size={18} className="text-emerald-500" />
                    <span className="text-sm font-black text-[#0F172A] uppercase tracking-widest leading-none">
                       {participantsCount} Authorized Personnel
                    </span>
                 </div>

                 {editingQuestionId ? (
                   <button 
                     onClick={() => handleDeleteQuestion(editingQuestionId)}
                     disabled={submitting}
                     className="bg-red-500 text-white px-8 py-4 rounded-[24px] flex items-center gap-3 shadow-xl shadow-red-200 hover:bg-red-600 active:scale-95 transition-all text-sm font-black uppercase tracking-widest disabled:opacity-50"
                   >
                     <Trash2 size={18} />
                     Delete Intelligence Node
                   </button>
                 ) : (
                   <button 
                     onClick={() => {
                       setEditingQuestionId(null);
                       setNewQuestion({ content: "", options: ["", "", "", ""], correct_answer: "A", time_limit: 30, points: 100 });
                       window.scrollTo({ top: 300, behavior: 'smooth' });
                     }}
                     className="bg-[#2563EB] text-white px-8 py-4 rounded-[24px] flex items-center gap-3 shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all text-sm font-black uppercase tracking-widest"
                   >
                     <Plus size={18} strokeWidth={3} />
                     Add Intelligence Node
                   </button>
                 )}
              </div>

             <header className="text-right">
                <h1 className="text-5xl font-extrabold text-[#0F172A] tracking-tighter uppercase leading-none">
                   Configure <span className="text-[#2563EB]">Intelligence</span>
                </h1>
                <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.3em] mt-2">
                   {quiz?.title} • Session Protocol Analysis
                </p>
             </header>
          </div>

         <div className="flex justify-center w-full px-4 md:px-8">
            {/* Question Entry Form */}
            <div className="w-full max-w-[1800px] space-y-12">
               <div className="bg-white rounded-[40px] border border-[#E2E8F0] shadow-sm p-8 space-y-8">
                  <form onSubmit={handleAuthorizeNode} className="space-y-8">
                     <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 items-stretch">
                        {/* Left Side: Question */}
                        <div className="flex flex-col h-full space-y-4">
                           <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.4em] ml-6">Challenge Content Matrix</label>
                           <textarea 
                             required
                             value={newQuestion.content}
                             onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                             placeholder="Enter the technical challenge or question protocol..."
                             className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-[32px] p-8 text-2xl font-black text-[#0F172A] focus:outline-none focus:border-[#2563EB] flex-1 resize-none"
                           />

                           <div className="flex flex-col gap-4 pt-2">
                              <button
                                type="submit"
                                disabled={submitting || !newQuestion.content || newQuestion.options.some(opt => !opt) || !newQuestion.time_limit || !newQuestion.points}
                                className={`w-full py-6 rounded-[28px] font-black text-xl uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 group ${
                                  (submitting || !newQuestion.content || newQuestion.options.some(opt => !opt) || !newQuestion.time_limit || !newQuestion.points)
                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                    : "bg-[#0F172A] text-white hover:scale-[1.02] active:scale-95"
                                }`}
                              >
                                 <span>{submitting ? "Authorizing..." : "Authorize Node"}</span>
                                 <Zap className={`${(submitting || !newQuestion.content || newQuestion.options.some(opt => !opt) || !newQuestion.time_limit || !newQuestion.points) ? "text-slate-300" : "text-blue-500 fill-blue-500"} w-8 h-8 group-hover:animate-pulse`} />
                              </button>

                              <button
                                type="button"
                                onClick={() => router.push('/quiz/admin/quizzes')}
                                className="w-full py-6 rounded-[28px] border-2 border-[#0F172A] font-black text-xs uppercase tracking-[0.4em] text-[#0F172A] hover:bg-slate-50 transition-all flex items-center justify-center gap-4 group"
                              >
                                 <span>Finish Protocol</span>
                                 <ArrowRight size={18} className="group-hover:translate-x-1 transition-all" />
                              </button>
                           </div>
                        </div>

                        {/* Right Side: Options & Correct Answer */}
                        <div className="flex flex-col h-full space-y-8">
                           <div className="grid grid-cols-1 gap-6">
                              {['A', 'B', 'C', 'D'].map((label, idx) => (
                                 <div key={label} className="space-y-3">
                                    <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] ml-6">Option Node {label}</label>
                                    <div className="relative group">
                                       <div className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white border-2 border-[#E2E8F0] rounded-2xl flex items-center justify-center text-sm font-black text-[#2563EB] shadow-sm">
                                          {label}
                                       </div>
                                       <input 
                                         type="text"
                                         required
                                         value={newQuestion.options[idx]}
                                         onChange={(e) => {
                                           const opts = [...newQuestion.options];
                                           opts[idx] = e.target.value;
                                           setNewQuestion({...newQuestion, options: opts});
                                         }}
                                         placeholder={`Define protocol ${label}...`}
                                         className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-[24px] py-6 pl-24 pr-8 text-lg font-black text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition-all"
                                       />
                                    </div>
                                 </div>
                              ))}
                           </div>

                           <div className="space-y-6 pt-4">
                              <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] ml-6">Correct Response Signature</label>
                              <div className="flex gap-4">
                                 {['A', 'B', 'C', 'D'].map((label) => (
                                    <button
                                      key={label}
                                      type="button"
                                      onClick={() => setNewQuestion({...newQuestion, correct_answer: label})}
                                      className={`flex-1 py-7 rounded-[28px] font-black text-base transition-all border-2 ${
                                        newQuestion.correct_answer === label 
                                          ? "bg-[#2563EB] text-white border-[#2563EB] shadow-2xl shadow-blue-200 scale-[1.05]" 
                                          : "bg-white text-[#94A3B8] border-[#E2E8F0] hover:border-[#2563EB]/40"
                                      }`}
                                    >
                                       {label}
                                    </button>
                                 ))}
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#F1F5F9]">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] ml-6">Response Timer (Sec)</label>
                                 <div className="relative">
                                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#2563EB] w-5 h-5" />
                                    <input 
                                      type="text"
                                      value={newQuestion.time_limit || ""}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setNewQuestion({...newQuestion, time_limit: val ? parseInt(val) : ""})
                                      }}
                                      placeholder="00"
                                      className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-[28px] py-6 pl-16 pr-8 text-lg font-black text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition-all"
                                    />
                                 </div>
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.4em] ml-6">Node Magnitude (Pts)</label>
                                 <div className="relative">
                                    <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500 w-5 h-5" />
                                    <input 
                                      type="text"
                                      value={newQuestion.points || ""}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setNewQuestion({...newQuestion, points: val ? parseInt(val) : ""})
                                      }}
                                      placeholder="0"
                                      className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-[28px] py-6 pl-16 pr-8 text-lg font-black text-[#0F172A] focus:outline-none focus:border-[#2563EB] transition-all"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </form>
               </div>

               {/* Protocol Navigation Matrix Terminal */}
               <div className="pt-10 border-t border-[#F1F5F9] bg-slate-50/50 rounded-b-[40px] p-12">
                  <div className="flex flex-col items-center gap-10">
                     <div className="flex items-center gap-6">
                        <div className="h-px w-16 bg-[#E2E8F0]" />
                        <p className="text-[11px] font-black text-[#64748B] uppercase tracking-[0.8em]">INTELLIGENCE NODE SELECTOR</p>
                        <div className="h-px w-16 bg-[#E2E8F0]" />
                     </div>
                     
                     <div className="w-full bg-white/80 border border-[#E2E8F0] rounded-[32px] p-4 shadow-inner">
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar-hide px-4 scroll-smooth">
                           {questions.map((q, idx) => (
                              <button
                                key={q.id}
                                type="button"
                                onClick={() => {
                                  setEditingQuestionId(q.id);
                                  setNewQuestion({
                                    content: q.content,
                                    options: q.options,
                                    correct_answer: q.correct_answer,
                                    time_limit: q.time_limit,
                                    points: q.points
                                  });
                                  window.scrollTo({ top: 300, behavior: 'smooth' });
                                }}
                                className={`flex-shrink-0 w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-lg font-black transition-all shadow-sm relative group active:scale-95 ${
                                  editingQuestionId === q.id 
                                    ? "bg-blue-600 border-blue-600 text-white" 
                                    : "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-blue-50"
                                }`}
                              >
                                 {idx + 1}
                                 <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                   editingQuestionId === q.id ? "bg-white" : "bg-emerald-500"
                                 }`} />
                              </button>
                           ))}
                           
                           <button
                             type="button"
                             onClick={() => {
                               setEditingQuestionId(null);
                               setNewQuestion({ content: "", options: ["", "", "", ""], correct_answer: "A", time_limit: 30, points: 100 });
                               window.scrollTo({ top: 300, behavior: 'smooth' });
                             }}
                             className={`flex-shrink-0 w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all active:scale-95 ml-2 ${
                               editingQuestionId === null 
                                 ? "bg-white border-blue-600 text-blue-600 shadow-lg shadow-blue-100" 
                                 : "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
                             }`}
                           >
                              <Plus size={24} strokeWidth={3} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
    </div>
  );
}
