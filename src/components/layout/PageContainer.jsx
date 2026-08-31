"use client";

import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function PageContainer({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

      <div className="flex-1 flex w-full mx-auto">
        <Sidebar
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
