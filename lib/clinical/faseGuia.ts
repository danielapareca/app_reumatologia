// Orientação por fase: o que o médico deve preencher/fazer em cada etapa.
// Derivado dos dados da doença (etapas, exames de confirmação e pré-tratamento)
// + tipo da consulta. Apoio — organiza o atendimento, não substitui o médico.

import { D } from './diseases';

export type ConsultaTipo = 'primeira' | 'retorno';

export interface FaseOpcao {
  id: string;      // id da etapa
  label: string;   // nome da etapa (ex.: "1ª linha — tratamento de base")
  sub?: string;    // subtítulo curto
  ordem: number;   // 1, 2, 3...
}

// Lista as fases (etapas) de uma doença, na ordem, para o assistente escolher.
export function fasesDaDoenca(id: string): FaseOpcao[] {
  const d = id ? D[id] : null;
  if (!d) return [];
  return d.etapas.map((e, i) => ({ id: e.id, label: e.label, sub: e.sub, ordem: i + 1 }));
}

// Etapa sugerida conforme o tipo de consulta (o médico pode trocar).
export function etapaSugerida(id: string, tipo: ConsultaTipo): string {
  const d = id ? D[id] : null;
  if (!d || !d.etapas.length) return '';
  if (tipo === 'retorno') {
    const base = d.etapas.find((e) => e.id === 'base');
    return (base || d.etapas[1] || d.etapas[0]).id;
  }
  return d.etapas[0].id;
}

// Orientação (o que preencher) para a fase escolhida.
export function guiaFase(id: string, etapaId: string, tipo: ConsultaTipo): string[] {
  const d = id ? D[id] : null;
  if (!d) return ['Escolha a doença para o app orientar o que preencher nesta fase.'];

  const idx = Math.max(0, d.etapas.findIndex((e) => e.id === etapaId));
  const etapa = d.etapas[idx] || d.etapas[0];
  const temBasal = Array.isArray(d.basal) && d.basal.length > 0;
  const temConf = Array.isArray(d.conf) && d.conf.length > 0;
  const etapaTemLme = (etapa?.itens || []).some((it) => it.ceaf);
  const g: string[] = [];

  if (tipo === 'primeira') {
    g.push('Registre a queixa e o tempo de evolução (HDA) e os antecedentes — dá para ditar por voz.');
    g.push('Responda a anamnese guiada da doença para ajustar a etapa e ver os alertas.');
    if (temConf) g.push('Solicite os exames de confirmação diagnóstica (já vêm pré-marcados).');
    if (temBasal) g.push('Adiante a avaliação pré-tratamento (TB, hepatites, HIV, vacinas) para não atrasar o início.');
    g.push('A receita desta fase é a inicial/sintomática (ponte) — revise as doses antes de assinar.');
    g.push('Anexe exames que o paciente trouxer (PDF ou foto) na Central de documentos.');
    return g;
  }

  // retorno
  g.push('Anexe os exames que voltaram (PDF ou foto) — a IA lança os valores no gráfico.');
  if (idx > 0) g.push('Registre a resposta da etapa anterior (melhora, efeitos, adesão) nas observações.');
  if (temBasal || etapaTemLme) g.push('Confira o rastreio pré-biológico (TB, hepatites B/C, HIV, vacinas) antes de imunossupressor.');
  g.push(`Defina o tratamento desta fase — ${etapa?.label || 'etapa atual'} — e ajuste a dose ao paciente (peso, função renal).`);
  g.push('Confira as interações com o que o paciente já usa (o app avisa na receita).');
  if (etapaTemLme) g.push('Itens marcados como LME exigem laudo (Componente Especializado) — confira a documentação.');
  return g;
}
