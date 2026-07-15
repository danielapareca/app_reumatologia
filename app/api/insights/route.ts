import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

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

Você NÃO é o médico e NÃO toma decisões. É uma ferramenta de APOIO: o médico assistente revisa, valida e individualiza tudo. Nunca afirme diagnósticos como certeza; use linguagem de hipótese e de sugestão.

A partir dos dados fornecidos (anamnese, evolução das consultas, resultados de exames e histórico de medicação e dose), produza uma resposta em português do Brasil, organizada EXATAMENTE nestas seções (use os títulos com "##"):

## Resumo da evolução
Síntese objetiva de como o paciente evoluiu ao longo das consultas.

## Alertas de interação e segurança
Interações medicamentosas relevantes, contraindicações e cuidados. Se não houver, diga que não foram identificados alertas evidentes.

## Comparação com o protocolo
Como a conduta atual se compara com a diretriz/protocolo esperado para a doença e etapa. Aponte concordâncias e possíveis desvios.

## Dose e posologia
Avise quando alguma dose parecer fora do esperado (acima/abaixo do usual). Se as doses parecem adequadas, diga isso.

## Próximos exames de monitorização
Sugestão de exames de acompanhamento pertinentes à doença e ao tratamento.

Seja conciso e direto. Use listas quando ajudar. Baseie-se apenas nos dados fornecidos; se faltar informação para alguma seção, diga o que seria necessário registrar. Termine sempre com uma linha em itálico: *Apoio ao médico assistente — revise e individualize antes de decidir.*`;

function montarPrompt(input: InsightsInput): string {
  const linhas: string[] = [];
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
      max_tokens: 2048,
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
