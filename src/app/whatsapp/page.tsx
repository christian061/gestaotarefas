"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MessageSquare, CheckCircle2, Settings, Bell, UserCheck, Calendar,
  Zap, Loader2, LogOut, QrCode, Save, Eye, EyeOff, RefreshCw,
  AlertTriangle, Wifi, WifiOff, Key, Globe, Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWhatsAppStore } from "@/stores/whatsapp-store";

const NOTIFICATION_SETTINGS = [
  { id: "task_created",    label: "Nova tarefa atribuída",  description: "Quando uma tarefa é atribuída a você",           icon: Bell,        },
  { id: "task_completed",  label: "Tarefa concluída",       description: "Quando uma tarefa é marcada como concluída",     icon: CheckCircle2 },
  { id: "assignee_changed",label: "Responsável alterado",   description: "Quando o responsável de uma tarefa muda",        icon: UserCheck    },
  { id: "due_date",        label: "Prazo se aproximando",   description: "24h antes do prazo da tarefa",                   icon: Calendar     },
  { id: "overdue",         label: "Tarefa em atraso",       description: "Quando uma tarefa passa do prazo",               icon: Zap          },
];

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type QrStep = "idle" | "loading" | "show" | "polling" | "connected" | "error";
type CodeStep = "idle" | "sending" | "verify" | "connecting" | "connected";

