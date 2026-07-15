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
  iaInsight: string;
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
  nascimento: string;
  whats: string;
  cpf: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
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
      nascimento: input.nascimento.trim() || null,
      whats: input.whats.trim() || null,
      cpf: input.cpf.trim() || null,
      email: input.email.trim() || null,
      endereco: input.endereco.trim() || null,
      cidade: input.cidade.trim() || null,
      estado: input.estado.trim() || null,
      cep: input.cep.trim() || null,
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
    ia_insight: input.iaInsight || null,
  });

  if (error) return { error: error.message };
  revalidatePath(`/paciente/${input.patientId}`);
  return { ok: true };
}

// Avaliação obrigatória (1–5) das sugestões da IA; discordância obrigatória se <= 3.
export async function saveAiFeedback(input: {
  patientId: string;
  doencaId: string;
  aiModel: string;
  aiResponse: string;
  rating: number;
  disagreement: string;
}): Promise<SaveConsultaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  if (!(input.rating >= 1 && input.rating <= 5)) return { error: 'Dê uma nota de 1 a 5.' };
  if (input.rating <= 3 && !input.disagreement.trim()) {
    return { error: 'Para notas 3 ou menos, descreva o que não concordou com a IA.' };
  }
  const { error } = await supabase.from('ai_feedback').insert({
    patient_id: input.patientId,
    doctor_id: user.id,
    doenca_id: input.doencaId || null,
    ai_model: input.aiModel || null,
    ai_response: input.aiResponse || null,
    rating: input.rating,
    disagreement: input.disagreement.trim() || null,
  });
  if (error) return { error: error.message };
  return { ok: true };
}
