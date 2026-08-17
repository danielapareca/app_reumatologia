'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { LmeJson, ScreeningState } from '@/lib/types';

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
  observacoes: string;
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

// Salva a lista de diagnósticos (doenças) do paciente. Falha silenciosa se a coluna
// ainda não existir no banco (o app segue funcionando com a doença ativa).
export async function updateDiagnosticos(patientId: string, diagnosticos: string[]): Promise<SaveConsultaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  const lista = Array.isArray(diagnosticos) ? diagnosticos.filter((x) => typeof x === 'string' && x.trim()).slice(0, 20) : [];
  const { error } = await supabase.from('patients').update({ diagnosticos: lista }).eq('id', patientId);
  if (error) {
    if (error.code === 'PGRST204' || error.code === '42703' || /diagnostic/i.test(error.message)) return { ok: true };
    return { error: error.message };
  }
  return { ok: true };
}

// Salva uma consulta no histórico do paciente.
export async function saveConsulta(input: SaveConsultaInput): Promise<SaveConsultaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };

  const row: Record<string, unknown> = {
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
    observacoes: input.observacoes || null,
  };

  let { error } = await supabase.from('consultas').insert(row);
  // Compatível com bancos onde a coluna `observacoes` ainda não foi criada: salva sem ela.
  if (error && 'observacoes' in row && (error.code === 'PGRST204' || error.code === '42703' || /observ/i.test(error.message))) {
    delete row.observacoes;
    ({ error } = await supabase.from('consultas').insert(row));
  }

  if (error) return { error: error.message };
  revalidatePath(`/paciente/${input.patientId}`);
  return { ok: true };
}

// Corrige os textos livres de uma consulta já salva (HDA, antecedentes, observações).
export async function updateConsulta(input: {
  id: string; patientId: string; hda: string; antecedentes: string; observacoes: string;
}): Promise<SaveConsultaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  const patch: Record<string, unknown> = {
    hda: input.hda || null, antecedentes: input.antecedentes || null, observacoes: input.observacoes || null,
  };
  let { error } = await supabase.from('consultas').update(patch).eq('id', input.id);
  if (error && (error.code === 'PGRST204' || error.code === '42703' || /observ/i.test(error.message))) {
    delete patch.observacoes;
    ({ error } = await supabase.from('consultas').update(patch).eq('id', input.id));
  }
  if (error) return { error: error.message };
  revalidatePath(`/paciente/${input.patientId}`);
  return { ok: true };
}

// Exclui uma consulta do histórico.
export async function deleteConsulta(id: string, patientId: string): Promise<SaveConsultaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  const { error } = await supabase.from('consultas').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath(`/paciente/${patientId}`);
  return { ok: true };
}

// Exclui o paciente e todo o seu histórico (consultas, exames e medicação em cascata).
export async function deletePatient(id: string): Promise<SaveConsultaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/');
  return { ok: true };
}

// Registra/atualiza o consentimento do paciente para o tratamento de dados (LGPD).
export async function setConsent(patientId: string, value: boolean): Promise<SaveConsultaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  const patch = { consent_data: value, consent_data_at: value ? new Date().toISOString() : null };
  const { error } = await supabase.from('patients').update(patch).eq('id', patientId);
  if (error) {
    if (error.code === 'PGRST204' || error.code === '42703' || /consent/i.test(error.message)) {
      return { error: 'Rode o SQL de consentimento no Supabase para salvar essa opção.' };
    }
    return { error: error.message };
  }
  revalidatePath(`/paciente/${patientId}`);
  return { ok: true };
}

// Salva o rastreio pré-biológico do paciente.
export async function saveScreening(patientId: string, screening: ScreeningState): Promise<SaveConsultaResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sessão expirada.' };
  const { error } = await supabase.from('patients').update({ screening }).eq('id', patientId);
  if (error) return { error: error.message };
  revalidatePath(`/paciente/${patientId}`);
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
