"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/layout/Sidebar";
import { 
  Users, 
  Search,
  MoreVertical,
  Mail,
  Shield,
  Clock,
  Phone,
  Bookmark,
  Hash,
  Layers,
  KeyRound
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    }
    loadUsers();
  }, []);

  return (
    <div className="p-10 space-y-10 flex flex-col min-h-full">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Identity Registry</h1>
          <p className="text-meta">CORE TERMINAL ACCESS & USER DATA</p>
        </motion.div>
        
        <div className="flex items-center gap-4">
          <div className="glass-morphism bg-white px-3 py-2 rounded-inner border border-card-border shadow-subtle flex items-center gap-3">
            <Search size={16} className="text-text-meta" />
            <input 
              type="text" 
              placeholder="Lookup node..." 
              className="bg-transparent border-none outline-none text-xs font-semibold placeholder:text-text-meta w-48 text-[#0F172A]"
            />
          </div>
          <button className="bg-[#2563EB] text-white px-5 py-2.5 rounded-inner font-bold text-xs tracking-widest uppercase shadow-lg shadow-blue-200">
            New Instance
          </button>
        </div>
      </div>

      <div className="dashboard-card overflow-hidden !p-0 border-[#E2E8F0]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50/50">
              <th className="px-6 py-5 text-[9px] font-black text-text-meta uppercase tracking-widest">Identified Node</th>
              <th className="px-6 py-5 text-[9px] font-black text-text-meta uppercase tracking-widest">Branch/Dept</th>
              <th className="px-4 py-5 text-[9px] font-black text-text-meta uppercase tracking-widest text-center">Sec</th>
              <th className="px-4 py-5 text-[9px] font-black text-text-meta uppercase tracking-widest text-center">Sem</th>
              <th className="px-6 py-5 text-[9px] font-black text-text-meta uppercase tracking-widest">Contact Info</th>
              <th className="px-6 py-5 text-[9px] font-black text-text-meta uppercase tracking-widest text-center">Auth Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                 <td colSpan="6" className="py-20 text-center">
                    <div className="w-8 h-8 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin mx-auto" />
                 </td>
              </tr>
            ) : users.map((u, i) => (
              <motion.tr 
                key={u.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b last:border-none group hover:bg-[#F0F7FF]/50 transition-colors"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-[#2563EB]/10 rounded-xl flex items-center justify-center text-[#2563EB] font-black text-xs">
                        {u.full_name?.[0] || "U"}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-[#0F172A] leading-tight">{u.full_name || "Unknown Entity"}</p>
                        <p className="text-[10px] font-black text-[#94A3B8] uppercase tracking-tighter">ID: {u.id.slice(0, 8).toUpperCase()}</p>
                     </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                     <Layers size={14} className="text-[#2563EB]" />
                     <span className="text-xs font-bold text-[#0F172A] uppercase tracking-tight">
                       {u.department || "CSE/AI"}
                     </span>
                  </div>
                </td>
                <td className="px-4 py-5 text-center">
                  <span className="px-2.5 py-1 bg-[#F1F5F9] rounded-lg text-[10px] font-black text-[#64748B] uppercase">Section A</span>
                </td>
                <td className="px-4 py-5 text-center">
                  <span className="text-xs font-bold text-[#0F172A]">06</span>
                </td>
                <td className="px-6 py-5">
                   <div className="space-y-1">
                      <div className="flex items-center gap-2 text-text-secondary">
                         <Mail size={12} className="text-[#94A3B8]" />
                         <span className="text-[11px] font-bold text-[#64748B]">{u.email || "node@skillforge.io"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary">
                         <Phone size={12} className="text-[#94A3B8]" />
                         <span className="text-[11px] font-bold text-[#64748B]">+91 99****65</span>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E11D48] rounded-xl transition-all group/btn border border-[#FECDD3]">
                       <KeyRound size={12} className="group-hover/btn:rotate-12 transition-transform" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Reset Pass</span>
                    </button>
                    <button className="p-2 hover:bg-white rounded-lg transition-all text-text-meta">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
