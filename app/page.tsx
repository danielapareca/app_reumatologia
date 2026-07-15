import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/TopBar';
import PatientSearch from '@/components/PatientSearch';
import { DISCLAIMER_LONGO } from '@/lib/disclaimer';
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

  return (
    <>
      <TopBar title="Pacientes" />
      <div className="page">
        <h2>Meus pacientes</h2>
        <p className="psub">
          {nome ? `Bem-vindo, ${nome}. ` : ''}
          Busque um paciente ou cadastre um novo para iniciar o atendimento.
        </p>

        <div className="toolbar">
          <Link className="inline-btn" href="/paciente/novo">+ Novo paciente</Link>
        </div>

        <PatientSearch
          patients={(patients as Patient[]) || []}
          resumos={ultimaPorPaciente}
          hojeISO={new Date().toISOString().slice(0, 10)}
        />
      </div>
      <footer className="app-footer">{DISCLAIMER_LONGO}</footer>
    </>
  );
}
