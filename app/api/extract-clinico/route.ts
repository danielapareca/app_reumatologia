import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { limiteAtingido, registrarUso } from '@/lib/aiUsage';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Leitura usa modelo mais barato (Sonnet); raciocínio clínico segue no Opus.
const MODEL = process.env.ANTHROPIC_MODEL_LEITURA || 'claude-sonnet-5';
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type ImgType = (typeof IMG_TYPES)[number];

const SYSTEM = `Você lê um print de tela (ou foto) da evolução/prontuário de um paciente no sistema da clínica e organiza o texto em campos, para o médico revisar. Você é uma ferramenta de APOIO: o médico revisa e edita tudo antes de salvar.

Regras:
- Devolva SOMENTE um objeto JSON, sem texto fora dele.
- Campos (todos opcionais; use "" quando não houver): {"hda": string, "antecedentes": string, "observacoes": string}.
- "hda": história da doença atual — queixa, tempo de evolução, sintomas, evolução do quadro.
- "antecedentes": antecedentes pessoais/familiares, comorbidades, MEDICAÇÕES EM USO e ALERGIAS.
- "observacoes": conduta, orientações e anotações que não sejam HDA nem antecedentes.
- Transcreva fielmente o que está escrito, apenas organizando nos campos. NÃO invente sintomas, doses, diagnósticos nem exames. NÃO complete o que não estiver na imagem.
- Se não conseguir separar, coloque todo o texto legível em "hda" e deixe os outros "".
- Mantenha o português do texto original e abreviações médicas como estão.`;

interface Extracted { hda: string; antecedentes: string; observacoes: string }

function parseObj(text: string): Extracted {
  let raw = text.trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) raw = fence[1].trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
  let obj: unknown;
  try { obj = JSON.parse(raw); } catch { return { hda: '', antecedentes: '', observacoes: '' }; }
  if (!obj || typeof obj !== 'object') return { hda: '', antecedentes: '', observacoes: '' };
  const o = obj as Record<string, unknown>;
  const s = (k: string) => String(o[k] ?? '').trim();
  return { hda: s('hda'), antecedentes: s('antecedentes'), observacoes: s('observacoes') };
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'A chave da IA (ANTHROPIC_API_KEY) não foi configurada no servidor.' }, { status: 503 });
  }
  if (await limiteAtingido(supabase, user.id)) {
    return NextResponse.json({ error: 'Limite diário de uso da IA atingido. Tente novamente amanhã ou digite/dite manualmente.' }, { status: 429 });
  }

  let body: { imageBase64?: string; mediaType?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }
  const imageBase64 = (body.imageBase64 || '').replace(/^data:image\/\w+;base64,/, '');
  const mediaType = (body.mediaType || '') as ImgType;
  if (!imageBase64) return NextResponse.json({ error: 'Imagem não recebida.' }, { status: 400 });
  if (!IMG_TYPES.includes(mediaType)) {
    return NextResponse.json({ error: 'Formato de imagem não suportado (use JPG, PNG ou WEBP).' }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: 'Organize o texto clínico desta tela em HDA, antecedentes e observações, seguindo estritamente o formato pedido. Transcreva, não invente.' },
        ],
      }],
    });
    registrarUso(supabase, user.id, 'extract-clinico', MODEL);
    const texto = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text).join('\n');
    return NextResponse.json({ dados: parseObj(texto) });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      const msg = err.status === 401
        ? 'A chave da IA foi recusada. Verifique a ANTHROPIC_API_KEY no servidor.'
        : 'Falha ao ler a imagem: ' + err.message;
      return NextResponse.json({ error: msg }, { status: err.status === 401 ? 500 : (err.status || 500) });
    }
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao ler a imagem: ' + msg }, { status: 500 });
  }
}
