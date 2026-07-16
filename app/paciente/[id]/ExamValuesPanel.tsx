'use client';

import { useEffect, useMemo, useState } from 'react';
import LineChart from '@/components/LineChart';
import { createClient } from '@/lib/supabase/client';
import type { ExamValue, ExamFile } from '@/lib/types';
import { addExamValue, deleteExamValue } from './examActions';

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
  const grupos = useMemo(() => {
    const map = new Map<string, ExamValue[]>();
    for (const v of values) {
      const arr = map.get(v.marcador) || [];
      arr.push(v);
      map.set(v.marcador, arr);
    }
    return Array.from(map.entries());
  }, [values]);

  // Laudos originais guardados (Storage).
  const supabase = useMemo(() => createClient(), []);
  const [laudos, setLaudos] = useState<ExamFile[]>([]);
  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data, error } = await supabase.from('exam_files').select('*').eq('patient_id', patientId).order('created_at', { ascending: false });
      if (vivo && !error && data) setLaudos(data as ExamFile[]);
    })();
    return () => { vivo = false; };
  }, [supabase, patientId]);

  async function guardarLaudo(file: File) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const safe = (file.name || 'laudo.pdf').replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 60);
      const path = `${user.id}/${patientId}/${Date.now()}-${safe}`;
      const up = await supabase.storage.from('exames').upload(path, file, { contentType: 'application/pdf', upsert: false });
      if (up.error) return; // bucket/tabela ainda não criados → guarda silenciosamente falha, extração segue
      const ins = await supabase.from('exam_files').insert({ patient_id: patientId, doctor_id: user.id, path, filename: file.name, data: today }).select('*').single();
      if (!ins.error && ins.data) setLaudos((l) => [ins.data as ExamFile, ...l]);
    } catch { /* ignora */ }
  }
  async function baixarLaudo(f: ExamFile) {
    const { data } = await supabase.storage.from('exames').createSignedUrl(f.path, 120);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  }
  async function removerLaudo(f: ExamFile) {
    if (!window.confirm('Remover este laudo anexado?')) return;
    await supabase.storage.from('exames').remove([f.path]);
    await supabase.from('exam_files').delete().eq('id', f.id);
    setLaudos((l) => l.filter((x) => x.id !== f.id));
  }

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
    guardarLaudo(file); // guarda o arquivo original em paralelo à análise
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
      if (!vals.length) setPdfErr('Nenhum valor numérico com data foi reconhecido no PDF.');
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

  async function remove(id: string) {
    const r = await deleteExamValue(id, patientId);
    if (!r.error) onChanged(values.filter((v) => v.id !== id));
  }

  return (
    <div className="card">
      <h3>Exames — anexe o PDF e a IA preenche</h3>
      <p className="sub">Anexe o laudo em PDF: a IA lê e extrai os valores (com data e nome do exame). Você revisa e confirma. Os exames viram gráficos de evolução e o <b>arquivo original fica guardado</b> aqui.</p>

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
              <input value={e.marcador} onChange={(ev) => updEx(i, { marcador: ev.target.value })} style={{ width: 140, ...inpStyle }} placeholder="Exame" />
              <input value={e.valor} onChange={(ev) => updEx(i, { valor: ev.target.value })} style={{ width: 70, ...inpStyle }} placeholder="Valor" inputMode="decimal" />
              <input value={e.unidade} onChange={(ev) => updEx(i, { unidade: ev.target.value })} style={{ width: 70, ...inpStyle }} placeholder="Un." />
              <input type="date" value={e.data} onChange={(ev) => updEx(i, { data: ev.target.value })} style={{ width: 150, ...inpStyle }} />
            </div>
          ))}
          <button className="btn-primary" onClick={adicionarExtraidos} style={{ marginTop: 6, padding: '8px 14px' }}>Adicionar selecionados</button>
        </div>
      )}

      {laudos.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--gold-600)', fontWeight: 800, marginBottom: 6 }}>Laudos anexados</div>
          {laudos.map((f) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, padding: '5px 0', borderBottom: '1px solid var(--line-soft)' }}>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.filename || 'laudo.pdf'}</span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{f.data ? new Date(f.data).toLocaleDateString('pt-BR') : ''}</span>
              <button className="btn-ghost" style={{ height: 30, padding: '0 10px', fontSize: 12 }} onClick={() => baixarLaudo(f)}>Abrir</button>
              <button onClick={() => removerLaudo(f)} title="Remover" style={{ border: 'none', background: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 14 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {grupos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginTop: 18 }}>
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
