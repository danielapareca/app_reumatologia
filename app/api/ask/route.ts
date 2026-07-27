import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { GROUNDING, GROUNDING_REGRAS, GROUNDING_FUND, GROUNDING_META, type GroundingChunk } from '@/lib/clinical/grounding';
import { limiteAtingido, registrarUso, AI_DAILY_LIMIT } from '@/lib/aiUsage';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';

function norm(t: string): string {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Seleciona a base (regras + fundamentos) + os chunks mais relevantes à pergunta.
function selecionarChunks(pergunta: string): GroundingChunk[] {
  const base = [...GROUNDING_REGRAS, ...GROUNDING_FUND];
  const baseIds = new Set(base.map((c) => c.id));
  const palavras = Array.from(new Set(norm(pergunta).split(/[^a-z0-9]+/).filter((w) => w.length >= 4)));
  const scored = GROUNDING
    .filter((c) => !baseIds.has(c.id))
    .map((c) => {
      const hay = norm(`${c.doenca} ${c.topico} ${c.texto}`);
      let s = 0;
      for (const w of palavras) if (hay.includes(w)) s++;
      return { c, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)
    .map((x) => x.c);
  return [...base, ...scored];
}

const SYSTEM_PROMPT = `Você é um assistente clínico de apoio a um médico reumatologista no Brasil, respondendo a uma pergunta livre feita pelo próprio médico.

REGRAS OBRIGATÓRIAS:
- Você é APOIO, nunca decisão. Não substitui o julgamento do médico.
- Use a BASE DE CONHECIMENTO fornecida como referência prioritária e CITE A FONTE no formato [id-do-chunk] sempre que a base embasar a resposta.
- Você pode complementar com conhecimento clínico consolidado quando a base não cobrir o tema, MAS: seja cauteloso, sinalize claramente quando estiver fora da base ("isto não consta na base do app; confirme no PCDT/diretriz vigente"), e NUNCA invente doses específicas — se não houver dose confiável na base, recomende confirmar na diretriz.
- SEGURANÇA PRIMEIRO: se a pergunta envolver sinal de alarme/emergência, destaque no topo.
- Antes de sugerir imunossupressor/biológico, lembre de checar gestação/lactação, função renal, hepatopatia e infecção/rastreio (fundamentos da base).
- Seja objetivo e clínico. Responda em português do Brasil.

Estruture a resposta de forma legível (use "## " para seções quando fizer sentido) e, ao final, se usou a base, liste em "## Fontes citadas" os ids e a referência. Termine sempre com uma linha em itálico: *Apoio ao médico assistente — revise e confirme no PCDT/diretriz vigente antes de decidir.*`;

// Bloco da base para injetar no system (referência prioritária, citando [id]).
function baseBlock(chunks: GroundingChunk[]): string {
  const l: string[] = [];
  l.push('===== BASE DE CONHECIMENTO (referência prioritária; cite [id]) =====');
  l.push(`(Base revisão ${GROUNDING_META.revisao}. ${GROUNDING_META.aviso})`);
  l.push('');
  chunks.forEach((c) => {
    l.push(`[${c.id}] ${c.doenca} — ${c.topico}`);
    l.push(`Fonte: ${c.fonte}`);
    l.push(c.texto);
    l.push('');
  });
  l.push('Use esta base como referência prioritária na resposta seguinte da conversa.');
  return l.join('\n');
}

type Turno = { role: 'user' | 'assistant'; content: string };

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'A chave da IA (ANTHROPIC_API_KEY) não foi configurada no servidor.' }, { status: 503 });
  }
  if (await limiteAtingido(supabase, user.id)) {
    return NextResponse.json({ error: `Limite diário de uso da IA atingido (${AI_DAILY_LIMIT} usos hoje). Tente amanhã ou aumente o limite (AI_DAILY_LIMIT no servidor).` }, { status: 429 });
  }

  // Aceita conversa (messages[]) ou pergunta única (compatível com o formato antigo).
  let turnos: Turno[] = [];
  let contexto = '';
  try {
    const body = (await request.json()) as { pergunta?: string; messages?: Turno[]; contexto?: string };
    contexto = String(body.contexto || '').trim().slice(0, 4000);
    if (Array.isArray(body.messages) && body.messages.length) {
      turnos = body.messages
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
        .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 4000) }))
        .slice(-16); // limita o histórico enviado
    } else if (body.pergunta) {
      turnos = [{ role: 'user', content: String(body.pergunta).trim().slice(0, 4000) }];
    }
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }
  // A conversa precisa começar por uma fala do médico.
  while (turnos.length && turnos[0].role !== 'user') turnos.shift();
  const ultimaPergunta = [...turnos].reverse().find((t) => t.role === 'user')?.content || '';
  if (ultimaPergunta.length < 3) return NextResponse.json({ error: 'Escreva a pergunta.' }, { status: 400 });

  try {
    const ctxBloco = contexto
      ? `\n\n===== CONTEXTO DA CONSULTA (dados deste paciente, informados pelo médico; apoio, não é a base) =====\n${contexto}\n(Use para responder no contexto deste paciente; ainda assim cite a base [id] quando embasar condutas.)`
      : '';
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2600,
      system: SYSTEM_PROMPT + '\n\n' + baseBlock(selecionarChunks(ultimaPergunta)) + ctxBloco,
      messages: turnos,
    });
    const texto = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text).join('\n').trim();
    await registrarUso(supabase, user.id, 'ask', MODEL);
    return NextResponse.json({ resposta: texto, model: MODEL });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const msg = err.status === 401 ? 'A chave da IA foi recusada. Verifique a ANTHROPIC_API_KEY.' : 'Falha ao responder: ' + err.message;
      return NextResponse.json({ error: msg }, { status: err.status === 401 ? 500 : (err.status || 500) });
    }
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao responder: ' + msg }, { status: 500 });
  }
}
