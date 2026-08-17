import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { limiteAtingido, registrarUso } from '@/lib/aiUsage';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Leitura de laudo. Padrão: mesmo modelo do app (Opus). Para usar um modelo mais barato,
// definir ANTHROPIC_MODEL_LEITURA no servidor (ex.: claude-sonnet-5) APÓS confirmar o acesso.
const MODEL = process.env.ANTHROPIC_MODEL_LEITURA || process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
const IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type ImgType = (typeof IMG_TYPES)[number];

const SYSTEM = `Você lê um print de tela (ou foto) do sistema/prontuário de uma clínica e extrai os dados cadastrais do paciente para pré-preencher um cadastro. Você é uma ferramenta de APOIO: o médico revisa tudo antes de salvar.

Regras:
- Devolva SOMENTE um objeto JSON, sem texto fora dele.
- Campos possíveis (todos opcionais; use "" quando não encontrar): {"nome": string, "nascimento": "YYYY-MM-DD", "idade": string, "cpf": string, "whats": string, "email": string, "endereco": string, "cidade": string, "estado": string, "cep": string}.
- "nome": nome completo do paciente.
- "nascimento": data de nascimento no formato YYYY-MM-DD. Se a tela mostrar dd/mm/aaaa, converta. Se não houver, use "".
- "idade": se aparecer a idade em anos (ex.: "54 anos"), traga; senão "".
- "cpf": só os dígitos ou no formato 000.000.000-00, como estiver na tela.
- "whats": telefone/celular do paciente, como estiver na tela.
- "email": e-mail do paciente.
- "endereco": logradouro, número e bairro em um texto só.
- "estado": sigla UF de 2 letras (ex.: SP).
- NÃO invente nada. Traga apenas o que estiver claramente visível na imagem. Se um campo não aparecer, deixe "".
- Não confunda dados da clínica/médico com dados do paciente — extraia apenas o paciente.`;

interface Extracted {
  nome: string; nascimento: string; idade: string; cpf: string;
  whats: string; email: string; endereco: string; cidade: string; estado: string; cep: string;
}

function parseObj(text: string): Partial<Extracted> {
  let raw = text.trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) raw = fence[1].trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) raw = raw.slice(start, end + 1);
  let obj: unknown;
  try { obj = JSON.parse(raw); } catch { return {}; }
  if (!obj || typeof obj !== 'object') return {};
  const o = obj as Record<string, unknown>;
  const s = (k: string) => String(o[k] ?? '').trim();
  let nascimento = s('nascimento');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(nascimento)) {
    const br = nascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    nascimento = br ? `${br[3]}-${br[2]}-${br[1]}` : '';
  }
  let estado = s('estado').toUpperCase();
  if (estado.length > 2) estado = estado.slice(0, 2);
  return {
    nome: s('nome'), nascimento, idade: s('idade'), cpf: s('cpf'),
    whats: s('whats'), email: s('email'), endereco: s('endereco'),
    cidade: s('cidade'), estado, cep: s('cep'),
  };
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'A chave da IA (ANTHROPIC_API_KEY) não foi configurada no servidor.' }, { status: 503 });
  }
  if (await limiteAtingido(supabase, user.id)) {
    return NextResponse.json({ error: 'Limite diário de uso da IA atingido. Tente novamente amanhã ou preencha o cadastro manualmente.' }, { status: 429 });
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
      max_tokens: 1024,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } },
          { type: 'text', text: 'Extraia os dados cadastrais do paciente desta tela, seguindo estritamente o formato pedido.' },
        ],
      }],
    });
    registrarUso(supabase, user.id, 'extract-paciente', MODEL);
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
