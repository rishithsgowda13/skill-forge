"use client";

import { SidebarProvider } from "@/context/SidebarContext";

export function Providers({ children }) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  );
}
