'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface SaveResult {
  ok?: boolean;
  error?: string;
}

export async function saveProfile(_prev: SaveResult, formData: FormData): Promise<SaveResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' };

  const payload = {
    id: user.id,
    nome: String(formData.get('nome') || '').trim(),
    crm: String(formData.get('crm') || '').trim(),
    especialidade: String(formData.get('especialidade') || 'Reumatologia').trim(),
    clinica: String(formData.get('clinica') || '').trim(),
    endereco: String(formData.get('endereco') || '').trim(),
    cidade: String(formData.get('cidade') || '').trim(),
    cnes: String(formData.get('cnes') || '').trim(),
    cns_medico: String(formData.get('cns_medico') || '').trim(),
  };

  const { error } = await supabase.from('profiles').upsert(payload);
  if (error) return { error: error.message };

  revalidatePath('/perfil');
  revalidatePath('/');
  return { ok: true };
}
