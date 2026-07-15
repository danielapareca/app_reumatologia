import type { QState } from './types';

// Alertas de segurança a partir do questionário de avaliação.
// Portado de computeFlags() de gerador_v3.html.
export function computeFlags(Q: QState): string[] {
  const f: string[] = [];
  if (Q.consulta === 'primeira')
    f.push('Primeira consulta: priorize sintomático (corticoide/AINE) e solicite exames. Defina o tratamento de base no retorno.');
  if (Q.gestacao === 'sim')
    f.push('Gestante/lactante: evite metotrexato, leflunomida, micofenolato e ciclofosfamida. Prefira opções compatíveis (hidroxicloroquina, sulfassalazina, azatioprina, corticoide na menor dose).');
  if (Q.renal === 'baixa')
    f.push('TFG < 30: AINEs contraindicados; metotrexato contraindicado; ajustar colchicina e alopurinol.');
  if (Q.hepato === 'alt' || Q.comorb.includes('hepato'))
    f.push('Transaminases elevadas / hepatopatia: cautela ou contraindicação a metotrexato, leflunomida e sulfassalazina.');
  if (Q.infec === 'sim')
    f.push('Infecção ativa ou rastreio TB/HBV pendente: não inicie imunossupressor/biológico até rastreio negativo ou TB latente tratada. Mantenha sintomático.');
  if (Q.comorb.includes('gi'))
    f.push('Úlcera / sangramento GI: evitar AINE ou associar inibidor de bomba de prótons.');
  if (Q.comorb.includes('icc'))
    f.push('ICC / cardiopatia: cautela com AINE e com anti-TNF em insuficiência cardíaca; avaliar risco com JAKi.');
  if (Q.comorb.includes('tb'))
    f.push('TB prévia: confirmar tratamento adequado antes de biológico/imunossupressor.');
  const al = (Q.alergia || '').trim();
  if (al) f.push('Alergia relatada: ' + al + '. Conferir cada item da receita.');
  return f;
}
