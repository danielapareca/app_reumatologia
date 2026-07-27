import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import Atendimento from './Atendimento';
import type { Patient, Consulta, Profile, ExamValue, MedicationEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function PacientePage({ params, searchParams }: { params: { id: string }; searchParams: { doenca?: string; etapa?: string; tipo?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!patient) notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .maybeSingle();

  const { data: consultas } = await supabase
    .from('consultas')
    .select('*')
    .eq('patient_id', params.id)
    .order('data', { ascending: false });

  const { data: examValues } = await supabase
    .from('exam_values')
    .select('*')
    .eq('patient_id', params.id)
    .order('data', { ascending: true });

  const { data: medEvents } = await supabase
    .from('medication_events')
    .select('*')
    .eq('patient_id', params.id)
    .order('data', { ascending: true });

  return (
    <AppShell>
      <Atendimento
        patient={patient as Patient}
        profile={(profile as Profile) || null}
        consultas={(consultas as Consulta[]) || []}
        examValues={(examValues as ExamValue[]) || []}
        medEvents={(medEvents as MedicationEvent[]) || []}
        inicial={{ doencaId: searchParams.doenca, etapa: searchParams.etapa, tipo: searchParams.tipo }}
      />
    </AppShell>
  );
}
