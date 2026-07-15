'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { D, ORDER } from '@/lib/clinical/diseases';
import { computeFlags } from '@/lib/clinical/flags';
import { scanText } from '@/lib/clinical/insights';
import { ANAM, jointScoreCat, computeAnamInsight, type AnamState } from '@/lib/clinical/anamnese';
import { defaultQState, type QState, type RxItem } from '@/lib/clinical/types';
import type { Patient, Profile, Consulta, LmeJson, ExamValue, MedicationEvent } from '@/lib/types';
import { idadeFromNascimento } from '@/lib/util';
import { computeMonitorAlerts } from '@/lib/clinical/monitor';
import { DISCLAIMER_LONGO, DISCLAIMER_DOC } from '@/lib/disclaimer';
import VoiceMic from '@/components/VoiceMic';
import LmePreview, { type LmeFields, type LmeMed } from './LmePreview';
import ExamValuesPanel from './ExamValuesPanel';
import ActivityCalculators from './ActivityCalculators';
import ScreeningChecklist from './ScreeningChecklist';
import MedicationTimeline from './MedicationTimeline';
import AiFeedback from './AiFeedback';
import AiDocs from './AiDocs';
import { saveConsulta, updatePatient } from './actions';

type Tab = 'docs' | 'anamnese' | 'evolucao';

function todayBR() {
  return new Date().toLocaleDateString('pt-BR');
}

