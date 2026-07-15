'use client';

import { useState } from 'react';

type Tipo = 'resumo_paciente' | 'laudo' | 'atestado' | 'relatorio';

const BOTOES: { tipo: Tipo; label: string }[] = [
  { tipo: 'resumo_paciente', label: 'Resumo para o paciente' },
  { tipo: 'laudo', label: 'Laudo médico' },
  { tipo: 'atestado', label: 'Atestado' },
  { tipo: 'relatorio', label: 'Relatório de evolução' },
];

export default function AiDocs({
  buildContext,
  onFlash,
}: {
  buildContext: () => Record<string, string>;
  onFlash: (msg: string) => void;
}) {
  const [busy, setBusy] = useState<Tipo | ''>('');
  const [texto, setTexto] = useState('');
  const [err, setErr] = useState('');

  async function gerar(tipo: Tipo) {
    setBusy(tipo); setErr('');
    try {
      const res = await fetch('/api/ai-doc', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, ...buildContext() }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Falha ao gerar');
      setTexto(j.texto || '');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha ao gerar');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="card">
      <h3>Gerar documentos com IA</h3>
      <p className="sub">A IA redige um rascunho a partir da ficha; <b>revise e edite antes de usar</b>. Apoio, não decisão.</p>
      <div className="chips">
        {BOTOES.map((b) => (
          <button key={b.tipo} className="btn-ghost" onClick={() => gerar(b.tipo)} disabled={!!busy} style={{ padding: '8px 12px' }}>
            {busy === b.tipo ? 'Gerando…' : b.label}
          </button>
        ))}
      </div>
      {err && <div className="auth-err" style={{ marginTop: 12 }}>{err}</div>}
      {texto && (
        <div style={{ marginTop: 12 }}>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} style={{ width: '100%', minHeight: 180, padding: 12, border: '1px solid var(--line)', borderRadius: 8, fontFamily: 'inherit', fontSize: 13.5, lineHeight: 1.5, resize: 'vertical' }} />
          <button className="btn-ghost" style={{ marginTop: 8 }} onClick={() => navigator.clipboard.writeText(texto.trim()).then(() => onFlash('Copiado'))}>Copiar texto</button>
        </div>
      )}
    </div>
  );
}
