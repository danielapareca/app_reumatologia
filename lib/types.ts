// Tipos das linhas do banco (Supabase).

export interface Profile {
  id: string;
  nome: string | null;
  crm: string | null;
  especialidade: string | null;
  clinica: string | null;
  endereco: string | null;
  cidade: string | null;
  cnes: string | null;
  cns_medico: string | null;
  created_at?: string;
}

export interface Patient {
  id: string;
  doctor_id: string;
  nome: string;
  idade: string | null;
  nascimento: string | null;
  whats: string | null;
  cpf: string | null;
  email: string | null;
  endereco: string | null;
  created_at?: string;
}

export interface Consulta {
  id: string;
  patient_id: string;
  doctor_id: string;
  data: string;
  doenca_id: string | null;
  doenca_nome: string | null;
  etapa: string | null;
  consulta_tipo: string | null;
  hda: string | null;
  antecedentes: string | null;
  exam_results: string | null;
  insight: string | null;
  exames_texto: string | null;
  receita_texto: string | null;
  lme_json: LmeJson | null;
  ia_insight: string | null;
  created_at?: string;
}

// Snapshot dos campos da LME salvos junto da consulta.
export interface LmeJson {
  cnes?: string;
  estab?: string;
  paciente?: string;
  mae?: string;
  peso?: string;
  altura?: string;
  meds?: { m: string; q: string }[];
  cid?: string;
  diagnostico?: string;
  anamnese?: string;
  medico?: string;
  cnsMed?: string;
  data?: string;
  telefone?: string;
  documento?: string;
  email?: string;
}
