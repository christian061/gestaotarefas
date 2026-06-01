"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  KanbanSquare,
  Settings,
  Users,
  Bell,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Calendar,
  BarChart3,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { useNotificationsStore } from "@/stores/notifications-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useBoardStore } from "@/stores/board-store";
import { NewBoardModal } from "@/components/board/new-board-modal";
import { EditBoardModal } from "@/components/board/edit-board-modal";
import type { Board } from "@/types";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: KanbanSquare, label: "Quadros", href: "/" },
  { icon: Calendar, label: "Calendário", href: "/calendar" },
  { icon: BarChart3, label: "Relatórios", href: "/reports" },
  { icon: Users, label: "Equipe", href: "/team" },
];

const bottomNavBase: NavItem[] = [
  { icon: Bell, label: "Notificações", href: "/notifications" },
  { icon: MessageSquare, label: "WhatsApp", href: "/whatsapp" },
  { icon: Sparkles, label: "IA Assistant", href: "/ai" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (href: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ activeItem, onNavigate, collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const active = activeItem || pathname || "/";
  const [newBoardOpen, setNewBoardOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length);
  const { profile } = useSettingsStore();
  const { boards, activeBoard, switchBoard, deleteBoard } = useBoardStore();
  const bottomNav = bottomNavBase.map((item) =>
    item.href === "/notifications" ? { ...item, badge: unreadCount || undefined } : item
  );
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const setCollapsed = (v: boolean) => {
    setInternalCollapsed(v);
    onCollapsedChange?.(v);
  };

  const navigate = (href: string) => {
    onNavigate?.(href);
    router.push(href);
  };

  return (
    <>
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      suppressHydrationWarning
      className={cn(
        "hidden md:flex flex-col h-screen border-r border-border bg-card/50 backdrop-blur-xl",
        "fixed left-0 top-0 z-40"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 h-16">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <KanbanSquare className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">TaskFlow</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator />

      {/* Search */}
      {!collapsed && (
        <div className="p-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-muted-foreground h-9 px-3"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Buscar...</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </Button>
        </div>
      )}

      {/* New Board Button */}
      <div className="px-3 pb-2">
        <Button
          onClick={() => setNewBoardOpen(true)}
          className={cn(
            "w-full gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25",
            collapsed && "px-0"
          )}
          size={collapsed ? "icon" : "default"}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span>Novo Quadro</span>}
        </Button>
      </div>

      <Separator className="my-2" />

      {/* Boards List */}
      {!collapsed && boards.length > 0 && (
        <div className="px-3 pb-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-1">Meus Quadros</p>
          <div className="space-y-0.5 max-h-40 overflow-y-auto">
            {boards.map((board) => (
              <div
                key={board.id}
                className={cn(
                  "group w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  activeBoard?.id === board.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <button
                  className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  onClick={() => { navigate("/"); switchBoard(board.id); }}
                >
                  <span className={cn("h-3 w-3 rounded-sm shrink-0 bg-gradient-to-br", board.color || "from-violet-500 to-indigo-600")} />
                  <span className="truncate">{board.title}</span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="opacity-0 group-hover:opacity-100 shrink-0 h-5 w-5 rounded flex items-center justify-center hover:bg-muted-foreground/20 transition-all"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setEditingBoard(board)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Editar quadro
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => { if (boards.length > 1) deleteBoard(board.id); }}
                      className={cn("text-destructive", boards.length <= 1 && "opacity-40 pointer-events-none")}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir quadro
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator className="my-2" />

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {mainNav.map((item) => (
          <Button
            key={item.href}
            variant={active === item.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10 font-medium",
              active === item.href && "bg-accent text-accent-foreground",
              collapsed && "justify-center px-0"
            )}
            onClick={() => navigate(item.href)}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {item.badge && !collapsed && (
              <span className="ml-auto bg-violet-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Button>
        ))}
      </nav>

      <Separator className="my-2" />

      {/* Bottom Navigation */}
      <nav className="px-3 pb-3 space-y-1">
        {bottomNav.map((item) => (
          <Button
            key={item.href}
            variant={active === item.href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-10",
              active === item.href && "bg-accent text-accent-foreground",
              collapsed && "justify-center px-0"
            )}
            onClick={() => navigate(item.href)}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {item.badge && !collapsed && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Button>
        ))}
      </nav>

      <Separator />

      {/* User Section */}
      <div className={cn("p-3 flex items-center gap-3", collapsed && "justify-center")}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs">
            {profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile.name}</p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
        )}
        {!collapsed && <ThemeToggle />}
      </div>
    </motion.aside>

    <NewBoardModal open={newBoardOpen} onClose={() => setNewBoardOpen(false)} />
    {editingBoard && (
      <EditBoardModal
        board={editingBoard}
        open={!!editingBoard}
        onClose={() => setEditingBoard(null)}
      />
    )}
    </>
  );
}
