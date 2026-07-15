'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ExamValue } from '@/lib/types';

export interface ExamResult {
  ok?: boolean;
  error?: string;
  value?: ExamValue;
}

// Registra um valor numérico de exame ou escore com data.
export async function addExamValue(input: {
  patientId: string;
  marcador: string;
  valor: number;
  unidade: string;
  data: string;
  tipo: 'lab' | 'escore';
}): Promise<ExamResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  if (!input.marcador.trim()) return { error: 'Informe o marcador.' };
  if (!isFinite(input.valor)) return { error: 'Valor inválido.' };
  if (!input.data) return { error: 'Informe a data.' };

  const { data, error } = await supabase
    .from('exam_values')
    .insert({
      patient_id: input.patientId,
      doctor_id: user.id,
      marcador: input.marcador.trim(),
      valor: input.valor,
      unidade: input.unidade.trim() || null,
      data: input.data,
      tipo: input.tipo,
    })
    .select('*')
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/paciente/${input.patientId}`);
  return { ok: true, value: data as ExamValue };
}

export async function deleteExamValue(id: string, patientId: string): Promise<ExamResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  const { error } = await supabase.from('exam_values').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/paciente/${patientId}`);
  return { ok: true };
}
