"use client";

import { LayoutDashboard, KanbanSquare, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  activeItem?: string;
  onNavigate?: (href: string) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: KanbanSquare, label: "Quadros", href: "/boards" },
  { icon: Plus, label: "Novo", href: "/new", isAction: true },
  { icon: Bell, label: "Alertas", href: "/notifications" },
  { icon: User, label: "Perfil", href: "/profile" },
];

export function MobileNav({ activeItem = "/boards", onNavigate }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => onNavigate?.(item.href)}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors",
              item.isAction && "relative -top-4",
              activeItem === item.href
                ? "text-violet-500"
                : "text-muted-foreground"
            )}
          >
            {item.isAction ? (
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <item.icon className="h-5 w-5 text-white" />
              </div>
            ) : (
              <item.icon className="h-5 w-5" />
            )}
            <span className={cn("text-[10px] font-medium", item.isAction && "mt-1")}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
