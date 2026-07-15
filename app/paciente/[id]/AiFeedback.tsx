'use client';

import { useState } from 'react';
import { saveAiFeedback } from './actions';

export default function AiFeedback({
  patientId,
  doencaId,
  aiModel,
  aiResponse,
}: {
  patientId: string;
  doencaId: string;
  aiModel: string;
  aiResponse: string;
}) {
  const [rating, setRating] = useState(0);
  const [disagreement, setDisagreement] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const precisaTexto = rating > 0 && rating <= 3;

  async function salvar() {
    setErr('');
    if (!rating) { setErr('Dê uma nota de 1 a 5.'); return; }
    if (precisaTexto && !disagreement.trim()) { setErr('Descreva o que não concordou com a IA.'); return; }
    setBusy(true);
    const r = await saveAiFeedback({ patientId, doencaId, aiModel, aiResponse, rating, disagreement });
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    setSaved(true);
  }

  if (saved) {
    return <div style={{ marginTop: 12, fontSize: 12.5, color: '#2f7d32', fontWeight: 600 }}>Avaliação registrada. Obrigado — isso ajuda a melhorar a IA.</div>;
  }

  return (
    <div style={{ marginTop: 14, borderTop: '1px dashed var(--line)', paddingTop: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Avalie esta sugestão da IA (obrigatório para registrar):</div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)}
            style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--line)', cursor: 'pointer', fontWeight: 700,
              background: rating === n ? 'var(--gold)' : '#fff', color: rating === n ? '#fff' : 'var(--ink)' }}>{n}</button>
        ))}
        <span style={{ alignSelf: 'center', fontSize: 11.5, color: 'var(--muted)' }}>1 = ruim · 5 = ótimo</span>
      </div>
      {precisaTexto && (
        <div className="field">
          <label>O que você não concordou com a IA? (obrigatório)</label>
          <textarea value={disagreement} onChange={(e) => setDisagreement(e.target.value)} style={{ minHeight: 60 }} placeholder="Descreva a discordância para ajustarmos a base e os prompts." />
        </div>
      )}
      {err && <div className="auth-err" style={{ marginTop: 8 }}>{err}</div>}
      <button className="btn-ghost" onClick={salvar} disabled={busy} style={{ marginTop: 6, maxWidth: 200 }}>{busy ? 'Salvando…' : 'Registrar avaliação'}</button>
    </div>
  );
}
