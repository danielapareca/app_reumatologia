// Anamnese guiada por doença — apoio ao médico (critérios simplificados, não substituem
// a avaliação clínica). AR usa contagem de articulações (ACR/EULAR 2010); as demais usam
// domínios pontuados por chips, baseados nos critérios de classificação de cada condição.

export interface ScoredQ {
  id: string;
  q: string;
  opts: [string, number][];
}
export interface ClinicalQ {
  id: string;
  q: string;
}
export interface AnamneseDef {
  titulo: string;
  criterio?: string;   // nome do critério (ex.: "CASPAR")
  limiar?: number;     // pontuação sugestiva
  positivo?: string;   // veredito quando >= limiar
  negativo?: string;   // veredito quando < limiar
  scored: ScoredQ[];
  clinical: ClinicalQ[];
}

export const ANAM: Record<string, AnamneseDef> = {
  ar: {
    titulo: 'Artrite Reumatoide — critérios ACR/EULAR 2010',
    criterio: 'ACR/EULAR 2010',
    limiar: 6,
    scored: [
      { id: 'joints', q: 'Articulações acometidas (sinovite)', opts: [['1 grande', 0], ['2 a 10 grandes', 1], ['1 a 3 pequenas', 2], ['4 a 10 pequenas', 3], ['> 10 (com ≥ 1 pequena)', 5]] },
      { id: 'sero', q: 'Sorologia (FR / anti-CCP)', opts: [['Negativos / não disponível', 0], ['Positivo baixo (≤ 3x)', 2], ['Positivo alto (> 3x)', 3]] },
      { id: 'fase', q: 'VHS ou PCR elevada?', opts: [['Não / normal', 0], ['Sim, elevada', 1]] },
      { id: 'dur', q: 'Duração dos sintomas ≥ 6 semanas?', opts: [['Não', 0], ['Sim', 1]] },
    ],
    clinical: [
      { id: 'rigidez', q: 'Rigidez matinal > 60 min?' },
      { id: 'simetria', q: 'Acometimento simétrico?' },
      { id: 'febre', q: 'Febre associada?' },
      { id: 'mono', q: 'Monoartrite aguda muito inflamatória?' },
    ],
  },

  aps: {
    titulo: 'Artrite Psoriásica — critérios CASPAR',
    criterio: 'CASPAR', limiar: 3,
    scored: [
      { id: 'psor', q: 'Psoríase', opts: [['Atual', 2], ['História pessoal', 1], ['História familiar', 1], ['Ausente', 0]] },
      { id: 'dactilite', q: 'Dactilite (dedo em salsicha)', opts: [['Presente ou história', 1], ['Ausente', 0]] },
      { id: 'unha', q: 'Distrofia ungueal (onicólise, pitting)', opts: [['Presente', 1], ['Ausente', 0]] },
      { id: 'fr', q: 'Fator reumatoide', opts: [['Negativo', 1], ['Positivo / desconhecido', 0]] },
      { id: 'osso', q: 'Neoformação óssea justarticular (radiografia)', opts: [['Presente', 1], ['Ausente / não feita', 0]] },
    ],
    clinical: [
      { id: 'entesite', q: 'Entesite (dor em inserções, ex.: calcâneo)?' },
      { id: 'axial', q: 'Dor lombar inflamatória (axial)?' },
      { id: 'rigidez', q: 'Rigidez matinal > 30 min?' },
    ],
  },

  ea: {
    titulo: 'Espondiloartrite axial — apoio (ASAS)',
    criterio: 'ASAS (apoio)', limiar: 5,
    scored: [
      { id: 'dor', q: 'Dor lombar inflamatória (início < 40a, insidiosa, melhora com exercício, dor noturna)', opts: [['≥ 4 características', 3], ['2 a 3', 2], ['0 a 1', 0]] },
      { id: 'b27', q: 'HLA-B27', opts: [['Positivo', 2], ['Negativo / desconhecido', 0]] },
      { id: 'imagem', q: 'Sacroiliíte em imagem (Rx / RM)', opts: [['Presente', 3], ['Ausente / não feita', 0]] },
      { id: 'aine', q: 'Resposta a AINE', opts: [['Boa resposta', 1], ['Sem resposta / não testado', 0]] },
    ],
    clinical: [
      { id: 'uveite', q: 'Uveíte anterior (olho vermelho doloroso)?' },
      { id: 'pso_dii', q: 'Psoríase ou doença inflamatória intestinal?' },
      { id: 'familia', q: 'História familiar de espondiloartrite?' },
    ],
  },

  reativa: {
    titulo: 'Artrite Reativa — apoio',
    criterio: 'Artrite reativa (apoio)', limiar: 3,
    scored: [
      { id: 'infec', q: 'Infecção prévia (1–4 semanas): geniturinária ou gastrointestinal', opts: [['Confirmada', 2], ['Provável', 1], ['Ausente', 0]] },
      { id: 'padrao', q: 'Padrão articular', opts: [['Oligoartrite assimétrica de MMII', 2], ['Poliartrite', 1], ['Outro', 0]] },
      { id: 'b27', q: 'HLA-B27', opts: [['Positivo', 1], ['Negativo / desconhecido', 0]] },
    ],
    clinical: [
      { id: 'uretrite', q: 'Uretrite / cervicite?' },
      { id: 'conjuntivite', q: 'Conjuntivite?' },
      { id: 'entesite', q: 'Entesite ou dactilite?' },
    ],
  },

  les: {
    titulo: 'Lúpus Eritematoso Sistêmico — apoio (ACR/EULAR 2019)',
    criterio: 'ACR/EULAR 2019 (apoio)', limiar: 10,
    positivo: 'Pontuação ≥ 10 com FAN positivo: alta suspeita de LES — confirmar critérios e exames imunológicos.',
    negativo: 'Pontuação < 10: não classifica LES isoladamente — reavaliar e complementar exames.',
    scored: [
      { id: 'hemato', q: 'Hematológico', opts: [['Trombocitopenia', 4], ['Leucopenia', 3], ['Nenhum', 0]] },
      { id: 'muco', q: 'Mucocutâneo', opts: [['Lúpus agudo (rash malar)', 6], ['Lúpus discoide / subagudo', 4], ['Alopecia ou úlcera oral', 2], ['Nenhum', 0]] },
      { id: 'articular', q: 'Articular', opts: [['Sinovite / artrite ≥ 2 articulações', 6], ['Artralgia inflamatória', 0], ['Nenhum', 0]] },
      { id: 'renal', q: 'Renal', opts: [['Nefrite classe III/IV (biópsia)', 8], ['Proteinúria > 0,5 g/24h', 4], ['Nenhum', 0]] },
      { id: 'imuno', q: 'Imunológico', opts: [['Anti-DNA ou anti-Sm', 6], ['Complemento baixo', 3], ['Nenhum', 0]] },
    ],
    clinical: [
      { id: 'fan', q: 'FAN positivo (≥ 1:80)?' },
      { id: 'serosite', q: 'Serosite (pleurite / pericardite)?' },
      { id: 'febre', q: 'Febre sem infecção?' },
      { id: 'raynaud', q: 'Fenômeno de Raynaud?' },
    ],
  },

  sjogren: {
    titulo: 'Síndrome de Sjögren — critérios ACR/EULAR 2016',
    criterio: 'ACR/EULAR 2016', limiar: 4,
    scored: [
      { id: 'antiro', q: 'Anti-Ro / SSA', opts: [['Positivo', 3], ['Negativo', 0]] },
      { id: 'biopsia', q: 'Biópsia de glândula salivar (focus score ≥ 1)', opts: [['Positiva', 3], ['Negativa / não feita', 0]] },
      { id: 'ocular', q: 'Testes oculares (Schirmer / coloração de superfície)', opts: [['Alterados', 1], ['Normais / não feitos', 0]] },
      { id: 'salivar', q: 'Fluxo salivar não estimulado reduzido', opts: [['Sim', 1], ['Não / não medido', 0]] },
    ],
    clinical: [
      { id: 'olho', q: 'Xeroftalmia (olho seco) diária > 3 meses?' },
      { id: 'boca', q: 'Xerostomia (boca seca) > 3 meses?' },
      { id: 'parotida', q: 'Aumento recorrente de parótidas?' },
    ],
  },

  esclerose: {
    titulo: 'Esclerose Sistêmica — critérios ACR/EULAR 2013',
    criterio: 'ACR/EULAR 2013', limiar: 9,
    scored: [
      { id: 'pele', q: 'Espessamento cutâneo dos dedos', opts: [['Proximal às MCF (esclerodactilia)', 9], ['Dedos edemaciados (puffy)', 2], ['Ausente', 0]] },
      { id: 'polpa', q: 'Lesões de polpa digital', opts: [['Cicatrizes puntiformes', 3], ['Úlceras digitais', 2], ['Ausente', 0]] },
      { id: 'capilar', q: 'Capilaroscopia', opts: [['Padrão esclerodermia', 2], ['Normal / não feita', 0]] },
      { id: 'ac', q: 'Autoanticorpos (anticentrômero, anti-Scl70, anti-RNA pol III)', opts: [['Positivo', 3], ['Negativo', 0]] },
      { id: 'tel', q: 'Telangiectasias', opts: [['Presentes', 2], ['Ausentes', 0]] },
    ],
    clinical: [
      { id: 'raynaud', q: 'Fenômeno de Raynaud?' },
      { id: 'pulmao', q: 'Dispneia (doença pulmonar / hipertensão pulmonar)?' },
      { id: 'refluxo', q: 'Refluxo ou disfagia?' },
    ],
  },

  miopatias: {
    titulo: 'Miopatias Inflamatórias — apoio',
    criterio: 'Miopatia inflamatória (apoio)', limiar: 5,
    scored: [
      { id: 'fraqueza', q: 'Fraqueza muscular proximal', opts: [['Simétrica e progressiva', 3], ['Leve', 1], ['Ausente', 0]] },
      { id: 'ck', q: 'CK (creatinofosfoquinase)', opts: [['Muito elevada', 2], ['Elevada', 1], ['Normal', 0]] },
      { id: 'pele', q: 'Achados cutâneos (heliótropo, pápulas de Gottron)', opts: [['Presentes', 3], ['Ausentes', 0]] },
      { id: 'ac', q: 'Autoanticorpos miosite-específicos', opts: [['Positivo', 2], ['Negativo / não feito', 0]] },
    ],
    clinical: [
      { id: 'disfagia', q: 'Disfagia?' },
      { id: 'dispneia', q: 'Dispneia (pneumopatia intersticial)?' },
      { id: 'enzimas', q: 'Elevação de aldolase / TGO?' },
    ],
  },

  saf: {
    titulo: 'Síndrome Antifosfolípide — apoio (Sydney)',
    criterio: 'Sydney (apoio)', limiar: 6,
    positivo: 'Achados sugestivos: requer ≥ 1 critério clínico + anticorpo antifosfolípide confirmado em 12 semanas.',
    negativo: 'Não preenche o padrão clínico + laboratorial — reavaliar e repetir sorologias.',
    scored: [
      { id: 'trombose', q: 'Trombose vascular (arterial ou venosa) confirmada', opts: [['Sim', 3], ['Não', 0]] },
      { id: 'gestacao', q: 'Morbidade gestacional (perdas, pré-eclâmpsia, prematuridade)', opts: [['Sim', 2], ['Não / não se aplica', 0]] },
      { id: 'apl', q: 'Anticorpos antifosfolípides (anticardiolipina, anti-β2GP1, anticoagulante lúpico)', opts: [['Positivo', 3], ['Negativo / não feito', 0]] },
    ],
    clinical: [
      { id: 'livedo', q: 'Livedo reticular?' },
      { id: 'plaq', q: 'Trombocitopenia?' },
      { id: 'les', q: 'LES associado?' },
    ],
  },

  pmr: {
    titulo: 'Polimialgia Reumática — apoio (EULAR/ACR 2012)',
    criterio: 'EULAR/ACR 2012 (apoio)', limiar: 4,
    scored: [
      { id: 'cintura', q: 'Idade ≥ 50a + dor bilateral em cinturas (ombros/quadris)', opts: [['Sim', 2], ['Não', 0]] },
      { id: 'rigidez', q: 'Rigidez matinal > 45 min', opts: [['Sim', 2], ['Não', 0]] },
      { id: 'fase', q: 'VHS / PCR elevados', opts: [['Sim', 1], ['Não', 0]] },
      { id: 'sero', q: 'Ausência de FR / anti-CCP', opts: [['Sim', 2], ['Não / desconhecido', 0]] },
    ],
    clinical: [
      { id: 'ombro', q: 'Dor/limitação nova de ombros?' },
      { id: 'cortico', q: 'Resposta rápida a corticoide em dose baixa?' },
      { id: 'acg', q: 'Sintomas de arterite temporal (cefaleia, claudicação de mandíbula)?' },
    ],
  },

  acg: {
    titulo: 'Arterite de Células Gigantes — critérios ACR 1990',
    criterio: 'ACR 1990', limiar: 3,
    scored: [
      { id: 'idade', q: 'Idade ≥ 50 anos ao início', opts: [['Sim', 1], ['Não', 0]] },
      { id: 'cefaleia', q: 'Cefaleia nova localizada', opts: [['Sim', 1], ['Não', 0]] },
      { id: 'arteria', q: 'Alteração da artéria temporal (dor / pulso reduzido)', opts: [['Sim', 1], ['Não', 0]] },
      { id: 'vhs', q: 'VHS ≥ 50 mm/h', opts: [['Sim', 1], ['Não', 0]] },
      { id: 'biopsia', q: 'Biópsia de artéria temporal alterada', opts: [['Sim', 1], ['Não feita / normal', 0]] },
    ],
    clinical: [
      { id: 'mandibula', q: 'Claudicação de mandíbula?' },
      { id: 'visual', q: 'Sintomas visuais (amaurose, diplopia)? — URGÊNCIA' },
      { id: 'pmr', q: 'Polimialgia associada?' },
    ],
  },

  anca: {
    titulo: 'Vasculites ANCA-associadas — apoio',
    criterio: 'Vasculite ANCA (apoio)', limiar: 4,
    scored: [
      { id: 'anca', q: 'ANCA (PR3 / MPO)', opts: [['Positivo', 3], ['Negativo / não feito', 0]] },
      { id: 'renal', q: 'Acometimento renal (hematúria, proteinúria, glomerulonefrite)', opts: [['Sim', 2], ['Não', 0]] },
      { id: 'via', q: 'Via aérea (sinusite crônica, nódulos, hemoptise)', opts: [['Sim', 2], ['Não', 0]] },
      { id: 'sistemico', q: 'Sistêmico (febre, perda de peso, mononeurite)', opts: [['Sim', 1], ['Não', 0]] },
    ],
    clinical: [
      { id: 'hemoptise', q: 'Hemoptise / hemorragia alveolar? — URGÊNCIA' },
      { id: 'sinusite', q: 'Sinusite ou otite recorrente?' },
      { id: 'purpura', q: 'Púrpura palpável?' },
    ],
  },

  gota: {
    titulo: 'Gota — apoio (ACR/EULAR 2015)',
    criterio: 'ACR/EULAR 2015 (apoio)', limiar: 8,
    scored: [
      { id: 'padrao', q: 'Padrão da crise', opts: [['Monoartrite de 1ª MTF (podagra)', 3], ['Monoartrite de outra articulação de MMII', 2], ['Poliarticular', 1], ['Outro', 0]] },
      { id: 'crise', q: 'Características (eritema, dor intensa, dificuldade de tocar)', opts: [['≥ 2 presentes', 2], ['1', 1], ['Nenhuma', 0]] },
      { id: 'urato', q: 'Ácido úrico sérico', opts: [['> 10 mg/dL', 4], ['8 a 10', 3], ['6 a 8', 2], ['< 6', 0]] },
      { id: 'tofo', q: 'Tofos', opts: [['Presentes', 4], ['Ausentes', 0]] },
    ],
    clinical: [
      { id: 'previas', q: 'Crises prévias autolimitadas?' },
      { id: 'cristais', q: 'Cristais de urato no líquido sinovial?' },
      { id: 'fator', q: 'Uso de diurético ou álcool?' },
    ],
  },

  pseudogota: {
    titulo: 'Artrite por Pirofosfato (Pseudogota) — apoio',
    criterio: 'CPPD (apoio)', limiar: 4,
    scored: [
      { id: 'condro', q: 'Condrocalcinose em imagem (menisco, punho)', opts: [['Presente', 3], ['Ausente / não feita', 0]] },
      { id: 'padrao', q: 'Padrão', opts: [['Monoartrite aguda (joelho/punho)', 2], ['Poliarticular crônico', 1], ['Outro', 0]] },
      { id: 'cristais', q: 'Cristais de pirofosfato no líquido sinovial', opts: [['Presentes', 3], ['Não pesquisados', 0]] },
    ],
    clinical: [
      { id: 'idade', q: 'Idade > 60 anos?' },
      { id: 'metabolica', q: 'Doença metabólica (hemocromatose, hiperparatireoidismo)?' },
      { id: 'recorrente', q: 'Crises recorrentes?' },
    ],
  },

  osteoartrite: {
    titulo: 'Osteoartrite (Artrose) — apoio',
    criterio: 'Osteoartrite (apoio)', limiar: 5,
    scored: [
      { id: 'dor', q: 'Padrão de dor', opts: [['Mecânica (piora com uso, melhora repouso)', 2], ['Mista', 1], ['Inflamatória', 0]] },
      { id: 'rigidez', q: 'Rigidez matinal', opts: [['< 30 min', 2], ['30 a 60 min', 1], ['> 60 min', 0]] },
      { id: 'topografia', q: 'Articulações típicas (joelho, quadril, mãos IFD/IFP, coluna)', opts: [['Sim', 2], ['Não', 0]] },
      { id: 'nodulos', q: 'Nódulos de Heberden / Bouchard', opts: [['Presentes', 1], ['Ausentes', 0]] },
    ],
    clinical: [
      { id: 'idade', q: 'Idade > 50 anos?' },
      { id: 'crepitacao', q: 'Crepitação articular?' },
      { id: 'seminflam', q: 'Sem sinais inflamatórios sistêmicos?' },
    ],
  },

  osteoporose: {
    titulo: 'Osteoporose — avaliação de risco (apoio)',
    criterio: 'Risco de osteoporose (apoio)', limiar: 4,
    scored: [
      { id: 'fratura', q: 'Fratura por fragilidade prévia', opts: [['Sim', 3], ['Não', 0]] },
      { id: 'idade', q: 'Idade', opts: [['≥ 70 anos', 2], ['60 a 69', 1], ['< 60', 0]] },
      { id: 'risco', q: 'Fatores de risco (corticoide, tabagismo, menopausa precoce, baixo IMC)', opts: [['≥ 2', 2], ['1', 1], ['Nenhum', 0]] },
      { id: 'dxa', q: 'Densitometria (T-score)', opts: [['≤ -2,5', 3], ['-1 a -2,5', 1], ['> -1 / não feita', 0]] },
    ],
    clinical: [
      { id: 'cortico', q: 'Uso crônico de corticoide?' },
      { id: 'menopausa', q: 'Menopausa?' },
      { id: 'familia', q: 'História familiar de fratura de quadril?' },
    ],
  },

  fibromialgia: {
    titulo: 'Fibromialgia — critérios ACR 2016 (apoio)',
    criterio: 'ACR 2016 (apoio)', limiar: 5,
    scored: [
      { id: 'wpi', q: 'Índice de dor difusa (nº de regiões acometidas)', opts: [['≥ 7', 3], ['4 a 6', 2], ['< 4', 0]] },
      { id: 'sss', q: 'Gravidade de sintomas (fadiga, sono, cognição)', opts: [['Grave', 3], ['Moderada', 2], ['Leve', 0]] },
      { id: 'dur', q: 'Duração dos sintomas ≥ 3 meses', opts: [['Sim', 1], ['Não', 0]] },
    ],
    clinical: [
      { id: 'sono', q: 'Sono não reparador?' },
      { id: 'fadiga', q: 'Fadiga importante?' },
      { id: 'exclui', q: 'Sem outra doença que explique melhor?' },
    ],
  },

  febre: {
    titulo: 'Febre Reumática — critérios de Jones (apoio)',
    criterio: 'Jones (apoio)', limiar: 4,
    scored: [
      { id: 'maiores', q: 'Critérios maiores (cardite, artrite, coreia, eritema marginado, nódulos)', opts: [['≥ 2 maiores', 4], ['1 maior', 2], ['0', 0]] },
      { id: 'menores', q: 'Critérios menores (febre, artralgia, VHS/PCR↑, PR alargado)', opts: [['≥ 2 menores', 2], ['1', 1], ['0', 0]] },
      { id: 'estrepto', q: 'Evidência de infecção estreptocócica prévia (ASLO, cultura)', opts: [['Sim', 2], ['Não', 0]] },
    ],
    clinical: [
      { id: 'faringite', q: 'Faringite prévia?' },
      { id: 'cardite', q: 'Sopro cardíaco novo (cardite)?' },
      { id: 'coreia', q: 'Coreia de Sydenham?' },
    ],
  },

  chikungunya: {
    titulo: 'Artropatia por Chikungunya — apoio',
    criterio: 'Pós-chikungunya (apoio)', limiar: 4,
    scored: [
      { id: 'historia', q: 'História de chikungunya (confirmada ou suspeita)', opts: [['Sim', 3], ['Não', 0]] },
      { id: 'padrao', q: 'Padrão articular', opts: [['Poliartralgia / poliartrite simétrica', 2], ['Oligoarticular', 1], ['Outro', 0]] },
      { id: 'dur', q: 'Duração', opts: [['Subaguda / crônica (> 3 meses)', 2], ['Aguda', 1]] },
    ],
    clinical: [
      { id: 'febre', q: 'Febre alta no início do quadro?' },
      { id: 'rash', q: 'Rash cutâneo?' },
      { id: 'persist', q: 'Persistência de dor após a fase aguda?' },
    ],
  },
};

