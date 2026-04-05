"use client";

import Sidebar from "./Sidebar";
import { useSidebar } from "@/context/SidebarContext";
import { motion } from "framer-motion";

export default function DashboardWrapper({ children, className = "" }) {
  const { isExpanded } = useSidebar();

  return (
    <div className="flex min-h-screen bg-page-bg font-sans">
      <Sidebar />
      <motion.main 
        animate={{ 
          marginLeft: isExpanded ? "240px" : "72px" 
        }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className={`flex-1 min-h-screen w-full transition-all ${className}`}
      >
        {children}
      </motion.main>
    </div>
  );
}
