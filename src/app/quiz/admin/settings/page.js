"use client";

import Sidebar from "@/components/layout/Sidebar";
import { 
  Settings, 
  Palette,
  Bell,
  Database,
  Cloud,
  Code
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSettingsPage() {
  return (
    <div className="p-10 space-y-10 flex flex-col min-h-full">
      <div className="flex items-center justify-between">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">System Infrastructure</h1>
          <p className="text-meta">CORE PLATFORM PARAMETERS & DEPLOYMENT</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {[
           { label: "Neural Interface", icon: Palette, desc: "Visual aesthetics & theme engine config." },
           { label: "Notification Node", icon: Bell, desc: "Global broadcast & alert system rules." },
           { label: "Storage Engine", icon: Database, desc: "Supabase DB sync & latency optimization." },
           { label: "Cloud Deployment", icon: Cloud, desc: "Vercel edge functions & static routing." },
           { label: "API Configuration", icon: Code, desc: "Environment secrets & public key access." },
           { label: "System Core", icon: Settings, desc: "General platform version & system health." }
         ].map((s, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: i * 0.05 }}
             className="dashboard-card group hover:border-[#2563EB] transition-all cursor-pointer relative overflow-hidden"
           >
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-gray-50 group-hover:bg-[#F0F7FF] rounded-2xl flex items-center justify-center text-text-meta group-hover:text-[#2563EB] transition-colors">
                    <s.icon size={22} />
                 </div>
                 <h3 className="text-lg font-bold text-text-primary group-hover:text-[#2563EB] transition-colors">{s.label}</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">{s.desc}</p>
              <button className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Configure Node</button>
           </motion.div>
         ))}
      </div>
    </div>
  );
}
