"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/layout/Sidebar";
import { 
  Users, 
  Search,
  CheckCircle2,
  BookOpen,
  Trophy,
  Loader2,
  RefreshCw,
  Upload,
  Database,
  Shuffle,
  Trash2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Round2SelectionPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [problemStatements, setProblemStatements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [allocating, setAllocating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      const mockSession = document.cookie
        .split("; ")
        .find((row) => row.startsWith("mock_session="))
        ?.split("=")[1];
      
      const isMockAdmin = mockSession === "admin";
      
      if (!user && !isMockAdmin) {
        router.push("/auth");
        return;
      }

      if (user && !isMockAdmin) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        
        if (profile?.role !== "admin" && profile?.role !== "evaluator") {
          router.push("/");
          return;
        }
      }
      
      loadData();
    }
    checkAuth();
  }, []);

  async function loadData() {
    setLoading(true);
    await Promise.all([loadUsers(), loadProblemStatements()]);
    setLoading(false);
  }

  async function loadUsers() {
    // Fetch users who have submitted a quiz
    const { data: submissions } = await supabase
      .from("submissions")
      .select("user_id, profiles(*)")
      .order("submitted_at", { ascending: false });

    // Get unique users from submissions
    const uniqueUserIds = [...new Set(submissions?.map(s => s.user_id) || [])];
    
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", uniqueUserIds);

    setUsers(profiles || []);
  }

  async function loadProblemStatements() {
    const { data, error } = await supabase
      .from("problem_statements")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error loading PS:", error);
    } else {
      setProblemStatements(data || []);
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      
      // Assume first line is header if it looks like one, otherwise treat as data
      const dataLines = lines[0].toLowerCase().includes("problem") ? lines.slice(1) : lines;
      
      const statements = dataLines.map(line => ({ text: line.trim() }));

      if (statements.length === 0) {
        setError("CSV file is empty or invalid.");
        return;
      }

      setLoading(true);
      const { error: insertError } = await supabase
        .from("problem_statements")
        .insert(statements);

      if (insertError) {
        setError("Failed to upload to Supabase. Ensure 'problem_statements' table exists with a 'text' column.");
        setLoading(false);
      } else {
        await loadProblemStatements();
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const clearProblemStatements = async () => {
    if (!confirm("Are you sure you want to delete all problem statements?")) return;
    
    setLoading(true);
    const { error } = await supabase
      .from("problem_statements")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Hack to delete all in Supabase

    if (error) {
      setError("Failed to clear statements.");
    } else {
      setProblemStatements([]);
    }
    setLoading(false);
  };

  const bulkAllocate = async () => {
    if (problemStatements.length === 0) {
      alert("Please upload problem statements first.");
      return;
    }
    if (users.length === 0) {
      alert("No candidates available for allocation.");
      return;
    }

    setAllocating(true);
    
    // Logic: 
    // 1. Shuffle PS
    // 2. Loop through users and assign
    // 3. Ensure all PS are used if possible
    
    const shuffledPS = [...problemStatements].sort(() => Math.random() - 0.5);
    const userUpdates = [];

    users.forEach((user, index) => {
      // If users > ps, it will wrap around correctly using modulo
      // This ensures every PS is assigned at least once if users >= ps
      // If users < ps, only some PS are used (as per user exception case)
      const psIndex = index % shuffledPS.length;
      userUpdates.push({
        id: user.id,
        round2_topic: shuffledPS[psIndex].text,
        round2_status: 'assigned'
      });
    });

    // Update profiles one by one (Supabase free tier doesn't support bulk upsert on multiple rows easily without unique constraints)
    // For production, a RPC or multi-update would be better, but here we'll do it sequentially or in parallel chunks
    const results = await Promise.all(userUpdates.map(update => 
      supabase.from("profiles").update({ 
        round2_topic: update.round2_topic, 
        round2_status: update.round2_status 
      }).eq("id", update.id)
    ));

    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      setError(`Failed to update ${errors.length} profiles.`);
    } else {
      alert(`Successfully allocated problem statements to ${users.length} candidates.`);
      await loadUsers();
    }
    
    setAllocating(false);
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 md:p-14 space-y-12">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase leading-none">
            Round 2 <span className="text-[#2563EB]">Protocol</span>
          </h1>
          <p className="text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.4em] mt-2">
            INTELLIGENT ALLOCATION SYSTEM
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="bg-white border border-[#E2E8F0] px-4 py-2 rounded-2xl flex items-center gap-3 flex-1 md:flex-none md:min-w-[250px] shadow-sm">
            <Search size={16} className="text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Filter candidates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold w-full placeholder:text-[#CBD5E1]"
            />
          </div>
          
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#0F172A] px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#F8FAFC] transition-all"
          >
            <Upload size={14} />
            <span>Import CSV</span>
          </button>

          <button 
            onClick={bulkAllocate}
            disabled={allocating || problemStatements.length === 0}
            className="flex items-center gap-2 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {allocating ? <Loader2 size={14} className="animate-spin" /> : <Shuffle size={14} />}
            <span>Run Allocation</span>
          </button>
        </div>
      </header>

      {/* PS Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-[28px] shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center">
                <Database size={20} />
             </div>
             <div>
                <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Problem Library</p>
                <h3 className="text-xl font-black text-[#0F172A]">{problemStatements.length} Statements</h3>
             </div>
          </div>
          {problemStatements.length > 0 && (
            <button onClick={clearProblemStatements} className="text-[#EF4444] hover:bg-rose-50 p-2 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6 rounded-[28px] shadow-sm flex items-center gap-4">
           <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Users size={20} />
           </div>
           <div>
              <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Candidate Registry</p>
              <h3 className="text-xl font-black text-[#0F172A]">{users.length} Active Nodes</h3>
           </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] p-6 rounded-[28px] shadow-sm flex items-center gap-4">
           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Trophy size={20} />
           </div>
           <div>
              <p className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Status</p>
              <h3 className="text-xl font-black text-[#0F172A]">
                {users.filter(u => u.round2_topic).length} / {users.length} Assigned
              </h3>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600"
          >
            <AlertCircle size={18} />
            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
            <Loader2 size={40} className="animate-spin text-[#2563EB]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Synchronizing Nodes</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white border border-dashed border-[#E2E8F0] rounded-[32px] p-20 text-center">
            <Users size={48} className="mx-auto text-[#CBD5E1] mb-4" />
            <p className="text-sm font-bold text-[#64748B]">No eligible candidates detected.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-[32px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Candidate Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Assigned Problem Statement</th>
                    <th className="px-8 py-5 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest text-center">Protocol Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredUsers.map((user) => (
                    <motion.tr 
                      key={user.id} 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }}
                      className="hover:bg-[#F8FAFC] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-white font-black text-xs">
                            {user.full_name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#0F172A] leading-tight">{user.full_name}</p>
                            <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {user.round2_topic ? (
                          <div className="flex items-start gap-3 text-[#2563EB] max-w-md">
                            <BookOpen size={14} className="mt-1 flex-shrink-0" />
                            <span className="text-xs font-bold leading-relaxed">{user.round2_topic}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-[#CBD5E1] uppercase tracking-widest italic">Pending Allocation</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          user.round2_status === 'submitted' 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : user.round2_status === 'assigned'
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : "bg-gray-50 text-gray-400 border-gray-100"
                        }`}>
                          {user.round2_status || "PENDING"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
