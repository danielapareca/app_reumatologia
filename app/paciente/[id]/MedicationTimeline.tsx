'use client';

import { useState } from 'react';
import type { MedicationEvent, MedEventTipo } from '@/lib/types';
import { addMedEvent, deleteMedEvent } from './medActions';

const EVENTOS: { v: MedEventTipo; label: string; cor: string }[] = [
  { v: 'inicio', label: 'Início', cor: '#2f7d32' },
  { v: 'troca', label: 'Troca', cor: '#8A6D3B' },
  { v: 'aumento', label: 'Aumento', cor: '#8a5a1b' },
  { v: 'reducao', label: 'Redução', cor: '#8a5a1b' },
  { v: 'suspensao', label: 'Suspensão', cor: '#9B2D22' },
];

export default function MedicationTimeline({
  patientId,
  events,
  onChanged,
  today,
}: {
  patientId: string;
  events: MedicationEvent[];
  onChanged: (events: MedicationEvent[]) => void;
  today: string;
}) {
  const [medicamento, setMedicamento] = useState('');
  const [evento, setEvento] = useState<MedEventTipo>('inicio');
  const [dose, setDose] = useState('');
  const [motivo, setMotivo] = useState('');
  const [data, setData] = useState(today);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const ordenados = [...events].sort((a, b) => b.data.localeCompare(a.data));

  async function add() {
    setErr('');
    if (!medicamento.trim()) { setErr('Informe o medicamento.'); return; }
    setBusy(true);
    const r = await addMedEvent({ patientId, medicamento, evento, dose, motivo, data });
    setBusy(false);
    if (r.error) { setErr(r.error); return; }
    if (r.value) onChanged([...events, r.value]);
    setMedicamento(''); setDose(''); setMotivo('');
  }
  async function remove(id: string) {
    const r = await deleteMedEvent(id, patientId);
    if (!r.error) onChanged(events.filter((e) => e.id !== id));
  }

  return (
    <div className="card">
      <h3>Linha do tempo de medicação</h3>
      <p className="sub">
        Atualiza sozinha quando você salva a consulta: cada medicamento da receita vira <b>Início</b> (novo) ou <b>Troca</b> (mudou a dose). Se o paciente <b>já tomava</b> algo antes, cadastre manualmente aqui — depois as próximas receitas continuam a linha automaticamente. Suspensão é sempre manual.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ margin: 0, flex: '1 1 160px' }}><label>Medicamento</label><input value={medicamento} onChange={(e) => setMedicamento(e.target.value)} placeholder="ex.: Metotrexato 2,5 mg" /></div>
        <div className="field" style={{ margin: 0, width: 130 }}><label>Evento</label>
          <select value={evento} onChange={(e) => setEvento(e.target.value as MedEventTipo)}>
            {EVENTOS.map((ev) => <option key={ev.v} value={ev.v}>{ev.label}</option>)}
          </select>
        </div>
        <div className="field" style={{ margin: 0, width: 110 }}><label>Dose</label><input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="15 mg/sem" /></div>
        <div className="field" style={{ margin: 0, width: 140 }}><label>Data</label><input type="date" value={data} onChange={(e) => setData(e.target.value)} /></div>
      </div>
      <div className="field" style={{ marginTop: 6 }}><label>Motivo (opcional)</label><input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="ex.: intolerância, falha terapêutica…" /></div>
      <button className="btn-primary" onClick={add} disabled={busy} style={{ maxWidth: 180 }}>{busy ? '…' : 'Adicionar evento'}</button>
      {err && <div className="auth-err" style={{ marginTop: 10 }}>{err}</div>}

      {ordenados.length > 0 && (
        <div style={{ marginTop: 16, borderLeft: '2px solid var(--line)', paddingLeft: 14 }}>
          {ordenados.map((e) => {
            const cfg = EVENTOS.find((x) => x.v === e.evento);
            return (
              <div key={e.id} style={{ position: 'relative', marginBottom: 12 }}>
                <span style={{ position: 'absolute', left: -21, top: 3, width: 10, height: 10, borderRadius: '50%', background: cfg?.cor || 'var(--gold)' }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{new Date(e.data).toLocaleDateString('pt-BR')}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cfg?.cor, textTransform: 'uppercase' }}>{cfg?.label}</span>
                  <span style={{ fontSize: 13 }}>{e.medicamento}{e.dose ? ` — ${e.dose}` : ''}</span>
                  <button onClick={() => remove(e.id)} title="Remover" style={{ border: 'none', background: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 13, marginLeft: 'auto' }}>×</button>
                </div>
                {e.motivo && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Motivo: {e.motivo}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
