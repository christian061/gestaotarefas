"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Loader2, User, CheckCircle2, Kanban, BarChart3, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/auth-store";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const FEATURES = [
  { icon: Kanban, text: "Quadros Kanban com drag & drop" },
  { icon: BarChart3,   text: "Dashboard com métricas em tempo real" },
  { icon: Bell,        text: "Notificações e prazos automáticos" },
  { icon: CheckCircle2,text: "Gestão completa de tarefas e equipes" },
];

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const isBackendLocal = API_URL.includes("localhost") || API_URL.includes("127.0.0.1");

export default function LoginPage() {
  const router = useRouter();
  const { login, register, loginWithGoogle, isLoading } = useAuthStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "register" && name.trim().length < 2) {
      setError("Nome precisa ter ao menos 2 caracteres.");
      return;
    }
    if (password.length < 6) {
      setError("Senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (mode === "login") {
      await login(email, password);
    } else {
      await register(name, email, password);
    }
    router.push("/");
  };

  const handleGoogle = async () => {
    if (isBackendLocal) {
      setError("Login com Google requer o backend configurado em produção. Use email e senha.");
      return;
    }
    await loginWithGoogle();
    // OAuth faz seu próprio redirect — não chamar router.push aqui
  };

  const switchMode = (next: "login" | "register") => {
    setError("");
    setMode(next);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-12 relative overflow-hidden">
        {/* Background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">TaskFlow</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Organize seu trabalho,<br />
              <span className="text-white/70">do início ao fim.</span>
            </h2>
            <p className="text-white/60 mt-4 text-lg leading-relaxed">
              Gerencie tarefas, equipes e projetos com clareza e agilidade.
            </p>
          </div>
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/80">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-white/40 text-xs">© 2026 TaskFlow · Todos os direitos reservados</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Kanban className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">TaskFlow</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "login" ? "Entrar na conta" : "Criar sua conta"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {mode === "login"
                  ? "Bem-vindo de volta! Acesse seu painel."
                  : "Comece gratuitamente, sem cartão de crédito."}
              </p>
            </div>

            {/* Google */}
            <Button
              variant="outline"
              className="w-full gap-3 h-11 font-medium hover:bg-accent disabled:opacity-50"
              onClick={handleGoogle}
              disabled={isLoading || isBackendLocal}
              title={isBackendLocal ? "Requer backend configurado em produção" : undefined}
            >
              <GoogleIcon />
              Continuar com Google
              {isBackendLocal && <span className="text-xs text-muted-foreground ml-auto">(indisponível)</span>}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><Separator /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground">ou com email</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl bg-muted p-1 mb-6">
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    mode === m
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "login" ? "Entrar" : "Criar conta"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {mode === "register" && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 pb-0.5">
                      <Label htmlFor="name">Nome completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Seu nome"
                          className="pl-9 h-11"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-9 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => router.push("/auth/forgot-password")}
                      className="text-xs text-violet-500 hover:text-violet-600"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "Mínimo 6 caracteres" : "••••••••"}
                    className="pl-9 pr-10 h-11"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20 font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "login" ? (
                  "Entrar"
                ) : (
                  "Criar conta grátis"
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6">
              {mode === "login" ? "Não tem conta? " : "Já tem uma conta? "}
              <button
                onClick={() => switchMode(mode === "login" ? "register" : "login")}
                className="text-violet-500 hover:text-violet-600 font-medium"
              >
                {mode === "login" ? "Criar agora" : "Entrar"}
              </button>
            </p>

            {mode === "register" && (
              <p className="text-center text-[11px] text-muted-foreground/60 mt-3 leading-relaxed">
                Ao criar conta você concorda com os{" "}
                <span className="underline cursor-pointer">Termos de Uso</span> e{" "}
                <span className="underline cursor-pointer">Política de Privacidade</span>.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
