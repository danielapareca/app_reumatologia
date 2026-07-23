import type { Diseases } from './types';

// ============ DATASET CLÍNICO ============
// Portado de gerador_v3.html. 19 doenças, etapas de tratamento em ordem.
// Cada etapa: {id,label,sub,alerta,itens:[{m,p,q,ceaf}],nota}
export const D: Diseases = {
  ar: {
    n: 'Artrite Reumatoide',
    cid: 'M05/M06',
    conf: ['Hemograma completo', 'VHS', 'PCR', 'Fator reumatoide (FR)', 'Anti-CCP', 'TGO (AST)', 'TGP (ALT)', 'Creatinina', 'EAS (urina tipo I)', 'Radiografia de mãos, punhos e pés (AP)'],
    basal: ['PPD ou IGRA', 'Radiografia de tórax (PA e perfil)', 'HBsAg', 'Anti-HBc total', 'Anti-HBs', 'Anti-HCV', 'Anti-HIV', 'Beta-HCG (se potencial gestacional)'],
    etapas: [
      { id: 'inicial', label: 'Consulta inicial', sub: 'sintomático + solicitar exames', itens: [
        { m: 'Prednisona 20 mg', p: 'Tomar 1 comprimido por via oral 1x/dia pela manhã, em redução gradual, como ponte anti-inflamatória até o retorno.' },
        { m: 'Naproxeno 500 mg', p: 'Tomar 1 comprimido por via oral de 12/12h se dor, com protetor gástrico.' }],
        nota: 'Solicitar exames e reavaliar no retorno para definir o tratamento de base (DMARD).' },
      { id: 'base', label: '1ª linha — tratamento de base', sub: 'no retorno com exames', itens: [
        { m: 'Metotrexato 2,5 mg', p: 'Tomar 6 comprimidos por via oral 1x/semana (15 mg/semana). Ajustar entre 7,5 e 25 mg/semana.', q: '24 comprimidos', ceaf: true },
        { m: 'Ácido fólico 5 mg', p: 'Tomar 1 comprimido por via oral 1x/semana, 48h após o metotrexato.', q: '4 comprimidos', ceaf: true },
        { m: 'Prednisona 10 mg', p: 'Em redução, como ponte até o metotrexato agir.' }],
        nota: 'Alternativas ao MTX: leflunomida 20 mg/dia OU sulfassalazina 2-3 g/dia. Combinar HCQ se necessário.' },
      { id: 'segunda', label: '2ª linha', sub: 'falha do MMCDsc otimizado', itens: [
        { m: 'Combinação de MMCDsc: Metotrexato + Hidroxicloroquina + Sulfassalazina', p: 'Otimizar tripla terapia conforme tolerância.', ceaf: true },
        { m: 'OU biológico anti-TNF (adalimumabe, etanercepte, infliximabe, golimumabe, certolizumabe)', p: 'Associado ao metotrexato. Exige rastreio infeccioso e LME.', ceaf: true }] },
      { id: 'terceira', label: '3ª linha', sub: 'falha do biológico', itens: [
        { m: 'Trocar biológico (mudar de mecanismo: tocilizumabe, abatacepte, rituximabe)', p: 'Conforme resposta e perfil.', ceaf: true },
        { m: 'OU inibidor de JAK (tofacitinibe, baricitinibe, upadacitinibe)', p: 'Cautela: risco cardiovascular/trombótico. Associar ao MTX quando possível.', ceaf: true }] },
    ],
  },

  aps: {
    n: 'Artrite Psoriásica',
    cid: 'M07',
    conf: ['Hemograma completo', 'VHS', 'PCR', 'Fator reumatoide (FR)', 'Anti-CCP', 'TGO (AST)', 'TGP (ALT)', 'Creatinina', 'Radiografia de mãos, pés e bacia'],
    basal: ['PPD ou IGRA', 'Radiografia de tórax (PA e perfil)', 'HBsAg', 'Anti-HBc total', 'Anti-HBs', 'Anti-HCV', 'Anti-HIV', 'Beta-HCG (se potencial gestacional)'],
    etapas: [
      { id: 'inicial', label: 'Consulta inicial', sub: 'sintomático + exames', itens: [
        { m: 'Naproxeno 500 mg', p: 'Tomar 1 comprimido por via oral de 12/12h, com protetor gástrico (artrite, entesite, dactilite).' }],
        nota: 'Evitar corticoide sistêmico prolongado (rebote cutâneo). Reavaliar no retorno.' },
      { id: 'base', label: '1ª linha — tratamento de base', sub: 'doença periférica', itens: [
        { m: 'Metotrexato 2,5 mg', p: 'Tomar 6 comprimidos por via oral 1x/semana (bom para pele e articulação).', q: '24 comprimidos', ceaf: true },
        { m: 'Ácido fólico 5 mg', p: '1 comprimido por via oral 1x/semana, 48h após o metotrexato.', q: '4 comprimidos', ceaf: true }],
        nota: 'Doença axial ou entesítica pura responde mal a MMCDsc: se ativa apesar de AINE, ir a biológico.' },
      { id: 'segunda', label: '2ª linha — biológico', sub: 'falha ou doença axial', itens: [
        { m: 'Anti-TNF (adalimumabe, etanercepte, infliximabe, golimumabe, certolizumabe)', p: 'Cobre pele, articulação, êntese e eixo axial. LME.', ceaf: true },
        { m: 'OU anti-IL-17 (secuquinumabe, ixequizumabe)', p: 'Ótimo para pele e eixo axial. LME.', ceaf: true }] },
      { id: 'terceira', label: '3ª linha', sub: 'troca de mecanismo', itens: [
        { m: 'Trocar de classe biológica ou apremilaste (doença leve)', p: 'Conforme resposta.', ceaf: true },
        { m: 'OU inibidor de JAK (tofacitinibe, upadacitinibe)', p: 'Cautela cardiovascular/trombótica.', ceaf: true }] },
    ],
  },

  ea: {
    n: 'Espondiloartrite axial / Espondilite anquilosante',
    cid: 'M45',
    conf: ['VHS', 'PCR', 'HLA-B27', 'Radiografia de bacia (sacroilíacas) e coluna lombar', 'Ressonância magnética de sacroilíacas (se radiografia normal)'],
    basal: ['PPD ou IGRA', 'Radiografia de tórax (PA e perfil)', 'HBsAg', 'Anti-HBc total', 'Anti-HBs', 'Anti-HCV', 'Anti-HIV'],
    etapas: [
      { id: 'inicial', label: '1ª linha — AINE + fisioterapia', sub: 'pilar do tratamento', itens: [
        { m: 'Naproxeno 500 mg', p: 'Tomar 1 comprimido por via oral de 12/12h de forma contínua, com protetor gástrico. Reavaliar em 2-4 semanas.', q: '60 comprimidos' },
        { m: 'Fisioterapia / exercício', p: 'Encaminhamento para reabilitação axial (alongamento, McKenzie, hidroterapia).' }],
        nota: 'Solicitar exames para confirmação. Sulfassalazina só ajuda doença periférica.' },
      { id: 'base', label: 'Doença periférica', sub: 'se artrite periférica', itens: [
        { m: 'Sulfassalazina 500 mg', p: 'Tomar 2 comprimidos por via oral de 12/12h (2 g/dia). Sem efeito axial.', q: '120 comprimidos', ceaf: true }] },
      { id: 'segunda', label: '2ª linha — biológico', sub: 'falha de ≥ 2 AINEs', itens: [
        { m: 'Anti-TNF (adalimumabe, etanercepte, infliximabe, golimumabe, certolizumabe)', p: '1ª opção para doença axial refratária. LME.', ceaf: true },
        { m: 'OU anti-IL-17 (secuquinumabe)', p: 'Axial e periférica. LME.', ceaf: true }] },
      { id: 'terceira', label: '3ª linha', sub: 'troca', itens: [
        { m: 'Trocar para outro anti-TNF, anti-IL-17 ou JAKi (upadacitinibe, tofacitinibe)', p: 'Conforme resposta; cautela cardiovascular com JAKi.', ceaf: true }] },
    ],
  },

  reativa: {
    n: 'Artrite Reativa',
    cid: 'M02',
    conf: ['Hemograma completo', 'VHS', 'PCR', 'Coprocultura', 'Pesquisa / PCR para Chlamydia trachomatis', 'HLA-B27', 'Anti-HIV', 'HBsAg', 'Anti-HCV', 'VDRL'],
    etapas: [
      { id: 'inicial', label: '1ª linha — sintomático', sub: '+ tratar infecção', itens: [
        { m: 'Naproxeno 500 mg', p: 'Tomar 1 comprimido por via oral de 12/12h, com protetor gástrico.', q: '30 comprimidos' },
        { m: 'Azitromicina 500 mg', p: 'Tomar 2 comprimidos por via oral em dose única (apenas se Chlamydia confirmada; tratar o parceiro).', q: '2 comprimidos' }],
        nota: 'Artrocentese para excluir artrite séptica antes de corticoide. Antibiótico não melhora a artrite pós-entérica.' },
      { id: 'base', label: '2ª linha', sub: 'curso arrastado > 3-6 meses', itens: [
        { m: 'Sulfassalazina 500 mg', p: 'Tomar 2 comprimidos por via oral de 12/12h (2 g/dia).', q: '120 comprimidos', ceaf: true }] },
      { id: 'segunda', label: '3ª linha', sub: 'refratária', itens: [
        { m: 'Anti-TNF', p: 'Como nas demais espondiloartrites, se doença persistente. LME.', ceaf: true }] },
    ],
  },

  les: {
    n: 'Lúpus Eritematoso Sistêmico',
    cid: 'M32',
    conf: ['FAN (HEp-2)', 'Anti-DNA nativo (dsDNA)', 'Anti-Sm', 'Anti-Ro/SSA', 'Anti-La/SSB', 'Complemento C3', 'Complemento C4', 'Anticardiolipina IgG e IgM', 'Anti-beta-2-glicoproteína I IgG e IgM', 'Anticoagulante lúpico', 'Hemograma completo', 'Creatinina', 'EAS (urina tipo I)', 'Relação proteína/creatinina urinária'],
    etapas: [
      { id: 'inicial', label: 'Consulta inicial', sub: 'sintomático + base + exames', itens: [
        { m: 'Hidroxicloroquina 400 mg', p: 'Tomar 1 comprimido por via oral 1x/dia (≤ 5 mg/kg/dia). Base para todos; iniciar já.', q: '30 comprimidos', ceaf: true },
        { m: 'Protetor solar FPS 50+', p: 'Aplicar em áreas expostas 2-3x/dia.' },
        { m: 'Prednisona 20 mg', p: 'Dose conforme atividade, na menor dose eficaz, se sintomas articulares/serosite.' }],
        nota: 'Solicitar exames. Avaliação oftalmológica basal (hidroxicloroquina).' },
      { id: 'base', label: 'Poupador de corticoide', sub: 'doença leve-moderada', itens: [
        { m: 'Hidroxicloroquina 400 mg', p: 'Manter 1 comprimido por via oral 1x/dia.', q: '30 comprimidos', ceaf: true },
        { m: 'Azatioprina OU Metotrexato', p: 'Poupador conforme manifestação (articular/cutânea).', ceaf: true }] },
      { id: 'segunda', label: 'Doença grave / nefrite', sub: 'indução — com especialista', alerta: true, itens: [
        { m: 'Corticoide (± pulso de metilprednisolona) + Micofenolato OU Ciclofosfamida', p: 'Indução de nefrite lúpica (classes III/IV/V). Encaminhamento/co-manejo.', ceaf: true }] },
      { id: 'terceira', label: 'Refratária', sub: '', itens: [
        { m: 'Rituximabe', p: 'Casos refratários. LME.', ceaf: true }] },
    ],
  },

  sjogren: {
    n: 'Síndrome de Sjögren',
    cid: 'M35.0',
    conf: ['Anti-Ro/SSA', 'Anti-La/SSB', 'FAN', 'Fator reumatoide (FR)', 'Hemograma completo', 'EAS (urina tipo I)', 'Eletroforese de proteínas', 'Teste de Schirmer (solicitar à oftalmologia)'],
    etapas: [
      { id: 'inicial', label: '1ª linha — sintomático', sub: 'secura', itens: [
        { m: 'Lágrima artificial (carmelose/hipromelose)', p: 'Instilar 1 gota em cada olho 4-6x/dia.', q: '1 frasco' },
        { m: 'Saliva artificial / gel oral', p: 'Aplicar conforme necessidade, sobretudo antes das refeições e ao dormir.', q: '1 frasco' },
        { m: 'Pilocarpina 5 mg', p: 'Tomar 1 comprimido por via oral de 6/6h se secura importante e função glandular residual. Cautela em asma, DPOC, glaucoma, cardiopatia.', q: '30 comprimidos' }] },
      { id: 'base', label: 'Manifestação articular', sub: 'artralgia/artrite', itens: [
        { m: 'Hidroxicloroquina 400 mg', p: 'Tomar 1 comprimido por via oral 1x/dia.', q: '30 comprimidos', ceaf: true }] },
      { id: 'segunda', label: 'Doença sistêmica grave', sub: 'vasculite/neuro/renal', alerta: true, itens: [
        { m: 'Corticoide + imunossupressor (azatioprina/micofenolato) ou rituximabe', p: 'Casos selecionados, com especialista.', ceaf: true }] },
    ],
  },

  esclerose: {
    n: 'Esclerose Sistêmica (Esclerodermia)',
    cid: 'M34',
    conf: ['FAN', 'Anticentrômero', 'Anti-Scl-70 (topoisomerase I)', 'Anti-RNA-polimerase III', 'Capilaroscopia periungueal', 'Creatinina', 'EAS (urina tipo I)', 'Tomografia de tórax de alta resolução', 'Espirometria com DLCO', 'Ecocardiograma com Doppler (PSAP)'],
    etapas: [
      { id: 'inicial', label: 'Sintomático por domínio', sub: 'Raynaud + refluxo', itens: [
        { m: 'Nifedipino retard 20 mg', p: 'Tomar 1 comprimido por via oral de 12/12h (Raynaud). Titular conforme PA.', q: '60 comprimidos' },
        { m: 'Omeprazol 40 mg', p: 'Tomar 1 comprimido por via oral 1x/dia em jejum (refluxo). Medidas antirrefluxo.' }],
        nota: 'Rastrear órgão-alvo (pulmão, coração, rim). Evitar corticoide em dose alta (risco de crise renal).' },
      { id: 'base', label: 'Doença de órgão', sub: 'pele / pulmão', itens: [
        { m: 'Metotrexato 2,5 mg (pele difusa inicial)', p: '6 comprimidos por via oral 1x/semana + ácido fólico.', q: '24 comprimidos', ceaf: true },
        { m: 'Micofenolato OU Ciclofosfamida (doença pulmonar intersticial)', p: 'Conforme gravidade. Considerar nintedanibe (antifibrótico).', ceaf: true }] },
      { id: 'segunda', label: 'Crise renal / HAP', sub: 'emergência / especialista', alerta: true, itens: [
        { m: 'Crise renal: Captopril (IECA) imediato', p: 'Iniciar precocemente e internar. Reduz mortalidade.' },
        { m: 'HAP: terapia específica (inibidor de PDE-5, antagonista de endotelina, prostanoides)', p: 'Com especialista.', ceaf: true }] },
    ],
  },

  miopatias: {
    n: 'Miopatias Inflamatórias (dermato/polimiosite)',
    cid: 'M33',
    conf: ['CK (creatinoquinase)', 'Aldolase', 'TGO (AST)', 'TGP (ALT)', 'DHL', 'Eletroneuromiografia', 'Ressonância magnética de coxas', 'Anticorpos miosite-específicos (anti-Jo-1 e painel)', 'Tomografia de tórax de alta resolução'],
    etapas: [
      { id: 'inicial', label: '1ª linha — corticoide', sub: 'iniciar e investigar', itens: [
        { m: 'Prednisona 20 mg', p: 'Tomar 3 comprimidos por via oral 1x/dia pela manhã (0,5-1 mg/kg/dia). Pulso de metilprednisolona se doença grave.', q: '90 comprimidos' }],
        nota: 'Solicitar exames e rastrear neoplasia. Força muscular é o melhor guia de resposta.' },
      { id: 'base', label: '+ poupador de corticoide', sub: '', itens: [
        { m: 'Metotrexato 2,5 mg OU Azatioprina', p: 'Poupador precoce de corticoide (MTX: 6 comp/semana + ácido fólico).', q: '24 comprimidos', ceaf: true }] },
      { id: 'segunda', label: '2ª linha', sub: 'refratária / DPI', itens: [
        { m: 'Imunoglobulina intravenosa (IVIG)', p: 'Boa evidência, sobretudo na dermatomiosite e na disfagia.', ceaf: true },
        { m: 'OU Micofenolato (doença pulmonar)', p: 'Conforme acometimento.', ceaf: true }] },
      { id: 'terceira', label: '3ª linha', sub: '', itens: [
        { m: 'Rituximabe ou Ciclofosfamida', p: 'Doença refratária / DPI grave. LME.', ceaf: true }] },
    ],
  },

  saf: {
    n: 'Síndrome Antifosfolípide',
    cid: 'D68.6',
    conf: ['Anticoagulante lúpico', 'Anticardiolipina IgG e IgM', 'Anti-beta-2-glicoproteína I IgG e IgM', '(repetir os anticorpos em 12 semanas)', 'Tempo de protrombina (TP)', 'TTPa', 'Hemograma completo', 'FAN'],
    etapas: [
      { id: 'inicial', label: 'SAF trombótica', sub: 'anticoagulação', itens: [
        { m: 'Varfarina', p: 'Dose ajustada para INR 2,0-3,0 (evento venoso). Controle seriado de INR. NÃO usar na gestação.', q: 'conforme INR' },
        { m: 'AAS 100 mg', p: '1 comprimido por via oral 1x/dia (conforme cenário arterial / perfil).' }] },
      { id: 'base', label: 'SAF obstétrica', sub: 'gestação', itens: [
        { m: 'AAS 100 mg + Heparina de baixo peso (enoxaparina)', p: 'Na gestação. Converter varfarina para heparina antes de engravidar.' }] },
      { id: 'segunda', label: 'SAF catastrófica (CAPS)', sub: 'emergência', alerta: true, itens: [
        { m: 'Terapia tríplice: anticoagulação + pulso de corticoide + IVIG/plasmaférese', p: 'UTI. Mortalidade alta.' }] },
    ],
  },

  pmr: {
    n: 'Polimialgia Reumática',
    cid: 'M35.3',
    conf: ['VHS', 'PCR', 'Hemograma completo', 'TSH', 'CK (creatinoquinase)', 'Fator reumatoide (FR)', 'Anti-CCP'],
    etapas: [
      { id: 'inicial', label: '1ª linha — corticoide', sub: 'resposta rápida confirma', itens: [
        { m: 'Prednisona 15 mg', p: 'Tomar 1 comprimido por via oral 1x/dia pela manhã (12,5-25 mg/dia). Desmame lento em meses.', q: '30 comprimidos' },
        { m: 'Carbonato de cálcio 500 mg + vitamina D', p: 'Tomar 1 comprimido por via oral de 12/12h (profilaxia de osteoporose).', q: '60 comprimidos' }],
        nota: 'Rastrear arterite de células gigantes (cefaleia, claudicação de mandíbula, sintoma visual).' },
      { id: 'base', label: 'Poupador de corticoide', sub: 'recaídas frequentes', itens: [
        { m: 'Metotrexato 2,5 mg', p: '6 comprimidos por via oral 1x/semana + ácido fólico.', q: '24 comprimidos', ceaf: true }] },
    ],
  },

  acg: {
    n: 'Arterite de Células Gigantes',
    cid: 'M31.6',
    conf: ['VHS', 'PCR', 'Hemograma completo', 'Biópsia de artéria temporal', 'Ultrassom de artérias temporais (se disponível)'],
    etapas: [
      { id: 'inicial', label: '1ª linha — corticoide IMEDIATO', sub: 'não aguardar biópsia', alerta: true, itens: [
        { m: 'Prednisona 20 mg', p: 'Tomar 2 a 3 comprimidos por via oral 1x/dia (40-60 mg/dia). Se sintoma visual: pulso hospitalar de metilprednisolona 1 g/dia EV por 3 dias.', q: 'conforme esquema' },
        { m: 'AAS 100 mg', p: '1 comprimido por via oral 1x/dia, se sem contraindicação.' },
        { m: 'Carbonato de cálcio 500 mg + vitamina D', p: '1 comprimido por via oral de 12/12h.', q: '60 comprimidos' }] },
      { id: 'base', label: 'Poupador de corticoide', sub: '', itens: [
        { m: 'Tocilizumabe OU Metotrexato', p: 'Reduz recaídas e dose de corticoide. LME (tocilizumabe).', ceaf: true }] },
    ],
  },

  anca: {
    n: 'Vasculites ANCA-associadas',
    cid: 'M31',
    conf: ['ANCA (IFI + anti-PR3 e anti-MPO)', 'Hemograma completo', 'Creatinina', 'Ureia', 'EAS com sedimento urinário', 'Relação proteína/creatinina urinária', 'PCR', 'Tomografia de tórax', 'Tomografia de seios da face', 'Biópsia do órgão acometido'],
    etapas: [
      { id: 'inicial', label: 'Indução — com especialista', sub: 'doença grave = internar', alerta: true, itens: [
        { m: 'Corticoide em dose alta (± pulso) + Rituximabe OU Ciclofosfamida', p: 'Indução de remissão. Plasmaférese em casos selecionados. Profilaxia para Pneumocystis.', ceaf: true }] },
      { id: 'base', label: 'Manutenção', sub: '', itens: [
        { m: 'Rituximabe (preferencial) OU Azatioprina/Metotrexato', p: 'Com desmame do corticoide. LME.', ceaf: true }] },
    ],
  },

  gota: {
    n: 'Gota',
    cid: 'M10',
    conf: ['Ácido úrico', 'Creatinina', 'Ureia', 'Hemograma completo', 'Glicemia de jejum', 'Perfil lipídico', 'TGO (AST)', 'TGP (ALT)', 'Análise de líquido sinovial com pesquisa de cristais (se dúvida)'],
    etapas: [
      { id: 'inicial', label: 'Crise aguda', sub: 'tratar a dor', alerta: true, itens: [
        { m: 'Colchicina 0,5 mg', p: 'Tomar 2 comprimidos por via oral agora + 1 após 1 hora; depois 1 comprimido 1-2x/dia. Ajustar/evitar em DRC e com estatinas/macrolídeos.', q: '20 comprimidos' },
        { m: 'Naproxeno 500 mg (alternativa)', p: '1 comprimido por via oral de 12/12h por 5-7 dias, com protetor gástrico.', q: '14 comprimidos' },
        { m: 'Prednisona 20 mg (alternativa)', p: '1-2 comprimidos por via oral 1x/dia com desmame em 5-10 dias.', q: 'conforme esquema' }],
        nota: 'Não iniciar nem ajustar alopurinol na crise se o paciente ainda não usa.' },
      { id: 'base', label: 'Manutenção', sub: 'alvo ácido úrico < 6 (< 5 se tofo)', itens: [
        { m: 'Alopurinol 100 mg', p: '1 comprimido por via oral 1x/dia. Aumentar 100 mg a cada 2-4 semanas até o alvo (máx 800 mg/dia). Iniciar 2-4 semanas após a crise.', q: '30 comprimidos' },
        { m: 'Colchicina 0,5 mg (profilaxia)', p: '1 comprimido por via oral 1x/dia. Iniciar 1-2 semanas antes do alopurinol e manter 3-6 meses.', q: '30 comprimidos' }],
        nota: 'Suspender alopurinol imediatamente se rash. Benzbromarona 25-100 mg/dia se não atingir alvo.' },
    ],
  },

  pseudogota: {
    n: 'Artrite por Pirofosfato (Pseudogota)',
    cid: 'M11',
    conf: ['Análise de líquido sinovial com pesquisa de cristais', 'Radiografia de joelhos, punhos e bacia (condrocalcinose)', 'Cálcio', 'PTH', 'Ferritina', 'Saturação de transferrina', 'Magnésio', 'Fosfatase alcalina', 'TSH'],
    etapas: [
      { id: 'inicial', label: 'Crise aguda', sub: 'tratar a dor', alerta: true, itens: [
        { m: 'Naproxeno 500 mg', p: '1 comprimido por via oral de 12/12h por 5-7 dias, com protetor gástrico.', q: '14 comprimidos' },
        { m: 'Colchicina 0,5 mg (alternativa)', p: '1 comprimido por via oral 2-3x/dia.', q: '30 comprimidos' }],
        nota: 'Excluir artrite séptica. Investigar causa secundária em < 55 anos.' },
      { id: 'base', label: 'Recorrente', sub: 'profilaxia', itens: [
        { m: 'Colchicina 0,5 mg', p: '1 comprimido por via oral 1x/dia (profilaxia).', q: '30 comprimidos' }],
        nota: 'Tratar hiperparatireoidismo, hemocromatose ou hipomagnesemia se presentes.' },
    ],
  },

  osteoartrite: {
    n: 'Osteoartrite (Artrose)',
    cid: 'M15-M19',
    conf: ['Radiografia da articulação acometida com carga (joelho/quadril)', 'VHS, PCR e Fator reumatoide (apenas se dúvida com artrite inflamatória)'],
    etapas: [
      { id: 'inicial', label: 'Tratamento', sub: 'base não farmacológica + analgesia', itens: [
        { m: 'Paracetamol 750 mg', p: '1 comprimido por via oral até de 8/8h se dor.', q: '30 comprimidos' },
        { m: 'Diclofenaco dietilamônio gel', p: 'Aplicar sobre a articulação 3x/dia.', q: '1 bisnaga' },
        { m: 'Naproxeno 500 mg', p: '1 comprimido por via oral de 12/12h por curto período em dor moderada, com protetor gástrico.', q: '14 comprimidos' },
        { m: 'Fisioterapia e fortalecimento', p: 'Programa de exercícios; orientar perda de peso (base do tratamento).' }] },
      { id: 'base', label: 'Dor crônica / refratária', sub: '', itens: [
        { m: 'Duloxetina 30 mg', p: '1 comprimido por via oral 1x/dia, titular a 60 mg (dor com componente central).' },
        { m: 'Infiltração intra-articular de corticoide', p: 'Para surtos de dor de joelho (efeito de curto prazo).' }],
        nota: 'Encaminhar à ortopedia se refratário a 6 meses, limitação importante ou deformidade (potencial artroplastia).' },
    ],
  },

  osteoporose: {
    n: 'Osteoporose',
    cid: 'M80/M81',
    conf: ['Densitometria óssea (coluna lombar e fêmur)', 'Cálcio total e iônico', 'Fósforo', 'Creatinina', 'TGO (AST)', 'TGP (ALT)', '25-OH-vitamina D', 'PTH', 'TSH', 'Calciúria de 24 horas', 'Fosfatase alcalina', 'Radiografia de coluna torácica e lombar', 'Eletroforese de proteínas (se indicado)'],
    etapas: [
      { id: 'inicial', label: 'Consulta inicial', sub: 'exames + repor base', itens: [
        { m: 'Carbonato de cálcio 500 mg + vitamina D', p: '1 comprimido por via oral de 12/12h.', q: '60 comprimidos' },
        { m: 'Colecalciferol 7.000 UI', p: '1 unidade por via oral 1x/semana (repor conforme dosagem de vitamina D).', q: '4 unidades' }],
        nota: 'Solicitar densitometria e exames. Corrigir vitamina D e cálcio antes do antirreabsortivo.' },
      { id: 'base', label: '1ª linha — antirreabsortivo', sub: 'após exames', itens: [
        { m: 'Alendronato 70 mg', p: '1 comprimido por via oral 1x/semana, em jejum, com água, permanecendo em pé 30-60 min.', q: '4 comprimidos' },
        { m: 'Carbonato de cálcio 500 mg + vitamina D', p: '1 comprimido por via oral de 12/12h.', q: '60 comprimidos' }],
        nota: 'Hipocalcemia contraindica bisfosfonato. Uso ~5 anos, reavaliar (drug holiday).' },
      { id: 'segunda', label: '2ª linha / refratária', sub: 'intolerância ou grave', itens: [
        { m: 'Ácido zoledrônico 5 mg EV 1x/ano OU Denosumabe 60 mg SC 6/6 meses OU Teriparatida', p: 'Intolerância oral, DRC ou doença grave. Teriparatida exige LME.', ceaf: true }] },
    ],
  },

  fibromialgia: {
    n: 'Fibromialgia',
    cid: 'M79.7',
    conf: ['Hemograma completo', 'VHS', 'PCR', 'TSH', 'CK (creatinoquinase)', '25-OH-vitamina D'],
    etapas: [
      { id: 'inicial', label: 'Tratamento', sub: 'não farmacológico + sintomático', itens: [
        { m: 'Amitriptilina 25 mg', p: 'Tomar 1 comprimido por via oral à noite (iniciar 12,5-25 mg). Melhora sono e dor.', q: '30 comprimidos' },
        { m: 'Exercício aeróbico', p: 'Atividade aeróbica moderada 3x/semana (1ª linha). Higiene do sono.' }],
        nota: 'Evitar opioides. Corticoide/AINE não têm papel (doença não inflamatória).' },
      { id: 'base', label: 'Alternativas', sub: 'conforme sintoma', itens: [
        { m: 'Duloxetina 30 mg', p: '1 comprimido por via oral 1x/dia, titular a 60 mg (dor e humor).' },
        { m: 'Pregabalina', p: 'Titular (dor e sono). Receituário de controle especial (B1).', aviso: true },
        { m: 'Ciclobenzaprina 5-10 mg', p: 'À noite, para o sono.' }] },
    ],
  },

  febre: {
    n: 'Febre Reumática',
    cid: 'I00-I02',
    conf: ['ASLO', 'Anti-DNAse B', 'Cultura de orofaringe (ou teste rápido para estreptococo)', 'VHS', 'PCR', 'Hemograma completo', 'Eletrocardiograma', 'Ecocardiograma com Doppler'],
    etapas: [
      { id: 'inicial', label: 'Tratamento', sub: 'erradicar estreptococo + artrite', itens: [
        { m: 'Penicilina G benzatina 1.200.000 UI', p: 'Aplicar por via intramuscular em dose única (600.000 UI se peso < 20 kg).', q: '1 ampola' },
        { m: 'Naproxeno 500 mg', p: '1 comprimido por via oral de 12/12h (artrite), com protetor gástrico.', q: '30 comprimidos' }],
        nota: 'Cardite moderada/grave: corticoide. Acompanhamento cardiológico é central.' },
      { id: 'base', label: 'Profilaxia secundária', sub: 'essencial', alerta: true, itens: [
        { m: 'Penicilina G benzatina 1.200.000 UI', p: 'Aplicar por via intramuscular a cada 21 dias. Duração conforme presença/gravidade de cardite.', q: 'aplicação seriada' }] },
    ],
  },

  chikungunya: {
    n: 'Artropatia por Chikungunya',
    cid: 'A92.0',
    conf: ['RT-PCR para chikungunya (na 1ª semana) ou Sorologia IgM/IgG', 'Hemograma completo', 'VHS', 'PCR', 'Fator reumatoide e Anti-CCP (na fase crônica)'],
    etapas: [
      { id: 'inicial', label: 'Fase aguda', sub: 'evitar AINE/AAS até excluir dengue', alerta: true, itens: [
        { m: 'Paracetamol 750 mg', p: '1 comprimido por via oral até de 6/6h se dor/febre.', q: '30 comprimidos' },
        { m: 'Dipirona 1 g', p: '1 comprimido por via oral até de 6/6h se dor/febre. Reforçar hidratação.', q: '20 comprimidos' }],
        nota: 'Não usar AINE nem AAS enquanto dengue não excluída (risco de sangramento).' },
      { id: 'base', label: 'Fase subaguda / crônica', sub: 'dengue já excluída', itens: [
        { m: 'Naproxeno 500 mg', p: '1 comprimido por via oral de 12/12h, com protetor gástrico.', q: '30 comprimidos' },
        { m: 'Metotrexato 2,5 mg (artropatia crônica)', p: 'Considerar 6 comp/semana + ácido fólico, conduzido pela reumatologia.', q: '24 comprimidos', ceaf: true }] },
    ],
  },

  // ===== Módulos solicitados pelo Dr. Willian (validar antes de publicar) =====
  miofascial: {
    n: 'Síndrome da Dor Miofascial',
    cid: 'M79.1',
    conf: ['Diagnóstico clínico — ponto-gatilho em banda tensa (dor referida reprodutível)', 'TSH', '25-OH-vitamina D', 'Vitamina B12', 'Ferritina', 'Magnésio'],
    etapas: [
      { id: 'inicial', label: '1ª linha — não farmacológico + sintomático', sub: 'base do tratamento', itens: [
        { m: 'Fisioterapia / alongamento / agulhamento a seco', p: 'Alongamento do músculo, correção postural, liberação por pressão isquêmica, exercício aeróbico e fortalecimento. Corrigir fatores perpetuantes.' },
        { m: 'Amitriptilina 25 mg', p: 'Tomar 10 a 25 mg por via oral à noite, sobretudo se distúrbio do sono associado.' },
        { m: 'Ciclobenzaprina 5 mg', p: 'Tomar 5 a 10 mg por via oral à noite por período curto (ponte).' }],
        nota: 'Não usar opioide. AINE/paracetamol curto para exacerbação.' },
      { id: 'segunda', label: 'Injeção de ponto-gatilho', sub: 'dor localizada', itens: [
        { m: 'Lidocaína 1% sem vasoconstritor', p: 'Injeção de 0,5 a 1 mL por ponto-gatilho. Alternativa: agulhamento a seco (eficácia semelhante). Corticoide na injeção não traz benefício.' }] },
      { id: 'terceira', label: 'Refratário', sub: 'pontos bem localizados', itens: [
        { m: 'Toxina botulínica tipo A', p: 'Reservada a casos refratários e pontos bem localizados (evidência heterogênea).' }] },
    ],
  },

  sdcr: {
    n: 'Síndrome da Dor Complexa Regional',
    cid: 'G90.5',
    conf: ['Diagnóstico clínico — critérios de Budapeste', 'Radiografia do segmento (osteopenia irregular tardia)', 'Cintilografia óssea trifásica (apoio em casos duvidosos)', 'Exames apenas para afastar fratura oculta, infecção, TVP ou compressão nervosa'],
    etapas: [
      { id: 'inicial', label: '1ª linha — reabilitação precoce', sub: 'quanto antes, melhor', alerta: true, itens: [
        { m: 'Reabilitação funcional precoce', p: 'Dessensibilização progressiva, carga gradual, uso funcional do membro, imagética motora graduada e terapia espelho. Evitar imobilização e repouso. TCC.' },
        { m: 'Prednisona 20 mg', p: 'Fase inicial inflamatória: 30 a 40 mg por dia por via oral por 2 a 3 semanas, com desmame. Maior benefício quanto mais precoce.' }] },
      { id: 'segunda', label: 'Dor neuropática + bifosfonato', sub: 'edema e osteopenia', itens: [
        { m: 'Gabapentina / Pregabalina / Amitriptilina / Duloxetina', p: 'Para o componente de dor neuropática, titular conforme tolerância.' },
        { m: 'Bifosfonato (pamidronato, alendronato, neridronato ou zoledrônico)', p: 'Em fase precoce com edema e osteopenia regional. Uma das poucas classes com evidência positiva específica.' }] },
      { id: 'terceira', label: 'Refratário (intervencionista)', sub: 'após falha conservadora', itens: [
        { m: 'Bloqueio simpático / estimulação medular / cetamina EV', p: 'Bloqueio simpático como teste e janela para reabilitação; estimulação medular após 6 meses de tratamento conservador; cetamina EV em centro especializado. Evitar simpatectomia.' }] },
    ],
  },

  fadiga: {
    n: 'Fadiga Crônica / Encefalomielite Miálgica',
    cid: 'G93.3',
    conf: ['Hemograma, VHS, PCR', 'TSH e T4 livre', 'Glicemia de jejum e HbA1c', 'Ureia, creatinina/TFG e eletrólitos', 'TGO, TGP, GGT, FA, bilirrubinas, CPK', 'Ferritina, ferro, saturação, B12, folato, 25-OH-vitamina D', 'FAN, fator reumatoide, anti-Ro e anti-La', 'Sorologias infecciosas DIRIGIDAS pela história (EBV, HIV, hepatites B/C, etc.)'],
    etapas: [
      { id: 'inicial', label: 'Manejo (sintomático e de suporte)', sub: 'sem tratamento curativo específico', itens: [
        { m: 'Manejo de energia (pacing)', p: 'Respeitar o limiar de esforço para evitar o mal-estar pós-esforço. O exercício progressivo forçado NÃO é intervenção primária.' },
        { m: 'Tratamento do sono, da dor e da intolerância ortostática', p: 'Higiene do sono; tratar POTS/intolerância ortostática; abordar dor. Rastrear e tratar comorbidades (hipotireoidismo, anemia, depressão).' },
        { m: 'Suporte psicológico', p: 'Apoio psicológico e educação sobre a doença.' }],
        nota: 'Diagnóstico de exclusão (critérios IOM 2015). Os exames servem para excluir alternativas e documentar comorbidades tratáveis.' },
    ],
  },

  aij: {
    n: 'Artrite Idiopática Juvenil',
    cid: 'M08',
    conf: ['Hemograma com esfregaço, VHS, PCR', 'LDH e ácido úrico (rastreio de leucemia/linfoma)', 'Função hepática e renal', 'Ferritina (forma sistêmica e rastreio de SAM)', 'FAN (define risco de uveíte)', 'Fator reumatoide e anti-CCP', 'HLA-B27 (se suspeita de forma relacionada a entesite)', 'Exame oftalmológico com lâmpada de fenda (obrigatório)'],
    basal: ['PPD ou IGRA', 'Radiografia de tórax', 'HBsAg, Anti-HBc, Anti-HBs', 'Anti-HCV', 'Anti-HIV', 'Atualização vacinal (evitar vírus vivo sob imunossupressão)'],
    etapas: [
      { id: 'inicial', label: '1ª linha — AINE + infiltração', sub: 'oligoarticular', itens: [
        { m: 'Naproxeno (dose pediátrica)', p: 'Naproxeno 10 a 20 mg/kg/dia em 2 tomadas (ou ibuprofeno 30 a 40 mg/kg/dia). Isolado resolve poucos casos.' },
        { m: 'Infiltração intra-articular de triancinolona hexacetonida', p: 'Tratamento de escolha na forma oligoarticular. Pode ser sob sedação em crianças menores.' }] },
      { id: 'base', label: 'Base — MMCD (poliarticular)', sub: 'no retorno', itens: [
        { m: 'Metotrexato 10 a 15 mg/m²/semana', p: 'Via oral ou subcutânea, com ácido fólico. Droga de base nas formas poliarticulares.', ceaf: true },
        { m: 'Leflunomida ou sulfassalazina', p: 'Alternativas (sulfassalazina útil na forma relacionada a entesite).', ceaf: true }] },
      { id: 'segunda', label: '2ª linha — biológico', sub: 'falha ou forma sistêmica', itens: [
        { m: 'Anti-TNF (adalimumabe; preferir monoclonal se uveíte)', p: 'Etanercepte não é eficaz para uveíte. Exige rastreio infeccioso e LME.', ceaf: true },
        { m: 'Tocilizumabe (anti-IL-6)', p: 'Forma sistêmica e poliarticular refratária.', ceaf: true },
        { m: 'Anakinra / canaquinumabe (anti-IL-1)', p: '1ª escolha biológica na forma sistêmica com febre e serosite.', ceaf: true }],
        nota: 'ALERTA — Síndrome de Ativação Macrofágica (emergência) na forma sistêmica: queda de VHS com PCR alta, ferritina muito elevada, citopenias, hipofibrinogenemia, hepatoesplenomegalia.' },
    ],
  },

  fmf: {
    n: 'Febre Familiar do Mediterrâneo',
    cid: 'E85.0',
    conf: ['Na crise: hemograma (leucocitose), VHS, PCR, amiloide A sérica (SAA)', 'Entre crises: PCR, VHS e SAA (inflamação subclínica)', 'Proteinúria de 24h ou relação proteína/creatinina (ao menos anual)', 'Creatinina/TFG e urina tipo 1', 'Sequenciamento do gene MEFV'],
    etapas: [
      { id: 'inicial', label: '1ª linha — colchicina', sub: 'iniciar ao diagnóstico', itens: [
        { m: 'Colchicina 0,5 mg', p: 'Adulto: iniciar 1 mg/dia, ajustar até 2 mg/dia (excepcionalmente 3), fracionada. Previne as crises e, principalmente, a amiloidose. Não interromper na crise, gestação ou amamentação.' }],
        nota: 'Monitorar hemograma, CPK, transaminases e função renal. Interações (claritromicina, eritromicina, cetoconazol, ciclosporina, verapamil, estatinas) aumentam a toxicidade.' },
      { id: 'segunda', label: '2ª linha — anti-IL-1', sub: 'resistência/intolerância à colchicina', itens: [
        { m: 'Anakinra 100 mg SC/dia', p: 'Manter a colchicina sempre que tolerada, pelo efeito sobre a amiloidose.', ceaf: true },
        { m: 'Canaquinumabe 150 mg SC a cada 4 semanas', p: 'Ajustar por peso em crianças. Manter a colchicina.', ceaf: true }] },
    ],
  },
};

// Agrupamento do dropdown de doenças.
export const ORDER: [string, string[]][] = [
  ['Parte I — Artrites inflamatórias', ['ar', 'aps', 'ea', 'reativa']],
  ['Parte II — Autoimunes sistêmicas', ['les', 'sjogren', 'esclerose', 'miopatias', 'saf']],
  ['Parte III — Vasculites', ['pmr', 'acg', 'anca']],
  ['Parte IV — Metabólicas e degenerativas', ['gota', 'pseudogota', 'osteoartrite']],
  ['Parte V — Ósseo e outras', ['osteoporose', 'fibromialgia', 'febre', 'chikungunya']],
  ['Parte VI — Dor, pediátrica e autoinflamatórias', ['miofascial', 'sdcr', 'fadiga', 'aij', 'fmf']],
];
