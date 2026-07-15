'use client';

import { useMemo, useState } from 'react';
import LineChart from '@/components/LineChart';
import type { ExamValue } from '@/lib/types';
import { addExamValue, deleteExamValue } from './examActions';

const COMUNS: { m: string; u: string }[] = [
  { m: 'VHS', u: 'mm/h' },
  { m: 'PCR', u: 'mg/L' },
  { m: 'Ácido úrico', u: 'mg/dL' },
  { m: 'Creatinina', u: 'mg/dL' },
  { m: 'TFG', u: 'mL/min' },
  { m: 'Hemoglobina', u: 'g/dL' },
  { m: 'Plaquetas', u: '/mm³' },
  { m: 'Leucócitos', u: '/mm³' },
  { m: 'TGO', u: 'U/L' },
  { m: 'TGP', u: 'U/L' },
];

export default function ExamValuesPanel({
  patientId,
  values,
  onChanged,
  today,
}: {
  patientId: string;
  values: ExamValue[];
  onChanged: (values: ExamValue[]) => void;
  today: string;
}) {
  const [marcador, setMarcador] = useState('');
  const [valor, setValor] = useState('');
  const [unidade, setUnidade] = useState('');
  const [data, setData] = useState(today);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  // Análise de PDF com IA.
  interface Extraido { marcador: string; valor: string; unidade: string; data: string; incluir: boolean }
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfErr, setPdfErr] = useState('');
  const [extraidos, setExtraidos] = useState<Extraido[]>([]);
  const updEx = (i: number, patch: Partial<Extraido>) =>
    setExtraidos((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const inpStyle: React.CSSProperties = { padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 6, fontFamily: 'inherit', fontSize: 13 };

  async function analisarPdf(file: File) {
    setPdfErr('');
    setExtraidos([]);
    if (file.type !== 'application/pdf') { setPdfErr('Envie um arquivo PDF.'); return; }
    if (file.size > 4 * 1024 * 1024) { setPdfErr('PDF muito grande (máx 4 MB). Reduza o arquivo ou envie menos páginas.'); return; }
    setPdfBusy(true);
    try {
      const b64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(',')[1] || '');
        r.onerror = () => rej(new Error('Falha ao ler o arquivo.'));
        r.readAsDataURL(file);
      });
      const resp = await fetch('/api/extract-exames', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: b64 }),
      });
      const j = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(j.error || 'Falha ao analisar o PDF.');
      const vals: Extraido[] = (j.valores || []).map((v: { marcador?: string; valor?: number; unidade?: string; data?: string }) => ({
        marcador: String(v.marcador || ''), valor: String(v.valor ?? ''),
        unidade: String(v.unidade || ''), data: v.data || today, incluir: true,
      }));
      if (!vals.length) setPdfErr('Nenhum valor numérico com data foi reconhecido no PDF. Você pode lançar manualmente acima.');
      setExtraidos(vals);
    } catch (e) {
      setPdfErr(e instanceof Error ? e.message : 'Falha ao analisar o PDF.');
    } finally {
      setPdfBusy(false);
    }
  }

  async function adicionarExtraidos() {
    const novos: ExamValue[] = [];
    for (const e of extraidos) {
      if (!e.incluir) continue;
      const n = parseFloat((e.valor || '').replace(',', '.'));
      if (!e.marcador.trim() || !isFinite(n) || !e.data) continue;
      const r = await addExamValue({ patientId, marcador: e.marcador, valor: n, unidade: e.unidade, data: e.data, tipo: 'lab' });
      if (r.value) novos.push(r.value);
    }
    if (novos.length) onChanged([...values, ...novos]);
    setExtraidos([]);
  }

  const grupos = useMemo(() => {
    const map = new Map<string, ExamValue[]>();
    for (const v of values) {
      const arr = map.get(v.marcador) || [];
      arr.push(v);
      map.set(v.marcador, arr);
    }
    return Array.from(map.entries());
  }, [values]);

  function pickComum(m: string, u: string) {
    setMarcador(m);
    setUnidade(u);
  }

  async function add() {
    setErr('');
    const n = parseFloat(valor.replace(',', '.'));
    if (!marcador.trim()) { setErr('Informe o marcador.'); return; }
    if (!isFinite(n)) { setErr('Valor numérico inválido.'); return; }
    setBusy(true);
    const r = await addExamValue({ patientId, marcador, valor: n, unidade, data, tipo: 'lab' });
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    if (r.value) onChanged([...values, r.value]);
    setValor('');
  }

  async function remove(id: string) {
    const r = await deleteExamValue(id, patientId);
    if (!r.error) onChanged(values.filter((v) => v.id !== id));
  }

  return (
    <div className="card">
      <h3>Exames e escores em números (com data)</h3>
      <p className="sub">Registre valores numéricos ao longo do tempo — viram gráficos de evolução e ajudam a IA a raciocinar sobre tendência.</p>

      <div className="chips" style={{ marginBottom: 8 }}>
        {COMUNS.map((c) => (
          <span key={c.m} className={'chip' + (marcador === c.m ? ' on' : '')} onClick={() => pickComum(c.m, c.u)}>{c.m}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ margin: 0, flex: '1 1 150px' }}><label>Marcador</label><input value={marcador} onChange={(e) => setMarcador(e.target.value)} placeholder="ex.: VHS" /></div>
        <div className="field" style={{ margin: 0, width: 90 }}><label>Valor</label><input value={valor} onChange={(e) => setValor(e.target.value)} placeholder="48" inputMode="decimal" /></div>
        <div className="field" style={{ margin: 0, width: 90 }}><label>Unidade</label><input value={unidade} onChange={(e) => setUnidade(e.target.value)} placeholder="mm/h" /></div>
        <div className="field" style={{ margin: 0, width: 150 }}><label>Data</label><input type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
        <button className="btn-primary" onClick={add} disabled={busy} style={{ padding: '9px 14px' }}>{busy ? '…' : 'Adicionar'}</button>
      </div>
      {err && <div className="auth-err" style={{ marginTop: 10 }}>{err}</div>}

      {/* Analisar PDF de exame com IA */}
      <div style={{ marginTop: 14, borderTop: '1px dashed var(--line)', paddingTop: 12 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
          Analisar PDF de exame com IA{' '}
          <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(a IA lê o laudo e extrai os valores; você revisa antes de salvar)</span>
        </div>
        <input type="file" accept="application/pdf" disabled={pdfBusy}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) analisarPdf(f); e.target.value = ''; }} />
        {pdfBusy && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Lendo o PDF com IA…</div>}
        {pdfErr && <div className="auth-err" style={{ marginTop: 8 }}>{pdfErr}</div>}
        {extraidos.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
              Revise os valores extraídos, corrija o que precisar e desmarque o que não quiser. Confira contra o laudo antes de salvar.
            </div>
            {extraidos.map((e, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                <input type="checkbox" checked={e.incluir} onChange={(ev) => updEx(i, { incluir: ev.target.checked })} />
                <input value={e.marcador} onChange={(ev) => updEx(i, { marcador: ev.target.value })} style={{ width: 130, ...inpStyle }} placeholder="Marcador" />
                <input value={e.valor} onChange={(ev) => updEx(i, { valor: ev.target.value })} style={{ width: 70, ...inpStyle }} placeholder="Valor" inputMode="decimal" />
                <input value={e.unidade} onChange={(ev) => updEx(i, { unidade: ev.target.value })} style={{ width: 70, ...inpStyle }} placeholder="Un." />
                <input type="date" value={e.data} onChange={(ev) => updEx(i, { data: ev.target.value })} style={{ width: 150, ...inpStyle }} />
              </div>
            ))}
            <button className="btn-primary" onClick={adicionarExtraidos} style={{ marginTop: 6, padding: '8px 14px' }}>Adicionar selecionados</button>
          </div>
        )}
      </div>

      {grupos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginTop: 16 }}>
          {grupos.map(([m, arr]) => (
            <div key={m}>
              <LineChart
                titulo={m}
                unidade={arr[arr.length - 1]?.unidade}
                points={arr.map((v) => ({ data: v.data, valor: Number(v.valor) }))}
              />
              <div style={{ marginTop: 4 }}>
                {arr.map((v) => (
                  <span key={v.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: 'var(--muted)', marginRight: 8 }}>
                    {v.data.slice(8, 10)}/{v.data.slice(5, 7)}: {Number(v.valor)}
                    <button onClick={() => remove(v.id)} title="Remover" style={{ border: 'none', background: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0, fontSize: 12 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
