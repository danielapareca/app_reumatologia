'use client';

import { useState } from 'react';
import { classificarTscore, condutaTscore, classificarZscore } from '@/lib/clinical/scores';
import type { ExamValue } from '@/lib/types';
import { addExamValue } from './examActions';

const numOrNull = (s: string): number | null => {
  if (!s.trim()) return null;
  const n = parseFloat(s.replace(',', '.'));
  return isFinite(n) ? n : null;
};

// Leitor de densitometria óssea (DXA) — apoio à interpretação.
export default function DxaReader({ patientId, today, onSaved }: { patientId: string; today: string; onSaved: (v: ExamValue) => void }) {
  const [grupo, setGrupo] = useState<'t' | 'z'>('t'); // T-score vs Z-score
  const [t, setT] = useState('');
  const [z, setZ] = useState('');
  const [fx, setFx] = useState('');
  const [msg, setMsg] = useState('');
  const [lendo, setLendo] = useState(false);
  const [lerErr, setLerErr] = useState('');

  async function lerLaudo(file: File) {
    setLerErr(''); setMsg('');
    const isPdf = file.type === 'application/pdf';
    const isImg = /^image\/(jpeg|png|webp|gif)$/.test(file.type);
    if (!isPdf && !isImg) { setLerErr('Envie o laudo em PDF ou foto (JPG, PNG ou WEBP).'); return; }
    if (file.size > 6 * 1024 * 1024) { setLerErr('Arquivo muito grande (máx 6 MB).'); return; }
    setLendo(true);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(',')[1] || '');
        r.onerror = () => rej(new Error('Falha ao ler o arquivo.'));
        r.readAsDataURL(file);
      });
      const payload = isPdf ? { pdfBase64: b64 } : { imageBase64: b64, mediaType: file.type };
      const resp = await fetch('/api/extract-dxa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(j.error || 'Falha ao ler o laudo.');
      const d = j.dados || {};
      const fmt = (n: number) => String(n).replace('.', ',');
      if (typeof d.tscoreMenor === 'number') { setT(fmt(d.tscoreMenor)); setGrupo('t'); }
      if (typeof d.zscoreMenor === 'number') { setZ(fmt(d.zscoreMenor)); if (typeof d.tscoreMenor !== 'number') setGrupo('z'); }
      if (typeof d.tscoreMenor !== 'number' && typeof d.zscoreMenor !== 'number') {
        setLerErr('Não consegui ler o T-score no laudo. Confira a foto/PDF ou digite o valor.');
      } else {
        setMsg('Valores lidos do laudo — revise antes de salvar.');
      }
    } catch (e) {
      setLerErr(e instanceof Error ? e.message : 'Falha ao ler o laudo.');
    } finally { setLendo(false); }
  }

  const tv = numOrNull(t);
  const zv = numOrNull(z);
  const inp: React.CSSProperties = { width: 90, padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14 };

  async function salvar() {
    if (tv === null) { setMsg('Informe o menor T-score.'); return; }
    const r = await addExamValue({ patientId, marcador: 'T-score DXA (menor)', valor: tv, unidade: 'DP', data: today, tipo: 'escore' });
    if (r.error) { setMsg(r.error); return; }
    if (r.value) onSaved(r.value);
    setMsg('T-score salvo na evolução.');
    window.setTimeout(() => setMsg(''), 2500);
  }

  return (
    <div className="card">
      <h3>Leitor de densitometria (DXA)</h3>
      <p className="sub">Apoio à interpretação. Use o <b>menor T-score</b> entre os sítios válidos (L1–L4 com ≥ 2 vértebras, colo femoral, fêmur total, rádio 33%). Não usar triângulo de Ward nem trocânter isolado.</p>

      <div className="print-clin no-print" style={{ marginBottom: 12 }}>
        <div className="pc-btns">
          <label className={'btn-ghost' + (lendo ? ' disabled' : '')} style={{ cursor: lendo ? 'default' : 'pointer', height: 34, padding: '0 12px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            ✨ Ler laudo da DXA (foto/PDF)
            <input type="file" accept="application/pdf,image/*" disabled={lendo} style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) lerLaudo(f); e.target.value = ''; }} />
          </label>
          {lendo && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Lendo o laudo com IA…</span>}
        </div>
        {lerErr && <div className="auth-err" style={{ marginTop: 8 }}>{lerErr}</div>}
      </div>

      <div className="chips" style={{ marginBottom: 12 }}>
        <span className={'chip' + (grupo === 't' ? ' on' : '')} onClick={() => setGrupo('t')}>T-score (pós-menopausa / homem ≥ 50)</span>
        <span className={'chip' + (grupo === 'z' ? ' on' : '')} onClick={() => setGrupo('z')}>Z-score (pré-menopausa / homem &lt; 50 / criança)</span>
      </div>

      {grupo === 't' ? (
        <>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Menor T-score (DP)<br /><input value={t} onChange={(e) => setT(e.target.value)} placeholder="ex.: -2,7" inputMode="decimal" style={inp} /></label>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>FRAX principal (%) — do site oficial<br /><input value={fx} onChange={(e) => setFx(e.target.value)} placeholder="ex.: 12" inputMode="decimal" style={inp} /></label>
          </div>
          <div style={{ marginTop: 10 }}>
            <a className="btn-ghost" href="https://frax.shef.ac.uk/FRAX/tool.aspx?lang=pt&country=55" target="_blank" rel="noreferrer"
              style={{ height: 40, padding: '0 14px', fontSize: 13, textDecoration: 'none', display: 'inline-flex' }}>
              Abrir calculadora FRAX oficial (Brasil) ↗
            </a>
            <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 6 }}>Calcule no site oficial (selecione <b>Brasil / Português</b> se não abrir direto) e traga o percentual de risco em 10 anos para o campo acima. O FRAX é proprietário e não pode ser recriado dentro do app.</div>
          </div>
        </>
      ) : (
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Menor Z-score (DP)<br /><input value={z} onChange={(e) => setZ(e.target.value)} placeholder="ex.: -2,2" inputMode="decimal" style={{ ...inp, display: 'block' }} /></label>
      )}

      {grupo === 't' && tv !== null && (
        <div className="scorebox" style={{ marginTop: 14 }}>
          <div className="it">Classificação OMS</div>
          <div className="score" style={{ fontSize: 20 }}>{classificarTscore(tv)}</div>
          <div className="verdict" style={{ color: 'var(--muted)', fontWeight: 500 }}>{condutaTscore(tv)}</div>
          {fx.trim() && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>FRAX informado: {fx}% — comparar ao limiar de intervenção brasileiro.</div>}
          <button className="btn-primary" onClick={salvar} style={{ marginTop: 10, maxWidth: 220 }}>Salvar T-score na evolução</button>
          {msg && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>{msg}</div>}
        </div>
      )}
      {grupo === 'z' && zv !== null && (
        <div className="scorebox" style={{ marginTop: 14 }}>
          <div className="it">Leitura por Z-score</div>
          <div className="verdict" style={{ color: 'var(--ink)', fontWeight: 600 }}>{classificarZscore(zv)}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Nesses grupos não se usa a palavra “osteoporose” apenas pela DXA.</div>
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 12, lineHeight: 1.5 }}>
        Não comparar exames de aparelhos diferentes (só pelo valor absoluto em g/cm²). Variação real só se maior que a menor mudança significativa do serviço (LSC, ~0,03 g/cm² na coluna). OA avançada, escoliose e calcificação elevam falsamente a DMO da coluna — priorizar o fêmur. Apoio — não substitui o laudo do densitometrista.
      </div>
    </div>
  );
}
