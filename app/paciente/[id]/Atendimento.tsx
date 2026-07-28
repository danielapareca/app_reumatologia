'use client';

import { useEffect, useMemo, useRef, useState, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Icon from '@/components/Icon';
import { D, ORDER } from '@/lib/clinical/diseases';
import { computeFlags } from '@/lib/clinical/flags';
import { scanText } from '@/lib/clinical/insights';
import { ANAM, jointScoreCat, computeAnamInsight, computeGenericAnamInsight, type AnamState } from '@/lib/clinical/anamnese';
import { defaultQState, type QState, type RxItem } from '@/lib/clinical/types';
import type { Patient, Profile, Consulta, LmeJson, ExamValue, MedicationEvent } from '@/lib/types';
import { idadeFromNascimento, diasDesde, haQuantoTempo } from '@/lib/util';
import { computeMonitorAlerts } from '@/lib/clinical/monitor';
import { redFlagsParaDoenca } from '@/lib/clinical/redflags';
import { checkInteracoes } from '@/lib/clinical/interactions';
import { lembretesParaDoenca } from '@/lib/clinical/lembretes';
import { montarRoteiro } from '@/lib/clinical/roteiro';
import { DISCLAIMER_LONGO, DISCLAIMER_DOC } from '@/lib/disclaimer';
import VoiceMic from '@/components/VoiceMic';
import TextTemplates from '@/components/TextTemplates';
import PrintClinicoReader from './PrintClinicoReader';
import ConsultaRecorder from './ConsultaRecorder';
import ConsultaChat from './ConsultaChat';
import ImagingReportReader from './ImagingReportReader';
import LmePreview, { type LmeFields, type LmeMed } from './LmePreview';
import ExamValuesPanel from './ExamValuesPanel';
import ActivityCalculators from './ActivityCalculators';
import ScreeningChecklist from './ScreeningChecklist';
import DxaReader from './DxaReader';
import MedicationTimeline from './MedicationTimeline';
import AiFeedback from './AiFeedback';
import AiDocs from './AiDocs';
import { saveConsulta, updatePatient, setConsent, updateConsulta, deleteConsulta, deletePatient } from './actions';
import { addMedEvent } from './medActions';
import { derivarEventosReceita } from '@/lib/clinical/medsync';

type Tab = 'docs' | 'anamnese' | 'evolucao';

function todayBR() {
  return new Date().toLocaleDateString('pt-BR');
}

// Iniciais do paciente para o avatar da topbar.
function iniciais(nome: string): string {
  const parts = (nome || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const STEPS: { t: Tab; n: number; l: string }[] = [
  { t: 'anamnese', n: 1, l: 'Anamnese' },
  { t: 'docs', n: 2, l: 'Conduta' },
  { t: 'evolucao', n: 3, l: 'Evolução' },
];

// Doenças mais comuns, como chips de acesso rápido (as demais ficam na lista completa).
const DOENCAS_COMUNS: [string, string][] = [
  ['ar', 'Artrite Reumatoide'],
  ['aps', 'Artrite Psoriásica'],
  ['ea', 'Espondiloartrite'],
  ['les', 'LES'],
  ['gota', 'Gota'],
];

export default function Atendimento({
  patient,
  profile,
  consultas,
  examValues,
  medEvents,
  inicial,
}: {
  patient: Patient;
  profile: Profile | null;
  consultas: Consulta[];
  examValues: ExamValue[];
  medEvents: MedicationEvent[];
  inicial?: { doencaId?: string; etapa?: string; tipo?: string };
}) {
  // ---- dados do paciente (editáveis) ----
  const [pacNome, setPacNome] = useState(patient.nome || '');
  const [pacIdade, setPacIdade] = useState(patient.idade || '');
  const [pacWhats, setPacWhats] = useState(patient.whats || '');
  const [pacCpf, setPacCpf] = useState(patient.cpf || '');
  const [pacEmail, setPacEmail] = useState(patient.email || '');
  const [pacNascimento, setPacNascimento] = useState(patient.nascimento || '');
  const [pacEndereco, setPacEndereco] = useState(patient.endereco || '');
  const [pacCidade, setPacCidade] = useState(patient.cidade || '');
  const [pacEstado, setPacEstado] = useState(patient.estado || '');
  const [pacCep, setPacCep] = useState(patient.cep || '');
  const [pacData, setPacData] = useState('');
  const [pacAlergia, setPacAlergia] = useState('');
  const [todayISO, setTodayISO] = useState('');
  const [consent, setConsentState] = useState(!!patient.consent_data);
  const router = useRouter();

  // Consentimento LGPD do paciente.
  async function onConsent(v: boolean) {
    setConsentState(v);
    const r = await setConsent(patient.id, v);
    if (r.error) { setConsentState(!v); showFlash(r.error); }
    else showFlash(v ? 'Consentimento registrado' : 'Consentimento removido');
  }

  // Editar / excluir consultas e excluir paciente.
  const [editId, setEditId] = useState<string | null>(null);
  const [editVals, setEditVals] = useState({ hda: '', antecedentes: '', observacoes: '' });
  function startEdit(c: Consulta) {
    setEditId(c.id);
    setEditVals({ hda: c.hda || '', antecedentes: c.antecedentes || '', observacoes: c.observacoes || '' });
  }
  async function saveEdit(c: Consulta) {
    const r = await updateConsulta({ id: c.id, patientId: patient.id, ...editVals });
    if (r.error) { showFlash(r.error); return; }
    setConsultaList((list) => list.map((x) => (x.id === c.id ? { ...x, ...editVals } : x)));
    setEditId(null);
    showFlash('Consulta atualizada');
  }
  async function delConsulta(c: Consulta) {
    if (!window.confirm('Excluir esta consulta do histórico? Não dá para desfazer.')) return;
    const r = await deleteConsulta(c.id, patient.id);
    if (r.error) { showFlash(r.error); return; }
    setConsultaList((list) => list.filter((x) => x.id !== c.id));
    showFlash('Consulta excluída');
  }
  async function delPaciente() {
    if (!window.confirm(`Excluir o paciente ${pacNome || ''} e TODO o histórico (consultas, exames, medicação)? Não dá para desfazer.`)) return;
    const r = await deletePatient(patient.id);
    if (r.error) { showFlash(r.error); return; }
    router.push('/');
  }

  useEffect(() => {
    setPacData(todayBR());
    setTodayISO(new Date().toISOString().slice(0, 10));
  }, []);

  // Data de nascimento → idade automática.
  function onNascimento(v: string) {
    setPacNascimento(v);
    const calc = idadeFromNascimento(v);
    if (calc) setPacIdade(calc);
  }

  // ---- clínico ----
  // Paciente já acompanhado: pré-carrega doença e fase da última consulta (o médico confirma/ajusta).
  const ultimaConsulta = consultas.length > 0 ? consultas[0] : null;
  const faseInicial = (() => {
    // Paciente já acompanhado: usa a última consulta.
    const did = ultimaConsulta?.doenca_id;
    if (did && D[did]) {
      const et = D[did].etapas.find((e) => e.label === ultimaConsulta?.etapa);
      return { id: did, stage: et ? et.id : (D[did].etapas[0]?.id || '') };
    }
    // Paciente novo vindo do cadastro guiado: usa a doença e fase escolhidas.
    const iid = inicial?.doencaId;
    if (iid && D[iid]) {
      const et = inicial?.etapa && D[iid].etapas.find((e) => e.id === inicial.etapa);
      return { id: iid, stage: et ? et.id : (D[iid].etapas[0]?.id || '') };
    }
    return { id: '', stage: '' };
  })();
  const [curId, setCurId] = useState(faseInicial.id);
  const [curStage, setCurStage] = useState(faseInicial.stage);
  const consultaInicial: 'primeira' | 'retorno' = ultimaConsulta
    ? 'retorno'
    : (inicial?.tipo === 'retorno' ? 'retorno' : (inicial?.tipo === 'primeira' ? 'primeira' : defaultQState.consulta));
  const [Q, setQ] = useState<QState>(() => ({ ...defaultQState, consulta: consultaInicial }));

  // ---- anamnese ----
  const [anam, setAnam] = useState<AnamState>({});

  // ---- texto ----
  const [hda, setHda] = useState('');
  const [antecedentes, setAntecedentes] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Chave dos modelos de texto do médico (por médico, no navegador).
  const tplKey = `modelos_texto_${profile?.id || 'medico'}`;

  // ---- ui ----
  const [tab, setTab] = useState<Tab>('anamnese');
  const [flash, setFlash] = useState('');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [consultaList, setConsultaList] = useState<Consulta[]>(consultas);

  // Insights com IA (Fase 2).
  const [iaInsight, setIaInsight] = useState('');
  const [iaModel, setIaModel] = useState('');
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState('');

  // Aviso de consulta não salva.
  const [dirty, setDirty] = useState(false);
  const skipDirty = useRef(true);

  // Exames numéricos / escores (Fase 3).
  const [examList, setExamList] = useState<ExamValue[]>(examValues);
  const [medList, setMedList] = useState<MedicationEvent[]>(medEvents);
  const monitorAlerts = useMemo(() => computeMonitorAlerts(medList, examList, todayISO), [medList, examList, todayISO]);

  // Resumo dos exames salvos (marcador: valores por data) — para IA e histórico.
  function examesResumo(): string {
    const marcadores = Array.from(new Set(examList.map((e) => e.marcador)));
    if (!marcadores.length) return '';
    return 'Exames (marcador: valores por data) — ' + marcadores.map((m) => {
      const arr = examList.filter((e) => e.marcador === m).sort((a, b) => a.data.localeCompare(b.data));
      return `${m}: ${arr.map((e) => `${e.data}=${Number(e.valor)}${e.unidade || ''}`).join(', ')}`;
    }).join(' | ');
  }

  const disease = curId ? D[curId] : null;
  const stages = disease?.etapas || [];
  const currentStage = useMemo(
    () => stages.find((e) => e.id === curStage) || stages[0],
    [stages, curStage]
  );
  // ---- exames e receita editáveis (o médico acrescenta/retira/altera) ----
  const [examesConf, setExamesConf] = useState<string[]>([]);
  const [examesBasal, setExamesBasal] = useState<string[]>([]);
  const [receitaItens, setReceitaItens] = useState<RxItem[]>([]);

  // Restaura exames e receita a partir do protocolo (ao trocar doença/etapa).
  const resetDocsFromProtocol = useCallback(() => {
    const d = curId ? D[curId] : null;
    setExamesConf(d ? [...d.conf] : []);
    setExamesBasal(d && d.basal ? [...d.basal] : []);
    const st = d ? d.etapas.find((e) => e.id === curStage) || d.etapas[0] : null;
    setReceitaItens(st ? st.itens.map((it) => ({ ...it })) : []);
  }, [curId, curStage]);

  useEffect(() => { resetDocsFromProtocol(); }, [resetDocsFromProtocol]);

  // Marca "alterações não salvas" a partir do trabalho clínico do médico.
  useEffect(() => {
    if (skipDirty.current) { skipDirty.current = false; return; }
    setDirty(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hda, antecedentes, observacoes, anam, curId, curStage, pacNome, pacIdade]);

  // Avisa antes de fechar/recarregar com consulta não salva.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const ceafMeds = useMemo(() => receitaItens.filter((i) => i.m.trim() && i.ceaf), [receitaItens]);
  const stageHasCeaf = ceafMeds.length > 0;

  // ---- pendências deste paciente (rastreio + monitorização) ----
  const screeningPendentes = useMemo(() => {
    const st = patient.screening || {};
    const KEYS: [string, string][] = [['tb', 'Tuberculose'], ['hbv', 'Hepatite B'], ['hcv', 'Hepatite C'], ['hiv', 'HIV'], ['vacinas', 'Vacinação']];
    return KEYS.filter(([k]) => (st[k]?.status || 'pendente') === 'pendente').map(([, l]) => l);
  }, [patient.screening]);

  // ---- interações medicamentosas (receita + medicações em uso + antecedentes) ----
  const interacoes = useMemo(() => {
    const textos = [
      ...receitaItens.map((i) => i.m),
      ...medList.map((m) => m.medicamento),
      antecedentes,
    ];
    return checkInteracoes(textos);
  }, [receitaItens, medList, antecedentes]);

  // ---- lembretes contextuais da doença (inclui lembrar de calcular o FRAX) ----
  const lembretes = useMemo(() => lembretesParaDoenca(curId), [curId]);

  // ---- roteiro adaptativo (doença + tipo + fase) ----
  const roteiro = useMemo(() => montarRoteiro(curId, curStage, Q.consulta), [curId, curStage, Q.consulta]);

  const pendencias = useMemo(() => {
    const p: string[] = [];
    interacoes.filter((x) => x.nivel === 'grave').forEach((x) => p.push('Interação grave: ' + x.msg));
    if (stageHasCeaf && screeningPendentes.length > 0) {
      p.push(`Rastreio pré-biológico pendente: ${screeningPendentes.join(', ')}. Concluir antes de iniciar imunossupressor/biológico.`);
    }
    monitorAlerts.forEach((a) => p.push(a));
    return p;
  }, [interacoes, stageHasCeaf, screeningPendentes, monitorAlerts]);

  // Dias desde a última consulta (paciente já acompanhado).
  const diasUltima = ultimaConsulta ? diasDesde(ultimaConsulta.data, todayISO) : null;

  // Resumo dos escores mais recentes (para a barra lateral).
  const escoresResumo = useMemo(() => {
    const byM = new Map<string, ExamValue>();
    for (const e of examList) {
      if (e.tipo !== 'escore') continue;
      const cur = byM.get(e.marcador);
      if (!cur || e.data > cur.data) byM.set(e.marcador, e);
    }
    return Array.from(byM.values());
  }, [examList]);

  // helpers de edição
  const updConf = (i: number, v: string) => setExamesConf((a) => a.map((x, idx) => (idx === i ? v : x)));
  const rmConf = (i: number) => setExamesConf((a) => a.filter((_, idx) => idx !== i));
  const addConf = () => setExamesConf((a) => [...a, '']);
  const updBasal = (i: number, v: string) => setExamesBasal((a) => a.map((x, idx) => (idx === i ? v : x)));
  const rmBasal = (i: number) => setExamesBasal((a) => a.filter((_, idx) => idx !== i));
  const addBasal = () => setExamesBasal((a) => [...a, '']);
  const updRx = (i: number, patch: Partial<RxItem>) => setReceitaItens((a) => a.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const rmRx = (i: number) => setReceitaItens((a) => a.filter((_, idx) => idx !== i));
  const addRx = () => setReceitaItens((a) => [...a, { m: '', p: '', q: '' }]);

  // texto dos documentos (para salvar e copiar) a partir do estado editável
  function examesToText(): string {
    const parts: string[] = [];
    if (disease) parts.push(`Hipótese diagnóstica: ${disease.n} (CID ${disease.cid})`);
    parts.push('Solicito os seguintes exames:');
    examesConf.filter((x) => x.trim()).forEach((e, i) => parts.push(`${i + 1}. ${e}`));
    const basal = examesBasal.filter((x) => x.trim());
    if (basal.length) {
      parts.push('Avaliação pré-tratamento:');
      basal.forEach((e, i) => parts.push(`${i + 1}. ${e}`));
    }
    return parts.join('\n');
  }
  function receitaToText(): string {
    const parts: string[] = [];
    if (currentStage) parts.push(`Etapa: ${currentStage.label}`);
    receitaItens.filter((x) => x.m.trim()).forEach((it, i) => {
      parts.push(`${i + 1}. ${it.m}${it.ceaf ? ' [LME]' : ''}`);
      if (it.p) parts.push(`   ${it.p}`);
      if (it.q) parts.push(`   Quantidade: ${it.q}`);
    });
    return parts.join('\n');
  }
  function copiarTexto(txt: string) {
    navigator.clipboard.writeText(txt.trim()).then(() => showFlash('Copiado'));
  }
  function scrollToDoc(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // Troca de aba E leva a tela para o conteúdo (senão parece que "não avança").
  const stageRef = useRef<HTMLElement>(null);
  function goTab(t: Tab) {
    setTab(t);
    requestAnimationFrame(() => stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  // Junta exames + receita (e resumo da LME) num texto só, para colar no sistema da clínica.
  function copiarTudo() {
    const partes = ['SOLICITAÇÃO DE EXAMES', examesToText(), '', 'RECEITUÁRIO', receitaToText()];
    if (stageHasCeaf) {
      const meds = receitaItens.filter((i) => i.m.trim() && i.ceaf).map((i) => `- ${i.m}${i.q ? ' (' + i.q + ')' : ''}`);
      partes.push('', 'LME (Componente Especializado):', ...meds);
    }
    copiarTexto(partes.join('\n'));
  }

  const flags = useMemo(() => computeFlags({ ...Q, alergia: pacAlergia }), [Q, pacAlergia]);
  const textInsights = useMemo(
    () => scanText(hda, antecedentes),
    [hda, antecedentes]
  );
  const anamInsight = curId === 'ar'
    ? computeAnamInsight(anam)
    : (curId && ANAM[curId] ? computeGenericAnamInsight(ANAM[curId], anam) : null);

  // ---- LME ----
  const [lme, setLme] = useState<LmeFields>({
    cnes: '', estab: '', paciente: '', mae: '', peso: '', altura: '',
    cid: '', diagnostico: '', anamnese: '', medico: '', cnsMed: '', data: '',
    telefone: '', documento: '', email: '',
  });
  const [lmeMeds, setLmeMeds] = useState<LmeMed[]>([]);

  // Sincroniza cabeçalho da LME com as fontes (preserva peso/altura/mãe manuais).
  useEffect(() => {
    setLme((prev) => ({
      cnes: profile?.cnes || '',
      estab: profile?.clinica || '',
      paciente: pacNome,
      mae: prev.mae,
      peso: prev.peso,
      altura: prev.altura,
      cid: disease?.cid || '',
      diagnostico: disease?.n || '',
      anamnese: hda,
      medico: profile?.nome || '',
      cnsMed: profile?.cns_medico || '',
      data: pacData,
      telefone: pacWhats,
      documento: pacCpf,
      email: pacEmail,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curId, curStage, pacNome, pacWhats, pacCpf, pacEmail, pacData, hda, profile]);

  // Medicamentos LME a partir dos itens marcados como LME na receita editável.
  useEffect(() => {
    setLmeMeds(ceafMeds.map((i) => ({ m: i.m, q: i.q || '' })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receitaItens]);

  const setLmeField = useCallback((k: keyof LmeFields, v: string) => {
    setLme((prev) => ({ ...prev, [k]: v }));
  }, []);

  // ---- flash ----
  const showFlash = useCallback((msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(''), 1600);
  }, []);

  // ---- troca de doença ----
  function onDiseaseChange(id: string) {
    setCurId(id);
    const st = id ? D[id].etapas : [];
    // primeira consulta → 1ª etapa; retorno → etapa "base".
    const next = Q.consulta === 'retorno' ? (st.find((e) => e.id === 'base') || st[0]) : st[0];
    setCurStage(next ? next.id : '');
  }

  function onConsultaChange(v: 'primeira' | 'retorno') {
    setQ((q) => ({ ...q, consulta: v }));
    if (curId) {
      const st = D[curId].etapas;
      const next = v === 'retorno' ? (st.find((e) => e.id === 'base') || st[0]) : st[0];
      setCurStage(next ? next.id : '');
    }
  }

  function toggleComorb(v: string) {
    setQ((q) => ({
      ...q,
      comorb: q.comorb.includes(v) ? q.comorb.filter((x) => x !== v) : [...q.comorb, v],
    }));
  }

  // ---- articulações (escore) ----
  const jL = (anam.jL as number) || 0;
  const jS = (anam.jS as number) || 0;
  const [jointSc, jointCat] = jointScoreCat(jL, jS);
  function setJoints(patch: { jL?: number; jS?: number }) {
    setAnam((a) => {
      const nL = patch.jL !== undefined ? patch.jL : (a.jL as number) || 0;
      const nS = patch.jS !== undefined ? patch.jS : (a.jS as number) || 0;
      const [sc] = jointScoreCat(nL, nS);
      const next: AnamState = { ...a, jL: nL, jS: nS };
      if (sc === null) delete next.joints; else next.joints = sc;
      return next;
    });
  }

  // ---- impressão ----
  const imprimir = useCallback((which: 'all' | 'ex' | 'rc' | 'lme' | 'hist') => {
    document.body.classList.remove('only-ex', 'only-rc', 'only-lme', 'only-hist');
    if (which === 'ex') document.body.classList.add('only-ex');
    else if (which === 'rc') document.body.classList.add('only-rc');
    else if (which === 'lme') {
      if (!stageHasCeaf) return;
      document.body.classList.add('only-lme');
    } else if (which === 'hist') {
      if (consultaList.length === 0) { showFlash('Sem consultas para imprimir'); return; }
      document.body.classList.add('only-hist');
    }
    window.print();
  }, [stageHasCeaf, consultaList.length, showFlash]);

  useEffect(() => {
    const clear = () => document.body.classList.remove('only-ex', 'only-rc', 'only-lme', 'only-hist');
    window.addEventListener('afterprint', clear);
    return () => window.removeEventListener('afterprint', clear);
  }, []);

  // ---- LME PDF ----
  async function baixarLME() {
    if (!stageHasCeaf) { showFlash('LME não se aplica a esta etapa'); return; }
    setDownloading(true);
    try {
      const payload: LmeJson = {
        cnes: lme.cnes, estab: lme.estab, paciente: lme.paciente, mae: lme.mae,
        peso: lme.peso, altura: lme.altura,
        meds: lmeMeds.filter((m) => m.m.trim()).map((m) => ({ m: m.m, q: m.q })),
        cid: lme.cid, diagnostico: lme.diagnostico, anamnese: lme.anamnese,
        medico: lme.medico, cnsMed: lme.cnsMed, data: lme.data,
        telefone: lme.telefone, documento: lme.documento, email: lme.email,
      };
      const res = await fetch('/api/lme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Falha ao gerar o PDF');
      }
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'LME_' + (lme.paciente || 'paciente').replace(/[^a-zA-Z0-9]+/g, '_') + '.pdf';
      document.body.appendChild(a); a.click();
      window.setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      showFlash('PDF oficial da LME gerado');
    } catch (err) {
      alert('Erro ao gerar o PDF oficial: ' + (err instanceof Error ? err.message : ''));
    } finally {
      setDownloading(false);
    }
  }

  // ---- insights com IA ----
  async function gerarInsights() {
    setIaLoading(true);
    setIaError('');
    try {
      const historico = consultaList.map((c) => ({
        data: new Date(c.data).toLocaleDateString('pt-BR'),
        doenca: c.doenca_nome || '',
        etapa: c.etapa || '',
        tipo: c.consulta_tipo === 'primeira' ? 'Primeira consulta' : (c.consulta_tipo === 'retorno' ? 'Retorno com exames' : (c.consulta_tipo || '')),
        hda: c.hda || '',
        antecedentes: c.antecedentes || '',
        exames: c.exam_results || '',
        receita: c.receita_texto || '',
      }));
      // Resumo das medições numéricas (laboratório + escores) para a IA analisar tendência.
      const payload = {
        paciente: pacNome,
        idade: pacIdade,
        doencaId: curId,
        doenca: disease?.n || '',
        cid: disease?.cid || '',
        anamneseAtual: {
          hda,
          antecedentes: [antecedentes, medList.length ? 'Histórico de medicação: ' + medList
            .slice().sort((a, b) => a.data.localeCompare(b.data))
            .map((m) => `${m.data} ${m.evento} ${m.medicamento}${m.dose ? ' (' + m.dose + ')' : ''}${m.motivo ? ' — ' + m.motivo : ''}`)
            .join('; ') : ''].filter(Boolean).join('\n'),
          exames: examesResumo(),
          escore: anamInsight ? `${anamInsight.score}/10 (ACR/EULAR 2010)` : '',
        },
        historico,
      };
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Falha ao gerar insights');
      setIaInsight(j.insight || '');
      setIaModel(j.model || '');
      showFlash('Insights gerados');
    } catch (e) {
      setIaError(e instanceof Error ? e.message : 'Falha ao gerar insights');
    } finally {
      setIaLoading(false);
    }
  }

  // Contexto (texto) para o chat da consulta.
  function buildChatContexto(): string {
    const l: string[] = [];
    if (pacNome) l.push(`Paciente: ${pacNome}${pacIdade ? ', ' + pacIdade : ''}`);
    if (disease) l.push(`Hipótese/doença: ${disease.n} (CID ${disease.cid})`);
    if (currentStage?.label) l.push(`Fase/etapa: ${currentStage.label}`);
    if (Q.consulta) l.push(`Tipo de consulta: ${Q.consulta === 'primeira' ? 'primeira' : 'retorno'}`);
    if (hda.trim()) l.push(`HDA: ${hda.trim()}`);
    if (antecedentes.trim()) l.push(`Antecedentes/medicações/alergias: ${antecedentes.trim()}`);
    if (observacoes.trim()) l.push(`Observações da consulta: ${observacoes.trim()}`);
    const ex = examesResumo();
    if (ex) l.push(`Exames: ${ex}`);
    const rc = receitaToText();
    if (rc.trim()) l.push(`Conduta/receita atual:\n${rc.trim()}`);
    return l.join('\n');
  }

  // Contexto para os documentos de IA (capturado no clique).
  function buildAiContext(): Record<string, string> {
    return {
      paciente: pacNome, idade: pacIdade, doencaId: curId,
      doenca: disease?.n || '', cid: disease?.cid || '',
      hda, antecedentes, exames: examesResumo(),
      etapa: currentStage?.label || '', receita: receitaToText(),
      medico: profile?.nome || '',
    };
  }

  // Redige a anamnese/justificativa da LME (campo 11) com IA.
  const [gerandoAnamnese, setGerandoAnamnese] = useState(false);
  async function gerarLmeAnamnese() {
    setGerandoAnamnese(true);
    try {
      const res = await fetch('/api/ai-doc', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'lme_anamnese', ...buildAiContext() }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Falha ao gerar');
      if (j.texto) setLmeField('anamnese', j.texto);
      showFlash('Anamnese da LME gerada');
    } catch (e) {
      showFlash(e instanceof Error ? e.message : 'Falha ao gerar');
    } finally {
      setGerandoAnamnese(false);
    }
  }

  // ---- salvar ----
  async function onSalvar() {
    if (!pacNome.trim()) { showFlash('Preencha o nome do paciente'); return; }
    setSaving(true);
    try {
      // Atualiza dados demográficos do paciente.
      const up = await updatePatient({
        id: patient.id, nome: pacNome, idade: pacIdade, nascimento: pacNascimento,
        whats: pacWhats, cpf: pacCpf, email: pacEmail,
        endereco: pacEndereco, cidade: pacCidade, estado: pacEstado, cep: pacCep,
      });
      if (up.error) { showFlash(up.error); setSaving(false); return; }

      const lmeJson: LmeJson | null = stageHasCeaf ? {
        cnes: lme.cnes, estab: lme.estab, paciente: lme.paciente, mae: lme.mae,
        peso: lme.peso, altura: lme.altura,
        meds: lmeMeds.filter((m) => m.m.trim()).map((m) => ({ m: m.m, q: m.q })),
        cid: lme.cid, diagnostico: lme.diagnostico, anamnese: lme.anamnese,
        medico: lme.medico, cnsMed: lme.cnsMed, data: lme.data,
        telefone: lme.telefone, documento: lme.documento, email: lme.email,
      } : null;

      const insightText = anamInsight
        ? `${anamInsight.score} / 10 pontos${anamInsight.done ? '' : ' (parcial)'}`
        : '';

      const r = await saveConsulta({
        patientId: patient.id,
        doencaId: curId,
        doencaNome: disease?.n || '',
        etapa: currentStage?.label || '',
        consultaTipo: Q.consulta,
        hda, antecedentes, examResults: examesResumo(),
        insight: insightText,
        examesTexto: examesToText(),
        receitaTexto: receitaToText(),
        lmeJson,
        iaInsight,
        observacoes,
      });
      if (r.error) { showFlash(r.error); setSaving(false); return; }

      // Otimista: adiciona ao topo da lista de evolução.
      const nowIso = new Date().toISOString();
      setConsultaList((list) => [{
        id: 'tmp-' + nowIso, patient_id: patient.id, doctor_id: patient.doctor_id,
        data: nowIso, doenca_id: curId || null, doenca_nome: disease?.n || null,
        etapa: currentStage?.label || null, consulta_tipo: Q.consulta,
        hda: hda || null, antecedentes: antecedentes || null, exam_results: examesResumo() || null,
        insight: insightText || null, exames_texto: null, receita_texto: null, lme_json: lmeJson,
        ia_insight: iaInsight || null, observacoes: observacoes || null,
      }, ...list]);
      setDirty(false);

      // Atualiza a linha do tempo de medicação a partir da receita (início/troca automáticos).
      let addedCount = 0;
      const novos = derivarEventosReceita(receitaItens, medList);
      if (novos.length && todayISO) {
        const criados: MedicationEvent[] = [];
        for (const n of novos) {
          const r = await addMedEvent({
            patientId: patient.id, medicamento: n.medicamento, evento: n.evento,
            dose: n.dose, motivo: 'Conforme receita desta consulta', data: todayISO,
          });
          if (r.value) criados.push(r.value);
        }
        if (criados.length) { setMedList((l) => [...l, ...criados]); addedCount = criados.length; }
      }
      showFlash(addedCount ? `Consulta salva · ${addedCount} med. na linha do tempo` : 'Consulta salva');
    } finally {
      setSaving(false);
    }
  }

  const anamDef = curId ? ANAM[curId] : null;

  return (
    <>
      <div className="pt-topbar no-print">
        <Link className="pt-back" href="/" title="Voltar aos pacientes"><Icon name="arrowleft" size={20} /><span className="pt-back-txt">Voltar</span></Link>
        <div className="pt-avatar">{iniciais(pacNome)}</div>
        <div className="pt-id">
          <div className="pt-nm">
            {pacNome || 'Novo atendimento'}
            {pacIdade && <span className="pt-pill">{pacIdade}</span>}
          </div>
          <div className="pt-dx">
            {disease?.n || 'Selecione a condição nos dados do paciente'}
            {currentStage ? ' · ' + currentStage.label : ''}
            {diasUltima !== null ? ' · última consulta ' + haQuantoTempo(diasUltima) : ''}
          </div>
        </div>
        <span className="spacer" />
        <div className="pt-topnav">
          <button className="btn-ghost" onClick={() => goTab('evolucao')} style={{ height: 40, padding: '0 14px', fontSize: 13 }}>
            <Icon name="clock" size={16} /> Histórico
          </button>
          <button className="btn-primary" onClick={onSalvar} disabled={saving} style={{ height: 40, padding: '0 16px', fontSize: 13 }}>
            <Icon name="save" size={16} /> {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

      <div className="safety-bar no-print">
        <Icon name="shield" size={16} />
        <span>Apoio ao médico — todas as sugestões exigem revisão e validação clínica. Não substitui o médico.</span>
      </div>

      {!profile?.cnes && (
        <div className="no-print" style={{ background: 'var(--amber-bg)', borderBottom: '1px solid #ECD9AE', padding: '9px 24px', fontSize: 12.5, color: 'var(--amber)', fontWeight: 600 }}>
          Complete o <Link href="/perfil" style={{ color: 'var(--gold-600)', fontWeight: 700 }}>cabeçalho do médico</Link> (CNES, CNS) para a LME sair completa.
        </div>
      )}

      {pendencias.length > 0 && (
        <div className="no-print pend-bar">
          <span className="pend-title">Pendências deste paciente</span>
          <ul>
            {pendencias.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      <div className="layout">
        {/* ------- CONTROLES ------- */}
        <aside className="controls no-print">
          <div className="stepper">
            {STEPS.map((s, i) => {
              const curIdx = STEPS.findIndex((x) => x.t === tab);
              return (
                <Fragment key={s.t}>
                  {i > 0 && <div className={'stp-conn' + (i <= curIdx ? ' done' : '')} />}
                  <button className={'stp' + (i === curIdx ? ' on' : '') + (i < curIdx ? ' done' : '')} onClick={() => goTab(s.t)}>
                    <span className="stp-dot">{i < curIdx ? <Icon name="check" size={15} /> : s.n}</span>
                    <span className="stp-lbl">{s.l}</span>
                  </button>
                </Fragment>
              );
            })}
          </div>

          <div className="block">
            <p className="eyebrow"><Icon name="user" size={14} /> Paciente</p>
            <div className="field"><label>Nome do paciente</label><input value={pacNome} onChange={(e) => setPacNome(e.target.value)} /></div>
            <div className="row2">
              <div className="field"><label>Data de nascimento</label><input type="date" value={pacNascimento} onChange={(e) => onNascimento(e.target.value)} /></div>
              <div className="field"><label>Idade (automática)</label><input value={pacIdade} onChange={(e) => setPacIdade(e.target.value)} placeholder="ex.: 54 anos" /></div>
            </div>
            <div className="row2">
              <div className="field"><label>Data da consulta</label><input value={pacData} onChange={(e) => setPacData(e.target.value)} /></div>
              <div className="field"><label>WhatsApp</label><input value={pacWhats} onChange={(e) => setPacWhats(e.target.value)} /></div>
            </div>
            <div className="row2">
              <div className="field"><label>CPF</label><input value={pacCpf} onChange={(e) => setPacCpf(e.target.value)} /></div>
              <div className="field"><label>E-mail</label><input value={pacEmail} onChange={(e) => setPacEmail(e.target.value)} /></div>
            </div>
            <div className="field"><label>Endereço (rua, nº, bairro)</label><input value={pacEndereco} onChange={(e) => setPacEndereco(e.target.value)} placeholder="Rua Exemplo, 123, Centro" /></div>
            <div className="row2">
              <div className="field"><label>Cidade</label><input value={pacCidade} onChange={(e) => setPacCidade(e.target.value)} /></div>
              <div className="field"><label>Estado (UF)</label><input value={pacEstado} onChange={(e) => setPacEstado(e.target.value)} maxLength={2} placeholder="SP" /></div>
            </div>
            <div className="field"><label>CEP</label><input value={pacCep} onChange={(e) => setPacCep(e.target.value)} placeholder="00000-000" /></div>
            <label className="consent-box">
              <input type="checkbox" checked={consent} onChange={(e) => onConsent(e.target.checked)} />
              <span>Paciente <b>consente</b> com o tratamento dos dados de saúde (LGPD).
                {consent && patient.consent_data_at && <span className="consent-hint"> Registrado em {new Date(patient.consent_data_at).toLocaleDateString('pt-BR')}.</span>}
              </span>
            </label>
            {!consent && <div className="consent-warn">Sem consentimento registrado.</div>}
          </div>

          <div className="block picker">
            <p className="eyebrow"><Icon name="stethoscope" size={14} /> Doença ativa</p>
            <div className="chips" style={{ marginBottom: 9 }}>
              {DOENCAS_COMUNS.filter(([id]) => D[id]).map(([id, lbl]) => (
                <span key={id} className={'chip' + (curId === id ? ' on' : '')} onClick={() => onDiseaseChange(id)}>{lbl}</span>
              ))}
            </div>
            <label>Ou selecione na lista completa</label>
            <select className="doenca" value={curId} onChange={(e) => onDiseaseChange(e.target.value)}>
              <option value="">— escolha a doença —</option>
              {ORDER.map(([grp, ids]) => (
                <optgroup key={grp} label={grp}>
                  {ids.map((id) => <option key={id} value={id}>{D[id].n}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <details className="acc">
            <summary>Avaliação do paciente</summary>
            <div className="inner">
              <p className="qhint">Responda rápido. Ajusta a etapa e mostra alertas de segurança na receita.</p>

              <div className="qlabel">Tipo de consulta</div>
              <div className="chips">
                {(['primeira', 'retorno'] as const).map((v) => (
                  <span key={v} className={'chip' + (Q.consulta === v ? ' on' : '')} onClick={() => onConsultaChange(v)}>
                    {v === 'primeira' ? 'Primeira consulta' : 'Retorno com exames'}
                  </span>
                ))}
              </div>

              <div className="qlabel">Gestante ou amamentando?</div>
              <div className="chips">
                {([['nao', 'Não'], ['sim', 'Sim'], ['na', 'N/A']] as const).map(([v, t]) => (
                  <span key={v} className={'chip' + (Q.gestacao === v ? ' on' : '')} onClick={() => setQ((q) => ({ ...q, gestacao: v }))}>{t}</span>
                ))}
              </div>

              <div className="qlabel">Função renal</div>
              <div className="chips">
                {([['normal', 'Normal'], ['baixa', 'TFG < 30'], ['desc', 'Desconhecida']] as const).map(([v, t]) => (
                  <span key={v} className={'chip' + (Q.renal === v ? ' on' : '')} onClick={() => setQ((q) => ({ ...q, renal: v }))}>{t}</span>
                ))}
              </div>

              <div className="qlabel">Transaminases / fígado</div>
              <div className="chips">
                {([['normal', 'Normal'], ['alt', 'Alteradas'], ['desc', 'Desconhecida']] as const).map(([v, t]) => (
                  <span key={v} className={'chip' + (Q.hepato === v ? ' on' : '')} onClick={() => setQ((q) => ({ ...q, hepato: v }))}>{t}</span>
                ))}
              </div>

              <div className="qlabel">Infecção ativa ou rastreio TB/HBV pendente?</div>
              <div className="chips">
                {([['nao', 'Não'], ['sim', 'Sim / pendente']] as const).map(([v, t]) => (
                  <span key={v} className={'chip' + (Q.infec === v ? ' on' : '')} onClick={() => setQ((q) => ({ ...q, infec: v }))}>{t}</span>
                ))}
              </div>

              <div className="qlabel">Comorbidades</div>
              <div className="chips">
                {([['drc', 'DRC'], ['hepato', 'Hepatopatia'], ['gi', 'Úlcera / sangramento GI'], ['icc', 'ICC / cardiopatia'], ['tb', 'TB prévia']] as const).map(([v, t]) => (
                  <span key={v} className={'chip' + (Q.comorb.includes(v) ? ' on' : '')} onClick={() => toggleComorb(v)}>{t}</span>
                ))}
              </div>

              <div className="field" style={{ marginTop: 12 }}>
                <label>Alergias medicamentosas</label>
                <input value={pacAlergia} onChange={(e) => setPacAlergia(e.target.value)} placeholder="ex.: alergia a sulfa" />
              </div>
            </div>
          </details>

          <div className="block">
            <p className="eyebrow" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Icon name="chart" size={14} /> Escores</span>
              <button className="eb-link" onClick={() => goTab('anamnese')}>Calcular</button>
            </p>
            {escoresResumo.length === 0 ? (
              <p className="empty-note" style={{ fontSize: 12 }}>Sem escores ainda. Calcule na aba Anamnese (DAS28, CDAI, BASDAI, SLEDAI).</p>
            ) : (
              <div className="esc-grid">
                {escoresResumo.map((e) => (
                  <div key={e.id} className="esc-cell">
                    <div className="esc-k">{e.marcador}</div>
                    <div className="esc-v">{Number(e.valor)}</div>
                    <div className="esc-d">{e.data.slice(8, 10)}/{e.data.slice(5, 7)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="block">
            <p className="eyebrow"><Icon name="pill" size={14} /> Etapa do tratamento</p>
            <div className="stages">
              {!curId ? (
                <p className="empty-note" style={{ fontSize: 12 }}>Escolha a doença para ver as etapas.</p>
              ) : (
                stages.map((e) => (
                  <label key={e.id} className={'stage-opt' + (e.alerta ? ' alert' : '') + (e.id === curStage ? ' on' : '')}>
                    <input type="radio" name="stage" checked={e.id === curStage} onChange={() => setCurStage(e.id)} />
                    <span>
                      <span className="st-label">{e.label}</span>
                      <span className="st-sub">{e.sub || ''}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="block actions">
            <button className="btn-primary" onClick={() => imprimir('all')}>Imprimir tudo</button>
            <div className="btn-row3">
              <button className="btn-ghost" onClick={() => imprimir('ex')}>Exames</button>
              <button className="btn-ghost" onClick={() => imprimir('rc')}>Receita</button>
              <button className={'btn-ghost' + (stageHasCeaf ? '' : ' disabled')} onClick={() => imprimir('lme')}>LME</button>
            </div>
            <div className="btn-row">
              <button className="btn-ghost" onClick={() => copiarTexto(examesToText())}>Copiar exames</button>
              <button className="btn-ghost" onClick={() => copiarTexto(receitaToText())}>Copiar receita</button>
            </div>
            <button className={'btn-primary' + (curId ? '' : ' disabled')} onClick={copiarTudo}>Copiar tudo (exames + receita)</button>
            <button className={'btn-ghost' + (curId ? '' : ' disabled')} onClick={resetDocsFromProtocol}>Restaurar modelo do protocolo</button>
            <button className="btn-primary" onClick={onSalvar} disabled={saving}>{saving ? 'Salvando…' : (dirty ? 'Salvar consulta •' : 'Salvar consulta')}</button>
            {dirty && (
              <div style={{ fontSize: 11.5, color: 'var(--red)', fontWeight: 600, textAlign: 'center', marginTop: -4 }}>
                ● Alterações não salvas
              </div>
            )}
          </div>

          <div className="safety">
            <b>Apoio ao médico — não substitui o médico.</b> {DISCLAIMER_LONGO} Os itens vêm pré-preenchidos pelo protocolo; revise, acrescente ou retire e individualize as doses (peso, função renal, interações, gestação) antes de assinar. A tarja <b>LME</b> marca o que exige Laudo do Componente Especializado.
          </div>

          <button className="btn-danger" onClick={delPaciente} style={{ marginTop: 12 }}>
            <Icon name="logout" size={15} /> Excluir paciente e histórico
          </button>
        </aside>

        {/* ------- PALCO ------- */}
        <main className="stage" ref={stageRef}>
          <div className="maintabs no-print">
            <button className={'maintab' + (tab === 'anamnese' ? ' on' : '')} onClick={() => goTab('anamnese')}>1 · Anamnese</button>
            <button className={'maintab' + (tab === 'docs' ? ' on' : '')} onClick={() => goTab('docs')}>2 · Conduta</button>
            <button className={'maintab' + (tab === 'evolucao' ? ' on' : '')} onClick={() => goTab('evolucao')}>3 · Evolução</button>
          </div>

          {/* DOCUMENTOS / CONDUTA */}
          <div className={'tabpanel docs-panel' + (tab === 'docs' ? ' on' : '')} style={{ display: tab === 'docs' ? 'flex' : 'none', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
            <p className="sub no-print" style={{ width: '100%', maxWidth: 720, margin: 0 }}>
              Os <b>insights da IA</b> e a <b>conversa com a IA</b> ficam no fim da aba <button className="btn-ghost" style={{ padding: '3px 9px', fontSize: 12 }} onClick={() => goTab('anamnese')}>1 · Anamnese</button> (Passo 4). Aqui você emite exames, receita e LME.
            </p>

            {/* Atalhos: Exames · Receita · LME */}
            <div className="no-print cond-actions" style={{ width: '100%', maxWidth: 720 }}>
              <button className="cond-card" onClick={() => scrollToDoc('wrapExames')}>
                <Icon name="clipboard" size={20} />
                <span className="cc-t">Exames</span>
                <span className="cc-s">Solicitar</span>
              </button>
              <button className="cond-card" onClick={() => scrollToDoc('wrapReceita')}>
                <Icon name="pill" size={20} />
                <span className="cc-t">Receita</span>
                <span className="cc-s">Emitir</span>
              </button>
              <button className={'cond-card cond-card-lme' + (stageHasCeaf ? '' : ' disabled')} onClick={() => scrollToDoc('wrapLME')}>
                <Icon name="printer" size={20} />
                <span className="cc-t">LME</span>
                <span className="cc-s">{stageHasCeaf ? 'PDF oficial' : 'não se aplica'}</span>
              </button>
            </div>

            {/* Exames */}
            <div className="doc-wrap" id="wrapExames">
              <div className="doc-tools no-print">
                <span className="dt-name">Solicitação de exames</span>
                <span className="dt-btns">
                  <button className="btn-ghost" onClick={() => imprimir('ex')}>Imprimir</button>
                  <button className="btn-ghost" onClick={() => copiarTexto(examesToText())}>Copiar</button>
                </span>
              </div>
              <article className="doc" id="docExames">
                <Letterhead profile={profile} />
                <div className="doc-title">Solicitação de exames</div>
                <DocMeta nome={pacNome} idade={pacIdade} data={pacData} />
                {!disease ? (
                  <p className="empty-note">Selecione uma condição para gerar o pedido.</p>
                ) : (
                  <div>
                    <div className="hipotese"><span className="k">Hipótese diagnóstica:</span> {disease.n} (CID {disease.cid})</div>
                    <div className="solicito">Solicito os seguintes exames:</div>
                    {examesConf.map((e, i) => (
                      <div className="exrow" key={i}>
                        <span className="num">{i + 1}.</span>
                        <input className="docf" value={e} onChange={(ev) => updConf(i, ev.target.value)} placeholder="Exame" />
                        <button className="rmbtn no-print" onClick={() => rmConf(i)} title="Remover exame">×</button>
                      </div>
                    ))}
                    <button className="addbtn no-print" onClick={addConf}>+ adicionar exame</button>
                    {examesBasal.length > 0 && (
                      <>
                        <div className="subhead">Avaliação pré-tratamento (antes de imunossupressor)</div>
                        {examesBasal.map((e, i) => (
                          <div className="exrow" key={i}>
                            <span className="num">{i + 1}.</span>
                            <input className="docf" value={e} onChange={(ev) => updBasal(i, ev.target.value)} placeholder="Exame" />
                            <button className="rmbtn no-print" onClick={() => rmBasal(i)} title="Remover exame">×</button>
                          </div>
                        ))}
                        <button className="addbtn no-print" onClick={addBasal}>+ adicionar exame pré-tratamento</button>
                      </>
                    )}
                    {Q.consulta === 'primeira' && (
                      <div className="retnote">Retornar com os resultados para definição do tratamento de base.</div>
                    )}
                  </div>
                )}
                <Signature profile={profile} nome={pacData} localCidade={profile?.cidade} data={pacData} />
                <div className="doc-disclaimer">{DISCLAIMER_DOC}</div>
              </article>
            </div>

            {/* Receita */}
            <div className="doc-wrap" id="wrapReceita">
              <div className="doc-tools no-print">
                <span className="dt-name">Receituário</span>
                <span className="dt-btns">
                  <button className="btn-ghost" onClick={() => imprimir('rc')}>Imprimir</button>
                  <button className="btn-ghost" onClick={() => copiarTexto(receitaToText())}>Copiar</button>
                </span>
              </div>
              <article className="doc" id="docReceita">
                <Letterhead profile={profile} />
                <div className="doc-title">Receituário</div>
                <DocMeta nome={pacNome} idade={pacIdade} data={pacData} />
                {!disease || !currentStage ? (
                  <p className="empty-note">Selecione uma condição para gerar a receita.</p>
                ) : (
                  <div>
                    {flags.length > 0 && (
                      <div className="flags">
                        <div className="ft">Alertas de segurança — revise antes de assinar</div>
                        <ul>{flags.map((x, i) => <li key={i}>{x}</li>)}</ul>
                      </div>
                    )}
                    <div className={'stage-banner' + (currentStage.alerta ? ' alert' : '')}>
                      Etapa: {currentStage.label}{currentStage.sub ? ' — ' + currentStage.sub : ''}
                    </div>
                    {interacoes.length > 0 && (
                      <div className="interacoes no-print">
                        <div className="it-head"><Icon name="shield" size={15} /> Interações medicamentosas — revise antes de assinar</div>
                        <ul>
                          {interacoes.map((x, i) => (
                            <li key={i} className={'it-li it-' + x.nivel}>
                              <span className="it-badge">{x.nivel === 'grave' ? 'EVITAR' : 'CAUTELA'}</span>
                              <span>{x.msg}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="it-foot">Apoio — o médico decide. Verificação por nome do medicamento; confira sempre.</div>
                      </div>
                    )}
                    {receitaItens.map((it, i) => (
                      <div className="rx-item" key={i}>
                        <div className="rx-num">{i + 1}.</div>
                        <div className="rx-body">
                          <div className="rx-med" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input className="docf" style={{ fontWeight: 600 }} value={it.m} onChange={(ev) => updRx(i, { m: ev.target.value })} placeholder="Medicamento e dose" />
                            <button className={'lme-tag-btn no-print' + (it.ceaf ? ' on' : '')} onClick={() => updRx(i, { ceaf: !it.ceaf })} title="Marcar como item de LME (Componente Especializado)">LME</button>
                            <button className="rmbtn no-print" onClick={() => rmRx(i)} title="Remover medicamento">×</button>
                            {it.ceaf && <span className="ceaf print-only">LME</span>}
                          </div>
                          <textarea className="docf rx-pos" style={{ minHeight: 34 }} value={it.p} onChange={(ev) => updRx(i, { p: ev.target.value })} placeholder="Posologia / orientação" />
                          <div className="rx-qtd">Quantidade: <input className="docf" style={{ display: 'inline-block', width: 180 }} value={it.q || ''} onChange={(ev) => updRx(i, { q: ev.target.value })} placeholder="ex.: 24 comprimidos" /></div>
                        </div>
                      </div>
                    ))}
                    <button className="addbtn no-print" onClick={addRx}>+ adicionar medicamento</button>
                    {currentStage.nota && <div className="rx-nota">{currentStage.nota}</div>}
                  </div>
                )}
                <Signature profile={profile} nome={pacData} localCidade={profile?.cidade} data={pacData} />
                <div className="doc-disclaimer">{DISCLAIMER_DOC}</div>
              </article>
            </div>

            {/* LME */}
            {stageHasCeaf && (
              <div className="doc-wrap" id="wrapLME">
                <LmePreview
                  fields={lme}
                  setField={setLmeField}
                  meds={lmeMeds}
                  setMeds={setLmeMeds}
                  onDownload={baixarLME}
                  downloading={downloading}
                  onGerarAnamnese={gerarLmeAnamnese}
                  gerandoAnamnese={gerandoAnamnese}
                />
              </div>
            )}

            {/* Documentos com IA (laudo/atestado/relatório/resumo) */}
            <div className="no-print" style={{ width: '100%', maxWidth: 720 }}>
              <AiDocs buildContext={buildAiContext} onFlash={showFlash} />

              <div className="passo-nav">
                <button className="btn-ghost" onClick={() => goTab('anamnese')}><Icon name="arrowleft" size={16} /> Anamnese</button>
                <button className="btn-ghost" onClick={onSalvar} disabled={saving}><Icon name="save" size={16} /> {saving ? 'Salvando…' : 'Salvar consulta'}</button>
                <button className="btn-primary" onClick={() => goTab('evolucao')}>Ver Evolução <Icon name="arrowright" size={16} /></button>
              </div>
            </div>
          </div>

          {/* ANAMNESE */}
          <div className="tabpanel" style={{ display: tab === 'anamnese' ? 'block' : 'none' }}>
            <div className="panel-inner">
              {consultaList.length > 0 && (
                <div className="card" style={{ borderColor: '#ECD9AE', background: 'var(--amber-bg)' }}>
                  <h3 style={{ marginBottom: 4 }}>Paciente já acompanhado</h3>
                  <p className="sub" style={{ margin: 0 }}>
                    <b>{consultaList.length}</b> consulta(s). Última{' '}
                    <b>{new Date(consultaList[0].data).toLocaleDateString('pt-BR')}</b>
                    {diasUltima !== null && <> ({haQuantoTempo(diasUltima)})</>}
                    {consultaList[0].doenca_nome ? <> — {consultaList[0].doenca_nome}</> : null}
                    {consultaList[0].etapa ? <> · {consultaList[0].etapa}</> : null}.
                  </p>
                  {faseInicial.id && (
                    <p className="sub" style={{ margin: '4px 0 0', color: 'var(--amber)' }}>
                      Já carreguei a <b>doença e a fase</b> abaixo a partir da última consulta — confirme ou ajuste nos dados do paciente.
                    </p>
                  )}
                  {consultaList[0].exam_results && (
                    <p className="sub" style={{ margin: '4px 0 0' }}><span className="k">Últimos exames:</span> {consultaList[0].exam_results}</p>
                  )}
                  <p className="sub" style={{ margin: '6px 0 0' }}>
                    Histórico das consultas em{' '}
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => goTab('evolucao')}>3 · Evolução</button>
                    {' '}· gráficos de exames no Passo 1 abaixo.
                  </p>
                </div>
              )}
              {curId && redFlagsParaDoenca(curId).length > 0 && (
                <div className="card" style={{ borderColor: '#ECC9C4', background: 'var(--red-bg)' }}>
                  <h3 style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="shield" size={16} /> Sinais de alarme — {disease?.n}</h3>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                    {redFlagsParaDoenca(curId).map((f, i) => <li key={i} style={{ fontSize: 12.5, color: '#7a3a30', marginBottom: 5, lineHeight: 1.45 }}>{f}</li>)}
                  </ul>
                </div>
              )}
              {lembretes.length > 0 && (
                <div className="lembretes-card">
                  <h3><Icon name="bell" size={16} /> Lembretes — {disease?.n}</h3>
                  <ul>
                    {lembretes.map((l, i) => (
                      <li key={i} className={l.destaque ? 'lb-destaque' : ''}>
                        {l.destaque && <span className="lb-badge">FRAX</span>}
                        {l.txt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Roteiro adaptativo da consulta */}
              {curId && (
                <div className="roteiro-resumo">
                  <Icon name="sparkles" size={15} /> <b>Roteiro desta consulta:</b> {roteiro.resumo}
                </div>
              )}

              {/* Passo 1 · Dados e exames */}
              <div className="roteiro-h"><span className="rh-n">1</span><div><div className="rh-t">Dados e exames</div><div className="rh-s">Confira os dados do paciente e os exames.</div></div></div>
              {roteiro.dados.length > 0 && <ul className="roteiro-foco">{roteiro.dados.map((t, i) => <li key={i}>{t}</li>)}</ul>}
              <ExamValuesPanel patientId={patient.id} values={examList} onChanged={setExamList} today={todayISO} />
              <ImagingReportReader patientId={patient.id} today={todayISO} onInserir={(txt) => setObservacoes((v) => (v.trim() ? v.trim() + '\n' : '') + txt)} />

              {/* Passo 2 · Escuta e avaliação */}
              <div className="roteiro-h"><span className="rh-n">2</span><div><div className="rh-t">Escuta e avaliação</div><div className="rh-s">Grave a conversa e faça a avaliação do paciente.</div></div></div>
              {roteiro.avaliacao.length > 0 && <ul className="roteiro-foco">{roteiro.avaliacao.map((t, i) => <li key={i}>{t}</li>)}</ul>}
              <div className="card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="mic" size={16} /> Escuta da consulta</h3>
                <p className="sub" style={{ margin: '0 0 10px' }}>Grave a conversa ao vivo — a transcrição cai nas Observações e é salva com a consulta. Peça o consentimento do paciente.</p>
                <ConsultaRecorder onText={(chunk) => setObservacoes((v) => (v ? v.trim() + '\n' : '') + chunk)} />
              </div>

              <div className="card">
                <h3>Anamnese guiada</h3>
                <p className="sub">
                  O doutor pergunta, marca as respostas e dita as observações por voz. A ferramenta cruza com o protocolo e gera insights.{' '}
                  {curId && <span style={{ color: 'var(--gold)', fontWeight: 600 }}>({disease?.n})</span>}
                </p>

                {!curId ? (
                  <p className="empty-note">Selecione uma doença para carregar a anamnese.</p>
                ) : !anamDef ? (
                  <p className="sub" style={{ margin: 0 }}>
                    Anamnese estruturada desta doença em construção (piloto validado na Artrite Reumatoide). Use os campos de voz abaixo para registrar a história — tudo é salvo no histórico.
                  </p>
                ) : (
                  <div>
                    {anamDef.scored.map((qd) => (
                      qd.id === 'joints' ? (
                        <div className="an-q" key={qd.id}>
                          <div className="ql">{qd.q} <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(conte quantas com sinovite)</span></div>
                          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
                            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Grandes<br />
                              <input type="number" min={0} value={jL} onChange={(e) => setJoints({ jL: Math.max(0, parseInt(e.target.value || '0', 10)) })} style={{ width: 82, padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14 }} />
                            </label>
                            <label style={{ fontSize: 12, color: 'var(--muted)' }}>Pequenas<br />
                              <input type="number" min={0} value={jS} onChange={(e) => setJoints({ jS: Math.max(0, parseInt(e.target.value || '0', 10)) })} style={{ width: 82, padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 6, fontFamily: 'inherit', fontSize: 14 }} />
                            </label>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 6, fontWeight: 600 }}>
                            {(jL + jS > 0 && jointSc !== null) ? `Categoria ACR/EULAR: ${jointCat} — ${jointSc} ponto${jointSc === 1 ? '' : 's'}` : ''}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 3 }}>Grandes: ombro, cotovelo, quadril, joelho, tornozelo. Pequenas: MCF, IFP, punho, MTF, IF do polegar.</div>
                        </div>
                      ) : (
                        <div className="an-q" key={qd.id}>
                          <div className="ql">{qd.q}</div>
                          <div className="chips">
                            {qd.opts.map((o, i) => (
                              <span key={i} className={'chip' + ((anam[qd.id] === o[1] && anam[qd.id + '_i'] === i) ? ' on' : '')}
                                onClick={() => setAnam((a) => ({ ...a, [qd.id]: o[1], [qd.id + '_i']: i }))}>
                                {o[0]}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                    <div style={{ height: 6 }} />
                    {anamDef.clinical.map((qd) => (
                      <div className="an-q" key={qd.id}>
                        <div className="ql">{qd.q}</div>
                        <div className="chips">
                          {['Não', 'Sim'].map((t, i) => (
                            <span key={i} className={'chip' + (anam[qd.id] === (i === 1) ? ' on' : '')}
                              onClick={() => setAnam((a) => ({ ...a, [qd.id]: i === 1 }))}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}

                    {anamInsight && (
                      <>
                        <div className="scorebox">
                          <div className="it">Insight — {anamInsight.criterio}</div>
                          <div className="score">{anamInsight.score} <small>/ {anamInsight.max} pontos{anamInsight.done ? '' : ' (parcial)'}</small></div>
                          <div className={'verdict ' + (anamInsight.yes ? 'yes' : 'no')}>{anamInsight.verdict}</div>
                          {anamInsight.tips.length > 0 && (
                            <ul>{anamInsight.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
                          )}
                        </div>
                        {anamInsight.septicWarning && (
                          <div className="an-flag">Monoartrite febril: excluir ARTRITE SÉPTICA com artrocentese antes de qualquer imunossupressor.</div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="card">
                <h3>Queixa e história (ditar, digitar ou ler print)</h3>
                <p className="sub" style={{ margin: '0 0 10px' }}>Anexe um <b>print/foto da evolução do seu sistema</b> e a IA organiza em HDA, antecedentes e observações — sem redigitar. Você revisa e edita.</p>
                <PrintClinicoReader onLido={(d) => {
                  const junta = (atual: string, novo: string) => !novo ? atual : (atual.trim() ? atual.trim() + '\n' + novo : novo);
                  if (d.hda) setHda((v) => junta(v, d.hda));
                  if (d.antecedentes) setAntecedentes((v) => junta(v, d.antecedentes));
                  if (d.observacoes) setObservacoes((v) => junta(v, d.observacoes));
                }} />
                <div className="an-q" style={{ marginTop: 14 }}>
                  <div className="ql ql-row">História da doença atual
                    <TextTemplates storageKey={tplKey} atalho={hda} onInsert={(t) => setHda((v) => (v ? v.trim() + ' ' : '') + t)} />
                  </div>
                  <div className="fieldrow">
                    <textarea value={hda} onChange={(e) => setHda(e.target.value)} placeholder="Dite ou digite a história..." />
                    <VoiceMic onText={(chunk) => setHda((v) => (v ? v.trim() + ' ' : '') + chunk)} />
                  </div>
                </div>
                <div className="an-q">
                  <div className="ql ql-row">Antecedentes, medicações em uso, alergias
                    <TextTemplates storageKey={tplKey} atalho={antecedentes} onInsert={(t) => setAntecedentes((v) => (v ? v.trim() + ' ' : '') + t)} />
                  </div>
                  <div className="fieldrow">
                    <textarea value={antecedentes} onChange={(e) => setAntecedentes(e.target.value)} placeholder="Dite ou digite..." />
                    <VoiceMic onText={(chunk) => setAntecedentes((v) => (v ? v.trim() + ' ' : '') + chunk)} />
                  </div>
                </div>
                <div className="an-q" style={{ marginBottom: 0 }}>
                  <div className="ql ql-row">Observações da consulta
                    <TextTemplates storageKey={tplKey} atalho={observacoes} onInsert={(t) => setObservacoes((v) => (v ? v.trim() + ' ' : '') + t)} />
                  </div>
                  <div className="fieldrow">
                    <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações do médico (a transcrição da escuta cai aqui; acrescente orientações, retorno, conduta livre…)" />
                    <VoiceMic onText={(chunk) => setObservacoes((v) => (v ? v.trim() + ' ' : '') + chunk)} />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Insights do relato</h3>
                <p className="sub">
                  Achados reconhecidos no texto ditado ou digitado (apoio, não diagnóstico).{' '}
                  <span style={{ color: 'var(--red)', fontWeight: 600 }}>Vermelho</span> = alerta ·{' '}
                  <span style={{ color: 'var(--gold-600)', fontWeight: 600 }}>dourado</span> = pista diagnóstica.
                </p>
                {textInsights.length === 0 ? (
                  <p className="empty-note" style={{ fontSize: 12.5 }}>Conforme o doutor dita ou digita a história, os achados relevantes aparecem aqui.</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {textInsights.map((r, i) => (
                      <li key={i} style={{ fontSize: 12.5, marginBottom: 5, color: r.lvl === 'flag' ? 'var(--red)' : (r.lvl === 'point' ? 'var(--gold-600)' : 'var(--muted)') }}>{r.m}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Passo 3 · Cálculos (se necessário) — adaptado à doença/fase */}
              <div className="roteiro-h"><span className="rh-n">3</span><div><div className="rh-t">Cálculos <span style={{ fontWeight: 400, color: 'var(--muted)' }}>{roteiro.calculos.relevante ? '(recomendado nesta fase)' : '(se necessário)'}</span></div><div className="rh-s">Escores, densitometria (FRAX) e rastreio.</div></div></div>
              {roteiro.calculos.nota && <ul className="roteiro-foco"><li>{roteiro.calculos.nota}</li></ul>}

              {roteiro.calculos.dxa ? (
                <>
                  <DxaReader patientId={patient.id} today={todayISO} onSaved={(v) => setExamList((l) => [...l, v])} />
                  <details className="acc-tools"><summary>Outras calculadoras de atividade</summary>
                    <ActivityCalculators patientId={patient.id} today={todayISO} onSaved={(v) => setExamList((l) => [...l, v])} sugerido={roteiro.calculos.escore || undefined} />
                  </details>
                </>
              ) : (
                <>
                  <ActivityCalculators patientId={patient.id} today={todayISO} onSaved={(v) => setExamList((l) => [...l, v])} sugerido={roteiro.calculos.escore || undefined} />
                  <details className="acc-tools"><summary>Leitor de densitometria (DXA / FRAX)</summary>
                    <DxaReader patientId={patient.id} today={todayISO} onSaved={(v) => setExamList((l) => [...l, v])} />
                  </details>
                </>
              )}

              <ScreeningChecklist patientId={patient.id} initial={patient.screening} precisaRastreio={stageHasCeaf} />

              {/* Passo 4 · IA da consulta */}
              <div className="roteiro-h"><span className="rh-n">4</span><div><div className="rh-t">IA da consulta</div><div className="rh-s">Gere os insights e converse com a IA sobre este paciente.</div></div></div>
              {roteiro.ia.length > 0 && <ul className="roteiro-foco">{roteiro.ia.map((t, i) => <li key={i}>{t}</li>)}</ul>}

              <IAInsights
                onGerar={gerarInsights}
                loading={iaLoading}
                error={iaError}
                insight={iaInsight}
                patientId={patient.id}
                doencaId={curId}
                aiModel={iaModel}
                onCopy={copiarTexto}
              />

              <ConsultaChat buildContexto={buildChatContexto} />

              <div className="passo-nav">
                <button className="btn-ghost" onClick={onSalvar} disabled={saving}><Icon name="save" size={16} /> {saving ? 'Salvando…' : 'Salvar consulta'}</button>
                <button className="btn-primary" onClick={() => goTab('docs')}>Ir para a Conduta <Icon name="arrowright" size={16} /></button>
              </div>
            </div>
          </div>

          {/* EVOLUÇÃO */}
          <div className="tabpanel" style={{ display: tab === 'evolucao' ? 'block' : 'none' }}>
            <div className="panel-inner">
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <h3>Evolução do paciente</h3>
                    <p className="sub" style={{ marginBottom: 0 }}>{pacNome} — {consultaList.length} consulta(s) registrada(s).</p>
                  </div>
                  {consultaList.length > 0 && (
                    <button className="btn-ghost no-print" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => imprimir('hist')}>Imprimir histórico</button>
                  )}
                </div>
                <div style={{ height: 10 }} />
                {consultaList.length === 0 ? (
                  <p className="evo-empty">Nenhuma consulta salva para este paciente. Use “Salvar consulta”.</p>
                ) : (
                  consultaList.map((c) => {
                    const tmp = String(c.id).startsWith('tmp-');
                    const editando = editId === c.id;
                    return (
                    <div className="evo-item" key={c.id}>
                      <div className="evo-head">
                        <span className="evo-date">{new Date(c.data).toLocaleDateString('pt-BR')}</span>
                        <span className="evo-dis">{c.doenca_nome || ''}</span>
                        {!tmp && !editando && (
                          <span className="evo-acts no-print">
                            <button title="Editar textos" onClick={() => startEdit(c)}>Editar</button>
                            <button title="Excluir consulta" onClick={() => delConsulta(c)} style={{ color: 'var(--red)' }}>Excluir</button>
                          </span>
                        )}
                      </div>
                      {c.consulta_tipo && (
                        <div className="evo-line">
                          <span className="k">Tipo:</span> {c.consulta_tipo === 'primeira' ? 'Primeira consulta' : 'Retorno com exames'} · <span className="k">Etapa:</span> {c.etapa || ''}
                        </div>
                      )}
                      {c.insight && <div className="evo-line"><span className="k">Escore:</span> {c.insight}</div>}
                      {c.exam_results && <div className="evo-line"><span className="k">Exames:</span> {c.exam_results}</div>}
                      {editando ? (
                        <div className="evo-edit no-print">
                          <label>HDA<textarea value={editVals.hda} onChange={(e) => setEditVals((v) => ({ ...v, hda: e.target.value }))} /></label>
                          <label>Antecedentes<textarea value={editVals.antecedentes} onChange={(e) => setEditVals((v) => ({ ...v, antecedentes: e.target.value }))} /></label>
                          <label>Observações<textarea value={editVals.observacoes} onChange={(e) => setEditVals((v) => ({ ...v, observacoes: e.target.value }))} /></label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-primary" style={{ height: 36, fontSize: 13 }} onClick={() => saveEdit(c)}>Salvar correção</button>
                            <button className="btn-ghost" style={{ height: 36, fontSize: 13 }} onClick={() => setEditId(null)}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {c.hda && <div className="evo-line"><span className="k">HDA:</span> {c.hda}</div>}
                          {c.observacoes && <div className="evo-line"><span className="k">Observações:</span> {c.observacoes}</div>}
                        </>
                      )}
                      {c.ia_insight && (
                        <details style={{ marginTop: 8 }}>
                          <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--gold-600)' }}>Insight da IA desta consulta</summary>
                          <div style={{ marginTop: 6 }}><InsightRender text={c.ia_insight} /></div>
                        </details>
                      )}
                    </div>
                    );
                  })
                )}
              </div>

              {monitorAlerts.length > 0 && (
                <div className="card" style={{ borderColor: '#ECC9C4', background: 'var(--red-bg)' }}>
                  <h3 style={{ color: 'var(--red)' }}>Alertas de monitorização</h3>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {monitorAlerts.map((a, i) => <li key={i} style={{ fontSize: 13, color: '#7a3a30', marginBottom: 4 }}>{a}</li>)}
                  </ul>
                </div>
              )}

              <MedicationTimeline patientId={patient.id} events={medList} onChanged={setMedList} today={todayISO} />

              <p className="sub" style={{ textAlign: 'center', marginTop: 4 }}>
                Os exames e os gráficos de evolução ficam em <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => goTab('anamnese')}>1 · Anamnese</button> (Passo 1 · Dados e exames).
              </p>
              <div className="passo-nav">
                <button className="btn-ghost" onClick={() => goTab('docs')}><Icon name="arrowleft" size={16} /> Conduta</button>
                <button className="btn-primary" onClick={onSalvar} disabled={saving}><Icon name="save" size={16} /> {saving ? 'Salvando…' : 'Salvar consulta'}</button>
              </div>
            </div>
          </div>

          {/* HISTÓRICO IMPRIMÍVEL (só aparece ao imprimir o histórico) */}
          <article className="doc doc-hist" id="docHistorico">
            <Letterhead profile={profile} />
            <div className="doc-title">Histórico do paciente</div>
            <DocMeta nome={pacNome} idade={pacIdade} data={pacData} />
            {consultaList.map((c) => (
              <div className="hist-c" key={c.id}>
                <div className="hist-c-head">
                  <b>{new Date(c.data).toLocaleDateString('pt-BR')}</b>
                  {c.doenca_nome ? <> — {c.doenca_nome}</> : null}
                  {c.etapa ? <> · {c.etapa}</> : null}
                  {c.consulta_tipo ? <> · {c.consulta_tipo === 'primeira' ? 'Primeira consulta' : 'Retorno'}</> : null}
                </div>
                {c.insight && <div className="hist-c-line"><span className="k">Escore:</span> {c.insight}</div>}
                {c.exam_results && <div className="hist-c-line"><span className="k">Exames:</span> {c.exam_results}</div>}
                {c.hda && <div className="hist-c-line"><span className="k">HDA:</span> {c.hda}</div>}
                {c.antecedentes && <div className="hist-c-line"><span className="k">Antecedentes:</span> {c.antecedentes}</div>}
                {c.observacoes && <div className="hist-c-line"><span className="k">Observações:</span> {c.observacoes}</div>}
                {c.receita_texto && <div className="hist-c-line"><span className="k">Conduta:</span> {c.receita_texto}</div>}
              </div>
            ))}
            <div className="doc-disclaimer">{DISCLAIMER_DOC}</div>
          </article>
        </main>
      </div>

      {flash && <div className="flashmsg">{flash}</div>}
    </>
  );
}

// ---- insights com IA ----
function IAInsights({
  onGerar,
  loading,
  error,
  insight,
  patientId,
  doencaId,
  aiModel,
  onCopy,
}: {
  onGerar: () => void;
  loading: boolean;
  error: string;
  insight: string;
  patientId: string;
  doencaId: string;
  aiModel: string;
  onCopy: (t: string) => void;
}) {
  return (
    <div className="insight">
      <div className="insight-head">
        <div className="insight-mark">✦</div>
        <div className="insight-title">
          <div className="ih-t">Insight — apoio à conduta</div>
          <div className="ih-s">Gerado a partir de PCDTs e diretrizes vigentes, citando a fonte</div>
        </div>
        <button className="btn-ghost" onClick={onGerar} disabled={loading} style={{ height: 38, padding: '0 14px', fontSize: 12.5 }}>
          {loading ? 'Gerando…' : (insight ? 'Regenerar' : 'Gerar insight')}
        </button>
        <span className="insight-seal">Apoio · não substitui o médico</span>
      </div>
      <div className="insight-body">
        {error && <div className="auth-err">{error}</div>}
        {loading && (
          <div>
            <div className="skel-shimmer" style={{ height: 13, width: '70%', marginBottom: 10 }} />
            <div className="skel-shimmer" style={{ height: 13, width: '100%', marginBottom: 8 }} />
            <div className="skel-shimmer" style={{ height: 13, width: '92%', marginBottom: 8 }} />
            <div className="skel-shimmer" style={{ height: 13, width: '80%' }} />
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>Consultando diretrizes e gerando o insight…</div>
          </div>
        )}
        {!insight && !loading && !error && (
          <p className="sub" style={{ margin: 0 }}>
            A IA analisa a anamnese, a evolução, os exames e a medicação e devolve resumo, alertas, comparação com o protocolo, dose e próximos passos — <b>fundamentada nos PCDTs/diretrizes</b> e <b>citando a fonte</b>. Clique em <b>Gerar insight</b>.
          </p>
        )}
        {insight && !loading && (
          <>
            <InsightRender text={insight} />
            <AiFeedback
              key={insight.slice(0, 40)}
              patientId={patientId}
              doencaId={doencaId}
              aiModel={aiModel}
              aiResponse={insight}
            />
          </>
        )}
      </div>
      {insight && !loading && (
        <div className="insight-foot">
          <button className="btn-primary" onClick={() => onCopy(insight)}><Icon name="copy" size={16} /> Copiar insight</button>
        </div>
      )}
    </div>
  );
}

// Renderiza texto em negrito inline (**assim**).
function renderInline(s: string) {
  return s.split('**').map((p, i) => (i % 2 === 1 ? <b key={i}>{p}</b> : <Fragment key={i}>{p}</Fragment>));
}

// Ícone da seção do insight, conforme o título.
function secIcon(title: string): string {
  const t = title.toLowerCase();
  if (/font/.test(t)) return 'clipboard';
  if (/sugest|conduta|pr[óo]xim|plano/.test(t)) return 'pill';
  if (/avali|resumo|an[áa]lise/.test(t)) return 'sparkles';
  if (/alert|seguran|aten/.test(t)) return 'shield';
  return 'chevron';
}

// Renderiza o insight da IA no formato do design: seções, sugestões em caixas e fontes em chips.
function InsightRender({ text }: { text: string }) {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let fontes: string[] = [];
  let inFontes = false;

  const flushFontes = (key: string) => {
    if (fontes.length) {
      out.push(
        <div key={'f' + key} className="ins-chips">
          {fontes.map((f, j) => <span key={j} className="source-chip">{f}</span>)}
        </div>
      );
      fontes = [];
    }
  };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) return;
    if (line.startsWith('## ') || line.startsWith('# ')) {
      flushFontes(String(i));
      const title = line.replace(/^#+\s/, '');
      inFontes = /font/i.test(title);
      out.push(<div key={i} className="ins-head"><Icon name={secIcon(title)} size={14} /> {title}</div>);
      return;
    }
    if (/^[-*]\s+/.test(line)) {
      const content = line.replace(/^[-*]\s+/, '');
      if (inFontes) { fontes.push(content.replace(/\*\*/g, '')); return; }
      out.push(
        <div key={i} className="insight-rec">
          <Icon name="chevron" size={16} style={{ color: 'var(--gold-600)', flexShrink: 0, marginTop: 1 }} />
          <span>{renderInline(content)}</span>
        </div>
      );
      return;
    }
    if (/^\*.+\*$/.test(line)) {
      out.push(<div key={i} className="ins-note">{line.replace(/^\*|\*$/g, '')}</div>);
      return;
    }
    out.push(<p key={i} className="ins-p">{renderInline(line)}</p>);
  });
  flushFontes('end');

  return <div className="ins-body-text">{out}</div>;
}

// ---- subcomponentes de documento ----
function Letterhead({ profile }: { profile: Profile | null }) {
  const crmSep = profile?.crm ? ' · ' + profile.crm : '';
  return (
    <div className="letterhead">
      <div className="lh-name">{profile?.nome || ''}</div>
      <div className="lh-sub">{profile?.especialidade || 'Reumatologia'}{crmSep}</div>
      {profile?.clinica && <div className="lh-clin">{profile.clinica}</div>}
      {profile?.endereco && <div className="lh-end">{profile.endereco}</div>}
    </div>
  );
}

function DocMeta({ nome, idade, data }: { nome: string; idade: string; data: string }) {
  return (
    <div className="doc-meta">
      <span>Paciente: <b>{nome}</b></span>
      <span className="mut">Idade: {idade}</span>
      <span className="mut">Data: {data}</span>
    </div>
  );
}

function Signature({ profile, localCidade, data }: { profile: Profile | null; nome?: string; localCidade?: string | null; data: string }) {
  const crmSep = profile?.crm ? ' · ' + profile.crm : '';
  const localdata = (localCidade ? localCidade + ', ' : '') + (data || '');
  return (
    <>
      <div className="localdata">{localdata}</div>
      <div className="assinatura">
        <div className="line" />
        <div className="an">{profile?.nome || ''}</div>
        <div className="ac">{(profile?.especialidade || 'Reumatologia') + crmSep}</div>
      </div>
    </>
  );
}
