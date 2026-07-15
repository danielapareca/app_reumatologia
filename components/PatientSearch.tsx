'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Icon from '@/components/Icon';
import type { Patient } from '@/lib/types';
import { diasDesde, haQuantoTempo, DIAS_RETORNO_ATRASADO, iniciais } from '@/lib/util';

export interface PatientSummary {
  data: string;
  doencaNome: string | null;
  etapa: string | null;
  consultaTipo: string | null;
}

// Busca e lista de pacientes salvos, com selo de doença/fase e alerta de retorno atrasado.
export default function PatientSearch({
  patients,
  resumos = {},
  hojeISO = '',
}: {
  patients: Patient[];
  resumos?: Record<string, PatientSummary>;
  hojeISO?: string;
}) {
  const [q, setQ] = useState('');
  const [soAtrasados, setSoAtrasados] = useState(false);

  const atrasado = (id: string): boolean => {
    const r = resumos[id];
    if (!r) return false;
    const d = diasDesde(r.data, hojeISO);
    return d !== null && d > DIAS_RETORNO_ATRASADO;
  };

  const totalAtrasados = useMemo(
    () => patients.filter((p) => atrasado(p.id)).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [patients, resumos, hojeISO]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = patients;
    if (term) {
      list = list.filter(
        (p) =>
          p.nome.toLowerCase().includes(term) ||
          (p.cpf || '').toLowerCase().includes(term) ||
          (p.whats || '').toLowerCase().includes(term) ||
          (resumos[p.id]?.doencaNome || '').toLowerCase().includes(term)
      );
    }
    if (soAtrasados) list = list.filter((p) => atrasado(p.id));
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, patients, resumos, soAtrasados, hojeISO]);

  return (
    <div>
      <div className="pt-search">
        <Icon name="search" size={18} style={{ color: 'var(--faint)' }} />
        <input
          placeholder="Buscar por nome, CPF, WhatsApp ou doença…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {totalAtrasados > 0 && (
        <button
          className={'pt-filter' + (soAtrasados ? ' on' : '')}
          onClick={() => setSoAtrasados((v) => !v)}
        >
          {soAtrasados ? '✓ ' : ''}Retorno atrasado ({totalAtrasados})
        </button>
      )}

      {filtered.length === 0 ? (
        <div className="pt-empty" style={{ marginTop: 12, border: '1px solid var(--line)', borderRadius: 8 }}>
          {q || soAtrasados ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda. Clique em "Novo paciente".'}
        </div>
      ) : (
        <div className="pt-list">
          {filtered.map((p) => {
            const r = resumos[p.id];
            const dias = r ? diasDesde(r.data, hojeISO) : null;
            const atras = atrasado(p.id);
            return (
              <Link key={p.id} className="pt-item" href={`/paciente/${p.id}`}>
                <span className="pt-avatar">{iniciais(p.nome)}</span>
                <span className="pt-item-body">
                  <span className="pt-item-top">
                    <span className="nm">{p.nome}</span>
                    {r?.doencaNome && (
                      <span className="pt-badge">
                        {r.doencaNome}{r.etapa ? ' · ' + r.etapa : ''}
                      </span>
                    )}
                    {atras && <span className="pt-badge atrasado">retorno atrasado</span>}
                  </span>
                  <span className="mt">
                    {[p.idade, p.cpf ? `CPF ${p.cpf}` : null, p.whats].filter(Boolean).join(' · ') || 'sem dados adicionais'}
                    {r && <> · última consulta {haQuantoTempo(dias)}</>}
                  </span>
                </span>
                <Icon name="chevron" size={18} className="pt-chevron" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
