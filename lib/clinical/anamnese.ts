// Anamnese guiada — piloto validado na Artrite Reumatoide (ACR/EULAR 2010).
// Portado de gerador_v3.html.

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
  scored: ScoredQ[];
  clinical: ClinicalQ[];
}

export const ANAM: Record<string, AnamneseDef> = {
  ar: {
    titulo: 'Artrite Reumatoide — critérios ACR/EULAR 2010',
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
}

// Insight ACR/EULAR (só AR). Espelha computeInsight() do protótipo.
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
  return { score, done, yes, verdict, tips, septicWarning };
}
