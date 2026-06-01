"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { authApi } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function InviteAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [state, setState] = useState<{ loading: boolean; valid?: boolean; email?: string | null; error?: string; accepted?: boolean }>({ loading: true });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/invites/${token}`, { credentials: 'include' });
        const data = await res.json();
        if (!data.valid) {
          setState({ loading: false, valid: false, error: 'Convite inválido ou expirado.' });
        } else {
          setState({ loading: false, valid: true, email: data.email || null });
        }
      } catch (e: any) {
        setState({ loading: false, valid: false, error: e.message || 'Erro ao validar convite' });
      }
    })();
  }, [token]);

  const accept = async () => {
    try {
      const res = await fetch(`${API}/invites/${token}/accept`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Falha ao aceitar convite');
      setState((s) => ({ ...s, accepted: true }));
      router.push('/boards');
    } catch (e: any) {
      setState((s) => ({ ...s, error: e.message || 'Erro ao aceitar convite' }));
    }
  };

  return (
    <PageLayout title="Convite" subtitle="Acesso ao quadro">
      <div className="p-6 max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Convite para colaborar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.loading && <p>Validando convite...</p>}
            {!state.loading && state.valid && (
              <>
                {state.email && <p className="text-sm text-muted-foreground">Convite direcionado para: <strong>{state.email}</strong></p>}
                <Button onClick={accept} className="gap-2">Aceitar convite</Button>
              </>
            )}
            {!state.loading && state.valid === false && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-red-600">Convite inválido</p>
                  <p className="text-muted-foreground">{state.error}</p>
                </div>
              </div>
            )}
            {state.accepted && (
              <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-600">Convite aceito!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
