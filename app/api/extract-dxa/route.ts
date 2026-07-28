import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { limiteAtingido, registrarUso } from '@/lib/aiUsage';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Leitura usa modelo mais barato (Sonnet); raciocínio clínico segue no Opus (outras rotas).
const MODEL = process.env.ANTHROPIC_MODEL_LEITURA || 'claude-sonnet-5';
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type ImgType = (typeof IMG_TYPES)[number];

const SYSTEM = `Você lê um laudo de densitometria óssea (DXA) e extrai os valores para o médico revisar. Ferramenta de APOIO: o médico confere antes de salvar.

Regras:
- Devolva SOMENTE um objeto JSON, sem texto fora dele.
- Formato: {"tscoreMenor": number|null, "zscoreMenor": number|null, "sitios": [{"sitio": string, "t": number|null, "z": number|null}]}.
- "tscoreMenor": o MENOR T-score entre os sítios válidos (coluna L1-L4, colo femoral, fêmur total, rádio 33%). Não usar triângulo de Ward nem trocânter isolado.
- "zscoreMenor": o menor Z-score, se o laudo trouxer Z-score (pré-menopausa, homem < 50, criança).
- Use ponto decimal e sinal negativo (ex.: -2.7).
- NÃO invente valores. Só inclua o que estiver claramente no laudo. Se não achar T-score, use null.`;

function parse(text: string): { tscoreMenor: number | null; zscoreMenor: number | null; sitios: { sitio: string; t: number | null; z: number | null }[] } {
  let raw = text.trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) raw = fence[1].trim();
  const s = raw.indexOf('{'); const e = raw.lastIndexOf('}');
  if (s >= 0 && e > s) raw = raw.slice(s, e + 1);
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    const num = (v: unknown): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
      return isFinite(n) ? n : null;
    };
    const sitios = Array.isArray(o.sitios) ? o.sitios.map((x) => {
      const r = x as Record<string, unknown>;
      return { sitio: String(r.sitio || '').trim(), t: num(r.t), z: num(r.z) };
    }).filter((x) => x.sitio) : [];
    return { tscoreMenor: num(o.tscoreMenor), zscoreMenor: num(o.zscoreMenor), sitios };
  } catch {
    return { tscoreMenor: null, zscoreMenor: null, sitios: [] };
  }
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'A chave da IA (ANTHROPIC_API_KEY) não foi configurada no servidor.' }, { status: 503 });
  if (await limiteAtingido(supabase, user.id)) return NextResponse.json({ error: 'Limite diário de uso da IA atingido. Tente amanhã ou digite o T-score.' }, { status: 429 });

  let body: { pdfBase64?: string; imageBase64?: string; mediaType?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }
  const pdfBase64 = (body.pdfBase64 || '').replace(/^data:application\/pdf;base64,/, '');
  const imageBase64 = (body.imageBase64 || '').replace(/^data:image\/\w+;base64,/, '');
  const mediaType = (body.mediaType || '') as ImgType;
  if (!pdfBase64 && !imageBase64) return NextResponse.json({ error: 'Arquivo não recebido.' }, { status: 400 });
  if (imageBase64 && !IMG_TYPES.includes(mediaType)) return NextResponse.json({ error: 'Formato de imagem não suportado (use JPG, PNG ou WEBP).' }, { status: 400 });

  const fileBlock: Anthropic.ContentBlockParam = pdfBase64
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } }
    : { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } };

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: MODEL, max_tokens: 1024, system: SYSTEM,
      messages: [{ role: 'user', content: [fileBlock, { type: 'text', text: 'Extraia os T-scores/Z-scores deste laudo de densitometria, seguindo o formato. Transcreva, não invente.' }] }],
    });
    registrarUso(supabase, user.id, 'extract-dxa', MODEL);
    const texto = message.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map((b) => b.text).join('\n');
    return NextResponse.json({ dados: parse(texto) });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const msg = err.status === 401 ? 'A chave da IA foi recusada. Verifique a ANTHROPIC_API_KEY.' : 'Falha ao ler o laudo: ' + err.message;
      return NextResponse.json({ error: msg }, { status: err.status === 401 ? 500 : (err.status || 500) });
    }
    return NextResponse.json({ error: 'Falha ao ler o laudo: ' + (err instanceof Error ? err.message : 'erro') }, { status: 500 });
  }
}
