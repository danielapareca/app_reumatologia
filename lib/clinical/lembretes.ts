// Lembretes contextuais por doença — coisas que o Dr. Willian pediu para o app lembrar.
// Apoio ao médico: exibidos como avisos (não bloqueiam a conduta). O médico decide.

export interface Lembrete {
  txt: string;
  // 'frax' aparece com destaque (pedido específico do Dr. Willian: lembrar de calcular o FRAX)
  destaque?: boolean;
}

export const LEMBRETES: Record<string, Lembrete[]> = {
  osteoporose: [
    { txt: 'Calcular o FRAX quando houver fator de risco (T-score de osteopenia, fratura prévia, uso de corticoide, história familiar). Use a calculadora oficial e lance o percentual no leitor de DXA.', destaque: true },
    { txt: 'Avaliação odontológica antes de iniciar bisfosfonato/denosumabe (risco de osteonecrose de mandíbula).' },
    { txt: 'Corrigir vitamina D e cálcio antes e durante o tratamento; checar função renal (clearance) para escolher a droga.' },
    { txt: 'Denosumabe não pode ser suspenso sem substituição (risco de fraturas vertebrais em rebote) — programar a próxima dose.' },
    { txt: 'Rastrear causas secundárias em osteoporose grave/precoce (TSH, cálcio, PTH, 25-OH-vit D, eletroforese de proteínas).' },
  ],
  fmf: [
    { txt: 'Solicitar proteinúria (relação proteína/creatinina ou urina de 24h) periodicamente — vigilância de amiloidose AA.' },
    { txt: 'Manter colchicina mesmo assintomático e checar adesão; monitorar SAA/PCR/VHS (inflamação subclínica).' },
  ],
  sjogren: [
    { txt: 'Vigilância de linfoma MALT: examinar parótidas e linfonodos; atenção a queda de C4, crioglobulinemia e componente monoclonal.' },
    { txt: 'Orientar saúde bucal (cáries) e avaliação oftalmológica do olho seco.' },
  ],
  aij: [
    { txt: 'Encaminhar ao oftalmologista para rastreio de uveíte (assintomática) conforme subtipo e FAN — não adiar.' },
    { txt: 'Acompanhar crescimento/estatura e saúde óssea; cuidado com corticoide prolongado.' },
  ],
  les: [
    { txt: 'Reforçar fotoproteção e adesão à hidroxicloroquina; agendar avaliação oftalmológica de rastreio de retinopatia.' },
    { txt: 'Monitorar função renal e sedimento urinário (nefrite) a cada consulta.' },
  ],
  gota: [
    { txt: 'Alvo de ácido úrico < 6 mg/dL (< 5 se tofos). Iniciar profilaxia de crise ao começar hipouricemiante.' },
    { txt: 'Rever comorbidades (HAS, síndrome metabólica, DRC) e medicações que elevam o urato (diuréticos).' },
  ],
  ar: [
    { txt: 'Rastrear tuberculose e hepatites B/C antes de imunobiológico; atualizar vacinas (evitar vivas sob imunossupressão).' },
    { txt: 'Monitorar hemograma/transaminases sob metotrexato/leflunomida e prescrever ácido fólico.' },
  ],
  espondilite: [
    { txt: 'Rastrear TB e hepatites antes do anti-TNF; avaliar entesite, uveíte e doença inflamatória intestinal.' },
  ],
  psoriatica: [
    { txt: 'Rastrear TB e hepatites antes do imunobiológico; avaliar comprometimento cutâneo/ungueal e síndrome metabólica.' },
  ],
  esclerose: [
    { txt: 'Rastreio anual de hipertensão pulmonar (ecocardiograma) e doença pulmonar intersticial (TCAR/prova de função).' },
    { txt: 'Vigiar crise renal esclerodérmica (aferir PA); cautela com corticoide em dose alta.' },
  ],
  anca: [
    { txt: 'Profilaxia para pneumocystis sob imunossupressão intensa; monitorar função renal e sedimento urinário.' },
  ],
  acg: [
    { txt: 'Sob corticoide prolongado: profilaxia de osteoporose (cálcio/vit D ± bisfosfonato) e rastreio de aneurisma de aorta.' },
  ],
  takayasu: [
    { txt: 'Use imagem (angio-RM/angio-TC/PET) para avaliar atividade E dano — imagem positiva residual não equivale automaticamente a atividade (EULAR 2025).' },
    { txt: 'Afira a PA nos quatro membros e vigie sopros/assimetria de pulsos a cada consulta.' },
    { txt: 'Associe DMARD não biológico (MTX/azatioprina/leflunomida) em toda TAK ativa; refratária/recorrente → tocilizumabe ou anti-TNF.' },
    { txt: 'Rastrear TB e hepatites antes do imunossupressor; proteção óssea sob corticoide.' },
  ],
};

export function lembretesParaDoenca(id: string): Lembrete[] {
  return (id && LEMBRETES[id]) || [];
}
