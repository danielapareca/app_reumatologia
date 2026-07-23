'use client';

import { useState } from 'react';
import {
  das28crp, das28Categoria, cdai, cdaiCategoria, basdai, basdaiCategoria,
  sledai, sledaiCategoria, SLEDAI_ITENS,
  cjadas10, cjadasCategoria, asdasCrp, asdasCategoria,
} from '@/lib/clinical/scores';
import type { ExamValue } from '@/lib/types';
import { addExamValue } from './examActions';

type Calc = 'das28' | 'cdai' | 'basdai' | 'sledai' | 'jadas' | 'asdas';

const num = (s: string) => parseFloat((s || '').replace(',', '.')) || 0;

export default function ActivityCalculators({
  patientId,
  today,
  onSaved,
}: {
  patientId: string;
  today: string;
  onSaved: (v: ExamValue) => void;
}) {
  const [calc, setCalc] = useState<Calc>('das28');
  const [f, setF] = useState<Record<string, string>>({});
  const [sled, setSled] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  let resultado: number | null = null;
  let categoria = '';
  let marcador = '';
  if (calc === 'das28') {
    resultado = das28crp(num(f.tjc), num(f.sjc), num(f.pcr), num(f.gh));
    categoria = das28Categoria(resultado); marcador = 'DAS28-PCR';
  } else if (calc === 'cdai') {
    resultado = cdai(num(f.tjc), num(f.sjc), num(f.pga), num(f.ega));
    categoria = cdaiCategoria(resultado); marcador = 'CDAI';
  } else if (calc === 'basdai') {
    resultado = basdai([num(f.q1), num(f.q2), num(f.q3), num(f.q4), num(f.q5), num(f.q6)]);
    categoria = basdaiCategoria(resultado); marcador = 'BASDAI';
  } else if (calc === 'jadas') {
    resultado = cjadas10(num(f.aj), num(f.phga), num(f.pga));
    categoria = cjadasCategoria(resultado); marcador = 'cJADAS-10';
  } else if (calc === 'asdas') {
    resultado = asdasCrp(num(f.bp), num(f.ms), num(f.pg), num(f.per), num(f.pcr));
    categoria = asdasCategoria(resultado); marcador = 'ASDAS-PCR';
  } else {
    resultado = sledai(Array.from(sled));
    categoria = sledaiCategoria(resultado); marcador = 'SLEDAI-2K';
  }

  async function salvar() {
    if (resultado === null) return;
    const r = await addExamValue({ patientId, marcador, valor: resultado, unidade: '', data: today, tipo: 'escore' });
    if (r.error) { setMsg(r.error); return; }
    if (r.value) onSaved(r.value);
    setMsg(`${marcador} ${resultado} salvo na evolução.`);
    window.setTimeout(() => setMsg(''), 2500);
  }

  const inp = (k: string, ph: string, w = 70) => (
    <input value={f[k] || ''} onChange={(e) => set(k, e.target.value)} placeholder={ph} inputMode="decimal"
      style={{ width: w, padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14 }} />
  );
  const lbl = (t: string) => <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t}</span>;

  return (
    <div className="card">
      <h3>Calculadoras de atividade da doença</h3>
      <p className="sub">O resultado é salvo na evolução (vira ponto no gráfico) e ajuda a IA. Apoio — confira o instrumento oficial.</p>

      <div className="chips" style={{ marginBottom: 12 }}>
        {([['das28', 'DAS28 (AR)'], ['cdai', 'CDAI (AR)'], ['basdai', 'BASDAI (espondilite)'], ['asdas', 'ASDAS (espondilite)'], ['sledai', 'SLEDAI-2K (lúpus)'], ['jadas', 'cJADAS (juvenil)']] as const).map(([v, t]) => (
          <span key={v} className={'chip' + (calc === v ? ' on' : '')} onClick={() => setCalc(v)}>{t}</span>
        ))}
      </div>

      {calc === 'das28' && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <label>{lbl('Articulações dolorosas (0-28)')}<br />{inp('tjc', '0')}</label>
          <label>{lbl('Articulações edemaciadas (0-28)')}<br />{inp('sjc', '0')}</label>
          <label>{lbl('PCR (mg/L)')}<br />{inp('pcr', '0')}</label>
          <label>{lbl('Avaliação global do paciente (0-100)')}<br />{inp('gh', '0')}</label>
        </div>
      )}
      {calc === 'cdai' && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <label>{lbl('Articulações dolorosas (0-28)')}<br />{inp('tjc', '0')}</label>
          <label>{lbl('Articulações edemaciadas (0-28)')}<br />{inp('sjc', '0')}</label>
          <label>{lbl('Global do paciente (0-10)')}<br />{inp('pga', '0')}</label>
          <label>{lbl('Global do médico (0-10)')}<br />{inp('ega', '0')}</label>
        </div>
      )}
      {calc === 'basdai' && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <label>{lbl('1. Fadiga (0-10)')}<br />{inp('q1', '0')}</label>
          <label>{lbl('2. Dor axial (0-10)')}<br />{inp('q2', '0')}</label>
          <label>{lbl('3. Dor/edema periférico (0-10)')}<br />{inp('q3', '0')}</label>
          <label>{lbl('4. Entesite/desconforto (0-10)')}<br />{inp('q4', '0')}</label>
          <label>{lbl('5. Rigidez matinal — intensidade (0-10)')}<br />{inp('q5', '0')}</label>
          <label>{lbl('6. Rigidez matinal — duração (0-10)')}<br />{inp('q6', '0')}</label>
        </div>
      )}
      {calc === 'asdas' && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <label>{lbl('Dor lombar (0-10)')}<br />{inp('bp', '0')}</label>
          <label>{lbl('Rigidez matinal (0-10)')}<br />{inp('ms', '0')}</label>
          <label>{lbl('Global do paciente (0-10)')}<br />{inp('pg', '0')}</label>
          <label>{lbl('Dor/edema periférico (0-10)')}<br />{inp('per', '0')}</label>
          <label>{lbl('PCR (mg/L)')}<br />{inp('pcr', '0')}</label>
        </div>
      )}
      {calc === 'jadas' && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <label>{lbl('Articulações ativas (0-10)')}<br />{inp('aj', '0')}</label>
          <label>{lbl('Global do médico (0-10)')}<br />{inp('phga', '0')}</label>
          <label>{lbl('Global do paciente (0-10)')}<br />{inp('pga', '0')}</label>
        </div>
      )}
      {calc === 'sledai' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 4 }}>
          {SLEDAI_ITENS.map((it) => (
            <label key={it.key} style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={sled.has(it.key)} onChange={(e) => {
                setSled((prev) => { const n = new Set(prev); if (e.target.checked) n.add(it.key); else n.delete(it.key); return n; });
              }} />
              {it.label} <span style={{ color: 'var(--muted)' }}>({it.peso})</span>
            </label>
          ))}
        </div>
      )}

      <div className="scorebox" style={{ marginTop: 14 }}>
        <div className="it">Resultado — {marcador}</div>
        <div className="score">{resultado} <small>— {categoria}</small></div>
        <button className="btn-primary" onClick={salvar} style={{ marginTop: 10, maxWidth: 220 }}>Salvar na evolução</button>
        {msg && <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8 }}>{msg}</div>}
      </div>
    </div>
  );
}
