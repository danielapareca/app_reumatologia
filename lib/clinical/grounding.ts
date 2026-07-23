// Base de conhecimento (grounding) — Reumatologia.
// GERADO a partir de data/grounding_reumatologia.json. Não editar à mão;
// regenerar a partir do JSON se a base for atualizada.
// Revisão da base: 2026-07 (rev. Dr. Willian). Apoio, não decisão. A IA deve citar a fonte e recomendar confirmar no PCDT/diretriz vigente.

export interface GroundingChunk {
  id: string;
  doenca: string;
  cid: string;
  topico: string;
  fonte: string;
  texto: string;
}

export const GROUNDING_META = {
  "titulo": "Base de conhecimento — Reumatologia (grounding para IA)",
  "revisao": "2026-07 (rev. Dr. Willian)",
  "aviso": "Apoio, não decisão. A IA deve citar a fonte e recomendar confirmar no PCDT/diretriz vigente."
};

export const GROUNDING: GroundingChunk[] = [
  {
    "id": "ia-01",
    "doenca": "Orientações IA",
    "cid": "—",
    "topico": "Papel e limites",
    "fonte": "Regra do app",
    "texto": "A IA é APOIO ao médico, nunca decisão. Não substitui o julgamento clínico. Toda sugestão de conduta ou dose deve vir dos chunks recuperados desta base; não inventar. Sempre recomendar confirmar no PCDT/diretriz vigente. Se não houver base suficiente nos chunks, dizer isso claramente e sugerir a avaliação/exame que faltou, em vez de adivinhar."
  },
  {
    "id": "ia-02",
    "doenca": "Orientações IA",
    "cid": "—",
    "topico": "Como responder",
    "fonte": "Regra do app",
    "texto": "Usar somente os chunks recuperados para a doença/tópico em questão + os dados do paciente. Citar a fonte (id do chunk e a referência) em cada afirmação relevante. Nunca citar dose que não esteja nos chunks. Linguagem objetiva e clínica."
  },
  {
    "id": "ia-03",
    "doenca": "Orientações IA",
    "cid": "—",
    "topico": "Formato do insight",
    "fonte": "Regra do app",
    "texto": "Estruturar a resposta em: (1) resumo da evolução do paciente; (2) pontos de atenção/alertas em destaque; (3) comparação da conduta com o protocolo; (4) sugestão de próximos passos (exames de monitorização, reavaliação); (5) fontes citadas. Marcar claramente que é apoio, não decisão."
  },
  {
    "id": "ia-04",
    "doenca": "Orientações IA",
    "cid": "—",
    "topico": "Segurança primeiro",
    "fonte": "Regra do app",
    "texto": "Se identificar sinal de alarme ou emergência (ver chunk fund-02), destacar no topo da resposta. Antes de sugerir imunossupressor/biológico, checar nos dados do paciente: gestação/lactação, função renal (TFG), hepatopatia/transaminases e infecção ativa ou rastreio TB/HBV pendente (ver chunks fund-03 e fund-04). Sinalizar contraindicações."
  },
  {
    "id": "ia-05",
    "doenca": "Orientações IA",
    "cid": "—",
    "topico": "Privacidade",
    "fonte": "Regra do app · LGPD",
    "texto": "A IA é chamada pelo servidor (a chave de API nunca fica no navegador). Não expor dados sensíveis do paciente além do necessário para o insight. O uso pressupõe consentimento do paciente e responsabilidade do médico pelos dados (LGPD)."
  },
  {
    "id": "fund-01",
    "doenca": "Fundamentos",
    "cid": "—",
    "topico": "Dor inflamatória vs mecânica",
    "fonte": "Protocolo de encaminhamento MS/TelessaúdeRS",
    "texto": "Padrão INFLAMATÓRIO: rigidez matinal > 30-60 min, melhora com o movimento, piora com o repouso, dor noturna, edema articular (sinovite). Padrão MECÂNICO/degenerativo: rigidez breve (< 30 min), piora com o uso e ao longo do dia, melhora com repouso, sem sinais inflamatórios sistêmicos. A distinção orienta se a suspeita é de doença inflamatória (encaminha/investiga autoanticorpos) ou degenerativa."
  },
  {
    "id": "fund-02",
    "doenca": "Fundamentos",
    "cid": "—",
    "topico": "Sinais de alarme (red flags)",
    "fonte": "Diretrizes de reumatologia (SBR/EULAR)",
    "texto": "Investigar com urgência: monoartrite aguda febril (excluir artrite séptica com artrocentese); febre + perda de peso + sudorese noturna (doença sistêmica/neoplasia); sintoma visual + cefaleia + claudicação de mandíbula em > 50 anos (arterite de células gigantes — corticoide imediato); hemoptise ou glomerulonefrite rapidamente progressiva (vasculite — emergência); fraqueza muscular proximal progressiva (miopatia — dosar CK)."
  },
  {
    "id": "fund-03",
    "doenca": "Fundamentos",
    "cid": "—",
    "topico": "Antes de imunossupressor/biológico",
    "fonte": "PCDTs MS · Recomendações de vacinação SBR 2025",
    "texto": "Rastreio obrigatório antes de iniciar imunossupressor ou biológico: tuberculose (PPD ou IGRA + radiografia de tórax), hepatite B (HBsAg, anti-HBc, anti-HBs), hepatite C (anti-HCV), HIV, e beta-HCG em mulheres em idade fértil. Não iniciar o imunossupressor com infecção ativa ou rastreio pendente. Atualizar vacinação antes (evitar vacinas de vírus vivo durante a imunossupressão)."
  },
  {
    "id": "fund-04",
    "doenca": "Fundamentos",
    "cid": "—",
    "topico": "Segurança na gestação e lactação",
    "fonte": "Diretrizes SBR/EULAR de gestação em doenças reumáticas",
    "texto": "Evitar na gestação/lactação: metotrexato, leflunomida, micofenolato e ciclofosfamida (teratogênicos). Opções geralmente compatíveis, conforme o caso: hidroxicloroquina, sulfassalazina, azatioprina, corticoide na menor dose eficaz e certos anti-TNF. Planejar a troca de esquema antes da concepção."
  },
  {
    "id": "fund-05",
    "doenca": "Fundamentos",
    "cid": "—",
    "topico": "Monitorização de metotrexato",
    "fonte": "PCDT Artrite Reumatoide · SBR",
    "texto": "Metotrexato: dose semanal (nunca diária), sempre com ácido fólico 48h após. Contraindicado em insuficiência renal (TFG < 30) e hepatopatia. Monitorizar hemograma e transaminases (TGO/TGP) periodicamente. Reforçar contracepção (teratogênico)."
  },
  {
    "id": "ar-exames",
    "doenca": "Artrite Reumatoide",
    "cid": "M05/M06",
    "topico": "Exames a solicitar",
    "fonte": "PCDT Artrite Reumatoide (Portaria Conjunta SAES/SCTIE nº 33, 19/01/2026) · critérios ACR/EULAR 2010 · SBR",
    "texto": "Exames para confirmação/avaliação inicial: Hemograma completo; VHS; PCR; Fator reumatoide (FR); Anti-CCP; TGO (AST); TGP (ALT); Creatinina; EAS (urina tipo I); Radiografia de mãos, punhos e pés (AP).\n\nAvaliação pré-tratamento (antes de imunossupressor): PPD ou IGRA; Radiografia de tórax (PA e perfil); HBsAg; Anti-HBc total; Anti-HBs; Anti-HCV; Anti-HIV; Beta-HCG (se potencial gestacional)."
  },
  {
    "id": "ar-trat-1",
    "doenca": "Artrite Reumatoide",
    "cid": "M05/M06",
    "topico": "Tratamento — Consulta inicial",
    "fonte": "PCDT Artrite Reumatoide (Portaria Conjunta SAES/SCTIE nº 33, 19/01/2026) · critérios ACR/EULAR 2010 · SBR",
    "texto": "Etapa: Consulta inicial (sintomático + solicitar exames).\n\n- Prednisona 20 mg: Tomar 1 comprimido por via oral 1x/dia pela manhã, em redução gradual, como ponte anti-inflamatória até o retorno.\n- Naproxeno 500 mg: Tomar 1 comprimido por via oral de 12/12h se dor, com protetor gástrico.\n\nObservação: Solicitar exames e reavaliar no retorno para definir o tratamento de base (DMARD)."
  },
  {
    "id": "ar-trat-2",
    "doenca": "Artrite Reumatoide",
    "cid": "M05/M06",
    "topico": "Tratamento — 1ª linha — tratamento de base",
    "fonte": "PCDT Artrite Reumatoide (Portaria Conjunta SAES/SCTIE nº 33, 19/01/2026) · critérios ACR/EULAR 2010 · SBR",
    "texto": "Etapa: 1ª linha — tratamento de base (no retorno com exames).\n\n- Metotrexato 2,5 mg: Tomar 6 comprimidos por via oral 1x/semana (15 mg/semana). Ajustar entre 7,5 e 25 mg/semana. Quantidade de referência: 24 comprimidos. [Exige LME — Componente Especializado.]\n- Ácido fólico 5 mg: Tomar 1 comprimido por via oral 1x/semana, 48h após o metotrexato. Quantidade de referência: 4 comprimidos. [Exige LME — Componente Especializado.]\n- Prednisona 10 mg: Em redução, como ponte até o metotrexato agir.\n\nObservação: Alternativas ao MTX: leflunomida 20 mg/dia OU sulfassalazina 2-3 g/dia. Combinar HCQ se necessário."
  },
  {
    "id": "ar-trat-3",
    "doenca": "Artrite Reumatoide",
    "cid": "M05/M06",
    "topico": "Tratamento — 2ª linha",
    "fonte": "PCDT Artrite Reumatoide (Portaria Conjunta SAES/SCTIE nº 33, 19/01/2026) · critérios ACR/EULAR 2010 · SBR",
    "texto": "Etapa: 2ª linha (falha do MMCDsc otimizado).\n\n- Combinação de MMCDsc: Metotrexato + Hidroxicloroquina + Sulfassalazina: Otimizar tripla terapia conforme tolerância. [Exige LME — Componente Especializado.]\n- OU biológico anti-TNF (adalimumabe, etanercepte, infliximabe, golimumabe, certolizumabe): Associado ao metotrexato. Exige rastreio infeccioso e LME. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "ar-trat-4",
    "doenca": "Artrite Reumatoide",
    "cid": "M05/M06",
    "topico": "Tratamento — 3ª linha",
    "fonte": "PCDT Artrite Reumatoide (Portaria Conjunta SAES/SCTIE nº 33, 19/01/2026) · critérios ACR/EULAR 2010 · SBR",
    "texto": "Etapa: 3ª linha (falha do biológico).\n\n- Trocar biológico (mudar de mecanismo: tocilizumabe, abatacepte, rituximabe): Conforme resposta e perfil. [Exige LME — Componente Especializado.]\n- OU inibidor de JAK (tofacitinibe, baricitinibe, upadacitinibe): Cautela: risco cardiovascular/trombótico. Associar ao MTX quando possível. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "aps-exames",
    "doenca": "Artrite Psoriásica",
    "cid": "M07",
    "topico": "Exames a solicitar",
    "fonte": "PCDT Artrite Psoriásica (Portaria Conjunta SAES/SCTIE nº 37, 21/01/2026) · critérios CASPAR · SBR",
    "texto": "Exames para confirmação/avaliação inicial: Hemograma completo; VHS; PCR; Fator reumatoide (FR); Anti-CCP; TGO (AST); TGP (ALT); Creatinina; Radiografia de mãos, pés e bacia.\n\nAvaliação pré-tratamento (antes de imunossupressor): PPD ou IGRA; Radiografia de tórax (PA e perfil); HBsAg; Anti-HBc total; Anti-HBs; Anti-HCV; Anti-HIV; Beta-HCG (se potencial gestacional)."
  },
  {
    "id": "aps-trat-1",
    "doenca": "Artrite Psoriásica",
    "cid": "M07",
    "topico": "Tratamento — Consulta inicial",
    "fonte": "PCDT Artrite Psoriásica (Portaria Conjunta SAES/SCTIE nº 37, 21/01/2026) · critérios CASPAR · SBR",
    "texto": "Etapa: Consulta inicial (sintomático + exames).\n\n- Naproxeno 500 mg: Tomar 1 comprimido por via oral de 12/12h, com protetor gástrico (artrite, entesite, dactilite).\n\nObservação: Evitar corticoide sistêmico prolongado (rebote cutâneo). Reavaliar no retorno."
  },
  {
    "id": "aps-trat-2",
    "doenca": "Artrite Psoriásica",
    "cid": "M07",
    "topico": "Tratamento — 1ª linha — tratamento de base",
    "fonte": "PCDT Artrite Psoriásica (Portaria Conjunta SAES/SCTIE nº 37, 21/01/2026) · critérios CASPAR · SBR",
    "texto": "Etapa: 1ª linha — tratamento de base (doença periférica).\n\n- Metotrexato 2,5 mg: Tomar 6 comprimidos por via oral 1x/semana (bom para pele e articulação). Quantidade de referência: 24 comprimidos. [Exige LME — Componente Especializado.]\n- Ácido fólico 5 mg: 1 comprimido por via oral 1x/semana, 48h após o metotrexato. Quantidade de referência: 4 comprimidos. [Exige LME — Componente Especializado.]\n\nObservação: Doença axial ou entesítica pura responde mal a MMCDsc: se ativa apesar de AINE, ir a biológico."
  },
  {
    "id": "aps-trat-3",
    "doenca": "Artrite Psoriásica",
    "cid": "M07",
    "topico": "Tratamento — 2ª linha — biológico",
    "fonte": "PCDT Artrite Psoriásica (Portaria Conjunta SAES/SCTIE nº 37, 21/01/2026) · critérios CASPAR · SBR",
    "texto": "Etapa: 2ª linha — biológico (falha ou doença axial).\n\n- Anti-TNF (adalimumabe, etanercepte, infliximabe, golimumabe, certolizumabe): Cobre pele, articulação, êntese e eixo axial. LME. [Exige LME — Componente Especializado.]\n- OU anti-IL-17 (secuquinumabe, ixequizumabe): Ótimo para pele e eixo axial. LME. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "aps-trat-4",
    "doenca": "Artrite Psoriásica",
    "cid": "M07",
    "topico": "Tratamento — 3ª linha",
    "fonte": "PCDT Artrite Psoriásica (Portaria Conjunta SAES/SCTIE nº 37, 21/01/2026) · critérios CASPAR · SBR",
    "texto": "Etapa: 3ª linha (troca de mecanismo).\n\n- Trocar de classe biológica ou apremilaste (doença leve): Conforme resposta. [Exige LME — Componente Especializado.]\n- OU inibidor de JAK (tofacitinibe, upadacitinibe): Cautela cardiovascular/trombótica. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "ea-exames",
    "doenca": "Espondiloartrite axial / Espondilite anquilosante",
    "cid": "M45",
    "topico": "Exames a solicitar",
    "fonte": "Critérios ASAS para espondiloartrite axial · SBR · Protocolo de encaminhamento MS/TelessaúdeRS",
    "texto": "Exames para confirmação/avaliação inicial: VHS; PCR; HLA-B27; Radiografia de bacia (sacroilíacas) e coluna lombar; Ressonância magnética de sacroilíacas (se radiografia normal).\n\nAvaliação pré-tratamento (antes de imunossupressor): PPD ou IGRA; Radiografia de tórax (PA e perfil); HBsAg; Anti-HBc total; Anti-HBs; Anti-HCV; Anti-HIV."
  },
  {
    "id": "ea-trat-1",
    "doenca": "Espondiloartrite axial / Espondilite anquilosante",
    "cid": "M45",
    "topico": "Tratamento — 1ª linha — AINE + fisioterapia",
    "fonte": "Critérios ASAS para espondiloartrite axial · SBR · Protocolo de encaminhamento MS/TelessaúdeRS",
    "texto": "Etapa: 1ª linha — AINE + fisioterapia (pilar do tratamento).\n\n- Naproxeno 500 mg: Tomar 1 comprimido por via oral de 12/12h de forma contínua, com protetor gástrico. Reavaliar em 2-4 semanas. Quantidade de referência: 60 comprimidos.\n- Fisioterapia / exercício: Encaminhamento para reabilitação axial (alongamento, McKenzie, hidroterapia).\n\nObservação: Solicitar exames para confirmação. Sulfassalazina só ajuda doença periférica."
  },
  {
    "id": "ea-trat-2",
    "doenca": "Espondiloartrite axial / Espondilite anquilosante",
    "cid": "M45",
    "topico": "Tratamento — Doença periférica",
    "fonte": "Critérios ASAS para espondiloartrite axial · SBR · Protocolo de encaminhamento MS/TelessaúdeRS",
    "texto": "Etapa: Doença periférica (se artrite periférica).\n\n- Sulfassalazina 500 mg: Tomar 2 comprimidos por via oral de 12/12h (2 g/dia). Sem efeito axial. Quantidade de referência: 120 comprimidos. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "ea-trat-3",
    "doenca": "Espondiloartrite axial / Espondilite anquilosante",
    "cid": "M45",
    "topico": "Tratamento — 2ª linha — biológico",
    "fonte": "Critérios ASAS para espondiloartrite axial · SBR · Protocolo de encaminhamento MS/TelessaúdeRS",
    "texto": "Etapa: 2ª linha — biológico (falha de ≥ 2 AINEs).\n\n- Anti-TNF (adalimumabe, etanercepte, infliximabe, golimumabe, certolizumabe): 1ª opção para doença axial refratária. LME. [Exige LME — Componente Especializado.]\n- OU anti-IL-17 (secuquinumabe): Axial e periférica. LME. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "ea-trat-4",
    "doenca": "Espondiloartrite axial / Espondilite anquilosante",
    "cid": "M45",
    "topico": "Tratamento — 3ª linha",
    "fonte": "Critérios ASAS para espondiloartrite axial · SBR · Protocolo de encaminhamento MS/TelessaúdeRS",
    "texto": "Etapa: 3ª linha (troca).\n\n- Trocar para outro anti-TNF, anti-IL-17 ou JAKi (upadacitinibe, tofacitinibe): Conforme resposta; cautela cardiovascular com JAKi. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "reativa-exames",
    "doenca": "Artrite Reativa",
    "cid": "M02",
    "topico": "Exames a solicitar",
    "fonte": "Protocolo de encaminhamento MS/TelessaúdeRS · SBR",
    "texto": "Exames para confirmação/avaliação inicial: Hemograma completo; VHS; PCR; Coprocultura; Pesquisa / PCR para Chlamydia trachomatis; HLA-B27; Anti-HIV; HBsAg; Anti-HCV; VDRL."
  },
  {
    "id": "reativa-trat-1",
    "doenca": "Artrite Reativa",
    "cid": "M02",
    "topico": "Tratamento — 1ª linha — sintomático",
    "fonte": "Protocolo de encaminhamento MS/TelessaúdeRS · SBR",
    "texto": "Etapa: 1ª linha — sintomático (+ tratar infecção).\n\n- Naproxeno 500 mg: Tomar 1 comprimido por via oral de 12/12h, com protetor gástrico. Quantidade de referência: 30 comprimidos.\n- Azitromicina 500 mg: Tomar 2 comprimidos por via oral em dose única (apenas se Chlamydia confirmada; tratar o parceiro). Quantidade de referência: 2 comprimidos.\n\nObservação: Artrocentese para excluir artrite séptica antes de corticoide. Antibiótico não melhora a artrite pós-entérica."
  },
  {
    "id": "reativa-trat-2",
    "doenca": "Artrite Reativa",
    "cid": "M02",
    "topico": "Tratamento — 2ª linha",
    "fonte": "Protocolo de encaminhamento MS/TelessaúdeRS · SBR",
    "texto": "Etapa: 2ª linha (curso arrastado > 3-6 meses).\n\n- Sulfassalazina 500 mg: Tomar 2 comprimidos por via oral de 12/12h (2 g/dia). Quantidade de referência: 120 comprimidos. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "reativa-trat-3",
    "doenca": "Artrite Reativa",
    "cid": "M02",
    "topico": "Tratamento — 3ª linha",
    "fonte": "Protocolo de encaminhamento MS/TelessaúdeRS · SBR",
    "texto": "Etapa: 3ª linha (refratária).\n\n- Anti-TNF: Como nas demais espondiloartrites, se doença persistente. LME. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "les-exames",
    "doenca": "Lúpus Eritematoso Sistêmico",
    "cid": "M32",
    "topico": "Exames a solicitar",
    "fonte": "PCDT Lúpus · critérios ACR/EULAR 2019 · Consenso SBR de nefrite lúpica",
    "texto": "Exames para confirmação/avaliação inicial: FAN (HEp-2); Anti-DNA nativo (dsDNA); Anti-Sm; Anti-Ro/SSA; Anti-La/SSB; Complemento C3; Complemento C4; Anticardiolipina IgG e IgM; Anti-beta-2-glicoproteína I IgG e IgM; Anticoagulante lúpico; Hemograma completo; Creatinina; EAS (urina tipo I); Relação proteína/creatinina urinária."
  },
  {
    "id": "les-trat-1",
    "doenca": "Lúpus Eritematoso Sistêmico",
    "cid": "M32",
    "topico": "Tratamento — Consulta inicial",
    "fonte": "PCDT Lúpus · critérios ACR/EULAR 2019 · Consenso SBR de nefrite lúpica",
    "texto": "Etapa: Consulta inicial (sintomático + base + exames).\n\n- Hidroxicloroquina 400 mg: Tomar 1 comprimido por via oral 1x/dia (≤ 5 mg/kg/dia). Base para todos; iniciar já. Quantidade de referência: 30 comprimidos. [Exige LME — Componente Especializado.]\n- Protetor solar FPS 50+: Aplicar em áreas expostas 2-3x/dia.\n- Prednisona 20 mg: Dose conforme atividade, na menor dose eficaz, se sintomas articulares/serosite.\n\nObservação: Solicitar exames. Avaliação oftalmológica basal (hidroxicloroquina)."
  },
  {
    "id": "les-trat-2",
    "doenca": "Lúpus Eritematoso Sistêmico",
    "cid": "M32",
    "topico": "Tratamento — Poupador de corticoide",
    "fonte": "PCDT Lúpus · critérios ACR/EULAR 2019 · Consenso SBR de nefrite lúpica",
    "texto": "Etapa: Poupador de corticoide (doença leve-moderada).\n\n- Hidroxicloroquina 400 mg: Manter 1 comprimido por via oral 1x/dia. Quantidade de referência: 30 comprimidos. [Exige LME — Componente Especializado.]\n- Azatioprina OU Metotrexato: Poupador conforme manifestação (articular/cutânea). [Exige LME — Componente Especializado.]"
  },
  {
    "id": "les-trat-3",
    "doenca": "Lúpus Eritematoso Sistêmico",
    "cid": "M32",
    "topico": "Tratamento — Doença grave / nefrite",
    "fonte": "PCDT Lúpus · critérios ACR/EULAR 2019 · Consenso SBR de nefrite lúpica",
    "texto": "Etapa: Doença grave / nefrite (indução — com especialista). [ATENÇÃO: etapa de alerta/emergência ou conduta com especialista.]\n\n- Corticoide (± pulso de metilprednisolona) + Micofenolato OU Ciclofosfamida: Indução de nefrite lúpica (classes III/IV/V). Encaminhamento/co-manejo. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "les-trat-4",
    "doenca": "Lúpus Eritematoso Sistêmico",
    "cid": "M32",
    "topico": "Tratamento — Refratária",
    "fonte": "PCDT Lúpus · critérios ACR/EULAR 2019 · Consenso SBR de nefrite lúpica",
    "texto": "Etapa: Refratária.\n\n- Rituximabe: Casos refratários. LME. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "sjogren-exames",
    "doenca": "Síndrome de Sjögren",
    "cid": "M35.0",
    "topico": "Exames a solicitar",
    "fonte": "Critérios ACR/EULAR 2016 · SBR",
    "texto": "Exames para confirmação/avaliação inicial: Anti-Ro/SSA; Anti-La/SSB; FAN; Fator reumatoide (FR); Hemograma completo; EAS (urina tipo I); Eletroforese de proteínas; Teste de Schirmer (solicitar à oftalmologia)."
  },
  {
    "id": "sjogren-trat-1",
    "doenca": "Síndrome de Sjögren",
    "cid": "M35.0",
    "topico": "Tratamento — 1ª linha — sintomático",
    "fonte": "Critérios ACR/EULAR 2016 · SBR",
    "texto": "Etapa: 1ª linha — sintomático (secura).\n\n- Lágrima artificial (carmelose/hipromelose): Instilar 1 gota em cada olho 4-6x/dia. Quantidade de referência: 1 frasco.\n- Saliva artificial / gel oral: Aplicar conforme necessidade, sobretudo antes das refeições e ao dormir. Quantidade de referência: 1 frasco.\n- Pilocarpina 5 mg: Tomar 1 comprimido por via oral de 6/6h se secura importante e função glandular residual. Cautela em asma, DPOC, glaucoma, cardiopatia. Quantidade de referência: 30 comprimidos."
  },
  {
    "id": "sjogren-trat-2",
    "doenca": "Síndrome de Sjögren",
    "cid": "M35.0",
    "topico": "Tratamento — Manifestação articular",
    "fonte": "Critérios ACR/EULAR 2016 · SBR",
    "texto": "Etapa: Manifestação articular (artralgia/artrite).\n\n- Hidroxicloroquina 400 mg: Tomar 1 comprimido por via oral 1x/dia. Quantidade de referência: 30 comprimidos. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "sjogren-trat-3",
    "doenca": "Síndrome de Sjögren",
    "cid": "M35.0",
    "topico": "Tratamento — Doença sistêmica grave",
    "fonte": "Critérios ACR/EULAR 2016 · SBR",
    "texto": "Etapa: Doença sistêmica grave (vasculite/neuro/renal). [ATENÇÃO: etapa de alerta/emergência ou conduta com especialista.]\n\n- Corticoide + imunossupressor (azatioprina/micofenolato) ou rituximabe: Casos selecionados, com especialista. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "esclerose-exames",
    "doenca": "Esclerose Sistêmica (Esclerodermia)",
    "cid": "M34",
    "topico": "Exames a solicitar",
    "fonte": "Critérios ACR/EULAR 2013 · SBR",
    "texto": "Exames para confirmação/avaliação inicial: FAN; Anticentrômero; Anti-Scl-70 (topoisomerase I); Anti-RNA-polimerase III; Capilaroscopia periungueal; Creatinina; EAS (urina tipo I); Tomografia de tórax de alta resolução; Espirometria com DLCO; Ecocardiograma com Doppler (PSAP)."
  },
  {
    "id": "esclerose-trat-1",
    "doenca": "Esclerose Sistêmica (Esclerodermia)",
    "cid": "M34",
    "topico": "Tratamento — Sintomático por domínio",
    "fonte": "Critérios ACR/EULAR 2013 · SBR",
    "texto": "Etapa: Sintomático por domínio (Raynaud + refluxo).\n\n- Nifedipino retard 20 mg: Tomar 1 comprimido por via oral de 12/12h (Raynaud). Titular conforme PA. Quantidade de referência: 60 comprimidos.\n- Omeprazol 40 mg: Tomar 1 comprimido por via oral 1x/dia em jejum (refluxo). Medidas antirrefluxo.\n\nObservação: Rastrear órgão-alvo (pulmão, coração, rim). Evitar corticoide em dose alta (risco de crise renal)."
  },
  {
    "id": "esclerose-trat-2",
    "doenca": "Esclerose Sistêmica (Esclerodermia)",
    "cid": "M34",
    "topico": "Tratamento — Doença de órgão",
    "fonte": "Critérios ACR/EULAR 2013 · SBR",
    "texto": "Etapa: Doença de órgão (pele / pulmão).\n\n- Metotrexato 2,5 mg (pele difusa inicial): 6 comprimidos por via oral 1x/semana + ácido fólico. Quantidade de referência: 24 comprimidos. [Exige LME — Componente Especializado.]\n- Micofenolato OU Ciclofosfamida (doença pulmonar intersticial): Conforme gravidade. Considerar nintedanibe (antifibrótico). [Exige LME — Componente Especializado.]"
  },
  {
    "id": "esclerose-trat-3",
    "doenca": "Esclerose Sistêmica (Esclerodermia)",
    "cid": "M34",
    "topico": "Tratamento — Crise renal / HAP",
    "fonte": "Critérios ACR/EULAR 2013 · SBR",
    "texto": "Etapa: Crise renal / HAP (emergência / especialista). [ATENÇÃO: etapa de alerta/emergência ou conduta com especialista.]\n\n- Crise renal: Captopril (IECA) imediato: Iniciar precocemente e internar. Reduz mortalidade.\n- HAP: terapia específica (inibidor de PDE-5, antagonista de endotelina, prostanoides): Com especialista. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "miopatias-exames",
    "doenca": "Miopatias Inflamatórias (dermato/polimiosite)",
    "cid": "M33",
    "topico": "Exames a solicitar",
    "fonte": "Critérios EULAR/ACR de miopatias inflamatórias · SBR",
    "texto": "Exames para confirmação/avaliação inicial: CK (creatinoquinase); Aldolase; TGO (AST); TGP (ALT); DHL; Eletroneuromiografia; Ressonância magnética de coxas; Anticorpos miosite-específicos (anti-Jo-1 e painel); Tomografia de tórax de alta resolução."
  },
  {
    "id": "miopatias-trat-1",
    "doenca": "Miopatias Inflamatórias (dermato/polimiosite)",
    "cid": "M33",
    "topico": "Tratamento — 1ª linha — corticoide",
    "fonte": "Critérios EULAR/ACR de miopatias inflamatórias · SBR",
    "texto": "Etapa: 1ª linha — corticoide (iniciar e investigar).\n\n- Prednisona 20 mg: Tomar 3 comprimidos por via oral 1x/dia pela manhã (0,5-1 mg/kg/dia). Pulso de metilprednisolona se doença grave. Quantidade de referência: 90 comprimidos.\n\nObservação: Solicitar exames e rastrear neoplasia. Força muscular é o melhor guia de resposta."
  },
  {
    "id": "miopatias-trat-2",
    "doenca": "Miopatias Inflamatórias (dermato/polimiosite)",
    "cid": "M33",
    "topico": "Tratamento — + poupador de corticoide",
    "fonte": "Critérios EULAR/ACR de miopatias inflamatórias · SBR",
    "texto": "Etapa: + poupador de corticoide.\n\n- Metotrexato 2,5 mg OU Azatioprina: Poupador precoce de corticoide (MTX: 6 comp/semana + ácido fólico). Quantidade de referência: 24 comprimidos. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "miopatias-trat-3",
    "doenca": "Miopatias Inflamatórias (dermato/polimiosite)",
    "cid": "M33",
    "topico": "Tratamento — 2ª linha",
    "fonte": "Critérios EULAR/ACR de miopatias inflamatórias · SBR",
    "texto": "Etapa: 2ª linha (refratária / DPI).\n\n- Imunoglobulina intravenosa (IVIG): Boa evidência, sobretudo na dermatomiosite e na disfagia. [Exige LME — Componente Especializado.]\n- OU Micofenolato (doença pulmonar): Conforme acometimento. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "miopatias-trat-4",
    "doenca": "Miopatias Inflamatórias (dermato/polimiosite)",
    "cid": "M33",
    "topico": "Tratamento — 3ª linha",
    "fonte": "Critérios EULAR/ACR de miopatias inflamatórias · SBR",
    "texto": "Etapa: 3ª linha.\n\n- Rituximabe ou Ciclofosfamida: Doença refratária / DPI grave. LME. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "saf-exames",
    "doenca": "Síndrome Antifosfolípide",
    "cid": "D68.6",
    "topico": "Exames a solicitar",
    "fonte": "Critérios de classificação de SAF (ACR/EULAR 2023) · SBR",
    "texto": "Exames para confirmação/avaliação inicial: Anticoagulante lúpico; Anticardiolipina IgG e IgM; Anti-beta-2-glicoproteína I IgG e IgM; (repetir os anticorpos em 12 semanas); Tempo de protrombina (TP); TTPa; Hemograma completo; FAN."
  },
  {
    "id": "saf-trat-1",
    "doenca": "Síndrome Antifosfolípide",
    "cid": "D68.6",
    "topico": "Tratamento — SAF trombótica",
    "fonte": "Critérios de classificação de SAF (ACR/EULAR 2023) · SBR",
    "texto": "Etapa: SAF trombótica (anticoagulação).\n\n- Varfarina: Dose ajustada para INR 2,0-3,0 (evento venoso). Controle seriado de INR. NÃO usar na gestação. Quantidade de referência: conforme INR.\n- AAS 100 mg: 1 comprimido por via oral 1x/dia (conforme cenário arterial / perfil)."
  },
  {
    "id": "saf-trat-2",
    "doenca": "Síndrome Antifosfolípide",
    "cid": "D68.6",
    "topico": "Tratamento — SAF obstétrica",
    "fonte": "Critérios de classificação de SAF (ACR/EULAR 2023) · SBR",
    "texto": "Etapa: SAF obstétrica (gestação).\n\n- AAS 100 mg + Heparina de baixo peso (enoxaparina): Na gestação. Converter varfarina para heparina antes de engravidar."
  },
  {
    "id": "saf-trat-3",
    "doenca": "Síndrome Antifosfolípide",
    "cid": "D68.6",
    "topico": "Tratamento — SAF catastrófica (CAPS)",
    "fonte": "Critérios de classificação de SAF (ACR/EULAR 2023) · SBR",
    "texto": "Etapa: SAF catastrófica (CAPS) (emergência). [ATENÇÃO: etapa de alerta/emergência ou conduta com especialista.]\n\n- Terapia tríplice: anticoagulação + pulso de corticoide + IVIG/plasmaférese: UTI. Mortalidade alta."
  },
  {
    "id": "pmr-exames",
    "doenca": "Polimialgia Reumática",
    "cid": "M35.3",
    "topico": "Exames a solicitar",
    "fonte": "Critérios EULAR/ACR 2012 de polimialgia reumática · SBR",
    "texto": "Exames para confirmação/avaliação inicial: VHS; PCR; Hemograma completo; TSH; CK (creatinoquinase); Fator reumatoide (FR); Anti-CCP."
  },
  {
    "id": "pmr-trat-1",
    "doenca": "Polimialgia Reumática",
    "cid": "M35.3",
    "topico": "Tratamento — 1ª linha — corticoide",
    "fonte": "Critérios EULAR/ACR 2012 de polimialgia reumática · SBR",
    "texto": "Etapa: 1ª linha — corticoide (resposta rápida confirma).\n\n- Prednisona 15 mg: Tomar 1 comprimido por via oral 1x/dia pela manhã (12,5-25 mg/dia). Desmame lento em meses. Quantidade de referência: 30 comprimidos.\n- Carbonato de cálcio 500 mg + vitamina D: Tomar 1 comprimido por via oral de 12/12h (profilaxia de osteoporose). Quantidade de referência: 60 comprimidos.\n\nObservação: Rastrear arterite de células gigantes (cefaleia, claudicação de mandíbula, sintoma visual)."
  },
  {
    "id": "pmr-trat-2",
    "doenca": "Polimialgia Reumática",
    "cid": "M35.3",
    "topico": "Tratamento — Poupador de corticoide",
    "fonte": "Critérios EULAR/ACR 2012 de polimialgia reumática · SBR",
    "texto": "Etapa: Poupador de corticoide (recaídas frequentes).\n\n- Metotrexato 2,5 mg: 6 comprimidos por via oral 1x/semana + ácido fólico. Quantidade de referência: 24 comprimidos. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "acg-exames",
    "doenca": "Arterite de Células Gigantes",
    "cid": "M31.6",
    "topico": "Exames a solicitar",
    "fonte": "Recomendações EULAR de arterite de células gigantes · SBR",
    "texto": "Exames para confirmação/avaliação inicial: VHS; PCR; Hemograma completo; Biópsia de artéria temporal; Ultrassom de artérias temporais (se disponível)."
  },
  {
    "id": "acg-trat-1",
    "doenca": "Arterite de Células Gigantes",
    "cid": "M31.6",
    "topico": "Tratamento — 1ª linha — corticoide IMEDIATO",
    "fonte": "Recomendações EULAR de arterite de células gigantes · SBR",
    "texto": "Etapa: 1ª linha — corticoide IMEDIATO (não aguardar biópsia). [ATENÇÃO: etapa de alerta/emergência ou conduta com especialista.]\n\n- Prednisona 20 mg: Tomar 2 a 3 comprimidos por via oral 1x/dia (40-60 mg/dia). Se sintoma visual: pulso hospitalar de metilprednisolona 1 g/dia EV por 3 dias. Quantidade de referência: conforme esquema.\n- AAS 100 mg: 1 comprimido por via oral 1x/dia, se sem contraindicação.\n- Carbonato de cálcio 500 mg + vitamina D: 1 comprimido por via oral de 12/12h. Quantidade de referência: 60 comprimidos."
  },
  {
    "id": "acg-trat-2",
    "doenca": "Arterite de Células Gigantes",
    "cid": "M31.6",
    "topico": "Tratamento — Poupador de corticoide",
    "fonte": "Recomendações EULAR de arterite de células gigantes · SBR",
    "texto": "Etapa: Poupador de corticoide.\n\n- Tocilizumabe OU Metotrexato: Reduz recaídas e dose de corticoide. LME (tocilizumabe). [Exige LME — Componente Especializado.]"
  },
  {
    "id": "anca-exames",
    "doenca": "Vasculites ANCA-associadas",
    "cid": "M31",
    "topico": "Exames a solicitar",
    "fonte": "PCDT/Diretrizes de vasculites associadas ao ANCA · EULAR · SBR",
    "texto": "Exames para confirmação/avaliação inicial: ANCA (IFI + anti-PR3 e anti-MPO); Hemograma completo; Creatinina; Ureia; EAS com sedimento urinário; Relação proteína/creatinina urinária; PCR; Tomografia de tórax; Tomografia de seios da face; Biópsia do órgão acometido."
  },
  {
    "id": "anca-trat-1",
    "doenca": "Vasculites ANCA-associadas",
    "cid": "M31",
    "topico": "Tratamento — Indução — com especialista",
    "fonte": "PCDT/Diretrizes de vasculites associadas ao ANCA · EULAR · SBR",
    "texto": "Etapa: Indução — com especialista (doença grave = internar). [ATENÇÃO: etapa de alerta/emergência ou conduta com especialista.]\n\n- Corticoide em dose alta (± pulso) + Rituximabe OU Ciclofosfamida: Indução de remissão. Plasmaférese em casos selecionados. Profilaxia para Pneumocystis. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "anca-trat-2",
    "doenca": "Vasculites ANCA-associadas",
    "cid": "M31",
    "topico": "Tratamento — Manutenção",
    "fonte": "PCDT/Diretrizes de vasculites associadas ao ANCA · EULAR · SBR",
    "texto": "Etapa: Manutenção.\n\n- Rituximabe (preferencial) OU Azatioprina/Metotrexato: Com desmame do corticoide. LME. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "gota-exames",
    "doenca": "Gota",
    "cid": "M10",
    "topico": "Exames a solicitar",
    "fonte": "Diretriz ACR 2020 de gota · Protocolo de encaminhamento MS/TelessaúdeRS · SBR",
    "texto": "Exames para confirmação/avaliação inicial: Ácido úrico; Creatinina; Ureia; Hemograma completo; Glicemia de jejum; Perfil lipídico; TGO (AST); TGP (ALT); Análise de líquido sinovial com pesquisa de cristais (se dúvida)."
  },
  {
    "id": "gota-trat-1",
    "doenca": "Gota",
    "cid": "M10",
    "topico": "Tratamento — Crise aguda",
    "fonte": "Diretriz ACR 2020 de gota · Protocolo de encaminhamento MS/TelessaúdeRS · SBR",
    "texto": "Etapa: Crise aguda (tratar a dor). [ATENÇÃO: etapa de alerta/emergência ou conduta com especialista.]\n\n- Colchicina 0,5 mg: Tomar 2 comprimidos por via oral agora + 1 após 1 hora; depois 1 comprimido 1-2x/dia. Ajustar/evitar em DRC e com estatinas/macrolídeos. Quantidade de referência: 20 comprimidos.\n- Naproxeno 500 mg (alternativa): 1 comprimido por via oral de 12/12h por 5-7 dias, com protetor gástrico. Quantidade de referência: 14 comprimidos.\n- Prednisona 20 mg (alternativa): 1-2 comprimidos por via oral 1x/dia com desmame em 5-10 dias. Quantidade de referência: conforme esquema.\n\nObservação: Não iniciar nem ajustar alopurinol na crise se o paciente ainda não usa."
  },
  {
    "id": "gota-trat-2",
    "doenca": "Gota",
    "cid": "M10",
    "topico": "Tratamento — Manutenção",
    "fonte": "Diretriz ACR 2020 de gota · Protocolo de encaminhamento MS/TelessaúdeRS · SBR",
    "texto": "Etapa: Manutenção (alvo ácido úrico < 6 (< 5 se tofo)).\n\n- Alopurinol 100 mg: 1 comprimido por via oral 1x/dia. Aumentar 100 mg a cada 2-4 semanas até o alvo (máx 800 mg/dia). Iniciar 2-4 semanas após a crise. Quantidade de referência: 30 comprimidos.\n- Colchicina 0,5 mg (profilaxia): 1 comprimido por via oral 1x/dia. Iniciar 1-2 semanas antes do alopurinol e manter 3-6 meses. Quantidade de referência: 30 comprimidos.\n\nObservação: Suspender alopurinol imediatamente se rash. Benzbromarona 25-100 mg/dia se não atingir alvo."
  },
  {
    "id": "pseudogota-exames",
    "doenca": "Artrite por Pirofosfato (Pseudogota)",
    "cid": "M11",
    "topico": "Exames a solicitar",
    "fonte": "Recomendações EULAR de artrite por pirofosfato de cálcio",
    "texto": "Exames para confirmação/avaliação inicial: Análise de líquido sinovial com pesquisa de cristais; Radiografia de joelhos, punhos e bacia (condrocalcinose); Cálcio; PTH; Ferritina; Saturação de transferrina; Magnésio; Fosfatase alcalina; TSH."
  },
  {
    "id": "pseudogota-trat-1",
    "doenca": "Artrite por Pirofosfato (Pseudogota)",
    "cid": "M11",
    "topico": "Tratamento — Crise aguda",
    "fonte": "Recomendações EULAR de artrite por pirofosfato de cálcio",
    "texto": "Etapa: Crise aguda (tratar a dor). [ATENÇÃO: etapa de alerta/emergência ou conduta com especialista.]\n\n- Naproxeno 500 mg: 1 comprimido por via oral de 12/12h por 5-7 dias, com protetor gástrico. Quantidade de referência: 14 comprimidos.\n- Colchicina 0,5 mg (alternativa): 1 comprimido por via oral 2-3x/dia. Quantidade de referência: 30 comprimidos.\n\nObservação: Excluir artrite séptica. Investigar causa secundária em < 55 anos."
  },
  {
    "id": "pseudogota-trat-2",
    "doenca": "Artrite por Pirofosfato (Pseudogota)",
    "cid": "M11",
    "topico": "Tratamento — Recorrente",
    "fonte": "Recomendações EULAR de artrite por pirofosfato de cálcio",
    "texto": "Etapa: Recorrente (profilaxia).\n\n- Colchicina 0,5 mg: 1 comprimido por via oral 1x/dia (profilaxia). Quantidade de referência: 30 comprimidos.\n\nObservação: Tratar hiperparatireoidismo, hemocromatose ou hipomagnesemia se presentes."
  },
  {
    "id": "osteoartrite-exames",
    "doenca": "Osteoartrite (Artrose)",
    "cid": "M15-M19",
    "topico": "Exames a solicitar",
    "fonte": "Diretrizes ACR/OARSI · Protocolo de encaminhamento MS/TelessaúdeRS",
    "texto": "Exames para confirmação/avaliação inicial: Radiografia da articulação acometida com carga (joelho/quadril); VHS, PCR e Fator reumatoide (apenas se dúvida com artrite inflamatória)."
  },
  {
    "id": "osteoartrite-trat-1",
    "doenca": "Osteoartrite (Artrose)",
    "cid": "M15-M19",
    "topico": "Tratamento — Tratamento",
    "fonte": "Diretrizes ACR/OARSI · Protocolo de encaminhamento MS/TelessaúdeRS",
    "texto": "Etapa: Tratamento (base não farmacológica + analgesia).\n\n- Paracetamol 750 mg: 1 comprimido por via oral até de 8/8h se dor. Quantidade de referência: 30 comprimidos.\n- Diclofenaco dietilamônio gel: Aplicar sobre a articulação 3x/dia. Quantidade de referência: 1 bisnaga.\n- Naproxeno 500 mg: 1 comprimido por via oral de 12/12h por curto período em dor moderada, com protetor gástrico. Quantidade de referência: 14 comprimidos.\n- Fisioterapia e fortalecimento: Programa de exercícios; orientar perda de peso (base do tratamento)."
  },
  {
    "id": "osteoartrite-trat-2",
    "doenca": "Osteoartrite (Artrose)",
    "cid": "M15-M19",
    "topico": "Tratamento — Dor crônica / refratária",
    "fonte": "Diretrizes ACR/OARSI · Protocolo de encaminhamento MS/TelessaúdeRS",
    "texto": "Etapa: Dor crônica / refratária.\n\n- Duloxetina 30 mg: 1 comprimido por via oral 1x/dia, titular a 60 mg (dor com componente central).\n- Infiltração intra-articular de corticoide: Para surtos de dor de joelho (efeito de curto prazo).\n\nObservação: Encaminhar à ortopedia se refratário a 6 meses, limitação importante ou deformidade (potencial artroplastia)."
  },
  {
    "id": "osteoporose-exames",
    "doenca": "Osteoporose",
    "cid": "M80/M81",
    "topico": "Exames a solicitar",
    "fonte": "PCDT/Diretrizes de osteoporose · Protocolo de encaminhamento",
    "texto": "Exames para confirmação/avaliação inicial: Densitometria óssea (coluna lombar e fêmur); Cálcio total e iônico; Fósforo; Creatinina; TGO (AST); TGP (ALT); 25-OH-vitamina D; PTH; TSH; Calciúria de 24 horas; Fosfatase alcalina; Radiografia de coluna torácica e lombar; Eletroforese de proteínas (se indicado)."
  },
  {
    "id": "osteoporose-trat-1",
    "doenca": "Osteoporose",
    "cid": "M80/M81",
    "topico": "Tratamento — Consulta inicial",
    "fonte": "PCDT/Diretrizes de osteoporose · Protocolo de encaminhamento",
    "texto": "Etapa: Consulta inicial (exames + repor base).\n\n- Carbonato de cálcio 500 mg + vitamina D: 1 comprimido por via oral de 12/12h. Quantidade de referência: 60 comprimidos.\n- Colecalciferol 7.000 UI: 1 unidade por via oral 1x/semana (repor conforme dosagem de vitamina D). Quantidade de referência: 4 unidades.\n\nObservação: Solicitar densitometria e exames. Corrigir vitamina D e cálcio antes do antirreabsortivo."
  },
  {
    "id": "osteoporose-trat-2",
    "doenca": "Osteoporose",
    "cid": "M80/M81",
    "topico": "Tratamento — 1ª linha — antirreabsortivo",
    "fonte": "PCDT/Diretrizes de osteoporose · Protocolo de encaminhamento",
    "texto": "Etapa: 1ª linha — antirreabsortivo (após exames).\n\n- Alendronato 70 mg: 1 comprimido por via oral 1x/semana, em jejum, com água, permanecendo em pé 30-60 min. Quantidade de referência: 4 comprimidos.\n- Carbonato de cálcio 500 mg + vitamina D: 1 comprimido por via oral de 12/12h. Quantidade de referência: 60 comprimidos.\n\nObservação: Hipocalcemia contraindica bisfosfonato. Uso ~5 anos, reavaliar (drug holiday)."
  },
  {
    "id": "osteoporose-trat-3",
    "doenca": "Osteoporose",
    "cid": "M80/M81",
    "topico": "Tratamento — 2ª linha / refratária",
    "fonte": "PCDT/Diretrizes de osteoporose · Protocolo de encaminhamento",
    "texto": "Etapa: 2ª linha / refratária (intolerância ou grave).\n\n- Ácido zoledrônico 5 mg EV 1x/ano OU Denosumabe 60 mg SC 6/6 meses OU Teriparatida: Intolerância oral, DRC ou doença grave. Teriparatida exige LME. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "fibromialgia-exames",
    "doenca": "Fibromialgia",
    "cid": "M79.7",
    "topico": "Exames a solicitar",
    "fonte": "Recomendações EULAR 2016 de fibromialgia · SBR",
    "texto": "Exames para confirmação/avaliação inicial: Hemograma completo; VHS; PCR; TSH; CK (creatinoquinase); 25-OH-vitamina D."
  },
  {
    "id": "fibromialgia-trat-1",
    "doenca": "Fibromialgia",
    "cid": "M79.7",
    "topico": "Tratamento — Tratamento",
    "fonte": "Recomendações EULAR 2016 de fibromialgia · SBR",
    "texto": "Etapa: Tratamento (não farmacológico + sintomático).\n\n- Amitriptilina 25 mg: Tomar 1 comprimido por via oral à noite (iniciar 12,5-25 mg). Melhora sono e dor. Quantidade de referência: 30 comprimidos.\n- Exercício aeróbico: Atividade aeróbica moderada 3x/semana (1ª linha). Higiene do sono.\n\nObservação: Evitar opioides. Corticoide/AINE não têm papel (doença não inflamatória)."
  },
  {
    "id": "fibromialgia-trat-2",
    "doenca": "Fibromialgia",
    "cid": "M79.7",
    "topico": "Tratamento — Alternativas",
    "fonte": "Recomendações EULAR 2016 de fibromialgia · SBR",
    "texto": "Etapa: Alternativas (conforme sintoma).\n\n- Duloxetina 30 mg: 1 comprimido por via oral 1x/dia, titular a 60 mg (dor e humor).\n- Pregabalina: Titular (dor e sono). Receituário de controle especial (B1).\n- Ciclobenzaprina 5-10 mg: À noite, para o sono."
  },
  {
    "id": "febre-exames",
    "doenca": "Febre Reumática",
    "cid": "I00-I02",
    "topico": "Exames a solicitar",
    "fonte": "Diretriz de Febre Reumática (SBC/SBP/SBR) · Ministério da Saúde",
    "texto": "Exames para confirmação/avaliação inicial: ASLO; Anti-DNAse B; Cultura de orofaringe (ou teste rápido para estreptococo); VHS; PCR; Hemograma completo; Eletrocardiograma; Ecocardiograma com Doppler."
  },
  {
    "id": "febre-trat-1",
    "doenca": "Febre Reumática",
    "cid": "I00-I02",
    "topico": "Tratamento — Tratamento",
    "fonte": "Diretriz de Febre Reumática (SBC/SBP/SBR) · Ministério da Saúde",
    "texto": "Etapa: Tratamento (erradicar estreptococo + artrite).\n\n- Penicilina G benzatina 1.200.000 UI: Aplicar por via intramuscular em dose única (600.000 UI se peso < 20 kg). Quantidade de referência: 1 ampola.\n- Naproxeno 500 mg: 1 comprimido por via oral de 12/12h (artrite), com protetor gástrico. Quantidade de referência: 30 comprimidos.\n\nObservação: Cardite moderada/grave: corticoide. Acompanhamento cardiológico é central."
  },
  {
    "id": "febre-trat-2",
    "doenca": "Febre Reumática",
    "cid": "I00-I02",
    "topico": "Tratamento — Profilaxia secundária",
    "fonte": "Diretriz de Febre Reumática (SBC/SBP/SBR) · Ministério da Saúde",
    "texto": "Etapa: Profilaxia secundária (essencial). [ATENÇÃO: etapa de alerta/emergência ou conduta com especialista.]\n\n- Penicilina G benzatina 1.200.000 UI: Aplicar por via intramuscular a cada 21 dias. Duração conforme presença/gravidade de cardite. Quantidade de referência: aplicação seriada."
  },
  {
    "id": "chikungunya-exames",
    "doenca": "Artropatia por Chikungunya",
    "cid": "A92.0",
    "topico": "Exames a solicitar",
    "fonte": "Protocolo do Ministério da Saúde para chikungunya · SBR",
    "texto": "Exames para confirmação/avaliação inicial: RT-PCR para chikungunya (na 1ª semana) ou Sorologia IgM/IgG; Hemograma completo; VHS; PCR; Fator reumatoide e Anti-CCP (na fase crônica)."
  },
  {
    "id": "chikungunya-trat-1",
    "doenca": "Artropatia por Chikungunya",
    "cid": "A92.0",
    "topico": "Tratamento — Fase aguda",
    "fonte": "Protocolo do Ministério da Saúde para chikungunya · SBR",
    "texto": "Etapa: Fase aguda (evitar AINE/AAS até excluir dengue). [ATENÇÃO: etapa de alerta/emergência ou conduta com especialista.]\n\n- Paracetamol 750 mg: 1 comprimido por via oral até de 6/6h se dor/febre. Quantidade de referência: 30 comprimidos.\n- Dipirona 1 g: 1 comprimido por via oral até de 6/6h se dor/febre. Reforçar hidratação. Quantidade de referência: 20 comprimidos.\n\nObservação: Não usar AINE nem AAS enquanto dengue não excluída (risco de sangramento)."
  },
  {
    "id": "chikungunya-trat-2",
    "doenca": "Artropatia por Chikungunya",
    "cid": "A92.0",
    "topico": "Tratamento — Fase subaguda / crônica",
    "fonte": "Protocolo do Ministério da Saúde para chikungunya · SBR",
    "texto": "Etapa: Fase subaguda / crônica (dengue já excluída).\n\n- Naproxeno 500 mg: 1 comprimido por via oral de 12/12h, com protetor gástrico. Quantidade de referência: 30 comprimidos.\n- Metotrexato 2,5 mg (artropatia crônica): Considerar 6 comp/semana + ácido fólico, conduzido pela reumatologia. Quantidade de referência: 24 comprimidos. [Exige LME — Componente Especializado.]"
  },
  {
    "id": "crit-ar",
    "doenca": "Artrite Reumatoide",
    "cid": "M05/M06",
    "topico": "Critérios ACR/EULAR 2010 (escore)",
    "fonte": "Critérios 2010 ACR/EULAR (reproduzidos no PCDT de AR)",
    "texto": "Somar 4 domínios; classificação de AR se total >= 6 (em paciente com >= 1 articulação com sinovite e sem diagnóstico alternativo melhor):\n- Articulações: 1 grande = 0; 2-10 grandes = 1; 1-3 pequenas = 2; 4-10 pequenas = 3; > 10 (>= 1 pequena) = 5.\n- Sorologia (FR/anti-CCP): negativos = 0; positivo baixo = 2; positivo alto = 3.\n- Provas inflamatórias (VHS/PCR): normais = 0; elevadas = 1.\n- Duração dos sintomas: < 6 semanas = 0; >= 6 semanas = 1."
  },
  {
    "id": "osteoporose-diag",
    "doenca": "Osteoporose",
    "cid": "M81",
    "topico": "Diagnóstico (3 caminhos)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Diagnóstico por qualquer um dos três caminhos independentes: (1) Densitométrico — T-score ≤ -2,5 em coluna lombar, colo femoral, fêmur total ou rádio 33%. (2) Clínico — fratura por fragilidade de quadril ou vértebra, independente do T-score. (3) Risco — osteopenia (T entre -1,0 e -2,5) com FRAX acima do limiar de intervenção. Sempre rastrear causa secundária (corticoterapia, hiperpara, hipertireoidismo, hipogonadismo, mieloma, doença celíaca, DRC, AR, inibidor de aromatase, anticonvulsivante, IBP crônico, heparina) antes de rotular como primária."
  },
  {
    "id": "osteoporose-dxa",
    "doenca": "Osteoporose",
    "cid": "M81",
    "topico": "Leitor de densitometria (DXA)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "T-score compara com adulto jovem do mesmo sexo (usar em mulheres pós-menopausa e homens ≥ 50 anos). Classificação OMS: ≥ -1,0 normal; entre -1,1 e -2,4 osteopenia; ≤ -2,5 osteoporose; ≤ -2,5 com fratura por fragilidade = osteoporose estabelecida/grave. Z-score compara com a mesma idade/sexo (usar em pré-menopausa, homens < 50, crianças): Z ≤ -2,0 = massa óssea abaixo do esperado para a idade (investigar secundária); nesses grupos não se usa a palavra osteoporose só pela DXA. Regras: usar o MENOR T-score entre sítios válidos (L1-L4 com ≥ 2 vértebras avaliáveis, colo femoral, fêmur total, rádio 33%); não usar triângulo de Ward nem trocânter isolado; excluir vértebra com fratura/artefato/cirurgia ou que difira > 1,0 DP das adjacentes; não comparar aparelhos diferentes (comparação válida só pelo valor absoluto em g/cm²); variação só é real se > menor mudança significativa do serviço (LSC, ~0,03 g/cm² na coluna). OA avançada, escoliose, calcificação aórtica e artefatos elevam falsamente a DMO da coluna — priorizar o fêmur. TBS agrega microarquitetura e pode entrar no FRAX."
  },
  {
    "id": "osteoporose-risco",
    "doenca": "Osteoporose",
    "cid": "M81",
    "topico": "Estratificação de risco",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Antes de escolher a droga, estratificar: ALTO risco = T-score ≤ -2,5 sem fratura, ou FRAX acima do limiar. MUITO ALTO risco = fratura recente (12–24 meses), múltiplas fraturas, fratura em vigência de tratamento, T-score ≤ -3,0, corticoide em dose alta, ou risco elevado de queda. Isso define se começa por antirreabsortivo (alto) ou por anabólico (muito alto)."
  },
  {
    "id": "osteoporose-trat-antirreab",
    "doenca": "Osteoporose",
    "cid": "M81",
    "topico": "Tratamento — alto risco (antirreabsortivo)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Base para qualquer esquema: cálcio 1000–1200 mg/dia (dieta + suplemento, priorizar dieta) e vitamina D 800–2000 UI/dia (alvo 25-OH-vit D > 30 ng/mL). Primeira linha no alto risco: Alendronato 70 mg/semana VO em jejum, copo cheio de água, permanecer em pé/sentado por 30 min; ou Risedronato 35 mg/semana ou 150 mg/mês; ou Ácido zoledrônico 5 mg IV 1x/ano (útil em intolerância gástrica, má adesão, pós-fratura de quadril); ou Denosumabe 60 mg SC a cada 6 meses (preferir se TFG < 30 mL/min ou intolerância a bifosfonato). Não farmacológico para todos: exercício resistido e de impacto, treino de equilíbrio, cessar tabagismo, reduzir álcool, prevenção de quedas, correção visual."
  },
  {
    "id": "osteoporose-trat-anab",
    "doenca": "Osteoporose",
    "cid": "M81",
    "topico": "Tratamento — muito alto risco (anabólico)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Muito alto risco: anabólico primeiro, depois antirreabsortivo. Teriparatida 20 mcg SC/dia por até 24 meses; ou Romosozumabe 210 mg SC/mês por 12 meses (NÃO usar se infarto ou AVC no último ano). Ao terminar o anabólico é OBRIGATÓRIO sequenciar com bifosfonato ou denosumabe, sob risco de perda rápida do ganho. Outras opções: Raloxifeno 60 mg/dia (mulher mais jovem na pós-menopausa com risco vertebral e risco de câncer de mama; contraindicado se tromboembolismo); terapia hormonal apenas próximo da menopausa com sintomas vasomotores e sem contraindicação."
  },
  {
    "id": "osteoporose-seguranca",
    "doenca": "Osteoporose",
    "cid": "M81",
    "topico": "Segurança e monitoramento",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Contraindicações dos bifosfonatos: TFG < 30–35 mL/min, hipocalcemia não corrigida, doença esofágica com retardo de esvaziamento, incapacidade de ficar ereto por 30 min (orais). DENOSUMABE não pode ser interrompido sem transição para bifosfonato — a suspensão isolada causa rebote com fraturas vertebrais múltiplas. Avaliação odontológica antes de iniciar e evitar procedimentos invasivos durante o uso (osteonecrose de mandíbula). Orientar sobre dor em coxa/quadril insidiosa (fratura atípica de fêmur). Corrigir vitamina D e cálcio antes da 1ª dose de zoledronato ou denosumabe (hipocalcemia). Férias terapêuticas: considerar após 5 anos de bifosfonato oral ou 3 anos de zoledronato se saiu do alto risco (não se aplica a denosumabe). Falha: nova fratura após 12 meses com boa adesão, ou perda de DMO acima do LSC — investigar adesão, absorção, causa secundária e trocar de classe."
  },
  {
    "id": "sjogren-diag",
    "doenca": "Síndrome de Sjögren",
    "cid": "M35.0",
    "topico": "Diagnóstico (ACR/EULAR 2016)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Critérios ACR/EULAR 2016 — soma ≥ 4 classifica. Pesos: biópsia de glândula salivar menor com sialadenite linfocítica focal e focus score ≥ 1 (3 pts); anti-Ro/SSA positivo (3 pts); Ocular Staining Score ≥ 5 (ou van Bijsterveld ≥ 4) em ≥ 1 olho (1 pt); Schirmer ≤ 5 mm/5 min em ≥ 1 olho (1 pt); fluxo salivar não estimulado ≤ 0,1 mL/min (1 pt). Critério de entrada: ≥ 1 sintoma de olho ou boca seca > 3 meses, ou suspeita pelo ESSDAI. Exclusões que impedem classificar: radioterapia de cabeça/pescoço, hepatite C ativa (PCR), HIV, sarcoidose, amiloidose, doença do enxerto contra hospedeiro, doença relacionada a IgG4."
  },
  {
    "id": "sjogren-imagem-biopsia",
    "doenca": "Síndrome de Sjögren",
    "cid": "M35.0",
    "topico": "Imagem e biópsia",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Ultrassom de glândulas salivares maiores: exame inicial de escolha, não invasivo (heterogeneidade, áreas hipoecoicas; score OMERACT ≥ 2 sugestivo). RM de parótidas: padrão sal e pimenta; indicada se aumento persistente/assimétrico e suspeita de linfoma. Biópsia de glândula salivar menor (lábio inferior) é o padrão do critério histológico — indicada com quadro sugestivo e anti-Ro negativo ou diagnóstico indefinido; retirar 4–6 lóbulos (área ≥ 8 mm²), solicitar focus score explicitamente; positivo = sialadenite linfocítica focal com focus score ≥ 1. Não biopsiar mucosa inflamada/operada. PAAF/biópsia de parótida se aumento endurecido/assimétrico com suspeita de linfoma MALT (enviar para imuno-histoquímica e clonalidade)."
  },
  {
    "id": "sjogren-trat",
    "doenca": "Síndrome de Sjögren",
    "cid": "M35.0",
    "topico": "Tratamento",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Oculares: 1ª linha lágrimas artificiais sem conservantes + gel/pomada à noite e medidas ambientais; 2ª linha ciclosporina colírio 0,05%, corticoide tópico curto, oclusão de ponto lacrimal; 3ª linha soro autólogo, lente escleral. Orais: higiene rigorosa, flúor, revisão odontológica 6/6m, estimulação (goma sem açúcar, xilitol), saliva artificial; secretagogos pilocarpina 5 mg 3–4x/dia ou cevimelina 30 mg 3x/dia (contraindicados em asma não controlada, glaucoma de ângulo fechado, bradiarritmia). Sistêmico (EULAR 2020): hidroxicloroquina 5 mg/kg/dia (artralgia, fadiga, cutâneo; oftalmo anual após 5 anos); glicocorticoide na menor dose/tempo; poupadores (metotrexato, azatioprina, micofenolato, leflunomida) conforme órgão; rituximabe para manifestações graves/refratárias (vasculite crioglobulinêmica, neuropatia, DPI progressiva, citopenias); ciclofosfamida em vasculite grave."
  },
  {
    "id": "sjogren-linfoma",
    "doenca": "Síndrome de Sjögren",
    "cid": "M35.0",
    "topico": "Vigilância de linfoma (alerta)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Risco de linfoma MALT ~5–10x maior que na população geral. SINAL DE ALARME — sinalizar quando houver: aumento persistente/recorrente de parótida; linfadenomegalia ou esplenomegalia; púrpura palpável/vasculite cutânea; C4 baixo, crioglobulinemia ou componente monoclonal; linfopenia com queda de imunoglobulinas antes elevadas; ESSDAI persistentemente alto. Investigar com imagem e biópsia."
  },
  {
    "id": "osteoartrite-def",
    "doenca": "Osteoartrite",
    "cid": "M19",
    "topico": "Definição e inflamm-aging",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Doença de toda a articulação como órgão (cartilagem, osso subcondral, sinóvia, meniscos, ligamentos, cápsula, músculo), não só desgaste. Desequilíbrio entre agressão mecânica e reparo, com metaloproteinases, IL-1β, IL-6, TNF-α. Fenótipos: pós-traumático, metabólico, relacionado à idade, dor centralizada, inflamatório (erosivo de mãos). Inflamm-aging: inflamação crônica sistêmica de baixo grau do envelhecimento (IL-6, TNF-α, PCR-us, IL-1β elevados discretamente) por senescência celular (SASP), disfunção mitocondrial, gordura visceral (adipocinas), disbiose e imunossenescência. Consequência prática: abordar a OA também como doença metabólico-inflamatória — peso, atividade física, sono, controle glicêmico e cessar tabagismo impactam esse eixo."
  },
  {
    "id": "osteoartrite-trat",
    "doenca": "Osteoartrite",
    "cid": "M19",
    "topico": "Tratamento (núcleo)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Núcleo para todos: educação e automanejo (dor não significa destruição inevitável); exercício terapêutico (1ª linha, maior evidência — fortalecimento + aeróbico + equilíbrio, manutenção a longo prazo); perda de peso se IMC elevado (5–10% já melhora); fisioterapia/terapia manual adjuvante; bengala no lado contralateral; palmilhas/órteses selecionadas (órtese de base do polegar na rizartrose tem boa evidência); abordagem do sono, humor e dor centralizada (TCC quando indicado). AINE tópico/oral e analgésicos conforme dor, pelo menor tempo, respeitando risco."
  },
  {
    "id": "osteoartrite-nao-indicado",
    "doenca": "Osteoartrite",
    "cid": "M19",
    "topico": "Não indicado / contraindicado",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "NÃO recomendados/contraindicados na OA: PRP, células-tronco e biológicos intra-articulares fora de pesquisa; artroscopia com lavagem/desbridamento no joelho; meniscectomia parcial de rotina em lesão degenerativa; glicocorticoide sistêmico oral; metotrexato, hidroxicloroquina e biológicos imunomoduladores (inclusive na forma erosiva de mãos); colchicina; repouso prolongado/imobilização (pioram). Cautela especial com AINE oral em DRC TFG < 30, IC, coronariopatia, HAS não controlada, cirrose com ascite, úlcera/sangramento prévio, anticoagulante."
  },
  {
    "id": "ea-sacro-suspeita",
    "doenca": "Espondiloartrite axial / Sacroileíte",
    "cid": "M46.1",
    "topico": "Quando suspeitar (lombalgia inflamatória)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Gatilho é a lombalgia inflamatória. Suspeitar (ASAS) com dor lombar crônica e ≥ 4 de 5: início < 45 anos; início insidioso; melhora com exercício; não melhora com repouso; dor noturna com melhora ao levantar. Somam-se: duração > 3 meses, rigidez matinal > 30 min, dor alternante em nádegas, boa resposta a AINE em 24–48h. Reforçam a suspeita: entesite (Aquiles, fáscia plantar), dactilite, uveíte anterior aguda recorrente, psoríase, DII, história familiar de espondiloartrite/psoríase/uveíte/DII, artrite periférica assimétrica de MMII, HLA-B27, VHS/PCR elevados, antecedente de infecção GU/entérica (reativa). Diferenciais não inflamatórios: sacroileíte infecciosa (piogênica, TB, brucelose), fratura de insuficiência, osteíte condensante do ílio, degenerativa, gravídica."
  },
  {
    "id": "ea-sacro-imagem",
    "doenca": "Espondiloartrite axial / Sacroileíte",
    "cid": "M46.1",
    "topico": "Diagnóstico e imagem",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Exame físico: testes de provocação sacroilíaca (Patrick/FABERE, Gaenslen, compressão/distração, Mennell) ganham valor com ≥ 2 positivos; mobilidade axial (Schober modificado, expansão torácica normal > 5 cm, occipito-parede) compõe o BASMI. Imagem: Rx de bacia AP é o 1º exame (Nova York modificada 0–4; sacroileíte radiográfica = grau ≥ 2 bilateral ou ≥ 3 unilateral — leva anos para aparecer). RM de sacroilíacas (STIR/T2 sat gordura) é a escolha na fase precoce: define sacroileíte ativa pelo edema de medula óssea subcondral (≥ 2 lesões num corte ou 1 lesão em 2 cortes) e permite diagnosticar EpA axial não radiográfica. TC para dano estrutural quando Rx duvidosa e RM indisponível. Cintilografia NÃO deve ser usada (baixa especificidade). Laboratório: VHS/PCR (podem ser normais), HLA-B27 (integra ASAS, não isolado). Antes de biológico: PPD/IGRA + Rx tórax, sorologias HBV/HCV/HIV, vacinação."
  },
  {
    "id": "ea-sacro-trat",
    "doenca": "Espondiloartrite axial / Sacroileíte",
    "cid": "M46.1",
    "topico": "Tratamento (ASAS-EULAR)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Não farmacológico é pilar: exercício estruturado (alongamento, mobilidade axial, fortalecimento, aeróbico), fisioterapia supervisionada, hidroterapia, CESSAR TABAGISMO (associado a maior atividade e dano), controle de peso e risco CV. Farmacológico: AINE em dose plena é 1ª linha — testar ≥ 2 AINEs, cada um 2–4 semanas; uso contínuo é preferível ao sob demanda na doença persistentemente ativa. DMARD sintético (sulfassalazina, metotrexato) NÃO tem eficácia axial (sulfassalazina só para artrite periférica). Falha de 2 AINEs com doença ativa (ASDAS ≥ 2,1 ou BASDAI ≥ 4) indica biológico: 1ª escolha anti-TNF ou anti-IL-17. Preferir anti-TNF monoclonal (adalimumabe, infliximabe, certolizumabe, golimumabe) se uveíte recorrente ou DII (etanercepte não é eficaz para essas); evitar anti-IL-17 (secuquinumabe, ixequizumabe) se DII. JAKi (upadacitinibe, tofacitinibe) após falha de biológico (atenção risco CV/trombótico/neoplásico > 65 anos, tabagista). Em remissão sustentada, considerar reduzir dose do biológico, não suspender."
  },
  {
    "id": "osteoporose-exames-w",
    "doenca": "Osteoporose",
    "cid": "M81",
    "topico": "Exames detalhados (1ª consulta)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "DXA de coluna lombar + fêmur proximal (+ rádio 33% se obesidade acima do limite da mesa, hiperpara primário ou sítios não avaliáveis). Rx coluna T/L em perfil ou VFA se perda de altura > 4 cm, dor dorsal, cifose ou corticoide crônico. Labs: hemograma, cálcio total + albumina (ou iônico), fósforo, magnésio, creatinina/TFG, fosfatase alcalina, 25-OH-vit D, PTH, TSH, VHS/PCR, eletroforese de proteínas, calciúria 24h, testosterona total (homens). Conforme suspeita: anti-transglutaminase IgA + IgA total, cortisol livre urinário/supressão, triptase, ferritina, função hepática."
  },
  {
    "id": "osteoartrite-exames-w",
    "doenca": "Osteoartrite",
    "cid": "M19",
    "topico": "Exames para diferencial",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Diagnóstico clínico. Laboratório apenas para diferencial (hemograma, VHS, PCR, FR, anti-CCP, ácido úrico, ferritina — normais na OA). Líquido sinovial se derrame/dúvida: não inflamatório (< 2.000 leucócitos/mm³, sem cristais, cultura negativa). Antes de AINE crônico: creatinina/TFG, hemograma, PA e revisão de risco CV/GI."
  },
  {
    "id": "miofascial-diag",
    "doenca": "Síndrome da Dor Miofascial",
    "cid": "M79.1",
    "topico": "Diagnóstico",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Diagnóstico clínico (sem exame confirmatório). Dor regional profunda e contínua, restrita a um músculo/grupo. Achado central: PONTO-GATILHO — nódulo hipersensível dentro de banda tensa palpável, cuja compressão reproduz a dor referida característica do paciente. A dor referida é reprodutível e NÃO segue dermátomo nem território de nervo. Sinal do pulo (jump sign) e resposta de contração local (twitch). Amplitude reduzida e alongamento doloroso. Ponto ativo dói espontaneamente; ponto latente só à palpação. Diferenciar de fibromialgia (dor difusa bilateral, fadiga, sono/cognição, sem dor referida em padrão definido) — podem coexistir."
  },
  {
    "id": "miofascial-fatores",
    "doenca": "Síndrome da Dor Miofascial",
    "cid": "M79.1",
    "topico": "Fatores perpetuantes",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Investigar antes de rotular como refratária: postura/ergonomia, discrepância de MMII, escoliose; hipotireoidismo, deficiência de vitamina D, B12, ferro, magnésio; distúrbio do sono, apneia, ansiedade/depressão; sobrecarga esportiva/ocupacional e microtrauma repetitivo. Corrigir os fatores identificados."
  },
  {
    "id": "miofascial-trat",
    "doenca": "Síndrome da Dor Miofascial",
    "cid": "M79.1",
    "topico": "Tratamento",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Base não farmacológica: alongamento do músculo, spray e alongamento, liberação por pressão isquêmica, fisioterapia com correção postural, exercício aeróbico + fortalecimento, termoterapia, TENS, agulhamento a seco (dry needling), e correção dos fatores perpetuantes. Farmacológico: injeção de ponto-gatilho com lidocaína 1% sem vasoconstritor 0,5–1 mL/ponto (alternativa dry needling); toxina botulínica A em casos refratários e pontos localizados; adesivo de lidocaína 5%; amitriptilina 10–25 mg à noite (se distúrbio do sono); ciclobenzaprina 5–10 mg à noite por período curto (ponte); AINE/paracetamol curto para exacerbação. NÃO usar opioide; corticoide na injeção do ponto-gatilho não traz benefício."
  },
  {
    "id": "sdcr-classif",
    "doenca": "Síndrome da Dor Complexa Regional",
    "cid": "G90.5",
    "topico": "Classificação e sintomas",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Tipo 1 (sem lesão de nervo identificável; antiga distrofia simpático-reflexa) segue injúria mínima, entorse, fratura, imobilização ou cirurgia. Tipo 2 (com lesão de nervo periférico; antiga causalgia) segue trauma mais grave. Quadro e tratamento iguais nos dois. Sintomas: dor contínua em queimação/choque desproporcional; alodínia, hiperalgesia; assimetria de temperatura e cor (palidez, eritema, cianose, marmóreo); edema; sudorese aumentada/reduzida/assimétrica; redução de amplitude, fraqueza, tremor, distonia (mão/pé em garra); alteração trófica de pele/unhas/pelos; negligência do membro; osteopenia regional tardia. Distribuição regional, distal, sem respeitar dermátomo/nervo."
  },
  {
    "id": "sdcr-budapeste",
    "doenca": "Síndrome da Dor Complexa Regional",
    "cid": "G90.5",
    "topico": "Critérios de Budapeste (diagnóstico)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Diagnóstico clínico — preencher os 4: (1) dor contínua desproporcional ao evento; (2) ≥ 1 SINTOMA relatado em 3 das 4 categorias; (3) ≥ 1 SINAL ao exame em 2 ou mais das 4 categorias; (4) ausência de outro diagnóstico melhor. Categorias: Sensitiva (hiperestesia, alodínia, hiperalgesia); Vasomotora (assimetria de temperatura, alteração/assimetria de cor); Sudomotora/edema (edema, alteração/assimetria de sudorese); Motora/trófica (redução de amplitude, disfunção motora — fraqueza/tremor/distonia, alteração trófica de pelos/unhas/pele). Exames não fazem o diagnóstico (Rx pode mostrar osteopenia irregular tardia; cintilografia trifásica pode apoiar); imagem só para afastar fratura oculta, infecção, TVP, compressão nervosa."
  },
  {
    "id": "sdcr-trat",
    "doenca": "Síndrome da Dor Complexa Regional",
    "cid": "G90.5",
    "topico": "Tratamento",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Princípio central: reabilitação funcional PRECOCE (quanto antes, melhor o prognóstico) — dessensibilização progressiva, carga gradual, uso funcional, imagética motora graduada e terapia espelho, TO/fisioterapia especializadas, evitar imobilização/repouso, TCC e abordagem do medo do movimento. O fármaco existe para viabilizar a reabilitação: fase inicial inflamatória prednisona 30–40 mg/dia por 2–3 semanas com desmame (mais precoce, melhor); dor neuropática (gabapentina, pregabalina, amitriptilina, duloxetina); bifosfonatos em fase precoce com edema/osteopenia (pamidronato, alendronato, neridronato, zoledrônico) — das poucas classes com evidência positiva; DMSO 50% tópico e N-acetilcisteína; vitamina C 500 mg/dia por 50 dias pós-fratura de punho como possível profilaxia (evidência conflitante). NÃO usar opioide crônico. Refratário: bloqueio simpático, estimulação medular (após 6 meses), cetamina EV hospitalar; evitar simpatectomia."
  },
  {
    "id": "fadiga-criterios",
    "doenca": "Fadiga Crônica / Encefalomielite Miálgica",
    "cid": "G93.3",
    "topico": "Definição e critérios (IOM 2015)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Doença crônica multissistêmica com fadiga incapacitante não explicada por outra condição. Critérios IOM 2015: exigem os 3 primeiros + ≥ 1 dos 2 últimos, por > 6 meses e intensidade moderada a grave em ≥ metade do tempo. (1) Redução substancial da capacidade funcional prévia com fadiga profunda, início definido, não aliviada pelo repouso. (2) Mal-estar pós-esforço (post-exertional malaise): piora desproporcional após esforço físico/cognitivo/emocional, com atraso de horas a dias e recuperação prolongada — achado mais característico. (3) Sono não reparador. (4) Comprometimento cognitivo. (5) Intolerância ortostática. Gatilho infeccioso identificável em 50–80% dos casos."
  },
  {
    "id": "fadiga-exames",
    "doenca": "Fadiga Crônica / Encefalomielite Miálgica",
    "cid": "G93.3",
    "topico": "Exames (exclusão)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Sem exame confirmatório — servem para excluir alternativas. Painel básico: hemograma, VHS, PCR, TSH e T4 livre, glicemia/HbA1c, ureia/creatinina/eletrólitos (Na, K, Ca, Mg, P), TGO/TGP/GGT/FA/bilirrubinas, CPK, ferritina/ferro/saturação, B12/folato/25-OH-vit D, urina tipo 1, eletroforese de proteínas, anti-transglutaminase IgA + IgA total, cortisol matinal. Imunológico: FAN, FR, anti-Ro/La (sobreposição com Sjögren), imunoglobulinas. Infeccioso DIRIGIDO por história (não em bloco): EBV (VCA IgM/IgG, EBNA), HHV-6, parvovírus B19, HIV, hepatites B/C, sífilis, CMV, SARS-CoV-2 se pós-COVID; Coxiella (febre Q), Mycoplasma/Chlamydia pneumoniae, Borrelia (só se epidemiologia), Bartonella, Brucella. Funcionais conforme sintoma: polissonografia, tilt/ortostase 10 min (POTS), avaliação neuropsicológica. Conduta: manejo de energia (pacing) respeitando o limiar — o exercício progressivo forçado NÃO é mais recomendado como intervenção primária (piora o mal-estar pós-esforço)."
  },
  {
    "id": "aij-diag",
    "doenca": "Artrite Idiopática Juvenil",
    "cid": "M08",
    "topico": "Definição, subtipos e sinais de alarme",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Artrite persistente ≥ 6 semanas, início < 16 anos, após exclusão de outras causas (diagnóstico clínico e de exclusão). Subtipos ILAR: oligoarticular (≤ 4 articulações em 6 meses; maior risco de uveíte anterior crônica assintomática, sobretudo FAN+); poliarticular FR negativo (≥ 5); poliarticular FR positivo (comporta-se como AR do adulto; confirmar FR em 2 dosagens com 3 meses); sistêmica/Still juvenil (febre diária ≥ 2 semanas com pico, rash salmão evanescente, linfadenopatia, hepatoesplenomegalia, serosite); psoriásica; relacionada a entesite (HLA-B27, sacroileíte, uveíte aguda, meninos > 6 anos); indiferenciada. SINAIS DE ALARME (afastar antes de assumir AIJ): dor noturna intensa desproporcional ao exame, criança acorda chorando → leucemia/neuroblastoma (solicitar esfregaço, LDH, ácido úrico; considerar mielograma); febre com toxemia + monoartrite + recusa a deambular → séptica/osteomielite; perda de peso, sudorese noturna, massa → neoplasia."
  },
  {
    "id": "aij-exames",
    "doenca": "Artrite Idiopática Juvenil",
    "cid": "M08",
    "topico": "Exames",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Hemograma com esfregaço, VHS, PCR; LDH e ácido úrico (rastreio leucemia/linfoma); função hepática e renal basal; ferritina (essencial na forma sistêmica e no rastreio de síndrome de ativação macrofágica); FAN (não diagnostica — define risco de uveíte e frequência do rastreio oftalmológico); FR e anti-CCP (subtipo poliarticular e prognóstico); HLA-B27 se suspeita de forma relacionada a entesite; hemocultura/líquido sinovial se suspeita séptica; ASLO/sorologias conforme reativa/febre reumática. EXAME OFTALMOLÓGICO com lâmpada de fenda obrigatório ao diagnóstico e periódico (a cada 3 meses no maior risco: oligoarticular, FAN+, início < 7 anos, doença < 4 anos; 6–12 meses nos demais). Antes de imunobiológico: PPD/IGRA + Rx tórax, HBV/HCV/HIV, vacinação. Imagem: US com Doppler (sinovite subclínica), RM com contraste (padrão, inclui sacroilíacas e ATM), Rx para dano; eco na forma sistêmica."
  },
  {
    "id": "aij-trat",
    "doenca": "Artrite Idiopática Juvenil",
    "cid": "M08",
    "topico": "Tratamento",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "AINE em dose pediátrica plena (naproxeno 10–20 mg/kg/dia em 2 tomadas; ibuprofeno 30–40 mg/kg/dia) — isolado resolve poucos casos. Infiltração intra-articular de triancinolona hexacetonida: escolha na forma oligoarticular. Metotrexato 10–15 mg/m²/semana (VO ou SC) com ácido fólico: base das formas poliarticulares; leflunomida/sulfassalazina alternativas (sulfassalazina útil na relacionada a entesite). Anti-TNF (etanercepte, adalimumabe): preferir monoclonal (adalimumabe/infliximabe) quando há uveíte (etanercepte não é eficaz para uveíte). Tocilizumabe (anti-IL-6): forma sistêmica e poliarticular refratária. Anakinra/canaquinumabe (anti-IL-1): 1ª escolha biológica na forma sistêmica com febre/serosite. Abatacepte após falha de anti-TNF; JAKi (tofacitinibe) em refratários. Glicocorticoide sistêmico como ponte pelo menor tempo; pulsoterapia na sistêmica grave e na SAM. Não usar corticoide crônico que comprometa crescimento sem poupador."
  },
  {
    "id": "aij-acomp",
    "doenca": "Artrite Idiopática Juvenil",
    "cid": "M08",
    "topico": "Acompanhamento e SAM (alerta)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Aplicar índice de atividade a cada consulta (JADAS-10/27 ou cJADAS que dispensa a prova de fase aguda); meta é remissão/baixa atividade (treat to target). Contagem articular ativa e limitada; avaliar ATM e coluna cervical (subdiagnosticadas). Curva de crescimento, estágio puberal, peso/altura. Oftalmo no intervalo do risco mesmo com articular controlada. Labs com MTX/leflunomida: hemograma, TGO/TGP, creatinina a cada 4–8 semanas no início, depois 12/12. Vacinação em dia, evitar vírus vivo sob imunossupressão, vacinar contatos. SINAL DE ALARME — Síndrome de Ativação Macrofágica (emergência) na forma sistêmica: queda de VHS com PCR alta, ferritina muito elevada, citopenias, hipofibrinogenemia, hipertrigliceridemia, transaminases elevadas, hepatoesplenomegalia. Planejar transição para reumatologia de adultos."
  },
  {
    "id": "fmf-def",
    "doenca": "Febre Familiar do Mediterrâneo",
    "cid": "E85.0",
    "topico": "Definição e genética",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Doença autoinflamatória monogênica autossômica recessiva por mutações no gene MEFV (16p13.3, codifica a pirina/marenostrina), com ativação descontrolada do inflamassoma e liberação de IL-1β — a mais comum das febres periódicas hereditárias. Mutações frequentes: M694V (fenótipo mais grave e maior risco de amiloidose), M680I, V726A, M694I, E148Q (penetrância variável). Maior prevalência em judeus sefarditas, armênios, turcos, árabes e povos do Mediterrâneo oriental; no Brasil considerar em descendentes, mas não excluir por ausência de ancestralidade."
  },
  {
    "id": "fmf-quadro",
    "doenca": "Febre Familiar do Mediterrâneo",
    "cid": "E85.0",
    "topico": "Quadro clínico e amiloidose",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Crises recorrentes autolimitadas de febre (12–72h) com intervalos assintomáticos irregulares: peritonite estéril (dor abdominal com defesa, simula abdome agudo — causa de laparotomia branca); pleurite (dor torácica unilateral); monoartrite aguda de grande articulação (joelho, tornozelo, quadril), autolimitada e não erosiva; eritema erisipeloide (placa dolorosa em perna/tornozelo/dorso do pé — bastante específico); mialgia; orquite em meninos. Início < 20 anos em ~90%. COMPLICAÇÃO PRINCIPAL: amiloidose AA com depósito renal → proteinúria, síndrome nefrótica e DRC terminal — prevenir a amiloidose é o principal objetivo do tratamento."
  },
  {
    "id": "fmf-diag",
    "doenca": "Febre Familiar do Mediterrâneo",
    "cid": "E85.0",
    "topico": "Diagnóstico e exames",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Diagnóstico clínico, apoiado por critérios (Tel Hashomer, Livneh; Eurofever/PRINTO 2019 incorporam genótipo) e confirmado por genética quando disponível. Resposta sustentada à colchicina apoia o diagnóstico. Na crise: leucocitose/neutrofilia, VHS/PCR elevados, amiloide A sérica (SAA) elevada, fibrinogênio/haptoglobina. ENTRE as crises (fundamentais): PCR, VHS e SAA para detectar inflamação subclínica persistente (principal fator de risco de amiloidose mesmo sem crises); proteinúria de 24h ou relação proteína/creatinina ao menos anual (proteinúria persistente → biópsia renal para amiloide); creatinina/TFG e urina tipo 1. Genética: sequenciamento MEFV — duas mutações patogênicas confirmam; uma única mutação com quadro típico não exclui; genética negativa com quadro clássico e resposta à colchicina não afasta. Diferenciais: TRAPS, deficiência de mevalonato quinase/HIDS, CAPS, PFAPA, Still, Behçet, DII."
  },
  {
    "id": "fmf-trat",
    "doenca": "Febre Familiar do Mediterrâneo",
    "cid": "E85.0",
    "topico": "Tratamento (colchicina)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Colchicina é o padrão e deve ser iniciada ao diagnóstico mesmo em oligossintomáticos — previne as crises e, principalmente, a amiloidose. Adulto: iniciar 1 mg/dia, ajustar até 2 mg/dia (excepcionalmente 3), fracionada. Pediátrico: ~0,5 mg/dia < 5 anos; 1 mg/dia 5–10 anos; 1,5 mg/dia > 10 anos. NÃO interromper durante crise, gestação ou amamentação (considerada segura). Monitorizar hemograma, CPK, transaminases e função renal; efeito adverso comum é diarreia (fracionar dose). Interações que aumentam toxicidade: claritromicina, eritromicina, cetoconazol, ciclosporina, verapamil, estatinas; ajustar em disfunção renal. Resistência/intolerância (~5–10%): 6+ crises/ano ou 3 em 4–6 meses com dose máxima e boa adesão, ou inflamação subclínica persistente → 2ª linha anti-IL-1 (anakinra 100 mg SC/dia; canaquinumabe 150 mg SC/4 semanas), mantendo a colchicina se tolerada. AINE para sintoma; corticoide não previne crises."
  },
  {
    "id": "febre-reumatica-w",
    "doenca": "Febre Reumática",
    "cid": "I00-I02",
    "topico": "Referência (caderno)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Complemento de referência sobre febre reumática (transcrição do caderno do Dr. Willian): sequela pós-estreptocócica; base de diagnóstico pelos critérios de Jones (maiores: cardite, artrite, coreia, eritema marginado, nódulos subcutâneos; menores: febre, artralgia, VHS/PCR elevados, PR alargado) + evidência de infecção estreptocócica prévia (ASLO, cultura). Confirmar conteúdo com o Dr. Willian antes de publicar."
  },
  {
    "id": "reativa-w",
    "doenca": "Artrite Reativa",
    "cid": "M02",
    "topico": "Referência (espectro das reativas)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Complemento de referência sobre o espectro das artrites reativas (transcrição do caderno): artrite estéril pós-infecciosa (geniturinária por Chlamydia ou entérica por Salmonella/Shigella/Yersinia/Campylobacter), 1–4 semanas após; oligoartrite assimétrica de MMII, entesite, dactilite; manifestações extra-articulares (uretrite/cervicite, conjuntivite, queratodermia, balanite); associação com HLA-B27. Validar detalhes com o Dr. Willian."
  },
  {
    "id": "ref-hepatite",
    "doenca": "Manifestações reumáticas das hepatites B e C",
    "cid": "B18",
    "topico": "Referência (caderno)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Manifestações reumáticas das hepatites virais B e C (transcrição do caderno do Dr. Willian): HBV pode cursar com artrite/dermatite na fase aguda e com poliarterite nodosa; HCV associa-se a crioglobulinemia mista (púrpura, artralgia, neuropatia, glomerulonefrite) e a fator reumatoide positivo. Importante no diferencial de poliartrite e vasculite, e como exclusão em Sjögren/critérios. Antes de imunossupressão, rastrear e considerar o risco de reativação viral (sobretudo HBV). Validar conteúdo com o Dr. Willian antes de publicar."
  },
  {
    "id": "ref-hiv",
    "doenca": "Manifestações reumáticas do HIV",
    "cid": "B23",
    "topico": "Referência (caderno)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Manifestações reumáticas do HIV (transcrição do caderno do Dr. Willian): artralgia/artrite, espondiloartrite e artrite reativa, síndrome de linfocitose infiltrativa difusa (DILS, simula Sjögren), miopatia, vasculites; considerar o HIV como diferencial e como exclusão nos critérios de Sjögren. Cautela com imunossupressão conforme estado imunológico. Validar detalhes com o Dr. Willian antes de publicar."
  },
  {
    "id": "chikungunya-w",
    "doenca": "Artropatia por Chikungunya",
    "cid": "B33.1",
    "topico": "Referência (caderno)",
    "fonte": "Dr. Willian Inácio — documento de trabalho (validar antes de publicar)",
    "texto": "Complemento de referência (transcrição do caderno): artropatia por chikungunya com fase aguda febril e poliartralgia/poliartrite simétrica que pode persistir por meses (subaguda/crônica); manejo sintomático na fase aguda (evitar AINE/AAS até excluir dengue) e avaliação reumatológica na persistência. Validar detalhes com o Dr. Willian."
  }
];

export const GROUNDING_REGRAS = GROUNDING.filter((c) => c.id.startsWith("ia-"));
// Fundamentos gerais (chunks fund-*).
export const GROUNDING_FUND = GROUNDING.filter((c) => c.id.startsWith("fund-"));

// Seleciona os chunks relevantes para uma doença (RAG por metadado):
// regras da IA + fundamentos gerais + chunks da doença (prefixo do id) + critérios.
export function chunksParaDoenca(doencaId: string): GroundingChunk[] {
  const daDoenca = doencaId
    ? GROUNDING.filter((c) => c.id === doencaId || c.id.startsWith(doencaId + "-"))
    : [];
  const criterios = doencaId
    ? GROUNDING.filter((c) => c.id.startsWith("crit-") && c.id.includes(doencaId))
    : [];
  // dedup preservando ordem: regras, fundamentos, doença, critérios
  const vistos = new Set<string>();
  const out: GroundingChunk[] = [];
  for (const c of [...GROUNDING_REGRAS, ...GROUNDING_FUND, ...daDoenca, ...criterios]) {
    if (!vistos.has(c.id)) { vistos.add(c.id); out.push(c); }
  }
  return out;
}
