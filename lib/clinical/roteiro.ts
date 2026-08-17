// Roteiro adaptativo da consulta: o que priorizar em cada passo conforme a
// DOENÇA + TIPO (primeira/retorno) + FASE (etapa). Apoio — organiza o atendimento.

import { D } from './diseases';
import type { ConsultaTipo } from './faseGuia';

// Escore de atividade que faz sentido calcular por doença (Passo 3).
export type EscoreId = 'das28' | 'cdai' | 'basdai' | 'asdas' | 'sledai' | 'jadas' | null;
const ESCORE: Record<string, EscoreId> = {
  ar: 'das28', aps: 'das28', ea: 'asdas', les: 'sledai', aij: 'jadas',
};
// Doenças em que a avaliação é por sintomas/função, sem escore de atividade articular.
const SEM_ESCORE_NOTA: Record<string, string> = {
  osteoporose: 'Aqui o que conta é a densitometria (DXA) e o FRAX — use o leitor abaixo, não escores de atividade.',
  gota: 'Acompanhe o ácido úrico (alvo < 6 mg/dL; < 5 se tofos) — não há escore de atividade articular.',
  fibromialgia: 'Avaliação por sintomas e função (sono, dor difusa, impacto) — não se usa escore de atividade articular.',
  miofascial: 'Avaliação por pontos-gatilho, dor e função — não se usa escore de atividade articular.',
  sdcr: 'Avaliação por critérios de Budapeste e função — priorize reabilitação precoce.',
  fadiga: 'Avaliação por sintomas e exclusão de causas — não se usa escore de atividade articular.',
  osteoartrite: 'Avaliação por dor/função (ex.: WOMAC) e exame — não se usa escore de atividade inflamatória.',
  takayasu: 'Atividade avaliada por clínica, fase aguda (VHS/PCR) e IMAGEM (angio-RM/TC/PET) — não por escore articular. Afira a PA nos 4 membros.',
  acg: 'Atividade por clínica e fase aguda; imagem seletiva para dano. Não se usa escore de atividade articular.',
  pmr: 'Atividade por clínica (dor/rigidez de cinturas) e fase aguda; sem escore articular específico.',
};

export function escoreSugerido(id: string): EscoreId {
  return ESCORE[id] ?? null;
}
export function usaDxaFrax(id: string): boolean {
  return id === 'osteoporose';
}

export interface Roteiro {
  resumo: string;
  dados: string[];
  avaliacao: string[];
  calculos: { relevante: boolean; nota: string; escore: EscoreId; dxa: boolean };
  ia: string[];
}

export function montarRoteiro(id: string, etapaId: string, tipo: ConsultaTipo): Roteiro {
  const d = id ? D[id] : null;
  if (!d) {
    return {
      resumo: 'Escolha a doença nos dados do paciente para o roteiro se ajustar à fase.',
      dados: ['Confira os dados do paciente e anexe os exames que houver.'],
      avaliacao: ['Registre a história e os antecedentes.'],
      calculos: { relevante: false, nota: 'Defina a doença para saber o que calcular.', escore: null, dxa: false },
      ia: ['Gere o insight e converse com a IA quando tiver os dados.'],
    };
  }

  const idx = Math.max(0, d.etapas.findIndex((e) => e.id === etapaId));
  const etapa = d.etapas[idx] || d.etapas[0];
  const temBasal = Array.isArray(d.basal) && d.basal.length > 0;
  const etapaTemLme = (etapa?.itens || []).some((it) => it.ceaf);
  const escore = escoreSugerido(id);
  const dxa = usaDxaFrax(id);
  const nomeEscore: Record<string, string> = { das28: 'DAS28', cdai: 'CDAI', basdai: 'BASDAI', asdas: 'ASDAS', sledai: 'SLEDAI', jadas: 'cJADAS' };

  const dados: string[] = [];
  const avaliacao: string[] = [];
  const ia: string[] = [];

  if (tipo === 'primeira') {
    dados.push('Primeira consulta: os exames costumam ser SOLICITADOS agora (ainda vão voltar). Anexe só o que o paciente já trouxer.');
    avaliacao.push('Foco na história (HDA) e nos antecedentes — grave a escuta e/ou dite.');
    avaliacao.push('Responda a anamnese guiada para apoiar a hipótese e ver os sinais de alarme.');
    if (temBasal) avaliacao.push('Adiante o pedido da avaliação pré-tratamento (TB, hepatites, HIV, vacinas).');
    ia.push('Gere o insight para confirmar a hipótese, os exames a pedir e a conduta inicial (ponte).');
    ia.push('Converse com a IA se tiver dúvida sobre o diagnóstico ou o que solicitar.');
  } else {
    dados.push('Retorno: revise os exames que voltaram — anexe o PDF/foto e a IA lança no gráfico.');
    if (idx > 0) avaliacao.push('Registre a resposta desde a última consulta (melhora, efeitos, adesão).');
    avaliacao.push('Reavalie com a anamnese guiada e a escuta da consulta.');
    if (etapaTemLme) avaliacao.push('Vai para imunossupressor/biológico? Confirme o rastreio no Passo 3 antes.');
    ia.push(`Gere o insight comparando com o protocolo e definindo o próximo passo/dose (${etapa?.label || 'fase atual'}).`);
    ia.push('Converse com a IA sobre o ajuste de conduta neste paciente.');
  }

  // Passo 3 — cálculos
  let calculos: Roteiro['calculos'];
  if (dxa) {
    calculos = {
      relevante: true, escore: null, dxa: true,
      nota: tipo === 'primeira'
        ? 'Leia a densitometria (DXA) e calcule o FRAX quando houver fator de risco — use o leitor abaixo.'
        : 'Releia a DXA/atualize o FRAX e verifique a resposta ao tratamento no leitor abaixo.',
    };
  } else if (escore) {
    calculos = {
      relevante: true, escore, dxa: false,
      nota: tipo === 'primeira'
        ? `Se já houver quadro/exames, calcule o ${nomeEscore[escore]} para registrar a atividade basal.`
        : `Calcule o ${nomeEscore[escore]} para medir a atividade e comparar com a consulta anterior.`,
    };
  } else if (SEM_ESCORE_NOTA[id]) {
    calculos = { relevante: false, escore: null, dxa: false, nota: SEM_ESCORE_NOTA[id] };
  } else {
    calculos = { relevante: false, escore: null, dxa: false, nota: 'Calcule algo apenas se fizer sentido para este caso.' };
  }
  if (etapaTemLme) {
    calculos.nota += ' Antes de biológico/imunossupressor, conclua o rastreio (TB, hepatites, HIV, vacinas) abaixo.';
    calculos.relevante = true;
  }

  const faseTxt = tipo === 'primeira' ? 'Primeira consulta' : 'Retorno';
  const resumo = `${faseTxt} — ${d.n}${etapa ? ` (${etapa.label})` : ''}.`;

  return { resumo, dados, avaliacao, calculos, ia };
}
