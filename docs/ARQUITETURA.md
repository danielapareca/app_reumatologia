# Arquitetura do app "Condutas" (Reumatologia) e guia de adaptação

Este documento descreve o app de apoio à decisão do Dr. Willian (reumatologia), o que
ele faz, como é construído e como reaproveitá-lo como base para um app de outra área
da saúde (ex.: dermatologia). Serve de briefing para abrir uma conversa no Claude e
recriar/adaptar o produto.

> Princípio inegociável do produto: é APOIO ao médico, NÃO substitui o médico. Toda
> sugestão da IA cita a fonte, nunca inventa dose e exige revisão clínica. Esse
> enquadramento deve ser mantido em qualquer versão.

---

## 1. O que o app faz

App web (celular e computador) que o médico usa durante a consulta para:

- Cadastrar o paciente de forma guiada (doença, fase do tratamento, dados, exames).
- Ler por foto/PDF: dados do paciente (print do sistema da clínica), laudos de
  exame (laboratório e imagem) e a evolução clínica, preenchendo os campos sozinho.
- Gravar e transcrever a consulta ao vivo (escuta), salvando no prontuário.
- Seguir um roteiro que se adapta à doença, ao tipo de consulta e à fase.
- Calcular escores de atividade da doença e ler densitometria (DXA/FRAX).
- Ver alertas de segurança: interações medicamentosas, sinais de alarme, lembretes.
- Gerar insights com IA (fundamentados em diretrizes, citando a fonte) e conversar
  com a IA no contexto do paciente.
- Emitir documentos: receita, solicitação de exames e LME (Laudo do Componente
  Especializado, específico do SUS).
- Guardar o histórico (prontuário) com data e numeração de consultas e gráficos de
  evolução.

---

## 2. Stack técnica

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 14 (App Router, Server Components, Server Actions, Route Handlers) |
| Linguagem | TypeScript |
| Banco / Auth / Storage | Supabase (PostgreSQL, Auth e-mail+senha, Storage, RLS) |
| IA | Anthropic Claude (SDK @anthropic-ai/sdk), modelo via env |
| PDF | pdf-lib (LME) e Chromium headless (impressão) |
| Hospedagem | Vercel (deploy automático a cada push na branch de produção) |
| Estilo | CSS puro (globals.css) com variáveis de tema (navy + dourado) |

Dependências principais: `next`, `react`, `@supabase/ssr`, `@supabase/supabase-js`,
`@anthropic-ai/sdk`, `pdf-lib`.

---

## 3. Estrutura de pastas

```
app/
  page.tsx                 Lista de pacientes (home)
  layout.tsx               Layout raiz, fontes, metadados
  globals.css              Todo o CSS (tema, componentes, responsivo)
  error.tsx/global-error.tsx  Telas de erro (mostram a mensagem real)
  login/                   Login (e-mail+senha) + actions
  perfil/                  Cabeçalho do médico (nome, CRM, CNES, CNS) + actions
  gestor/                  Painel admin (estatísticas de uso)
  assistente/              "Pergunte à IA" (chat livre)
  paciente/
    novo/                  Cadastro guiado (doença+fase, documentos, dados)
    [id]/                  Tela de atendimento (o coração do app)
      Atendimento.tsx      Componente principal da consulta
      *.tsx                Painéis: exames, escuta, calculadoras, DXA, etc.
      actions.ts           Server actions (salvar consulta/paciente, etc.)
  api/                     Route handlers de IA (ver seção 8)
components/                UI reutilizável (NavRail, Icon, LineChart, VoiceMic, etc.)
lib/
  supabase/                Clientes Supabase (server, client, middleware)
  clinical/                CONTEÚDO E LÓGICA CLÍNICA (ver seção 7) <- o que troca por área
  aiUsage.ts               Limite diário e registro de uso da IA
  types.ts                 Tipos das tabelas do banco
  util.ts                  Helpers (datas, idade, nome próprio, etc.)
  disclaimer.ts            Textos de "apoio, não substitui"
data/
  grounding_reumatologia.json  Base de conhecimento da IA (fonte do grounding.ts)
supabase/
  schema.sql               Esquema do banco (tabelas, RLS, funções, storage)
```

