"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onAddTask?: () => void;
}

export function PageLayout({ children, title, subtitle, onAddTask }: PageLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
        style={{ paddingLeft: sidebarCollapsed ? 72 : 260 }}
        suppressHydrationWarning
      >
        <Header title={title} subtitle={subtitle} onAddTask={onAddTask} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
