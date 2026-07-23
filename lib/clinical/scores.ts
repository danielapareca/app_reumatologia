// Calculadoras de atividade de doença. Apoio ao médico; conferir o instrumento oficial.

// DAS28-PCR (4 variáveis). tjc/sjc 0-28; pcr em mg/L; gh (avaliação global) 0-100.
export function das28crp(tjc: number, sjc: number, pcrMgL: number, gh: number): number {
  const v = 0.56 * Math.sqrt(Math.max(0, tjc)) + 0.28 * Math.sqrt(Math.max(0, sjc))
    + 0.36 * Math.log(Math.max(0, pcrMgL) + 1) + 0.014 * gh + 0.96;
  return Math.round(v * 100) / 100;
}
export function das28Categoria(v: number): string {
  if (v < 2.6) return 'remissão';
  if (v <= 3.2) return 'atividade baixa';
  if (v <= 5.1) return 'atividade moderada';
  return 'atividade alta';
}

// CDAI = TJC28 + SJC28 + avaliação global do paciente (0-10) + do médico (0-10).
export function cdai(tjc: number, sjc: number, pga: number, ega: number): number {
  return Math.round((tjc + sjc + pga + ega) * 10) / 10;
}
export function cdaiCategoria(v: number): string {
  if (v <= 2.8) return 'remissão';
  if (v <= 10) return 'atividade baixa';
  if (v <= 22) return 'atividade moderada';
  return 'atividade alta';
}

// BASDAI (espondilite): 6 perguntas 0-10. BASDAI = (Q1+Q2+Q3+Q4 + (Q5+Q6)/2) / 5.
export function basdai(q: number[]): number {
  const [q1, q2, q3, q4, q5, q6] = q.map((x) => (isFinite(x) ? x : 0));
  const v = (q1 + q2 + q3 + q4 + (q5 + q6) / 2) / 5;
  return Math.round(v * 100) / 100;
}
export function basdaiCategoria(v: number): string {
  return v >= 4 ? 'doença ativa (≥ 4)' : 'atividade baixa (< 4)';
}

// SLEDAI-2K (lúpus): soma dos pesos dos descritores presentes.
export interface SledaiItem { key: string; peso: number; label: string }
export const SLEDAI_ITENS: SledaiItem[] = [
  { key: 'convulsao', peso: 8, label: 'Convulsão' },
  { key: 'psicose', peso: 8, label: 'Psicose' },
  { key: 'cerebral', peso: 8, label: 'Síndrome cerebral orgânica' },
  { key: 'visual', peso: 8, label: 'Distúrbio visual' },
  { key: 'craniano', peso: 8, label: 'Distúrbio de nervo craniano' },
  { key: 'cefaleia', peso: 8, label: 'Cefaleia lúpica' },
  { key: 'avc', peso: 8, label: 'AVC' },
  { key: 'vasculite', peso: 8, label: 'Vasculite' },
  { key: 'artrite', peso: 4, label: 'Artrite' },
  { key: 'miosite', peso: 4, label: 'Miosite' },
  { key: 'cilindros', peso: 4, label: 'Cilindros urinários' },
  { key: 'hematuria', peso: 4, label: 'Hematúria' },
  { key: 'proteinuria', peso: 4, label: 'Proteinúria' },
  { key: 'piuria', peso: 4, label: 'Piúria' },
  { key: 'rash', peso: 2, label: 'Rash (novo/persistente)' },
  { key: 'alopecia', peso: 2, label: 'Alopecia' },
  { key: 'mucosa', peso: 2, label: 'Úlceras mucosas' },
  { key: 'pleurite', peso: 2, label: 'Pleurite' },
  { key: 'pericardite', peso: 2, label: 'Pericardite' },
  { key: 'complemento', peso: 2, label: 'Complemento baixo' },
  { key: 'dnadna', peso: 2, label: 'Anti-DNA aumentado' },
  { key: 'febre', peso: 1, label: 'Febre' },
  { key: 'plaquetopenia', peso: 1, label: 'Plaquetopenia' },
  { key: 'leucopenia', peso: 1, label: 'Leucopenia' },
];
export function sledai(marcados: string[]): number {
  const set = new Set(marcados);
  return SLEDAI_ITENS.reduce((t, i) => t + (set.has(i.key) ? i.peso : 0), 0);
}
export function sledaiCategoria(v: number): string {
  if (v === 0) return 'sem atividade';
  if (v <= 5) return 'atividade leve';
  if (v <= 10) return 'atividade moderada';
  if (v <= 19) return 'atividade alta';
  return 'atividade muito alta';
}

// cJADAS-10 (artrite idiopática juvenil): articulações ativas (máx 10) + global do médico (0-10)
// + global do paciente/responsável (0-10). Range 0-30. Dispensa prova de fase aguda.
export function cjadas10(activeJoints: number, phga: number, pga: number): number {
  const j = Math.min(10, Math.max(0, activeJoints));
  return Math.round((j + Math.max(0, phga) + Math.max(0, pga)) * 10) / 10;
}
export function cjadasCategoria(v: number): string {
  if (v <= 1) return 'remissão / inativa';
  if (v <= 4) return 'atividade baixa';
  if (v <= 8.5) return 'atividade moderada';
  return 'atividade alta';
}

// ASDAS-PCR (espondiloartrite axial). Componentes 0-10; PCR em mg/L.
// Coeficientes oficiais: 0,121·dor lombar + 0,058·rigidez matinal + 0,110·global do paciente
// + 0,073·dor/edema periférico + 0,579·ln(PCR+1).
export function asdasCrp(backPain: number, morningStiff: number, patientGlobal: number, peripheral: number, pcrMgL: number): number {
  const v = 0.121 * backPain + 0.058 * morningStiff + 0.110 * patientGlobal + 0.073 * peripheral + 0.579 * Math.log(Math.max(0, pcrMgL) + 1);
  return Math.round(v * 100) / 100;
}
export function asdasCategoria(v: number): string {
  if (v < 1.3) return 'inativa';
  if (v < 2.1) return 'baixa';
  if (v <= 3.5) return 'alta';
  return 'muito alta';
}

// Leitor de densitometria (DXA): classificação OMS pelo MENOR T-score entre sítios válidos.
export function classificarTscore(t: number): string {
  if (t >= -1.0) return 'Normal';
  if (t > -2.5) return 'Osteopenia (baixa massa óssea)';
  return 'Osteoporose';
}
export function condutaTscore(t: number): string {
  if (t >= -1.0) return 'Medidas gerais; repetir DXA conforme fatores de risco.';
  if (t > -2.5) return 'Calcular FRAX. Tratar se FRAX acima do limiar ou fratura por fragilidade prévia.';
  return 'Tratamento farmacológico indicado (cálcio + vitamina D de base).';
}
export function classificarZscore(z: number): string {
  return z <= -2.0 ? 'Massa óssea abaixo do esperado para a idade — investigar causa secundária' : 'Dentro do esperado para a idade';
}