A fronteira importante: **tudo que é específico da especialidade vive em
`lib/clinical/` e em `data/grounding_*.json`**. O resto (auth, cadastro, prontuário,
endpoints de IA, UI) é genérico e se reaproveita quase sem mudança.

---

## 4. Modelo de dados (Supabase, `supabase/schema.sql`)

Tabelas (todas com RLS: cada médico só vê os próprios dados):

- `profiles`: dados do médico (nome, crm, especialidade, clínica, endereço, cnes, cns).
- `patients`: paciente (nome, idade, nascimento, contato, endereço, consentimento
  LGPD `consent_data`, e `diagnosticos` jsonb = lista de doenças do paciente).
- `consultas`: cada consulta com data, doença, etapa, tipo, hda, antecedentes,
  observações (escuta), exames_texto, receita_texto, lme_json, ia_insight.
- `exam_values`: valores numéricos de exames/escores com data (viram gráfico).
- `exam_files`: laudos originais (ponteiro para o Storage).
- `medication_events`: linha do tempo de medicação (início/troca/suspensão).
- `ai_feedback`: feedback do médico sobre respostas da IA.
- `ai_usage`: registro de uso da IA (para o limite diário).
- `app_admins` + funções `is_admin()`, `admin_stats()`, `admin_fase_stats()`,
  `admin_ai_feedback()`: painel do gestor.

Storage: bucket privado `exames` (PDFs e fotos de laudos), com políticas por dono.

Segurança: RLS em todas as tabelas; chave da IA só no servidor; consentimento LGPD
do paciente registrado com data/hora.

---

## 5. Autenticação e perfis

- Login por e-mail e senha (Supabase Auth). `lib/supabase/{server,client,middleware}.ts`
  criam os clientes e mantêm a sessão via cookies (@supabase/ssr).
- O médico preenche o próprio cabeçalho em `/perfil` (nome, CRM, especialidade,
  CNES, CNS), usado nos documentos impressos.

---

## 6. Fluxo do usuário

1. Login.
2. Lista de pacientes (`/`), com busca, selo de doença(s) e alerta de retorno atrasado.
3. Cadastro guiado (`/paciente/novo`): Passo 1 doença + tipo + fase (com orientação
   do que preencher); Passo 2 "Central de documentos" (print dos dados + exames por
   PDF/foto) + campos do paciente. Ao salvar, abre a ficha já na fase escolhida.
4. Atendimento (`/paciente/[id]`), em um roteiro numerado na aba Anamnese:
   Passo 1 Dados e exames, Passo 2 Escuta e avaliação, Passo 3 Cálculos (se
   necessário), Passo 4 IA (gerar insight + conversar). Abas: Anamnese, Conduta
   (receita/exames/LME), Evolução (prontuário com datas + linha de medicação).

---

## 7. Camada clínica (`lib/clinical/`) — o que se troca por especialidade

Cada arquivo é um "conteúdo" estruturado. Para adaptar a outra área, troca-se o
conteúdo mantendo o formato:

- `types.ts`: tipos base. `Disease` = `{ n (nome), cid, conf (exames de
  confirmação), basal? (pré-tratamento), etapas: Etapa[] }`. `Etapa` =
  `{ id, label, sub?, itens: RxItem[], nota? }`. `RxItem` = `{ m (medicamento/
  conduta), p (posologia), q? (quantidade), ceaf? (exige LME) }`.
- `diseases.ts`: objeto `D` com todas as doenças (19+ na reumato) e `ORDER` (grupos
  para o menu). É a espinha dorsal: protocolos por etapa de tratamento.
- `grounding.ts` (+ `data/grounding_*.json`): base de conhecimento da IA, em
  "chunks" `{ id, doenca, cid, topico, fonte, texto }`. A IA cita por `[id]`.
- `anamnese.ts`: anamnese guiada por doença (perguntas pontuadas + clínicas) e
  cálculo de insight (critérios como ACR/EULAR).
