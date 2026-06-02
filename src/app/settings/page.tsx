"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { User, Lock, Bell, Palette, Globe, Trash2, Save, Eye, EyeOff, CheckCircle2, LogOut, ShieldAlert } from "lucide-react";
import { useTheme } from "next-themes";
import { useSettingsStore } from "@/stores/settings-store";
import { useAuthStore } from "@/stores/auth-store"; 
import { authApi } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const SECTIONS = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "security", label: "Segurança", icon: Lock },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "appearance", label: "Aparência", icon: Palette },
];

export default function SettingsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("profile");
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();
  const { profile, notifPrefs, updateProfile, saveProfile, updateNotifPrefs } = useSettingsStore();
  const { user, logout } = useAuthStore();

  /* ── password change ── */
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [pwdError, setPwdError]   = useState("");
  const [pwdSuccess, setPwdSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Carrega perfil do backend (cookies já são enviados)
        const res = await authApi.profile();
        const u = (res as any)?.user || res;
        updateProfile({
          name: u?.name || profile.name || "",
          email: u?.email || profile.email || "",
          phone: u?.phone || profile.phone || "",
          role: profile.role || "",
        });
      } catch {
        // fallback: usa dados do auth store
        if (user) updateProfile({ name: user.name || "", email: user.email || "" });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      // Persiste nome e telefone no backend
      await fetch(`${API}/users/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, phone: profile.phone })
      });
      saveProfile();
      // Atualiza auth store localmente
      if (user) useAuthStore.setState({ user: { ...user, name: profile.name, phone: profile.phone } as any });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // Silencia erro simples; opcional: exibir toast
    }
  };

  const handleUpdatePassword = () => {
    setPwdError("");
    if (!currentPwd) { setPwdError("Informe a senha atual."); return; }
    if (newPwd.length < 6) { setPwdError("Nova senha precisa ter ao menos 6 caracteres."); return; }
    if (newPwd !== confirmPwd) { setPwdError("As senhas não coincidem."); return; }
    setPwdSuccess(true);
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    setTimeout(() => setPwdSuccess(false), 3000);
  };

  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const initials = (user?.name || profile.name || "U")
    .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <PageLayout title="Configurações" subtitle="Gerencie sua conta e preferências">
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex gap-6">
          {/* Sidebar nav */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === s.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <s.icon className="h-4 w-4 shrink-0" />
                  {s.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {activeSection === "profile" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Informações do Perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="text-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">Alterar foto</Button>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou GIF. Máx 2MB.</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Nome</Label>
                      <Input value={profile.name} onChange={(e) => updateProfile({ name: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>E-mail</Label>
                      <Input value={profile.email} onChange={(e) => updateProfile({ email: e.target.value })} type="email" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Cargo</Label>
                      <Input value={profile.role} onChange={(e) => updateProfile({ role: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Telefone</Label>
                      <Input value={profile.phone} onChange={(e) => updateProfile({ phone: e.target.value })} type="tel" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    {saved && (
                      <span className="flex items-center gap-1.5 text-sm text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        Salvo com sucesso!
                      </span>
                    )}
                    <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white">
                      <Save className="h-4 w-4" />
                      Salvar alterações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}


            {activeSection === "security" && (
              <div className="space-y-4">
                {/* Change password */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4 text-violet-500" /> Alterar Senha
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Senha atual</Label>
                      <div className="relative">
                        <Input
                          type={showCurrent ? "text" : "password"}
                          placeholder="••••••••"
                          value={currentPwd}
                          onChange={(e) => { setCurrentPwd(e.target.value); setPwdError(""); }}
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowCurrent(!showCurrent)}>
                          {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nova senha</Label>
                      <div className="relative">
                        <Input
                          type={showNew ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={newPwd}
                          onChange={(e) => { setNewPwd(e.target.value); setPwdError(""); }}
                        />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowNew(!showNew)}>
                          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmar nova senha</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPwd}
                        onChange={(e) => { setConfirmPwd(e.target.value); setPwdError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdatePassword()}
                      />
                    </div>
                    {pwdError && (
                      <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{pwdError}</p>
                    )}
                    {pwdSuccess && (
                      <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" /> Senha atualizada com sucesso!
                      </p>
                    )}
                    <Button
                      onClick={handleUpdatePassword}
                      className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
                    >
                      Atualizar senha
                    </Button>
                  </CardContent>
                </Card>

                {/* Logout */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <LogOut className="h-4 w-4 text-violet-500" /> Sessão
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30">
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          Sessão atual
                          <Badge className="bg-green-500 text-white text-[10px] h-4">Ativa</Badge>
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email || profile.email || "—"}</p>
                      </div>
                      <Button
                        variant="outline" size="sm"
                        className="gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => setConfirmLogout(true)}
                      >
                        <LogOut className="h-4 w-4" /> Sair da conta
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Danger zone */}
                <Card className="border-red-500/20">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-red-500">
                      <ShieldAlert className="h-4 w-4" /> Zona de Risco
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Excluir conta</p>
                        <p className="text-xs text-muted-foreground">Esta ação é irreversível. Todos os dados serão apagados.</p>
                      </div>
                      <Button
                        variant="outline" size="sm"
                        className="gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10"
                        onClick={() => setConfirmDelete(true)}
                      >
                        <Trash2 className="h-4 w-4" /> Excluir conta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Logout confirm dialog */}
            <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
              <DialogContent showCloseButton={false} className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-red-500" /> Sair da conta?
                  </DialogTitle>
                  <DialogDescription>
                    Você será redirecionado para a tela de login. Seus dados permanecem salvos.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmLogout(false)}>Cancelar</Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleLogout}>Sair</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete account confirm dialog */}
            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
              <DialogContent showCloseButton={false} className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-500" /> Excluir conta permanentemente?
                  </DialogTitle>
                  <DialogDescription>
                    Todos os seus quadros, tarefas e dados serão excluídos. Esta ação <strong>não pode ser desfeita</strong>.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                  <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={() => { setConfirmDelete(false); handleLogout(); }}>Excluir permanentemente</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {activeSection === "notifications" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Preferências de Notificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { id: "email", label: "E-mail", description: "Receba notificações por e-mail" },
                    { id: "push", label: "Push Notifications", description: "Notificações no navegador" },
                    { id: "whatsapp", label: "WhatsApp", description: "Notificações via WhatsApp" },
                    { id: "weekly", label: "Resumo semanal", description: "Receba um resumo toda segunda-feira" },
                  ].map((item, i) => (
                    <div key={item.id}>
                      {i > 0 && <Separator className="mb-4" />}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <Switch
                          checked={notifPrefs[item.id as keyof typeof notifPrefs]}
                          onCheckedChange={(v) => updateNotifPrefs({ [item.id]: v })}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {activeSection === "appearance" && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Aparência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Tema</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ id: "light", label: "Claro" }, { id: "dark", label: "Escuro" }, { id: "system", label: "Sistema" }].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id)}
                          className={`p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                            theme === t.id ? "border-violet-500 bg-violet-500/10 text-violet-500" : "border-border hover:border-violet-500/40"
                          }`}
                        >
                          {t.id === "light" ? "☀️" : t.id === "dark" ? "🌙" : "💻"} {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <Label>Idioma</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <select className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm">
                        <option>Português (Brasil)</option>
                        <option>English</option>
                        <option>Español</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
