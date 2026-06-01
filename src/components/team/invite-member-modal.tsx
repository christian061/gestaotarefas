"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Link2,
  Copy,
  Check,
  Mail,
  MessageCircle,
  RefreshCw,
  Send,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useBoardStore } from "@/stores/board-store";
import { useAuthStore } from "@/stores/auth-store";
import { invitesApi, boardsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
}

function generateInviteToken() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

export function InviteMemberModal({ open, onClose }: InviteMemberModalProps) {
  const { activeBoard } = useBoardStore();
  const { user } = useAuthStore();
  const [token, setToken] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [addedMember, setAddedMember] = useState(false);
  const [whatsappTo, setWhatsappTo] = useState("");
  const [sentEmail, setSentEmail] = useState(false);
  const [sentWpp, setSentWpp] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          if (activeBoard) {
            const res = await fetch(`${API}/invites/create`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ boardId: activeBoard.id })
            });
            if (res.ok) {
              const data = await res.json();
              setToken(data.token);
            } else {
              setToken(generateInviteToken());
            }
          } else {
            setToken(generateInviteToken());
          }
        } catch {
          setToken(generateInviteToken());
        }
        setEmailTo("");
        setWhatsappTo("");
        setSentEmail(false);
        setSentWpp(false);
        setCopied(false);
      })();
    }
  }, [open, activeBoard]);

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/invite/${token}`
    : `https://taskflow.app/invite/${token}`;

  const boardName = activeBoard?.title || "TaskFlow";
  const message = `Você foi convidado para colaborar no quadro "${boardName}"! Acesse pelo link: ${inviteLink}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = async () => {
    if (!emailTo.trim() || !activeBoard) return;
    setAddingMember(true);
    setAddedMember(false);
    setEmailError(null);
    try {
      await boardsApi.addMember(activeBoard.id, emailTo.trim());
      // Recarrega board e atualiza store
      const fresh = await boardsApi.get(activeBoard.id);
      useBoardStore.setState((state) => {
        const boards = state.boards.map((b) => b.id === activeBoard.id ? {
          ...b,
          members: (fresh.members || []).map((m: any) => ({ id: m.user.id, name: m.user.name, email: m.user.email, avatar: m.user.avatar, role: m.role })),
        } : b);
        const active = boards.find((b) => b.id === activeBoard.id) || state.activeBoard;
        return { boards, activeBoard: active } as any;
      });
      setAddedMember(true);
    } catch (err: any) {
      setEmailError(err?.message || "Falha ao adicionar membro. Verifique se o usuário já possui conta.");
    } finally {
      setAddingMember(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = whatsappTo.replace(/\D/g, "");
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setSentWpp(true);
  };

  const handleEmail = async () => {
    if (!emailTo.trim()) return;
    setSendingEmail(true);
    setEmailError(null);
    try {
      await invitesApi.sendEmail({
        to: emailTo.trim(),
        boardName,
        inviteLink,
        inviterName: user?.name,
      });
      setSentEmail(true);
    } catch (err: any) {
      setEmailError(err?.message || "Falha ao enviar. Verifique a chave RESEND_API_KEY.");
    } finally {
      setSendingEmail(false);
    }
  };

  const regenerate = async () => {
    try {
      if (activeBoard) {
        const res = await fetch(`${API}/invites/create`, {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boardId: activeBoard.id, email: emailTo || undefined })
        });
        if (res.ok) {
          const data = await res.json();
          setToken(data.token);
        } else {
          setToken(generateInviteToken());
        }
      } else {
        setToken(generateInviteToken());
      }
    } catch {
      setToken(generateInviteToken());
    }
    setSentEmail(false);
    setSentWpp(false);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <UserPlus className="h-3.5 w-3.5 text-white" />
            </div>
            Convidar Membro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Board info */}
          <p className="text-sm text-muted-foreground">
            Compartilhe o link de convite para o quadro{" "}
            <span className="font-medium text-foreground">"{boardName}"</span>.
            O link é válido por 7 dias.
          </p>

          {/* Invite link */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" /> Link de convite
            </Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={inviteLink}
                className="flex-1 font-mono text-xs bg-muted/50 text-muted-foreground"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className={cn("shrink-0 transition-colors", copied && "border-green-500 text-green-500")}
                title="Copiar link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={regenerate}
                title="Gerar novo link"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-[#25D366]">
              <MessageCircle className="h-3.5 w-3.5" /> Enviar por WhatsApp
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="+55 11 99999-9999 (opcional)"
                value={whatsappTo}
                onChange={(e) => { setWhatsappTo(e.target.value); setSentWpp(false); }}
                className="flex-1"
              />
              <Button
                onClick={handleWhatsApp}
                className={cn(
                  "shrink-0 gap-2 transition-all",
                  sentWpp
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-[#25D366] hover:bg-[#20b858] text-white"
                )}
              >
                {sentWpp ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {sentWpp ? "Enviado!" : "Enviar"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Deixe em branco para abrir o WhatsApp e escolher o contato.
            </p>
          </div>

          <Separator />

          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Enviar por Email
            </Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={emailTo}
                onChange={(e) => { setEmailTo(e.target.value); setSentEmail(false); setEmailError(null); }}
                className="flex-1"
                disabled={sendingEmail}
              />
              <Button
                onClick={handleEmail}
                disabled={!emailTo.trim() || sendingEmail || sentEmail}
                className={cn(
                  "shrink-0 gap-2 transition-all",
                  sentEmail
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
                )}
              >
                {sendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : sentEmail ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {sendingEmail ? "Enviando..." : sentEmail ? "Enviado!" : "Enviar"}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAddMember}
                disabled={!emailTo.trim() || !activeBoard || addingMember}
                className={cn("shrink-0 gap-2", addedMember && "border-green-500 text-green-600")}
                title="Adicionar diretamente ao quadro"
              >
                {addingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {addingMember ? "Adicionando..." : addedMember ? "Adicionado" : "Adicionar ao quadro"}
              </Button>
            </div>
            {emailError && (
              <p className="text-[11px] text-red-500">{emailError}</p>
            )}
          </div>

          {/* Copy as fallback CTA */}
          {(sentWpp || sentEmail) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3 text-center"
            >
              <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                {sentWpp && !sentEmail ? "WhatsApp aberto!" : sentEmail && !sentWpp ? "Cliente de email aberto!" : "Pronto!"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sentEmail ? "Clique em Enviar no seu cliente de email para disparar o convite." : "Envie o link pelo WhatsApp ao convidado."}
              </p>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
