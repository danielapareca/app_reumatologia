import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import PatientSearch from '@/components/PatientSearch';
import Icon from '@/components/Icon';
import { DISCLAIMER_LONGO } from '@/lib/disclaimer';
import { diasDesde, haQuantoTempo, iniciais, DIAS_RETORNO_ATRASADO } from '@/lib/util';
import type { Patient } from '@/lib/types';
import type { PatientSummary } from '@/components/PatientSearch';

export const dynamic = 'force-dynamic';

interface ConsultaRow {
  patient_id: string;
  data: string;
  doenca_nome: string | null;
  etapa: string | null;
  consulta_tipo: string | null;
}

function Tile({ label, value, icon, tone }: { label: string; value: string | number; icon: string; tone?: 'alert' }) {
  return (
    <div className="card md-tile" style={{ marginBottom: 0 }}>
      <div className="md-tile-top">
        <Icon name={icon} size={15} />
        <span>{label}</span>
      </div>
      <div className="md-tile-val" style={tone === 'alert' ? { color: 'var(--red)' } : undefined}>{value}</div>
    </div>
  );
}

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Garante que o perfil existe (útil quando a confirmação por e-mail está ativa).
  let nome = '';
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('nome').eq('id', user.id).maybeSingle();
    if (!profile) {
      await supabase.from('profiles').upsert({
        id: user.id,
        nome: (user.user_metadata?.nome as string) || '',
        especialidade: 'Reumatologia',
      });
    }
    nome = profile?.nome || (user.user_metadata?.nome as string) || '';
  }

  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  // Última consulta de cada paciente → mostra doença/fase/data na lista.
  const { data: consultas } = await supabase
    .from('consultas')
    .select('patient_id, data, doenca_nome, etapa, consulta_tipo')
    .order('data', { ascending: false });

  const ultimaPorPaciente: Record<string, PatientSummary> = {};
  for (const c of (consultas as ConsultaRow[]) || []) {
    if (!ultimaPorPaciente[c.patient_id]) {
      ultimaPorPaciente[c.patient_id] = {
        data: c.data,
        doencaNome: c.doenca_nome,
        etapa: c.etapa,
        consultaTipo: c.consulta_tipo,
      };
    }
  }

  // ---- métricas da "visão do médico" ----
  const hojeISO = new Date().toISOString().slice(0, 10);
  const pacientes = (patients as Patient[]) || [];
  const totalPac = pacientes.length;

  // Consultas nos últimos 30 dias.
  const consultas30 = ((consultas as ConsultaRow[]) || []).filter((c) => {
    const d = diasDesde(c.data, hojeISO);
    return d !== null && d >= 0 && d <= 30;
  }).length;

  // Pacientes com retorno atrasado (última consulta há mais que o limite).
  const atrasados = pacientes
    .map((p) => ({ p, resumo: ultimaPorPaciente[p.id], dias: ultimaPorPaciente[p.id] ? diasDesde(ultimaPorPaciente[p.id].data, hojeISO) : null }))
    .filter((x) => x.dias !== null && x.dias > DIAS_RETORNO_ATRASADO)
    .sort((a, b) => (b.dias || 0) - (a.dias || 0));

  return (
    <AppShell>
      <div className="page">
        <p className="eyebrow"><Icon name="stethoscope" size={15} /> Painel do médico</p>
        <h2>{nome ? `Olá, ${nome.split(' ')[0]}` : 'Visão do médico'}</h2>
        <p className="psub">Sua visão de hoje: pacientes, retornos e pendências. Comece um atendimento pela busca abaixo.</p>

        <div className="md-tiles">
          <Tile label="Pacientes" value={totalPac} icon="users" />
          <Tile label="Retornos atrasados" value={atrasados.length} icon="clock" tone={atrasados.length ? 'alert' : undefined} />
          <Tile label="Consultas (30 dias)" value={consultas30} icon="clipboard" />
          <Link href="/paciente/novo" className="card md-tile md-tile-cta" style={{ marginBottom: 0 }}>
            <div className="md-tile-top"><Icon name="plus" size={15} /><span>Novo paciente</span></div>
            <div className="md-tile-val" style={{ fontSize: 15, color: 'var(--gold-600)' }}>Cadastrar →</div>
          </Link>
        </div>

        {atrasados.length > 0 && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 2 }}>Precisam de atenção</h3>
            <p className="sub" style={{ marginBottom: 12 }}>Retorno possivelmente atrasado — sem consulta há mais de {DIAS_RETORNO_ATRASADO} dias.</p>
            <div className="md-att">
              {atrasados.slice(0, 6).map(({ p, resumo, dias }) => (
                <Link key={p.id} href={`/paciente/${p.id}`} className="md-att-item">
                  <span className="pt-avatar">{iniciais(p.nome)}</span>
                  <span className="md-att-body">
                    <span className="nm">{p.nome}</span>
                    <span className="mt">{resumo?.doencaNome || 'Sem doença registrada'}{resumo?.etapa ? ' · ' + resumo.etapa : ''} · última {haQuantoTempo(dias)}</span>
                  </span>
                  <span className="pt-badge atrasado">atrasado</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="toolbar" style={{ marginTop: 4 }}>
          <Link className="inline-btn" href="/paciente/novo"><Icon name="plus" size={16} /> Novo paciente</Link>
        </div>

        <PatientSearch
          patients={pacientes}
          resumos={ultimaPorPaciente}
          hojeISO={hojeISO}
        />
      </div>
      <footer className="app-footer" style={{ marginLeft: 24 }}>{DISCLAIMER_LONGO}</footer>
    </AppShell>
  );
}
