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
