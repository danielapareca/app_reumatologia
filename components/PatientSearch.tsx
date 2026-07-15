'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Patient } from '@/lib/types';

// Busca e lista de pacientes salvos.
export default function PatientSearch({ patients }: { patients: Patient[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter(
      (p) =>
        p.nome.toLowerCase().includes(term) ||
        (p.cpf || '').toLowerCase().includes(term) ||
        (p.whats || '').toLowerCase().includes(term)
    );
  }, [q, patients]);

  return (
    <div>
      <div className="pt-search">
        <input
          placeholder="Buscar por nome, CPF ou WhatsApp…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="pt-empty" style={{ marginTop: 12, border: '1px solid var(--line)', borderRadius: 8 }}>
          {q ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda. Clique em "Novo paciente".'}
        </div>
      ) : (
        <div className="pt-list">
          {filtered.map((p) => (
            <Link key={p.id} className="pt-item" href={`/paciente/${p.id}`}>
              <div className="nm">{p.nome}</div>
              <div className="mt">
                {[p.idade, p.cpf ? `CPF ${p.cpf}` : null, p.whats].filter(Boolean).join(' · ') || 'sem dados adicionais'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
