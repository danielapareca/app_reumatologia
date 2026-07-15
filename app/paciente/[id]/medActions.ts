'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { MedicationEvent, MedEventTipo } from '@/lib/types';

export interface MedResult { ok?: boolean; error?: string; value?: MedicationEvent }

export async function addMedEvent(input: {
  patientId: string;
  medicamento: string;
  evento: MedEventTipo;
  dose: string;
  motivo: string;
  data: string;
}): Promise<MedResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  if (!input.medicamento.trim()) return { error: 'Informe o medicamento.' };
  if (!input.data) return { error: 'Informe a data.' };

  const { data, error } = await supabase
    .from('medication_events')
    .insert({
      patient_id: input.patientId,
      doctor_id: user.id,
      medicamento: input.medicamento.trim(),
      evento: input.evento,
      dose: input.dose.trim() || null,
      motivo: input.motivo.trim() || null,
      data: input.data,
    })
    .select('*')
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/paciente/${input.patientId}`);
  return { ok: true, value: data as MedicationEvent };
}

export async function deleteMedEvent(id: string, patientId: string): Promise<MedResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  const { error } = await supabase.from('medication_events').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/paciente/${patientId}`);
  return { ok: true };
}
