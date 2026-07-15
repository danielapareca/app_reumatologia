import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { chunksParaDoenca, GROUNDING_META } from '@/lib/clinical/grounding';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Modelo Claude atual (configurável por variável de ambiente).
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

interface ConsultaResumo {
  data: string;
  doenca: string;
  etapa: string;
  tipo: string;
  hda: string;
  antecedentes: string;
  exames: string;
  receita: string;
}

interface InsightsInput {
  paciente: string;
  idade: string;
  doencaId: string;
  doenca: string;
  cid: string;
  anamneseAtual: {
    hda: string;
    antecedentes: string;
    exames: string;
    escore: string;
  };
  historico: ConsultaResumo[];
}

const SYSTEM_PROMPT = `Você é um assistente clínico de apoio a um médico reumatologista no Brasil. Sua função é raciocinar sobre os dados registrados de um paciente e produzir insights úteis para a decisão do médico.

REGRAS OBRIGATÓRIAS (guardrails):
- Você é APOIO, nunca decisão. Não substitui o julgamento clínico do médico.
- Use SOMENTE a BASE DE CONHECIMENTO fornecida abaixo (chunks) + os dados do paciente. NÃO invente condutas nem doses — só cite doses que estejam nos chunks.
- CITE A FONTE em cada afirmação relevante, no formato [id-do-chunk] (ex.: [ar-trat-2]). A referência completa de cada chunk está no campo "Fonte".
- Se não houver base suficiente nos chunks para algo, diga claramente que não há base suficiente e sugira o exame/avaliação que faltou — NÃO adivinhe.
- SEGURANÇA PRIMEIRO: se houver sinal de alarme/emergência (ver [fund-02]), destaque no TOPO da resposta. Antes de sugerir imunossupressor/biológico, cheque nos dados do paciente gestação/lactação, função renal (TFG), hepatopatia/transaminases e infecção ativa ou rastreio TB/HBV pendente (ver [fund-03] e [fund-04]); sinalize contraindicações.
- Sempre recomende confirmar no PCDT/diretriz vigente antes de qualquer conduta.

Responda em português do Brasil, organizada EXATAMENTE nestas seções (títulos com "##"):

## Resumo da evolução
Síntese objetiva de como o paciente evoluiu ao longo das consultas.

## Pontos de atenção e alertas
Sinais de alarme (se houver) primeiro; depois interações medicamentosas, contraindicações e cuidados. Se não houver, diga que não foram identificados alertas evidentes.

## Comparação com o protocolo
Como a conduta atual se compara com o protocolo/diretriz da base para a doença e etapa. Aponte concordâncias e possíveis desvios, citando os chunks.

## Dose e posologia
Avise quando alguma dose parecer fora do esperado em relação à base. Se as doses conferem com a base, diga isso. Nunca cite dose que não esteja nos chunks.

## Próximos passos e monitorização
Sugestão de exames de acompanhamento e reavaliação pertinentes, com base nos chunks.

## Fontes citadas
Liste os ids dos chunks usados e a referência (Fonte) de cada um.

Seja conciso e clínico. Termine sempre com uma linha em itálico: *Apoio ao médico assistente — revise, confirme no PCDT/diretriz vigente e individualize antes de decidir.*`;

function montarPrompt(input: InsightsInput): string {
  const linhas: string[] = [];

  // BASE DE CONHECIMENTO (RAG por metadado: doença + regras + fundamentos).
  const chunks = chunksParaDoenca(input.doencaId);
  linhas.push('===== BASE DE CONHECIMENTO (use apenas isto para condutas/doses; cite [id]) =====');
  linhas.push(`(Base revisão ${GROUNDING_META.revisao}. ${GROUNDING_META.aviso})`);
  linhas.push('');
  chunks.forEach((c) => {
    linhas.push(`[${c.id}] ${c.doenca} — ${c.topico}`);
    linhas.push(`Fonte: ${c.fonte}`);
    linhas.push(c.texto);
    linhas.push('');
  });
  if (!input.doencaId) {
    linhas.push('(Nenhuma doença selecionada: há apenas regras e fundamentos gerais na base. Se faltar base específica, diga isso.)');
    linhas.push('');
  }

  linhas.push('===== DADOS DO PACIENTE =====');
  linhas.push(`Paciente: ${input.paciente || '(não informado)'} · Idade: ${input.idade || '(não informada)'}`);
  linhas.push(`Doença de trabalho: ${input.doenca || '(não definida)'}${input.cid ? ' (CID ' + input.cid + ')' : ''}`);
  linhas.push('');
  linhas.push('== Anamnese / dados da consulta atual ==');
  linhas.push(`História da doença atual: ${input.anamneseAtual.hda || '(vazio)'}`);
  linhas.push(`Antecedentes / medicações em uso / alergias: ${input.anamneseAtual.antecedentes || '(vazio)'}`);
  linhas.push(`Resultados de exames: ${input.anamneseAtual.exames || '(vazio)'}`);
  if (input.anamneseAtual.escore) linhas.push(`Escore de atividade/classificação: ${input.anamneseAtual.escore}`);
  linhas.push('');

  if (input.historico.length > 0) {
    linhas.push('== Histórico de consultas (mais recente primeiro) ==');
    input.historico.forEach((c, i) => {
      linhas.push(`Consulta ${i + 1} — ${c.data}`);
      if (c.doenca) linhas.push(`  Doença: ${c.doenca}`);
      if (c.tipo) linhas.push(`  Tipo: ${c.tipo}`);
      if (c.etapa) linhas.push(`  Etapa/conduta: ${c.etapa}`);
      if (c.receita) linhas.push(`  Medicação prescrita: ${c.receita}`);
      if (c.exames) linhas.push(`  Exames: ${c.exames}`);
      if (c.hda) linhas.push(`  Evolução/HDA: ${c.hda}`);
      if (c.antecedentes) linhas.push(`  Antecedentes: ${c.antecedentes}`);
    });
  } else {
    linhas.push('== Histórico de consultas ==');
    linhas.push('(Nenhuma consulta anterior registrada. Baseie-se na consulta atual.)');
  }

  linhas.push('');
  linhas.push('Produza os insights nas seções pedidas.');
  return linhas.join('\n');
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'A chave da IA (ANTHROPIC_API_KEY) ainda não foi configurada no servidor.' },
      { status: 503 }
    );
  }

  let input: InsightsInput;
  try {
    input = (await request.json()) as InsightsInput;
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: montarPrompt(input) }],
    });

    const texto = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    return NextResponse.json({ insight: texto });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const status = err.status === 401 ? 500 : err.status || 500;
      const msg = err.status === 401
        ? 'A chave da IA foi recusada. Verifique a ANTHROPIC_API_KEY no servidor.'
        : 'Falha ao gerar insights: ' + err.message;
      return NextResponse.json({ error: msg }, { status });
    }
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao gerar insights: ' + msg }, { status: 500 });
  }
}
