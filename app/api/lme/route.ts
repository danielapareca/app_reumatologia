import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { createClient } from '@/lib/supabase/server';
import type { LmeJson } from '@/lib/types';

export const runtime = 'nodejs';

// Preenche a LME oficial (Formulário LME 2026) com pdf-lib e devolve o PDF.
// Mapa de campos (app → campo no PDF) conforme o plano da Fase 1.
export async function POST(request: Request) {
  // Só médico autenticado gera o documento.
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  let body: LmeJson;
  try {
    body = (await request.json()) as LmeJson;
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  try {
    const pdfPath = path.join(process.cwd(), 'data', 'Formulario_LME_2026.pdf');
    const bytes = await readFile(pdfPath);
    const pdf = await PDFDocument.load(bytes);
    const form = pdf.getForm();

    // Escreve respeitando o MaxLength de cada campo (senão o campo fica vazio).
    const set = (name: string, value?: string | null) => {
      if (value == null || value === '') return;
      try {
        const field = form.getTextField(name);
        let s = String(value);
        const ml = field.getMaxLength ? field.getMaxLength() : undefined;
        if (ml && s.length > ml) s = s.slice(0, ml);
        field.setText(s);
      } catch {
        // Campo ausente/diferente no PDF — ignora silenciosamente.
      }
    };

    const meds = body.meds || [];
    // Quantidades por mês do 1º medicamento (col. 1º ao 6º mês).
    const qtyMonths = ['Text6', 'Text7', 'Text8', 'Text6a', 'Text7a', 'Text8a'];

    set('CNES', body.cnes);
    set('Nome do estabelecimento de saúde', body.estab);
    set('Nome do paciente', body.paciente);
    set('Nome da mãe do paciente', body.mae);
    set('Peso', body.peso);
    set('Altura', body.altura);

    // Medicamento(s): linha 1 no campo de texto; demais linhas são dropdowns
    // ("Selecao med 2".."Selecao med 6") — tentamos selecionar quando existirem.
    if (meds[0]) set('med1', meds[0].m);
    for (let i = 1; i < meds.length && i < 6; i++) {
      try {
        const dd = form.getDropdown(`Selecao med ${i + 1}`);
        const opts = dd.getOptions();
        const match = opts.find((o) => o.toLowerCase().includes(meds[i].m.toLowerCase().slice(0, 8)));
        if (match) dd.select(match);
      } catch {
        // Sem correspondência no dropdown — segue sem preencher.
      }
    }

    // Quantidade do 1º mês (só número, máx 4). Repetimos nos meses subsequentes.
    if (meds[0]) {
      const num = (meds[0].q || '').match(/\d+/);
      if (num) {
        for (const f of qtyMonths) set(f, num[0]);
      }
    }

    // CID máx 5 — enviar só o código (ex.: M05).
    set('CID', (body.cid || '').split('/')[0].trim());
    set('Diagnóstico', body.diagnostico);
    set('Anamnese', body.anamnese);
    set('Médico Solicitante', body.medico);
    set('TextCNS', body.cnsMed);
    set('Today', body.data);
    set('Telefone I', body.telefone);
    set('Documento', body.documento);
    set('email', body.email);

    const out = await pdf.save();
    const safeName = (body.paciente || 'paciente').replace(/[^a-zA-Z0-9]+/g, '_');

    return new NextResponse(Buffer.from(out), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="LME_${safeName}.pdf"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Falha ao gerar o PDF: ' + msg }, { status: 500 });
  }
}