- `scores.ts`: calculadoras de atividade (DAS28, CDAI, BASDAI, SLEDAI, ASDAS,
  cJADAS) e leitura de DXA (T-score/Z-score).
- `roteiro.ts`: monta o roteiro adaptativo (o que priorizar) conforme doença + tipo
  (primeira/retorno) + fase; define o escore sugerido por doença.
- `faseGuia.ts`: orientação "o que preencher" por fase, usada no cadastro guiado.
- `interactions.ts`: verificador de interações medicamentosas (regras grave/cautela
  por classes de medicamento).
- `lembretes.ts`: lembretes contextuais por doença (ex.: calcular FRAX).
- `redflags.ts`: sinais de alarme por doença.
- `flags.ts`, `monitor.ts`, `medsync.ts`, `insights.ts`: alertas de segurança da
  receita, monitorização, sincronização da linha de medicação a partir da receita, e
  varredura de achados no texto.

---

## 8. Endpoints de IA (`app/api/*/route.ts`)

Todos no servidor (chave nunca no cliente), com guarda de limite diário
(`lib/aiUsage.ts`) e registro de uso.

| Rota | Função | Modelo |
| --- | --- | --- |
| `/api/insights` | Gera o insight clínico da consulta (grounding por doença, cita fonte) | Opus (raciocínio) |
| `/api/ask` | Chat livre e chat da consulta (aceita histórico + contexto do paciente) | Opus |
| `/api/ai-doc` | Redige textos de documento (ex.: anamnese da LME) | Opus |
| `/api/extract-exames` | Lê laudo laboratorial (PDF/foto) e extrai valores numéricos | Leitura (padrão Opus; `ANTHROPIC_MODEL_LEITURA` pode trocar) |
| `/api/extract-paciente` | Lê print do sistema e extrai dados cadastrais | Leitura |
| `/api/extract-clinico` | Lê print da evolução e organiza em HDA/antecedentes/obs | Leitura |
| `/api/extract-dxa` | Lê laudo de densitometria (T-score/Z-score) | Leitura |
| `/api/extract-imagem` | Lê o LAUDO ESCRITO de exame de imagem (não interpreta a imagem) | Leitura |
| `/api/lme` | Gera o PDF da LME (pdf-lib) | — |

Padrão de grounding (RAG simples): seleciona chunks por prefixo da doença ou por
palavras-chave da pergunta, injeta no prompt e manda a IA citar `[id]`.

Importante: a IA lê texto, imagem e PDF, mas NÃO é dispositivo de diagnóstico por
imagem. O app lê LAUDOS (texto), não "lauda" radiografia/foto clínica.

---

## 9. Variáveis de ambiente

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: conexão Supabase.
- `ANTHROPIC_API_KEY`: chave da IA (somente servidor).
- `ANTHROPIC_MODEL`: modelo principal (padrão claude-opus-4-8).
- `ANTHROPIC_MODEL_LEITURA`: modelo das leituras de laudo (opcional; cai no principal).
- `AI_DAILY_LIMIT`: teto de chamadas de IA por médico por dia (padrão 40).

Supabase também precisa de uma `SUPABASE_SERVICE_ROLE`/chaves conforme o uso das
funções admin; conferir no painel.

---

## 10. Deploy

- Vercel conectado ao repositório; a branch de produção publica automaticamente a
  cada push.
- Supabase: rodar `supabase/schema.sql` no SQL Editor cria tabelas, RLS, storage e
  funções. Novas colunas são adicionadas com `alter table ... add column if not exists`.
- Custos: API Anthropic por uso (centavos por leitura/insight); Vercel e Supabase têm
  plano grátis e planos Pro (~US$20 e ~US$25/mês) quando o volume cresce.

---

## 11. Como adaptar para DERMATOLOGIA

A infraestrutura (auth, pacientes, consultas, exames, prontuário, cadastro guiado,
escuta, endpoints de IA, UI, deploy) é reaproveitada quase inteira. O trabalho é
trocar o CONTEÚDO CLÍNICO e alguns rótulos. Passo a passo:

