'use client';

import { useMemo, useState } from 'react';
import Icon from '@/components/Icon';
import { createClient } from '@/lib/supabase/client';

interface LaudoImg { modalidade: string; regiao: string; data: string; achados: string; conclusao: string; alerta: string }

// Lê o LAUDO ESCRITO de um exame de imagem (RX/RM/TC/US) — não interpreta a imagem.
// Extrai achados + conclusão, o médico revisa e insere nas observações. Guarda o arquivo.
export default function ImagingReportReader({ patientId, today, onInserir }: { patientId: string; today: string; onInserir: (texto: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState<LaudoImg | null>(null);
  const supabase = useMemo(() => { try { return createClient(); } catch { return null; } }, []);

  async function guardar(file: File) {
    if (!supabase) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const safe = (file.name || 'laudo-imagem').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 60);
      const path = `${user.id}/${patientId}/${Date.now()}-${safe}`;
      const up = await supabase.storage.from('exames').upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
      if (!up.error) await supabase.from('exam_files').insert({ patient_id: patientId, doctor_id: user.id, path, filename: file.name, data: today });
    } catch { /* ignora */ }
  }

  async function ler(file: File) {
    setErr(''); setRes(null);
    const isPdf = file.type === 'application/pdf';
    const isImg = /^image\/(jpeg|png|webp|gif)$/.test(file.type);
    if (!isPdf && !isImg) { setErr('Envie o laudo em PDF ou foto (JPG, PNG ou WEBP).'); return; }
    if (file.size > 6 * 1024 * 1024) { setErr('Arquivo muito grande (máx 6 MB).'); return; }
    setBusy(true);
    guardar(file);
    try {
      const b64 = await new Promise<string>((r, j) => { const fr = new FileReader(); fr.onload = () => r(String(fr.result).split(',')[1] || ''); fr.onerror = () => j(new Error('Falha ao ler o arquivo.')); fr.readAsDataURL(file); });
      const payload = isPdf ? { pdfBase64: b64 } : { imageBase64: b64, mediaType: file.type };
      const resp = await fetch('/api/extract-imagem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(j.error || 'Falha ao ler o laudo.');
      const d = (j.dados || {}) as LaudoImg;
      if (!d.achados && !d.conclusao) { setErr('Não encontrei um laudo escrito legível nessa imagem. Envie o laudo (texto), não a radiografia.'); return; }
      setRes(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Falha ao ler o laudo.');
    } finally { setBusy(false); }
  }

  function inserir() {
    if (!res) return;
    const partes: string[] = [];
    const cab = [res.modalidade, res.regiao].filter(Boolean).join(' — ') + (res.data ? ` (${res.data.split('-').reverse().join('/')})` : '');
    partes.push(`Imagem — ${cab || 'exame de imagem'}`);
    if (res.achados) partes.push(`Achados: ${res.achados}`);
    if (res.conclusao) partes.push(`Conclusão: ${res.conclusao}`);
    onInserir(partes.join('\n'));
    setRes(null);
  }

  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="clipboard" size={16} /> Laudo de imagem (RX, RM, TC, US)</h3>
      <p className="sub">Envie o <b>laudo escrito</b> do exame de imagem (PDF ou foto). A IA extrai os <b>achados e a conclusão</b> para você revisar e inserir nas observações. Não interpreta a imagem — apenas lê o laudo do radiologista.</p>

      <div className="print-clin no-print">
        <div className="pc-btns">
          <label className={'btn-ghost' + (busy ? ' disabled' : '')} style={{ cursor: busy ? 'default' : 'pointer', height: 34, padding: '0 12px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            ✨ Ler laudo (PDF/foto)
            <input type="file" accept="application/pdf,image/*" disabled={busy} style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) ler(f); e.target.value = ''; }} />
          </label>
          <label className={'btn-ghost' + (busy ? ' disabled' : '')} style={{ cursor: busy ? 'default' : 'pointer', height: 34, padding: '0 12px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Tirar foto
            <input type="file" accept="image/*" capture="environment" disabled={busy} style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) ler(f); e.target.value = ''; }} />
          </label>
          {busy && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Lendo o laudo com IA…</span>}
        </div>
        {err && <div className="auth-err" style={{ marginTop: 8 }}>{err}</div>}
      </div>

      {res && (
        <div className="scorebox" style={{ marginTop: 12 }}>
          {res.alerta && (
            <div className="an-flag" style={{ marginBottom: 8 }}>⚠ {res.alerta}</div>
          )}
          <div className="it">{[res.modalidade, res.regiao].filter(Boolean).join(' — ') || 'Laudo de imagem'}{res.data ? ` · ${res.data.split('-').reverse().join('/')}` : ''}</div>
          {res.achados && <p style={{ fontSize: 13, margin: '8px 0 0', lineHeight: 1.5 }}><b>Achados:</b> {res.achados}</p>}
          {res.conclusao && <p style={{ fontSize: 13, margin: '8px 0 0', lineHeight: 1.5 }}><b>Conclusão:</b> {res.conclusao}</p>}
          <button className="btn-primary" onClick={inserir} style={{ marginTop: 12, maxWidth: 280 }}>Inserir nas observações</button>
          <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 8 }}>Revise o texto — é transcrição do laudo, apoio ao médico. O arquivo original fica guardado nos exames.</div>
        </div>
      )}
    </div>
  );
}
