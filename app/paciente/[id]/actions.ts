'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { LmeJson } from '@/lib/types';

export interface SaveConsultaInput {
  patientId: string;
  doencaId: string;
  doencaNome: string;
  etapa: string;
  consultaTipo: string;
  hda: string;
  antecedentes: string;
  examResults: string;
  insight: string;
  examesTexto: string;
  receitaTexto: string;
  lmeJson: LmeJson | null;
}

export interface SaveConsultaResult {
  ok?: boolean;
  error?: string;
}

// Salva/atualiza os dados demográficos do paciente.
export async function updatePatient(input: {
  id: string;
  nome: string;
  idade: string;
  whats: string;
  cpf: string;
  email: string;
  endereco: string;
}): Promise<SaveConsultaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  if (!input.nome.trim()) return { error: 'O nome do paciente é obrigatório.' };

  const { error } = await supabase
    .from('patients')
    .update({
      nome: input.nome.trim(),
      idade: input.idade.trim() || null,
      whats: input.whats.trim() || null,
      cpf: input.cpf.trim() || null,
      email: input.email.trim() || null,
      endereco: input.endereco.trim() || null,
    })
    .eq('id', input.id);

  if (error) return { error: error.message };
  revalidatePath(`/paciente/${input.id}`);
  return { ok: true };
}

// Salva uma consulta no histórico do paciente.
export async function saveConsulta(input: SaveConsultaInput): Promise<SaveConsultaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const { error } = await supabase.from('consultas').insert({
    patient_id: input.patientId,
    doctor_id: user.id,
    doenca_id: input.doencaId || null,
    doenca_nome: input.doencaNome || null,
    etapa: input.etapa || null,
    consulta_tipo: input.consultaTipo || null,
    hda: input.hda || null,
    antecedentes: input.antecedentes || null,
    exam_results: input.examResults || null,
    insight: input.insight || null,
    exames_texto: input.examesTexto || null,
    receita_texto: input.receitaTexto || null,
    lme_json: input.lmeJson,
  });

  if (error) return { error: error.message };
  revalidatePath(`/paciente/${input.patientId}`);
  return { ok: true };
}