1. Duplicar o repositório (fork) e renomear o projeto (ex.: app_dermatologia).
2. `lib/clinical/diseases.ts`: substituir as doenças reumatológicas pelas
   dermatológicas, com as etapas de tratamento de cada uma. Exemplos de condições:
   acne, rosácea, dermatite atópica, psoríase, melasma, vitiligo, urticária,
   dermatite de contato, micoses, onicomicose, alopecia, câncer de pele
   (carcinomas e melanoma), hidradenite supurativa, verrugas/HPV.
3. `data/grounding_dermatologia.json` + `grounding.ts`: trocar a base de
   conhecimento por diretrizes de dermatologia (SBD, consensos, PCDTs de psoríase,
   etc.), no mesmo formato de chunks. Gerar o `grounding.ts` a partir do JSON.
4. `scores.ts`: trocar os escores por dermatológicos (PASI e BSA para psoríase,
   SCORAD/EASI para dermatite atópica, DLQI de qualidade de vida, IGA, escala de acne).
5. `redflags.ts`: sinais de alarme dermatológicos (regra ABCDE do melanoma, lesão
   que muda/sangra, sinais de infecção grave, farmacodermia grave como Stevens-Johnson).
6. `interactions.ts` e `lembretes.ts`: interações e lembretes relevantes
   (isotretinoína: gravidez/contracepção, lipídios e transaminases; metotrexato;
   imunobiológicos para psoríase: rastreio de TB/hepatites; fotoproteção).
7. `anamnese.ts`, `roteiro.ts`, `faseGuia.ts`: ajustar perguntas, roteiro e
   orientações por fase para o fluxo dermatológico.
8. Documentos: a reumato usa LME (CEAF). Em dermato, adaptar para os documentos
   da área (ex.: termo/receituário de controle especial da isotretinoína, LME de
   biológicos para psoríase). Ajustar `app/api/lme` e `LmePreview.tsx` ou substituir.
9. Imagem clínica: dermatologia é muito visual, mas vale a mesma regra. Reaproveitar
   o padrão de LER LAUDO (dermatoscopia/anatomopatológico) sem fazer diagnóstico por
   imagem com IA genérica (isso é dispositivo regulado pela ANVISA; ver seção 8).
10. Rótulos e textos: "reumatologista" -> "dermatologista", disclaimers, nome do app.

O que NÃO precisa mexer: `lib/supabase/*`, `app/api/ask|insights|extract-*` (lógica),
`components/*`, `app/login|perfil|gestor`, `supabase/schema.sql` (estrutura), fluxo de
cadastro e prontuário, controle de custo e LGPD.

---

## 12. Prompt pronto para começar o app de dermatologia

Abra uma conversa nova no Claude (ou um Claude Code sobre o fork) e cole:

> Você vai me ajudar a criar um app de apoio à decisão para um DERMATOLOGISTA,
> usando como base o app de reumatologia descrito no documento de arquitetura que
> vou anexar. Mantenha a mesma stack (Next.js 14 + Supabase + Claude) e o mesmo
> princípio: é APOIO ao médico, não substitui, a IA cita a fonte e nunca inventa dose.
>
> Reaproveite toda a infraestrutura (auth, pacientes, consultas, exames, prontuário,
> cadastro guiado, escuta, endpoints de IA, UI, deploy) e troque apenas o conteúdo
> clínico em lib/clinical/ e data/grounding por dermatologia.
>
> Comece propondo: (1) a lista de condições dermatológicas com as etapas de
> tratamento (diseases.ts), (2) os escores (PASI, SCORAD, DLQI...), (3) os sinais de
> alarme (ABCDE do melanoma), (4) a base de conhecimento (grounding) a partir de
> diretrizes da SBD. Tudo para eu validar com o médico antes de publicar.

Observação final: todo o conteúdo clínico (doses, protocolos, escores, interações)
precisa ser validado pelo médico responsável da nova área antes de ir ao ar.
