import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/TopBar';
import PatientSearch from '@/components/PatientSearch';
import { DISCLAIMER_LONGO } from '@/lib/disclaimer';
import type { Patient } from '@/lib/types';

export const dynamic = 'force-dynamic';

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

        <PatientSearch patients={(patients as Patient[]) || []} />
      </div>
      <footer className="app-footer">{DISCLAIMER_LONGO}</footer>
    </>
  );
}