export default function Atendimento({
  patient,
  profile,
  consultas,
  examValues,
  medEvents,
}: {
  patient: Patient;
  profile: Profile | null;
  consultas: Consulta[];
  examValues: ExamValue[];
  medEvents: MedicationEvent[];
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
  const [curId, setCurId] = useState('');
  const [curStage, setCurStage] = useState('');
  const [Q, setQ] = useState<QState>(defaultQState);

  // ---- anamnese ----
  const [anam, setAnam] = useState<AnamState>({});

  // ---- texto ----
  const [hda, setHda] = useState('');
  const [antecedentes, setAntecedentes] = useState('');

  // ---- ui ----
  const [tab, setTab] = useState<Tab>('docs');
  const [flash, setFlash] = useState('');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [consultaList, setConsultaList] = useState<Consulta[]>(consultas);

  // Insights com IA (Fase 2).
  const [iaInsight, setIaInsight] = useState('');
  const [iaModel, setIaModel] = useState('');
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState('');

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

  const ceafMeds = useMemo(() => receitaItens.filter((i) => i.m.trim() && i.ceaf), [receitaItens]);
  const stageHasCeaf = ceafMeds.length > 0;

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
  const anamInsight = curId === 'ar' ? computeAnamInsight(anam) : null;

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
  const imprimir = useCallback((which: 'all' | 'ex' | 'rc' | 'lme') => {
    document.body.classList.remove('only-ex', 'only-rc', 'only-lme');
    if (which === 'ex') document.body.classList.add('only-ex');
    else if (which === 'rc') document.body.classList.add('only-rc');
    else if (which === 'lme') {
      if (!stageHasCeaf) return;
      document.body.classList.add('only-lme');
    }
    window.print();
  }, [stageHasCeaf]);

  useEffect(() => {
    const clear = () => document.body.classList.remove('only-ex', 'only-rc', 'only-lme');
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
        ia_insight: iaInsight || null,
      }, ...list]);
      showFlash('Consulta salva');
    } finally {
      setSaving(false);
    }
  }

  const anamDef = curId ? ANAM[curId] : null;

  return (
    <>
      <div className="topbar no-print">
        <span className="tag">Reumatologia</span>
        <h1>Atendimento</h1>
        <span className="spacer" />
        <Link className="navlink" href="/">Pacientes</Link>
        <Link className="navlink" href="/perfil">Meu perfil</Link>
      </div>

      {!profile?.cnes && (
        <div className="no-print" style={{ background: 'var(--amber-bg)', borderBottom: '1px solid #e6d3a8', padding: '8px 22px', fontSize: 12.5, color: '#5b451e' }}>
          Complete o <Link href="/perfil" style={{ color: 'var(--gold)', fontWeight: 600 }}>cabeçalho do médico</Link> (CNES, CNS) para a LME sair completa.
        </div>
      )}

      <div className="layout">
        {/* ------- CONTROLES ------- */}
        <aside className="controls no-print">
          <div className="block">
            <p className="eyebrow">Paciente</p>
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
          </div>

          <div className="block picker">
            <p className="eyebrow">Condição</p>
            <label>Selecione a doença</label>
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
            <p className="eyebrow">Etapa do tratamento</p>
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
            <button className="btn-primary" onClick={onSalvar} disabled={saving}>{saving ? 'Salvando…' : 'Salvar consulta'}</button>
          </div>

          <div className="safety">
            <b>Apoio ao médico — não substitui o médico.</b> {DISCLAIMER_LONGO} Os itens vêm pré-preenchidos pelo protocolo; revise, acrescente ou retire e individualize as doses (peso, função renal, interações, gestação) antes de assinar. A tarja <b>LME</b> marca o que exige Laudo do Componente Especializado.
          </div>
        </aside>

        {/* ------- PALCO ------- */}
        <main className="stage">
          <div className="maintabs no-print">
            <button className={'maintab' + (tab === 'docs' ? ' on' : '')} onClick={() => setTab('docs')}>Documentos</button>
            <button className={'maintab' + (tab === 'anamnese' ? ' on' : '')} onClick={() => setTab('anamnese')}>Anamnese</button>
            <button className={'maintab' + (tab === 'evolucao' ? ' on' : '')} onClick={() => setTab('evolucao')}>Evolução</button>
          </div>

          {/* DOCUMENTOS */}
          <div className={'tabpanel docs-panel' + (tab === 'docs' ? ' on' : '')} style={{ display: tab === 'docs' ? 'flex' : 'none', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
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
            )}
          </div>

          {/* ANAMNESE */}
          <div className="tabpanel" style={{ display: tab === 'anamnese' ? 'block' : 'none' }}>
            <div className="panel-inner">
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
                          <div style={{ fontSize: 11, color: '#999', marginTop: 3 }}>Grandes: ombro, cotovelo, quadril, joelho, tornozelo. Pequenas: MCF, IFP, punho, MTF, IF do polegar.</div>
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
                        <div className="insight">
                          <div className="it">Insight — ACR/EULAR 2010</div>
                          <div className="score">{anamInsight.score} <small>/ 10 pontos{anamInsight.done ? '' : ' (parcial)'}</small></div>
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
                <h3>Queixa e história (ditar por voz)</h3>
                <div className="an-q">
                  <div className="ql">História da doença atual</div>
                  <div className="fieldrow">
                    <textarea value={hda} onChange={(e) => setHda(e.target.value)} placeholder="Dite ou digite a história..." />
                    <VoiceMic onText={(chunk) => setHda((v) => (v ? v.trim() + ' ' : '') + chunk)} />
                  </div>
                </div>
                <div className="an-q">
                  <div className="ql">Antecedentes, medicações em uso, alergias</div>
                  <div className="fieldrow">
                    <textarea value={antecedentes} onChange={(e) => setAntecedentes(e.target.value)} placeholder="Dite ou digite..." />
                    <VoiceMic onText={(chunk) => setAntecedentes((v) => (v ? v.trim() + ' ' : '') + chunk)} />
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Insights do relato</h3>
                <p className="sub">
                  Achados reconhecidos no texto ditado ou digitado (apoio, não diagnóstico).{' '}
                  <span style={{ color: 'var(--red)', fontWeight: 600 }}>Vermelho</span> = alerta ·{' '}
                  <span style={{ color: '#6b5326', fontWeight: 600 }}>dourado</span> = pista diagnóstica.
                </p>
                {textInsights.length === 0 ? (
                  <p className="empty-note" style={{ fontSize: 12.5 }}>Conforme o doutor dita ou digita a história, os achados relevantes aparecem aqui.</p>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {textInsights.map((r, i) => (
                      <li key={i} style={{ fontSize: 12.5, marginBottom: 5, color: r.lvl === 'flag' ? 'var(--red)' : (r.lvl === 'point' ? '#6b5326' : '#555') }}>{r.m}</li>
                    ))}
                  </ul>
                )}
              </div>

              <ActivityCalculators patientId={patient.id} today={todayISO} onSaved={(v) => setExamList((l) => [...l, v])} />

              <ScreeningChecklist patientId={patient.id} initial={patient.screening} precisaRastreio={stageHasCeaf} />

              <AiDocs buildContext={buildAiContext} onFlash={showFlash} />

              <IAInsights
                onGerar={gerarInsights}
                loading={iaLoading}
                error={iaError}
                insight={iaInsight}
                patientId={patient.id}
                doencaId={curId}
                aiModel={iaModel}
              />
            </div>
          </div>

          {/* EVOLUÇÃO */}
          <div className="tabpanel" style={{ display: tab === 'evolucao' ? 'block' : 'none' }}>
            <div className="panel-inner">
              <div className="card">
                <h3>Evolução do paciente</h3>
                <p className="sub">{pacNome} — {consultaList.length} consulta(s) registrada(s).</p>
                {consultaList.length === 0 ? (
                  <p className="evo-empty">Nenhuma consulta salva para este paciente. Use “Salvar consulta”.</p>
                ) : (
                  consultaList.map((c) => (
                    <div className="evo-item" key={c.id}>
                      <div className="evo-head">
                        <span className="evo-date">{new Date(c.data).toLocaleDateString('pt-BR')}</span>
                        <span className="evo-dis">{c.doenca_nome || ''}</span>
                      </div>
                      {c.consulta_tipo && (
                        <div className="evo-line">
                          <span className="k">Tipo:</span> {c.consulta_tipo === 'primeira' ? 'Primeira consulta' : 'Retorno com exames'} · <span className="k">Etapa:</span> {c.etapa || ''}
                        </div>
                      )}
                      {c.insight && <div className="evo-line"><span className="k">Escore:</span> {c.insight}</div>}
                      {c.exam_results && <div className="evo-line"><span className="k">Exames:</span> {c.exam_results}</div>}
                      {c.hda && <div className="evo-line"><span className="k">HDA:</span> {c.hda}</div>}
                      {c.ia_insight && (
                        <details style={{ marginTop: 8 }}>
                          <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--gold)' }}>Insight da IA desta consulta</summary>
                          <div style={{ marginTop: 6 }}><InsightRender text={c.ia_insight} /></div>
                        </details>
                      )}
                    </div>
                  ))
                )}
              </div>

              {monitorAlerts.length > 0 && (
                <div className="card" style={{ borderColor: '#d9b8b4', background: '#F7E9E7' }}>
                  <h3 style={{ color: 'var(--red)' }}>Alertas de monitorização</h3>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {monitorAlerts.map((a, i) => <li key={i} style={{ fontSize: 13, color: '#5b451e', marginBottom: 4 }}>{a}</li>)}
                  </ul>
                </div>
              )}

              <MedicationTimeline patientId={patient.id} events={medList} onChanged={setMedList} today={todayISO} />

              <ExamValuesPanel patientId={patient.id} values={examList} onChanged={setExamList} today={todayISO} />

              <IAInsights
                onGerar={gerarInsights}
                loading={iaLoading}
                error={iaError}
                insight={iaInsight}
                patientId={patient.id}
                doencaId={curId}
                aiModel={iaModel}
              />
            </div>
          </div>
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
}: {
  onGerar: () => void;
  loading: boolean;
  error: string;
  insight: string;
  patientId: string;
  doencaId: string;
  aiModel: string;
}) {
  return (
    <div className="card">
      <h3>Insights com IA</h3>
      <p className="sub">
        A IA analisa a anamnese, a evolução, os exames e a medicação e devolve resumo, alertas, comparação com o protocolo, dose e próximos passos — <b>fundamentada nos PCDTs/diretrizes</b> da base e <b>citando a fonte</b>. <b>Apoio, não decisão.</b>
      </p>
      <button className="btn-primary" onClick={onGerar} disabled={loading} style={{ maxWidth: 240 }}>
        {loading ? 'Gerando com IA…' : 'Gerar insights com IA'}
      </button>
      {error && <div className="auth-err" style={{ marginTop: 12 }}>{error}</div>}
      {insight && (
        <>
          <div className="insight" style={{ marginTop: 14 }}>
            <div className="it">Insight gerado por IA</div>
            <InsightRender text={insight} />
          </div>
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
  );
}

// Renderiza o texto de insight (com títulos "## " e listas "- ") de forma legível.
function InsightRender({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--ink)' }}>
      {lines.map((raw, i) => {
        const line = raw.trimEnd();
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
        if (line.startsWith('## ')) {
          return <div key={i} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700, margin: '12px 0 4px' }}>{line.slice(3)}</div>;
        }
        if (line.startsWith('# ')) {
          return <div key={i} style={{ fontSize: 14, fontWeight: 700, margin: '10px 0 4px' }}>{line.slice(2)}</div>;
        }
        if (/^[-*]\s+/.test(line)) {
          return <div key={i} style={{ paddingLeft: 16, position: 'relative', margin: '2px 0' }}><span style={{ position: 'absolute', left: 2, color: 'var(--gold)' }}>•</span>{line.replace(/^[-*]\s+/, '')}</div>;
        }
        if (/^\*.+\*$/.test(line)) {
          return <div key={i} style={{ fontStyle: 'italic', color: 'var(--muted)', marginTop: 8, fontSize: 12 }}>{line.replace(/^\*|\*$/g, '')}</div>;
        }
        return <div key={i} style={{ margin: '2px 0' }}>{line}</div>;
      })}
    </div>
  );
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
