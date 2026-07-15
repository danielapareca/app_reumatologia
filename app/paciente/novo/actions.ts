'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export interface NewPatientResult {
  error?: string;
}

export async function createPatient(_prev: NewPatientResult, formData: FormData): Promise<NewPatientResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

  const nome = String(formData.get('nome') || '').trim();
  if (!nome) return { error: 'O nome do paciente é obrigatório.' };

  const nascimentoRaw = String(formData.get('nascimento') || '').trim();

  const { data, error } = await supabase
    .from('patients')
    .insert({
      doctor_id: user.id,
      nome,
      idade: String(formData.get('idade') || '').trim() || null,
      nascimento: nascimentoRaw || null,
      whats: String(formData.get('whats') || '').trim() || null,
      cpf: String(formData.get('cpf') || '').trim() || null,
      email: String(formData.get('email') || '').trim() || null,
      endereco: String(formData.get('endereco') || '').trim() || null,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  redirect(`/paciente/${data.id}`);
}