// Categoria de articulações do escore ACR/EULAR a partir da contagem.
export function jointScoreCat(L: number, S: number): [number | null, string] {
  const total = L + S;
  if (total > 10 && S >= 1) return [5, '> 10 articulações (≥ 1 pequena)'];
  if (S >= 4) return [3, '4 a 10 pequenas'];
  if (S >= 1) return [2, '1 a 3 pequenas'];
  if (L >= 2) return [1, '2 a 10 grandes'];
  if (L >= 1) return [0, '1 grande'];
  return [null, ''];
}

export interface AnamState {
  jL?: number; // grandes
  jS?: number; // pequenas
  joints?: number;
  sero?: number;
  fase?: number;
  dur?: number;
  rigidez?: boolean;
  simetria?: boolean;
  febre?: boolean;
  mono?: boolean;
  [k: string]: number | boolean | undefined;
}

export interface AnamInsight {
  score: number;
  done: boolean;
  yes: boolean;
  verdict: string;
  tips: string[];
  septicWarning: boolean;
  criterio: string;
  max: number;
  limiar: number;
}

// Insight ACR/EULAR (só AR — usa a contagem de articulações grandes/pequenas).
export function computeAnamInsight(state: AnamState): AnamInsight | null {
  const keys = ['joints', 'sero', 'fase', 'dur'] as const;
  const score = keys.reduce<number>((t, k) => t + (typeof state[k] === 'number' ? (state[k] as number) : 0), 0);
  const done = keys.every((k) => typeof state[k] === 'number');
  const yes = score >= 6;
  const verdict = yes
    ? 'Pontuação ≥ 6: compatível com classificação de Artrite Reumatoide.'
    : 'Pontuação < 6: não classifica AR isoladamente — reavaliar/seguir com exames.';
  const tips: string[] = [];
  if (state.sero === 0) tips.push('Sorologia negativa ou pendente: solicitar FR e anti-CCP para completar a pontuação.');
  if (!done) tips.push('Complete os quatro domínios pontuados para o escore final.');
  if (state.rigidez) tips.push('Rigidez matinal prolongada reforça padrão inflamatório.');
  const septicWarning = !!state.febre && !!state.mono;
  return { score, done, yes, verdict, tips, septicWarning, criterio: 'ACR/EULAR 2010', max: 10, limiar: 6 };
}

// Insight genérico para as demais doenças: soma os domínios pontuados e compara ao limiar.
export function computeGenericAnamInsight(def: AnamneseDef, state: AnamState): AnamInsight {
  const ids = def.scored.map((q) => q.id);
  const score = ids.reduce<number>((t, id) => t + (typeof state[id] === 'number' ? (state[id] as number) : 0), 0);
  const done = ids.every((id) => typeof state[id] === 'number');
  const max = def.scored.reduce((t, q) => t + Math.max(0, ...q.opts.map((o) => o[1])), 0);
  const limiar = def.limiar ?? Math.ceil(max / 2);
  const yes = score >= limiar;
  const verdict = yes
    ? (def.positivo || `Pontuação ≥ ${limiar}: achados compatíveis — confirmar critérios e exames.`)
    : (def.negativo || `Pontuação < ${limiar}: não classifica isoladamente — reavaliar e complementar com exames.`);
  const tips: string[] = [];
  if (!done) tips.push('Complete os domínios pontuados para a pontuação final.');
  return { score, done, yes, verdict, tips, septicWarning: false, criterio: def.criterio || 'Critérios (apoio)', max, limiar };
}
