import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { limiteAtingido, registrarUso } from '@/lib/aiUsage';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type ImgType = (typeof IMG_TYPES)[number];

const SYSTEM = `Você extrai resultados de exames laboratoriais de um documento (laudo) para uso em gráficos de evolução. Você é uma ferramenta de APOIO: o médico revisa tudo antes de salvar.

Regras:
- Devolva SOMENTE um array JSON, sem texto fora dele.
- Cada item: {"marcador": string, "valor": number, "unidade": string, "data": "YYYY-MM-DD"}.
- "marcador": nome curto e padronizado em português (ex.: VHS, PCR, Hemoglobina, Leucócitos, Plaquetas, Creatinina, TFG, Ácido úrico, TGO, TGP, Glicemia, Colesterol total).
- "valor": apenas o número (use ponto decimal). Se o resultado for texto/qualitativo (ex.: "positivo", "1:320"), NÃO inclua.
- "unidade": a unidade do resultado (ex.: mg/L, mm/h, g/dL). Se não houver, use "".
- "data": data da coleta/exame no formato YYYY-MM-DD. Se não encontrar a data, use "".
- NÃO invente valores nem datas. Inclua só o que estiver claramente no documento. Se não houver exames numéricos, devolva [].`;

interface Extracted {
  marcador: string;
  valor: number;
  unidade: string;
  data: string;
}

function parseArray(text: string): Extracted[] {
  let raw = text.trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) raw = fence[1].trim();
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
  let arr: unknown;
  try { arr = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(arr)) return [];
  const out: Extracted[] = [];
  for (const it of arr) {
    if (!it || typeof it !== 'object') continue;
    const o = it as Record<string, unknown>;
    const valor = typeof o.valor === 'number' ? o.valor : parseFloat(String(o.valor).replace(',', '.'));
    const marcador = String(o.marcador || '').trim();
    if (!marcador || !isFinite(valor)) continue;
    let data = String(o.data || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) data = '';
    out.push({ marcador, valor, unidade: String(o.unidade || '').trim(), data });
  }
  return out;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'A chave da IA (ANTHROPIC_API_KEY) não foi configurada no servidor.' }, { status: 503 });
  }

  if (await limiteAtingido(supabase, user.id)) {
    return NextResponse.json({ error: 'Limite diário de uso da IA atingido. Tente novamente amanhã ou lance os exames manualmente.' }, { status: 429 });
  }

  let body: { pdfBase64?: string; imageBase64?: string; mediaType?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }
  const pdfBase64 = (body.pdfBase64 || '').replace(/^data:application\/pdf;base64,/, '');
  const imageBase64 = (body.imageBase64 || '').replace(/^data:image\/\w+;base64,/, '');
  const mediaType = (body.mediaType || '') as ImgType;
  if (!pdfBase64 && !imageBase64) return NextResponse.json({ error: 'Arquivo não recebido.' }, { status: 400 });
  if (imageBase64 && !IMG_TYPES.includes(mediaType)) {
    return NextResponse.json({ error: 'Formato de imagem não suportado (use JPG, PNG ou WEBP).' }, { status: 400 });
  }

  const promptTxt = 'Extraia os exames laboratoriais numéricos com data deste documento, seguindo estritamente o formato pedido. Se for uma foto ou print de tela, leia os valores visíveis com atenção.';
  const fileBlock: Anthropic.ContentBlockParam = pdfBase64
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } }
    : { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } };

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: [fileBlock, { type: 'text', text: promptTxt }],
      }],
    });
    registrarUso(supabase, user.id, 'extract-exames', MODEL);
    const texto = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text).join('\n');
    return NextResponse.json({ valores: parseArray(texto) });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const msg = err.status === 401
        ? 'A chave da IA foi recusada. Verifique a ANTHROPIC_API_KEY no servidor.'
        : 'Falha ao analisar o documento:' + err.message;
      return NextResponse.json({ error: msg }, { status: err.status === 401 ? 500 : (err.status || 500) });
    }
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao analisar o documento:' + msg }, { status: 500 });
  }
}
