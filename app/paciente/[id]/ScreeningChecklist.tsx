'use client';

import { useState } from 'react';
import type { ScreeningState, ScreeningStatus } from '@/lib/types';
import { saveScreening } from './actions';

const ITENS: { key: string; label: string; detalhe: string }[] = [
  { key: 'tb', label: 'Tuberculose', detalhe: 'PPD ou IGRA + radiografia de tórax' },
  { key: 'hbv', label: 'Hepatite B', detalhe: 'HBsAg, anti-HBc, anti-HBs' },
  { key: 'hcv', label: 'Hepatite C', detalhe: 'Anti-HCV' },
  { key: 'hiv', label: 'HIV', detalhe: 'Anti-HIV' },
  { key: 'vacinas', label: 'Vacinação', detalhe: 'Atualizada; evitar vírus vivo durante imunossupressão' },
];

const CORES: Record<ScreeningStatus, { bg: string; fg: string; label: string }> = {
  pendente: { bg: 'var(--red-bg)', fg: 'var(--red)', label: 'Pendente' },
  ok: { bg: 'var(--green-bg)', fg: 'var(--green)', label: 'OK' },
  na: { bg: 'var(--line-soft)', fg: 'var(--muted)', label: 'N/A' },
};

export default function ScreeningChecklist({
  patientId,
  initial,
  precisaRastreio,
}: {
  patientId: string;
  initial: ScreeningState | null;
  precisaRastreio: boolean;
}) {
  const [state, setState] = useState<ScreeningState>(initial || {});
  const [msg, setMsg] = useState('');

  function statusDe(key: string): ScreeningStatus {
    return state[key]?.status || 'pendente';
  }
  function ciclar(key: string) {
    const ordem: ScreeningStatus[] = ['pendente', 'ok', 'na'];
    const atual = statusDe(key);
    const prox = ordem[(ordem.indexOf(atual) + 1) % ordem.length];
    setState((s) => ({ ...s, [key]: { ...s[key], status: prox } }));
  }
  function setData(key: string, data: string) {
    setState((s) => ({ ...s, [key]: { status: statusDe(key), data } }));
  }
  async function salvar() {
    const r = await saveScreening(patientId, state);
    setMsg(r.error ? r.error : 'Rastreio salvo.');
    window.setTimeout(() => setMsg(''), 2500);
  }

  const pendentes = ITENS.filter((i) => statusDe(i.key) === 'pendente').map((i) => i.label);

  return (
    <div className="card">
      <h3>Rastreio pré-biológico / imunossupressor</h3>
      <p className="sub">Antes de iniciar imunossupressor ou biológico, conclua o rastreio (ver base [fund-03]). Clique no status para alternar Pendente → OK → N/A.</p>

      {precisaRastreio && pendentes.length > 0 && (
        <div className="an-flag" style={{ marginBottom: 12 }}>
          ⚠️ A etapa atual envolve imunossupressor/biológico e há rastreio PENDENTE: {pendentes.join(', ')}. Não iniciar até concluir ou justificar.
        </div>
      )}

      {ITENS.map((it) => {
        const st = statusDe(it.key);
        const c = CORES[st];
        return (
          <div key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <button onClick={() => ciclar(it.key)} style={{ background: c.bg, color: c.fg, border: '1px solid ' + c.fg, borderRadius: 6, padding: '4px 10px', fontWeight: 700, fontSize: 12, minWidth: 84, cursor: 'pointer' }}>
              {c.label}
            </button>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{it.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{it.detalhe}</div>
            </div>
            <input type="date" value={state[it.key]?.data || ''} onChange={(e) => setData(it.key, e.target.value)}
              title="Data do resultado" style={{ padding: '5px 7px', border: '1px solid var(--line)', borderRadius: 6, fontFamily: 'inherit', fontSize: 12.5 }} />
          </div>
        );
      })}

      <button className="btn-primary" onClick={salvar} style={{ marginTop: 8, maxWidth: 200 }}>Salvar rastreio</button>
      {msg && <span style={{ fontSize: 12, color: 'var(--green)', marginLeft: 10 }}>{msg}</span>}
    </div>
  );
}
