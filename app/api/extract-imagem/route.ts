import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { limiteAtingido, registrarUso } from '@/lib/aiUsage';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Lê o LAUDO (texto) de um exame de imagem — NÃO analisa a imagem radiológica.
const MODEL = process.env.ANTHROPIC_MODEL_LEITURA || 'claude-sonnet-5';
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type ImgType = (typeof IMG_TYPES)[number];

const SYSTEM = `Você lê o LAUDO ESCRITO de um exame de imagem (radiografia, ressonância, tomografia, ultrassom, capilaroscopia) e organiza o texto para o médico revisar. Você NÃO interpreta a imagem radiológica — apenas transcreve e organiza o que o radiologista escreveu. Ferramenta de APOIO.

Regras:
- Devolva SOMENTE um objeto JSON, sem texto fora dele.
- Formato: {"modalidade": string, "regiao": string, "data": "YYYY-MM-DD", "achados": string, "conclusao": string, "alerta": string}.
- "modalidade": tipo do exame (ex.: Radiografia, RM, TC, US, Densitometria, Capilaroscopia). "" se não houver.
- "regiao": região/segmento examinado (ex.: mãos e punhos, sacroilíacas, tórax). "" se não houver.
- "data": data do exame (YYYY-MM-DD) se constar; senão "".
- "achados": resumo fiel dos principais achados descritos no laudo, em português, sem inventar.
- "conclusao": a impressão/conclusão do laudo, transcrita.
- "alerta": só preencha se o laudo trouxer um achado que exija atenção urgente (ex.: fratura, nódulo pulmonar suspeito, lesão expansiva); senão "".
- NUNCA invente achados, medidas ou diagnósticos. Transcreva apenas o que o radiologista escreveu. Se a imagem não tiver um laudo escrito legível, devolva tudo "".`;

interface Extraido { modalidade: string; regiao: string; data: string; achados: string; conclusao: string; alerta: string }

function parse(text: string): Extraido {
  let raw = text.trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) raw = fence[1].trim();
  const s = raw.indexOf('{'); const e = raw.lastIndexOf('}');
  if (s >= 0 && e > s) raw = raw.slice(s, e + 1);
  try {
    const o = JSON.parse(raw) as Record<string, unknown>;
    const g = (k: string) => String(o[k] ?? '').trim();
    let data = g('data'); if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) data = '';
    return { modalidade: g('modalidade'), regiao: g('regiao'), data, achados: g('achados'), conclusao: g('conclusao'), alerta: g('alerta') };
  } catch {
    return { modalidade: '', regiao: '', data: '', achados: '', conclusao: '', alerta: '' };
  }
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'A chave da IA (ANTHROPIC_API_KEY) não foi configurada no servidor.' }, { status: 503 });
  if (await limiteAtingido(supabase, user.id)) return NextResponse.json({ error: 'Limite diário de uso da IA atingido. Tente amanhã ou digite o laudo.' }, { status: 429 });

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
      model: MODEL, max_tokens: 1500, system: SYSTEM,
      messages: [{ role: 'user', content: [fileBlock, { type: 'text', text: 'Organize o LAUDO ESCRITO deste exame de imagem no formato pedido. Transcreva os achados/conclusão, não interprete a imagem nem invente.' }] }],
    });
    registrarUso(supabase, user.id, 'extract-imagem', MODEL);
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
