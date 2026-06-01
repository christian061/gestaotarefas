"use client";

import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, AlertTriangle, MessageSquare, UserPlus, Clock, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "@/stores/notifications-store";

const ICON_MAP: Record<string, React.ElementType> = {
  Bell, CheckCircle2, AlertTriangle, MessageSquare, UserPlus, Clock,
};

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead } = useNotificationsStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <PageLayout title="Notificações" subtitle="Suas atualizações recentes">
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">
            {unread > 0 ? `${unread} não lidas` : "Todas lidas"}
          </h2>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="gap-2 text-violet-500 hover:text-violet-600" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = ICON_MAP[n.icon] || Bell;
            return (
              <Card
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "border-border/50 cursor-pointer hover:border-violet-500/30 transition-all",
                  !n.read && "border-l-4 border-l-violet-500 bg-violet-500/5"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-lg shrink-0 mt-0.5", n.bg)}>
                      <Icon className={cn("h-4 w-4", n.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("text-sm font-medium", !n.read && "text-foreground")}>{n.title}</p>
                        {!n.read && (
                          <Badge className="bg-violet-500 text-white text-[10px] h-4 px-1.5 shrink-0">Nova</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[11px] text-muted-foreground/70 mt-1.5">{n.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
