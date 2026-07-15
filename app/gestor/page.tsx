import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/TopBar';

export const dynamic = 'force-dynamic';

interface Stats {
  medicos: number; pacientes: number; consultas: number; exames: number;
  ia_total: number; ia_media: number; ia_baixas: number;
  ia_dist: Record<string, number>;
}
interface FbRow {
  id: string; created_at: string; doenca_id: string | null; ai_model: string | null;
  rating: number; disagreement: string | null; ai_response: string | null; patient_ref: string;
}

function Tile({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '14px 16px', background: '#fff', minWidth: 120 }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

export default async function GestorPage() {
  const supabase = createClient();
  const { data: stats, error: statsErr } = await supabase.rpc('admin_stats');
  const isAdmin = !statsErr && stats;

  if (!isAdmin) {
    return (
      <>
        <TopBar title="Painel do gestor" />
        <div className="page">
          <h2>Acesso restrito</h2>
          <p className="psub">Esta área é só para o gestor (admin). Se você é o dono, cadastre seu usuário como admin no Supabase (veja o comentário no final de <code>supabase/schema.sql</code>) e recarregue.</p>
          <Link className="inline-btn ghost" href="/">Voltar</Link>
        </div>
      </>
    );
  }

  const s = stats as Stats;
  const { data: fb } = await supabase.rpc('admin_ai_feedback', { lim: 100 });
  const rows = (fb as FbRow[]) || [];

  return (
    <>
      <TopBar title="Painel do gestor" />
      <div className="page">
        <h2>Visão geral</h2>
        <p className="psub">Números agregados. Nenhuma tela aqui mostra nome, contato ou dados clínicos ligados a um paciente identificável.</p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 26 }}>
          <Tile label="Médicos" value={s.medicos} />
          <Tile label="Pacientes" value={s.pacientes} />
          <Tile label="Consultas" value={s.consultas} />
          <Tile label="Exames/escores" value={s.exames} />
          <Tile label="Avaliações IA" value={s.ia_total} />
          <Tile label="Nota média IA" value={s.ia_media || '—'} />
          <Tile label="Notas baixas (≤3)" value={s.ia_baixas} />
        </div>

        <h2>Distribuição das notas da IA</h2>
        <p className="psub">Quantas avaliações receberam cada nota (1 a 5).</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 120, marginBottom: 30 }}>
          {[1, 2, 3, 4, 5].map((n) => {
            const c = s.ia_dist?.[String(n)] || 0;
            const max = Math.max(1, ...Object.values(s.ia_dist || {}));
            return (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{ width: 40, height: Math.round((c / max) * 90) + 6, background: n <= 3 ? 'var(--red)' : 'var(--gold)', borderRadius: '6px 6px 0 0' }} />
                <div style={{ fontSize: 12, marginTop: 4 }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c}</div>
              </div>
            );
          })}
        </div>

        <h2>QA da IA — avaliações (de-identificado)</h2>
        <p className="psub">Priorizando as notas baixas. O paciente aparece como um código. Use as discordâncias para ajustar o grounding e os prompts.</p>
        {rows.length === 0 ? (
          <p className="empty-note">Nenhuma avaliação registrada ainda.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((r) => (
              <div key={r.id} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', background: '#fff' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: r.rating <= 3 ? 'var(--red)' : '#2f7d32' }}>Nota {r.rating}</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Paciente #{r.patient_ref}</span>
                  {r.doenca_id && <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>{r.doenca_id}</span>}
                  {r.ai_model && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{r.ai_model}</span>}
                  <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                {r.disagreement && (
                  <div style={{ fontSize: 13, marginTop: 6, color: '#5b451e', background: 'var(--gold-soft)', padding: '6px 10px', borderRadius: 6 }}>
                    <b>Discordância:</b> {r.disagreement}
                  </div>
                )}
                {r.ai_response && (
                  <details style={{ marginTop: 6 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>Ver o que a IA respondeu</summary>
                    <div style={{ fontSize: 12.5, whiteSpace: 'pre-wrap', marginTop: 6, color: '#444' }}>{r.ai_response}</div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
