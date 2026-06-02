"use client";

import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ProfilePage() {
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/auth/profile`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setPhone(data?.user?.phone || "");
        }
      } catch {}
    })();
  }, []);

  const normalize = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    return digits.length <= 11 ? `55${digits}` : digits;
  };

  const save = async () => {
    setSaving(true); setSaved(false); setError(null);
    try {
      const normalized = normalize(phone);
      const res = await fetch(`${API}/users/me`, {
        method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized })
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      setSaved(true);
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <PageLayout title="Perfil" subtitle="Notificações por WhatsApp">
      <div className="max-w-xl p-6">
        <div className="space-y-2">
          <Label>Telefone (WhatsApp)</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="ex: 11999999999 ou +5511999999999" />
          <div className="flex gap-2 pt-2">
            <Button onClick={save} disabled={saving}>{saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}</Button>
            {error && <span className="text-sm text-red-500">{error}</span>}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
