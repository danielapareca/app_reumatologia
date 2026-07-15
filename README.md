# App Reumatologia — Fase 1

App de apoio ao médico reumatologista: login por médico, cadastro de pacientes,
gerador de **pedidos de exames**, **receitas por etapa de tratamento** e a
**LME oficial (Componente Especializado)** em PDF, com anamnese guiada, insights
de texto e histórico/evolução do paciente.

Portado do protótipo `gerador_v3.html` (19 doenças, etapas de tratamento,
escore ACR/EULAR 2010 da AR, alertas de segurança e motor de insights).

## Stack

- **Next.js 14** (App Router, TypeScript) + **React**
- **Supabase** — auth por e-mail/senha + PostgreSQL (com Row Level Security)
- **pdf-lib** — preenche a LME oficial no servidor
- **Vercel** — hospedagem (deploy automático a cada push)

## Como rodar localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Crie o projeto no Supabase** e rode o SQL:
   - Painel do Supabase → **SQL Editor** → cole e rode `supabase/schema.sql`.
   - Copie `Project URL` e `anon key` em **Settings → API**.
   - (Para testar rápido sem confirmar e-mail) **Authentication → Providers → Email**
     e desative "Confirm email".

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.local.example .env.local
   ```
   Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

4. **Rode:**
   ```bash
   npm run dev
   ```
   Abra http://localhost:3000.

## Publicar (Vercel)

1. Suba o código no **GitHub**.
2. Importe o repositório na **Vercel**.
3. Em **Settings → Environment Variables**, repita `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. (Fase 2: adicionar `ANTHROPIC_API_KEY` —
   **somente no servidor**, nunca exposta no navegador.)
4. Deploy. Cada `git push` publica automaticamente.

> **LGPD:** escolha a região do servidor no Supabase, use senha forte por médico
> e registre o consentimento do paciente. O médico é o responsável legal pelos dados.

## Estrutura

```
app/
  login/            login e cadastro de médico
  perfil/           cabeçalho do médico (sai nas receitas e na LME)
  paciente/novo/    cadastro de paciente
  paciente/[id]/    atendimento: abas Documentos, Anamnese, Evolução
  api/lme/          rota que preenche a LME oficial (pdf-lib)
  page.tsx          dashboard: busca e lista de pacientes
lib/
  clinical/         dados e lógica clínica (doenças, flags, anamnese, insights)
  supabase/         clientes browser/server + middleware de sessão
data/
  Formulario_LME_2026.pdf   LME oficial usada pelo pdf-lib
supabase/
  schema.sql        tabelas + RLS
```

## LME — mapa de campos (app → PDF)

Preenchida no servidor por `app/api/lme/route.ts`, respeitando o `MaxLength` de
cada campo (senão o campo fica vazio):

| App | Campo no PDF |
|---|---|
| CNES | `CNES` (máx 7) |
| Estabelecimento | `Nome do estabelecimento de saúde` |
| Paciente | `Nome do paciente` |
| Mãe | `Nome da mãe do paciente` |
| Peso / Altura | `Peso` / `Altura` |
| Medicamento linha 1 | `med1` (linhas 2–6: dropdowns `Selecao med 2`…`Selecao med 6`) |
| Quantidade 1º–6º mês | `Text6`, `Text7`, `Text8`, `Text6a`, `Text7a`, `Text8a` (máx 4, só número) |
| CID | `CID` (máx 5 — só o código, ex.: `M05`) |
| Diagnóstico / Anamnese | `Diagnóstico` / `Anamnese` |
| Médico | `Médico Solicitante` |
| CNS médico / Data | `TextCNS` / `Today` |
| Telefone / Documento / E-mail | `Telefone I` / `Documento` / `email` |

## Próximas fases

- **Fase 2:** insights com a API da Claude (rota no servidor, `ANTHROPIC_API_KEY`).
- **Fase 3:** gráficos de evolução, linha do tempo de medicação, anexos, alertas,
  receita digital assinada, lembrete por WhatsApp e agenda.
