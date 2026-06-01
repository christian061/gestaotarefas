"use client";

import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, ListChecks, BarChart3, Loader2, Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";

type ChatMessage = { role: "user" | "assistant"; content: string };

const FEATURE_CARDS = [
  { icon: Wand2, label: "Gerar Descrição", color: "text-violet-500", bg: "bg-violet-500/10", prompt: "Gere uma descrição para a tarefa: " },
  { icon: ListChecks, label: "Criar Subtarefas", color: "text-blue-500", bg: "bg-blue-500/10", prompt: "Liste subtarefas para: " },
  { icon: BarChart3, label: "Prever Atraso", color: "text-amber-500", bg: "bg-amber-500/10", prompt: "Avalie o risco de atraso para: " },
  { icon: Sparkles, label: "Resumir Board", color: "text-pink-500", bg: "bg-pink-500/10", prompt: "Resuma o status atual do projeto" },
];

const MOCK_RESPONSES: Record<string, string> = {
  default: "Sou o assistente de IA do TaskFlow. Posso ajudar a gerar descrições de tarefas, sugerir subtarefas, prever atrasos e muito mais. Como posso ajudar?",
  description: "📝 **Descrição gerada:**\n\nImplementar a funcionalidade seguindo os padrões de clean code e SOLID. Garantir cobertura de testes unitários acima de 80% e documentação atualizada no Confluence. Revisar com o tech lead antes do merge.",
  subtasks: "✅ **Subtarefas sugeridas:**\n\n1. Pesquisar e documentar requisitos\n2. Criar branch de desenvolvimento\n3. Implementar lógica principal\n4. Escrever testes unitários\n5. Realizar code review\n6. Atualizar documentação",
  delay: "⚠️ **Análise de risco:**\n\nRisco de atraso: **MÉDIO (65%)**\n\nMotivos identificados:\n- Dependências não resolvidas\n- Checklist com 30% de conclusão\n- 3 dias até o prazo\n\nSugestão: Priorizar as dependências críticas e alocar mais tempo diário para esta tarefa.",
  summary: "📊 **Resumo do Projeto:**\n\nO projeto está com **68% de conclusão** geral. Há 3 tarefas urgentes pendentes e 2 em atraso. O sprint atual está no ritmo esperado com um leve risco na entrega de quinta-feira. Recomendo revisar as tarefas da Ana Silva que acumulou mais tarefas recentemente.",
};

export default function AiPage() {
  const { columns } = useBoardStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: MOCK_RESPONSES.default },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const allTasks = columns.flatMap((c) => c.tasks);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1000));

    let response = MOCK_RESPONSES.default;
    const lower = text.toLowerCase();
    if (lower.includes("descrição") || lower.includes("gere") || lower.includes("description")) response = MOCK_RESPONSES.description;
    else if (lower.includes("subtarefa") || lower.includes("sublista")) response = MOCK_RESPONSES.subtasks;
    else if (lower.includes("atraso") || lower.includes("risco")) response = MOCK_RESPONSES.delay;
    else if (lower.includes("resumo") || lower.includes("status") || lower.includes("projeto")) response = MOCK_RESPONSES.summary;
    else response = `Entendido! Analisei seu board com **${allTasks.length} tarefas** e ${columns.length} colunas. Para obter resultados mais precisos, conecte sua chave da OpenAI nas configurações.`;

    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  return (
    <PageLayout title="IA Assistant" subtitle="Seu assistente inteligente de produtividade">
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Feature Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FEATURE_CARDS.map((f) => (
            <button
              key={f.label}
              onClick={() => send(f.prompt)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 hover:border-violet-500/40 hover:bg-muted/30 transition-all text-center group"
            >
              <div className={cn("p-2.5 rounded-lg", f.bg)}>
                <f.icon className={cn("h-5 w-5", f.color)} />
              </div>
              <span className="text-xs font-medium">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Chat */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Chat com IA
              <Badge variant="outline" className="ml-auto text-xs border-amber-500/30 text-amber-500">
                Demo Mode
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}>
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                    msg.role === "assistant" ? "bg-gradient-to-br from-violet-500 to-indigo-600" : "bg-muted"
                  )}>
                    {msg.role === "assistant" ? <Bot className="h-4 w-4 text-white" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={cn(
                    "rounded-xl px-4 py-3 max-w-[80%] text-sm",
                    msg.role === "assistant"
                      ? "bg-muted text-foreground"
                      : "bg-gradient-to-r from-violet-500 to-indigo-600 text-white"
                  )}>
                    {msg.content.split("\n").map((line, j) => (
                      <p key={j} className={j > 0 ? "mt-1" : ""}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Input
                placeholder="Pergunte algo sobre suas tarefas..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
                className="flex-1"
              />
              <Button
                size="icon"
                disabled={!input.trim() || loading}
                onClick={() => send(input)}
                className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
