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
  const consent = formData.get('consent') === 'on';

  const row: Record<string, unknown> = {
    doctor_id: user.id,
    nome,
    idade: String(formData.get('idade') || '').trim() || null,
    nascimento: nascimentoRaw || null,
    whats: String(formData.get('whats') || '').trim() || null,
    cpf: String(formData.get('cpf') || '').trim() || null,
    email: String(formData.get('email') || '').trim() || null,
    endereco: String(formData.get('endereco') || '').trim() || null,
    cidade: String(formData.get('cidade') || '').trim() || null,
    estado: String(formData.get('estado') || '').trim() || null,
    cep: String(formData.get('cep') || '').trim() || null,
    consent_data: consent,
    consent_data_at: consent ? new Date().toISOString() : null,
  };

  let res = await supabase.from('patients').insert(row).select('id').single();
  // Compatível com bancos sem as colunas de consentimento ainda criadas.
  if (res.error && (res.error.code === 'PGRST204' || res.error.code === '42703' || /consent/i.test(res.error.message))) {
    delete row.consent_data; delete row.consent_data_at;
    res = await supabase.from('patients').insert(row).select('id').single();
  }
  if (res.error) return { error: res.error.message };
  redirect(`/paciente/${res.data.id}`);
}
