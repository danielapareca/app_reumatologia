'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';

export interface ClinicoLido { hda: string; antecedentes: string; observacoes: string }

// Lê um print/foto da evolução do sistema da clínica e devolve HDA / antecedentes / observações.
// Apoio — o médico revisa e edita antes de salvar. Não sobrescreve: o pai decide como aplicar.
export default function PrintClinicoReader({ onLido }: { onLido: (d: ClinicoLido) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  async function ler(file: File) {
    setErr(''); setOk('');
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) { setErr('Envie um print ou foto (JPG, PNG ou WEBP).'); return; }
    if (file.size > 6 * 1024 * 1024) { setErr('Imagem muito grande (máx 6 MB).'); return; }
    setBusy(true);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(',')[1] || '');
        r.onerror = () => rej(new Error('Falha ao ler o arquivo.'));
        r.readAsDataURL(file);
      });
      const resp = await fetch('/api/extract-clinico', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: b64, mediaType: file.type }),
      });
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(j.error || 'Falha ao ler a imagem.');
      const d = (j.dados || {}) as Partial<ClinicoLido>;
      const clean: ClinicoLido = { hda: d.hda || '', antecedentes: d.antecedentes || '', observacoes: d.observacoes || '' };
      const achou = [clean.hda, clean.antecedentes, clean.observacoes].filter((x) => x.trim()).length;
      if (!achou) { setErr('Não consegui ler texto clínico nessa imagem. Confira o print ou digite/dite.'); return; }
      onLido(clean);
      setOk('Texto lido e inserido nos campos. Revise e edite antes de salvar.');
      window.setTimeout(() => setOk(''), 4000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha ao ler a imagem.');
    } finally { setBusy(false); }
  }

  return (
    <div className="print-clin no-print">
      <div className="pc-btns">
        <label className={'btn-ghost' + (busy ? ' disabled' : '')} style={{ cursor: busy ? 'default' : 'pointer', height: 34, padding: '0 12px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="sparkles" size={14} /> Ler print da evolução
          <input type="file" accept="image/*" disabled={busy} style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) ler(f); e.target.value = ''; }} />
        </label>
        <label className={'btn-ghost' + (busy ? ' disabled' : '')} style={{ cursor: busy ? 'default' : 'pointer', height: 34, padding: '0 12px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Tirar foto
          <input type="file" accept="image/*" capture="environment" disabled={busy} style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) ler(f); e.target.value = ''; }} />
        </label>
        {busy && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Lendo com IA…</span>}
      </div>
      {err && <div className="auth-err" style={{ marginTop: 8 }}>{err}</div>}
      {ok && <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginTop: 8 }}>{ok}</div>}
    </div>
  );
}
