// Motor de insights do texto ditado/digitado (apoio, não diagnóstico).
// Portado de TEXTRULES / scanText de gerador_v3.html.

export type InsightLevel = 'flag' | 'point' | 'clue';

export interface TextRule {
  t: string[]; // termos gatilho
  m: string; // mensagem
  lvl: InsightLevel;
}

export const TEXTRULES: TextRule[] = [
  { t: ['rigidez matinal', 'rigidez de manha'], m: 'Rigidez matinal: reforça padrão inflamatório.', lvl: 'clue' },
  { t: ['dor noturna', 'acorda a noite', 'acorda de madrugada', 'dor a noite'], m: 'Dor noturna: padrão inflamatório; investigar causa.', lvl: 'clue' },
  { t: ['melhora com repouso', 'piora com movimento', 'piora com atividade', 'piora ao usar'], m: 'Padrão mecânico sugerido (melhora com repouso).', lvl: 'clue' },
  { t: ['febre'], m: 'Febre relatada: se monoartrite, excluir artrite séptica; se sistêmico, investigar atividade/infecção.', lvl: 'flag' },
  { t: ['emagrecimento', 'perda de peso', 'perda ponderal', 'emagreceu'], m: 'Perda de peso: sinal de alarme; investigar doença sistêmica/neoplasia.', lvl: 'flag' },
  { t: ['sudorese noturna', 'suor noturno', 'suando a noite'], m: 'Sudorese noturna: sinal de alarme.', lvl: 'flag' },
  { t: ['perda visual', 'amaurose', 'vista embacada', 'perdi a visao', 'enxergando mal'], m: 'Sintoma visual: em > 50 anos com cefaleia, suspeitar arterite de células gigantes (emergência).', lvl: 'flag' },
  { t: ['claudicacao de mandibula', 'dor ao mastigar', 'dor na mandibula', 'cansa a mandibula'], m: 'Claudicação de mandíbula: suspeitar arterite de células gigantes.', lvl: 'flag' },
  { t: ['hemoptise', 'sangue no escarro', 'tossindo sangue', 'escarro com sangue'], m: 'Hemoptise: possível hemorragia alveolar (vasculite) — emergência.', lvl: 'flag' },
  { t: ['dispneia', 'falta de ar', 'cansaco aos esforcos', 'canso facil'], m: 'Dispneia: avaliar doença pulmonar intersticial / hipertensão pulmonar.', lvl: 'flag' },
  { t: ['fraqueza', 'subir escada', 'pentear', 'levantar da cadeira', 'forca nas pernas'], m: 'Fraqueza proximal: avaliar miopatia inflamatória (dosar CK).', lvl: 'point' },
  { t: ['raynaud', 'maos ficam brancas', 'dedos ficam roxos', 'dedos ficam brancos'], m: 'Fenômeno de Raynaud: avaliar esclerose sistêmica / LES (capilaroscopia, FAN).', lvl: 'point' },
  { t: ['olho seco', 'boca seca', 'secura', 'ressecamento'], m: 'Secura ocular/oral: avaliar síndrome de Sjögren (anti-Ro/La, Schirmer).', lvl: 'point' },
  { t: ['psoriase', 'placas na pele', 'descamacao', 'caspa forte'], m: 'Psoríase: avaliar artrite psoriásica (dactilite, entesite, unhas).', lvl: 'point' },
  { t: ['rash malar', 'asa de borboleta', 'fotossensibilidade', 'mancha no rosto', 'vermelhidao no rosto'], m: 'Lesão malar/fotossensibilidade: avaliar LES (FAN, complemento, anti-DNA).', lvl: 'point' },
  { t: ['tofo', 'podagra', 'halux', 'dedao do pe', 'dedao inchado'], m: 'Podagra/tofo: sugere gota (ácido úrico, pesquisa de cristais).', lvl: 'point' },
  { t: ['lombalgia', 'dor lombar', 'dor nas costas', 'dor na coluna'], m: 'Lombalgia: se inflamatória (< 45 anos, noturna, melhora com exercício), avaliar espondiloartrite.', lvl: 'point' },
  { t: ['uveite', 'olho vermelho', 'inflamacao no olho'], m: 'Uveíte: associada a espondiloartrites; encaminhar oftalmologia.', lvl: 'point' },
  { t: ['chikungunya', 'arbovirose', 'dengue', 'zika'], m: 'Arbovirose: avaliar artropatia por chikungunya; excluir dengue antes de AINE.', lvl: 'point' },
  { t: ['gestante', 'gravida', 'gravidez', 'amamentando', 'amamenta', 'gravidas'], m: 'Gestação/lactação: evitar metotrexato, leflunomida, micofenolato e ciclofosfamida.', lvl: 'flag' },
  { t: ['tuberculose', 'tuberculoso'], m: 'TB mencionada: confirmar rastreio/tratamento antes de imunossupressor/biológico.', lvl: 'flag' },
  { t: ['hepatite'], m: 'Hepatite mencionada: rastrear HBV/HCV antes de imunossupressor.', lvl: 'flag' },
  { t: ['insuficiencia renal', 'creatinina alta', 'problema no rim', 'doenca renal', 'rim ruim'], m: 'Função renal comprometida: ajustar/evitar AINE e metotrexato; ajustar colchicina/alopurinol.', lvl: 'flag' },
];

export function norm(t: string): string {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Devolve os insights reconhecidos no texto, ordenados por gravidade.
export function scanText(...texts: string[]): TextRule[] {
  const txt = norm(texts.join('  '));
  if (!txt.trim()) return [];
  const found = TEXTRULES.filter((r) => r.t.some((term) => txt.includes(norm(term))));
  const order: Record<InsightLevel, number> = { flag: 0, point: 1, clue: 2 };
  found.sort((a, b) => order[a.lvl] - order[b.lvl]);
  return found;
}
