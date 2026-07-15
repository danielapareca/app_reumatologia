import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { chunksParaDoenca } from '@/lib/clinical/grounding';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

type Tipo = 'resumo_paciente' | 'lme_anamnese' | 'laudo' | 'atestado' | 'relatorio' | 'cid';

interface DocInput {
  tipo: Tipo;
  paciente: string;
  idade: string;
  doencaId: string;
  doenca: string;
  cid: string;
  hda: string;
  antecedentes: string;
  exames: string;
  etapa: string;
  receita: string;
  medico: string;
}

const BASE = 'Você é um assistente de apoio a um médico reumatologista no Brasil. É APOIO, não decisão: o médico revisa, edita e assina. Não invente doses; use as dos protocolos. Responda em português do Brasil, só com o texto pedido (sem preâmbulo).';

const PROMPTS: Record<Tipo, string> = {
  resumo_paciente: `${BASE}
Escreva um RESUMO PARA O PACIENTE, em linguagem simples e acolhedora (sem jargão médico), explicando: o que foi avaliado, a hipótese/diagnóstico, o que é o tratamento proposto e por quê, os cuidados e os próximos passos (exames, retorno). Curto e claro. Termine com: "Este resumo é informativo; siga sempre a orientação do seu médico."`,
  lme_anamnese: `${BASE}
Escreva o texto da ANAMNESE para o campo 11 da LME (Laudo para Solicitação/Autorização de Medicamento do Componente Especializado), justificando a indicação do medicamento conforme o PCDT: resumo clínico, diagnóstico (com CID), tratamentos prévios/atuais e por que o medicamento solicitado é indicado nesta etapa. Objetivo e técnico, 1–2 parágrafos. Use a BASE DE CONHECIMENTO e cite [id] das fontes ao final.`,
  laudo: `${BASE}
Redija um LAUDO MÉDICO formal a partir dos dados: identificação do paciente, história clínica, achados/exames, hipótese diagnóstica (com CID) e conduta. Deixe claro o que precisa ser confirmado/individualizado pelo médico.`,
  atestado: `${BASE}
Redija um ATESTADO MÉDICO simples de comparecimento/afastamento. Deixe entre colchetes os campos a critério do médico (ex.: [nº de dias], [CID se o paciente autorizar]). Não invente afastamento; apenas a estrutura.`,
  relatorio: `${BASE}
Redija um RELATÓRIO MÉDICO de evolução, adequado para encaminhamento a outro serviço/especialista: história, evolução, condutas, situação atual e o que se solicita.`,
  cid: `${BASE}
Sugira o(s) código(s) CID-10 mais provável(is) para o diagnóstico/quadro informado, com uma linha de justificativa cada. Deixe claro que a definição final é do médico.`,
};

function contexto(input: DocInput): string {
  const l: string[] = [];
  if (input.tipo === 'lme_anamnese' || input.tipo === 'relatorio' || input.tipo === 'laudo') {
    const chunks = chunksParaDoenca(input.doencaId);
    if (chunks.length) {
      l.push('===== BASE DE CONHECIMENTO (cite [id]) =====');
      chunks.forEach((c) => { l.push(`[${c.id}] ${c.doenca} — ${c.topico} · Fonte: ${c.fonte}`); l.push(c.texto); l.push(''); });
    }
  }
  l.push('===== DADOS =====');
  l.push(`Médico: ${input.medico || '(não informado)'}`);
  l.push(`Paciente: ${input.paciente || '(não informado)'} · Idade: ${input.idade || '(não informada)'}`);
  l.push(`Doença/hipótese: ${input.doenca || '(não definida)'}${input.cid ? ' (CID ' + input.cid + ')' : ''}`);
  if (input.etapa) l.push(`Etapa/conduta: ${input.etapa}`);
  if (input.hda) l.push(`História da doença atual: ${input.hda}`);
  if (input.antecedentes) l.push(`Antecedentes/medicações/alergias: ${input.antecedentes}`);
  if (input.exames) l.push(`Exames: ${input.exames}`);
  if (input.receita) l.push(`Medicação prescrita:\n${input.receita}`);
  return l.join('\n');
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'A chave da IA (ANTHROPIC_API_KEY) não foi configurada no servidor.' }, { status: 503 });
  }

  let input: DocInput;
  try { input = await request.json(); } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }
  const prompt = PROMPTS[input.tipo];
  if (!prompt) return NextResponse.json({ error: 'Tipo de documento inválido.' }, { status: 400 });

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: prompt,
      messages: [{ role: 'user', content: contexto(input) }],
    });
    const texto = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text).join('\n').trim();
    return NextResponse.json({ texto });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const msg = err.status === 401
        ? 'A chave da IA foi recusada. Verifique a ANTHROPIC_API_KEY no servidor.'
        : 'Falha ao gerar: ' + err.message;
      return NextResponse.json({ error: msg }, { status: err.status === 401 ? 500 : (err.status || 500) });
    }
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao gerar: ' + msg }, { status: 500 });
  }
}
