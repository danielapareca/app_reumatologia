// Central de sinais de alarme por doença (do documento do Dr. Willian + fundamentos).
// Apoio — o médico avalia. Sinais que exigem atenção/urgência.

export const RED_FLAGS: Record<string, string[]> = {
  ar: [
    'Monoartrite aguda febril: excluir ARTRITE SÉPTICA com artrocentese antes de qualquer imunossupressor.',
  ],
  reativa: [
    'Monoartrite febril: artrocentese para excluir artrite séptica antes de corticoide.',
  ],
  aij: [
    'Dor noturna intensa, criança que acorda chorando, dor desproporcional ao exame → afastar LEUCEMIA/neuroblastoma (esfregaço, LDH, ácido úrico; considerar mielograma).',
    'Febre com toxemia + monoartrite + recusa a deambular → artrite séptica / osteomielite.',
    'Perda de peso, sudorese noturna, massa palpável → neoplasia.',
    'Síndrome de Ativação Macrofágica (forma sistêmica) — EMERGÊNCIA: queda de VHS com PCR alta, ferritina muito elevada, citopenias, hipofibrinogenemia, hipertrigliceridemia, hepatoesplenomegalia.',
  ],
  sjogren: [
    'Vigilância de LINFOMA MALT: aumento persistente/recorrente de parótida, linfadenomegalia/esplenomegalia, púrpura palpável, C4 baixo, crioglobulinemia, componente monoclonal, ESSDAI persistentemente alto.',
  ],
  fmf: [
    'Proteinúria persistente → risco de AMILOIDOSE AA (indicar biópsia renal). Manter colchicina e controlar a inflamação subclínica (SAA/PCR/VHS).',
  ],
  acg: [
    'Sintomas visuais (amaurose, diplopia) ou claudicação de mandíbula → URGÊNCIA: corticoide imediato para prevenir cegueira.',
  ],
  anca: [
    'Hemoptise/hemorragia alveolar ou glomerulonefrite rapidamente progressiva → EMERGÊNCIA.',
  ],
  esclerose: [
    'Crise renal esclerodérmica (hipertensão grave de início súbito + lesão renal aguda) → EMERGÊNCIA: iniciar IECA.',
  ],
  les: [
    'Atividade grave (nefrite rapidamente progressiva, manifestação neuropsiquiátrica, citopenias graves) → avaliação urgente.',
  ],
  gota: [
    'Monoartrite aguda muito inflamatória: excluir artrite séptica (artrocentese) antes de assumir crise de gota.',
  ],
  sdcr: [
    'Início precoce da reabilitação muda o prognóstico — não imobilizar nem adiar.',
  ],
};

export function redFlagsParaDoenca(id: string): string[] {
  return (id && RED_FLAGS[id]) || [];
}
