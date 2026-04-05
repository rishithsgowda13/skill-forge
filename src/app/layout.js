"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { Providers } from "./Providers";
import { useSidebar } from "@/context/SidebarContext";
import { motion } from "framer-motion";
import "./globals.css";

function DashboardLayoutContent({ children }) {
  const { isExpanded } = useSidebar();
  const pathname = usePathname();
  
  // Routes where sidebar should NOT appear
  const hideSidebarRoutes = ["/login", "/signup", "/auth", "/quiz/play", "/quiz/host"];
  const shouldShowSidebar = !hideSidebarRoutes.some(route => pathname?.startsWith(route)) && pathname !== "/";

  if (!shouldShowSidebar) {
    return <main className="flex-1 w-full min-h-screen overflow-y-auto">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-page-bg font-sans overflow-x-hidden">
      <Sidebar />
      <motion.main 
        initial={false}
        animate={{ 
          marginLeft: typeof window !== 'undefined' && window.innerWidth < 1024 ? "0px" : (isExpanded ? "240px" : "72px")
        }}
        className="flex-1 min-h-screen overflow-y-auto custom-scrollbar w-full"
      >
        <div className="w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </motion.main>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="antialiased h-full">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-page-bg text-black">
        <Providers>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Providers>
      </body>
    </html>
  );
}