export default function WhatsAppPage() {
  const { config, saveConfig, isConnected, connectedPhone, setConnected, disconnect, notifSettings, setNotifSetting } = useWhatsAppStore();

  /* ── API config form ── */
  const [apiUrl, setApiUrl]           = useState(config.apiUrl);
  const [apiKey, setApiKey]           = useState(config.apiKey);
  const [instanceName, setInstanceName] = useState(config.instanceName);
  const [showKey, setShowKey]         = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const hasConfig = !!(config.apiUrl && config.apiKey && config.instanceName);

  const handleSaveConfig = () => {
    saveConfig({ apiUrl: apiUrl.trim(), apiKey: apiKey.trim(), instanceName: instanceName.trim() });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2500);
  };

  /* ── QR Code connection ── */
  const [qrStep, setQrStep]   = useState<QrStep>("idle");
  const [qrBase64, setQrBase64] = useState("");
  const [qrError, setQrError] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };

  useEffect(() => () => stopPolling(), []);

  const fetchQr = async () => {
    setQrStep("loading");
    setQrError("");
    try {
      /* 1. Create/connect instance — Evolution API */
      const base = config.apiUrl.replace(/\/$/, "");
      const headers: Record<string, string> = { "Content-Type": "application/json", apikey: config.apiKey };

      /* Try to connect and get QR */
      const res = await fetch(`${base}/instance/connect/${config.instanceName}`, { headers });
      const data = await res.json();

      const qr = data.base64 || data.qrcode?.base64 || data.qr;
      if (qr) {
        setQrBase64(qr);
        setQrStep("show");
        startPolling();
      } else {
        throw new Error(data.message || "QR Code não retornado pela API.");
      }
    } catch (err: any) {
      setQrError(err.message || "Erro ao conectar à API Evolution. Verifique as configurações.");
      setQrStep("error");
    }
  };

  const startPolling = () => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const base = config.apiUrl.replace(/\/$/, "");
        const res = await fetch(`${base}/instance/connectionState/${config.instanceName}`, {
          headers: { apikey: config.apiKey },
        });
        const data = await res.json();
        const state = data.instance?.state || data.state;
        if (state === "open" || state === "connected") {
          stopPolling();
          const phone = data.instance?.profileName || data.instance?.wuid || config.instanceName;
          setConnected(phone);
          setQrStep("connected");
        } else if (state === "close" || state === "closed") {
          /* re-fetch QR if expired */
          stopPolling();
          setQrStep("idle");
        }
      } catch { /* ignore polling errors */ }
    }, 3000);
  };

  const handleQrDisconnect = async () => {
    stopPolling();
    try {
      const base = config.apiUrl.replace(/\/$/, "");
      await fetch(`${base}/instance/logout/${config.instanceName}`, {
        method: "DELETE",
        headers: { apikey: config.apiKey },
      });
    } catch { /* ignore */ }
    disconnect();
    setQrStep("idle");
    setQrBase64("");
  };

  /* ── Code-based connection (original flow) ── */
  const [codeStep, setCodeStep] = useState<CodeStep>("idle");
  const [phone, setPhone]       = useState("");
  const [code, setCode]         = useState("");
  const [codeError, setCodeError] = useState("");
  const [isDemo, setIsDemo]     = useState(false);

  const handleConnect = async () => {
    if (!phone.trim()) return;
    setCodeStep("sending");
    try {
      const res = await fetch(`${BACKEND}/whatsapp/send-code`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setIsDemo(!!data.demo);
    } catch { setIsDemo(true); }
    setCodeStep("verify");
  };

  const handleVerify = async () => {
    if (code.trim().length < 4) { setCodeError("Código inválido."); return; }
    setCodeError("");
    setCodeStep("connecting");
    try {
      const res = await fetch(`${BACKEND}/whatsapp/verify-code`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      if (!res.ok) {
        const err = await res.json();
        setCodeStep("verify");
        setCodeError(err.message || "Código inválido.");
        return;
      }
    } catch { /* demo fallback */ }
    setConnected(phone);
    setCodeStep("connected");
  };

  const handleCodeDisconnect = () => {
    setCodeStep("idle");
    setPhone(""); setCode(""); setIsDemo(false);
    disconnect();
  };

  return (
    <PageLayout title="WhatsApp" subtitle="Integração e notificações">
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* ── Status Card ── */}
        <Card className={cn("border-2 transition-colors", isConnected ? "border-green-500/40" : "border-border/50")}>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-xl transition-colors", isConnected ? "bg-green-500/10" : "bg-muted")}>
                <MessageSquare className={cn("h-8 w-8 transition-colors", isConnected ? "text-green-500" : "text-muted-foreground")} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-2">
                  WhatsApp Business
                  <Badge className={cn("text-xs", isConnected ? "bg-green-500 text-white" : "bg-muted text-muted-foreground")}>
                    {isConnected ? <><Wifi className="h-3 w-3 mr-1 inline" />Conectado</> : <><WifiOff className="h-3 w-3 mr-1 inline" />Desconectado</>}
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isConnected ? `Ativo para: ${connectedPhone}` : "Configure a API Evolution e conecte seu WhatsApp"}
                </p>
              </div>
              {isConnected && (
                <Button variant="outline" size="sm" className="gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10"
                  onClick={() => { handleQrDisconnect(); handleCodeDisconnect(); }}>
                  <LogOut className="h-4 w-4" /> Desconectar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── API Config ── */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-violet-500" />
              Configurar API Evolution
              {hasConfig && <Badge variant="outline" className="ml-auto text-green-600 border-green-500/30 text-xs">Configurada</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> URL da API</Label>
                <Input
                  placeholder="https://evo.seudominio.com"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Key className="h-3.5 w-3.5" /> API Key (Global)</Label>
                <div className="relative">
                  <Input
                    type={showKey ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pr-9"
                  />
                  <button
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Nome da Instância</Label>
                <Input
                  placeholder="taskflow"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Encontre esses dados no painel da sua API Evolution.
              </p>
              <Button
                onClick={handleSaveConfig}
                disabled={!apiUrl.trim() || !apiKey.trim() || !instanceName.trim()}
                size="sm"
                className={cn("gap-2 transition-all", configSaved ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white")}
              >
                {configSaved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {configSaved ? "Salvo!" : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Connection Methods ── */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              Conectar WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="qrcode">
              <TabsList className="grid grid-cols-2 mb-5">
                <TabsTrigger value="qrcode" className="gap-2">
                  <QrCode className="h-4 w-4" /> Via QR Code
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Smartphone className="h-4 w-4" /> Via Código
                </TabsTrigger>
              </TabsList>

              {/* QR Code Tab */}
              <TabsContent value="qrcode" className="space-y-4">
                {!hasConfig && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-600 dark:text-amber-400">Configure a API Evolution acima antes de gerar o QR Code.</p>
                  </div>
                )}

                {qrStep === "idle" && (
                  <div className="text-center py-4 space-y-4">
                    <div className="h-40 w-40 mx-auto rounded-2xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Escaneie para conectar</p>
                      <p className="text-xs text-muted-foreground mt-1">Clique em gerar para obter o QR Code da sua instância</p>
                    </div>
                    <Button
                      disabled={!hasConfig || isConnected}
                      onClick={fetchQr}
                      className="bg-[#25D366] hover:bg-[#20b858] text-white gap-2"
                    >
                      <QrCode className="h-4 w-4" /> Gerar QR Code
                    </Button>
                  </div>
                )}

                {qrStep === "loading" && (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-green-500" />
                    <p className="text-sm font-medium">Conectando à API Evolution...</p>
                    <p className="text-xs text-muted-foreground">Gerando QR Code da instância <strong>{config.instanceName}</strong></p>
                  </div>
                )}

                {(qrStep === "show" || qrStep === "polling") && qrBase64 && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative p-3 bg-white rounded-2xl shadow-xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrBase64.startsWith("data:") ? qrBase64 : `data:image/png;base64,${qrBase64}`}
                          alt="QR Code WhatsApp"
                          className="h-52 w-52 rounded-lg"
                        />
                        <div className="absolute inset-0 rounded-2xl ring-2 ring-[#25D366]/40 pointer-events-none" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1.5 justify-center">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-green-500" />
                          Aguardando escaneamento...
                        </p>
                        <p className="text-xs text-muted-foreground">Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={fetchQr} className="gap-2">
                        <RefreshCw className="h-3.5 w-3.5" /> Atualizar QR
                      </Button>
                    </div>
                  </motion.div>
                )}

                {qrStep === "connected" && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-9 w-9 text-green-500" />
                    </div>
                    <p className="font-semibold text-green-600 dark:text-green-400">WhatsApp conectado via QR Code!</p>
                    <p className="text-sm text-muted-foreground">Instância: <strong>{connectedPhone}</strong></p>
                  </motion.div>
                )}

                {qrStep === "error" && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Erro ao gerar QR Code</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{qrError}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchQr} className="gap-2">
                      <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Code Tab */}
              <TabsContent value="code" className="space-y-4">
                {codeStep === "idle" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Número do WhatsApp</Label>
                      <div className="flex gap-2">
                        <Input placeholder="+55 11 99999-9999" value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleConnect()} />
                        <Button disabled={!phone.trim()} onClick={handleConnect}
                          className="bg-[#25D366] hover:bg-[#20b858] text-white shrink-0">
                          Conectar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Formato internacional. Você receberá um código de verificação.</p>
                    </div>
                  </div>
                )}

                {codeStep === "sending" && (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                    <p className="text-sm">Enviando código para {phone}...</p>
                  </div>
                )}

                {codeStep === "verify" && (
                  <div className="space-y-4">
                    {isDemo && (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">⚠️ Modo Demo — qualquer código com 4+ dígitos funciona</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Código de verificação</Label>
                      <div className="flex gap-2">
                        <Input placeholder="123456" value={code}
                          onChange={(e) => { setCode(e.target.value); setCodeError(""); }}
                          onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                          maxLength={8} className="text-center text-lg tracking-widest font-mono" autoFocus />
                        <Button disabled={!code.trim()} onClick={handleVerify}
                          className="bg-[#25D366] hover:bg-[#20b858] text-white shrink-0">
                          Verificar
                        </Button>
                      </div>
                      {codeError && <p className="text-xs text-red-500">{codeError}</p>}
                    </div>
                    <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setCodeStep("idle")}>
                      ← Usar outro número
                    </Button>
                  </div>
                )}

                {codeStep === "connecting" && (
                  <div className="flex flex-col items-center gap-3 py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                    <p className="text-sm">Estabelecendo conexão...</p>
                  </div>
                )}

                {codeStep === "connected" && (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-9 w-9 text-green-500" />
                    </div>
                    <p className="font-semibold text-green-600 dark:text-green-400">WhatsApp conectado!</p>
                    <p className="text-sm text-muted-foreground">Ativo para <strong>{connectedPhone}</strong></p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* ── Notification Settings ── */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-violet-500" /> Tipos de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {NOTIFICATION_SETTINGS.map((s, i) => (
              <div key={s.id}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-start justify-between gap-4 py-1">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg bg-violet-500/10 mt-0.5">
                      <s.icon className="h-4 w-4 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifSettings[s.id] ?? false}
                    onCheckedChange={(v) => setNotifSetting(s.id, v)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
