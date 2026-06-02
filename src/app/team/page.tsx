"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Mail, UserPlus, CheckCircle2, Clock, Trash2 } from "lucide-react";
import { useBoardStore } from "@/stores/board-store";
import { InviteMemberModal } from "@/components/team/invite-member-modal";
import { boardsApi } from "@/lib/api";

export default function TeamPage() {
  const { columns, activeBoard } = useBoardStore();
  const allTasks = columns.flatMap((c) => c.tasks);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Refresh active board when Team page opens
  useEffect(() => {
    (async () => {
      try {
        if (activeBoard?.id && /^c[0-9a-z]{24}$/i.test(activeBoard.id)) {
          const fresh = await boardsApi.get(activeBoard.id);
          useBoardStore.setState((state) => {
            const boards = state.boards.map((b) => b.id === activeBoard.id ? {
              ...b,
              members: (fresh.members || []).map((m: any) => ({ id: m.user.id, name: m.user.name, email: m.user.email, avatar: m.user.avatar, role: m.role })),
            } : b);
            const active = boards.find((b) => b.id === activeBoard.id) || state.activeBoard;
            return { boards, activeBoard: active } as any;
          });
        }
      } catch {}
    })();
  }, [activeBoard?.id]);

  // Collect unique users: board members + task assignees
  const userMap = new Map<string, { id: string; name: string; email: string; avatar?: string }>();
  (activeBoard?.members || []).forEach((u) => userMap.set(u.id, u));
  allTasks.forEach((t) => { if (t.assignee) userMap.set(t.assignee.id, t.assignee); });
  const boardUsers = Array.from(userMap.values());

  const members = boardUsers.map((user) => {
    const assigned = allTasks.filter((t) => t.assignee?.id === user.id);
    const completed = assigned.filter((t) => t.status === "done").length;
    const inProgress = assigned.filter((t) => t.status === "in_progress").length;
    const total = assigned.length;
    return { ...user, total, completed, inProgress, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  const ROLE_BADGE: Record<string, string> = {
    "1": "Desenvolvedora",
    "2": "Tech Lead",
    "3": "Designer",
    "4": "QA Engineer",
  };

  const GRADIENT: Record<string, string> = {
    "1": "from-violet-500 to-indigo-600",
    "2": "from-blue-500 to-cyan-600",
    "3": "from-pink-500 to-rose-600",
    "4": "from-amber-500 to-orange-600",
  };

  return (
    <PageLayout title="Equipe" subtitle="Membros e desempenho">
      <div className="p-6 space-y-6">
        {/* Invite button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setInviteOpen(true)}
            className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20"
          >
            <UserPlus className="h-4 w-4" />
            Convidar Membro
          </Button>
        </div>

        {/* Members grid */}
        {members.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <UserPlus className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">Nenhum membro ainda. Convide pessoas ou atribua tarefas para vê-las aqui.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <Card key={member.id} className="border-border/50 hover:border-violet-500/30 transition-colors">
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className={`text-lg bg-gradient-to-br ${GRADIENT[member.id] || "from-violet-500 to-indigo-600"} text-white`}>
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{member.name || (member.email?.split("@")[0] || "Membro")}</p>
                    <p className="text-xs text-muted-foreground">{ROLE_BADGE[member.id] || "Membro"}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-500">
                    Ativo
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Conclusão</span>
                    <span className="font-medium">{member.rate}%</span>
                  </div>
                  <Progress value={member.rate} className="h-1.5" />

                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div>
                      <p className="text-lg font-bold">{member.total}</p>
                      <p className="text-[10px] text-muted-foreground">Total</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-500">{member.completed}</p>
                      <p className="text-[10px] text-muted-foreground">Feitas</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-yellow-500">{member.inProgress}</p>
                      <p className="text-[10px] text-muted-foreground">Em prog.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    Enviar mensagem
                  </Button>
                  {(activeBoard as any)?.members?.find((m: any) => m.id === (window as any)?.authUserId)?.role in { owner:1, admin:1 } && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1 text-red-600 border-red-200 hover:bg-red-500/10"
                      onClick={async () => {
                        if (!activeBoard?.id) return;
                        if (!confirm(`Remover ${member.name || member.email}?`)) return;
                        try {
                          await boardsApi.removeMember(activeBoard.id, member.id);
                          const fresh = await boardsApi.get(activeBoard.id);
                          useBoardStore.setState((state) => {
                            const boards = state.boards.map((b) => b.id === activeBoard.id ? {
                              ...b,
                              members: (fresh.members || []).map((m: any) => ({ id: m.user.id, name: m.user.name, email: m.user.email, avatar: m.user.avatar, role: m.role })),
                            } : b);
                            const active = boards.find((b) => b.id === activeBoard.id) || state.activeBoard;
                            return { boards, activeBoard: active } as any;
                          });
                        } catch (e: any) {
                          alert(e?.message || 'Falha ao remover membro');
                        }
                      }}
                      title="Remover do quadro"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Task assignment table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-4">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className={`text-xs bg-gradient-to-br ${GRADIENT[member.id] || "from-violet-500 to-indigo-600"} text-white`}>
                      {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{member.name}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 ml-2">
                        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" />{member.completed}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-yellow-500" />{member.inProgress}</span>
                      </div>
                    </div>
                    <Progress value={member.rate} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <InviteMemberModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </PageLayout>
  );
}
