# Documentação do app "Condutas" (apoio à decisão em reumatologia)

Este documento explica o app do Dr. Willian: o que ele faz, como ajuda o médico, e
como o código é organizado. Serve como documentação técnica e funcional do produto.

> Princípio do produto: é APOIO ao médico, NÃO substitui o médico. Toda sugestão da
> IA cita a fonte, nunca inventa dose e exige revisão clínica. A responsabilidade é
> sempre do médico.

---

## 1. O que o app faz

App web (funciona no celular e no computador) que o médico usa durante a consulta
para organizar o atendimento e apoiar a decisão. Em resumo, ele:

- Cadastra o paciente de forma guiada (doença, fase do tratamento, dados, exames).
- Lê por foto/PDF: dados do paciente (print do sistema da clínica), laudos de exame
  (laboratório e imagem) e a evolução clínica, preenchendo os campos sozinho.
- Grava e transcreve a consulta ao vivo (escuta), salvando no prontuário.
- Segue um roteiro que se adapta à doença, ao tipo de consulta e à fase.
- Calcula escores de atividade da doença e lê densitometria (DXA/FRAX).
- Mostra alertas de segurança: interações medicamentosas, sinais de alarme, lembretes.
- Gera insights com IA (fundamentados em diretrizes, citando a fonte) e permite
  conversar com a IA no contexto do paciente.
- Emite documentos: receita, solicitação de exames e LME (Laudo do Componente
  Especializado, do SUS).
- Guarda o histórico (prontuário) com data e numeração das consultas e gráficos de
  evolução dos exames.

---

## 2. Como o app ajuda o médico no dia a dia

O ganho central é tempo e segurança: o médico atende mais rápido, sem redigitar, e
com uma rede de proteção que reduz erros.

- Menos digitação: dados do paciente, exames e evolução entram por foto/print, e a
  conversa da consulta vira texto por voz. O médico revisa em vez de digitar do zero.
- Organização por passos: o app conduz "primeiro isso, depois isso", adaptado à
  doença e à fase, para não esquecer etapas (rastreio antes de biológico, por exemplo).
- Decisão apoiada em diretrizes: os insights e o chat respondem com base numa base de
  conhecimento (PCDTs e diretrizes), sempre citando a fonte, para o médico conferir.
- Segurança: alerta de interações medicamentosas perigosas, sinais de alarme por
  doença e lembretes (ex.: calcular o FRAX na osteoporose).
- Documentos prontos: receita, pedido de exames e LME saem padronizados e já com o
  cabeçalho do médico.
- Continuidade: cada consulta fica registrada com data; na volta, o app mostra que é
  a 2ª, 3ª consulta e traz os exames em gráfico para acompanhar a evolução.
- Controle de custo e privacidade: limite diário de uso da IA, chave da IA só no
  servidor, consentimento LGPD do paciente e dados isolados por médico.

Em uma frase: o app tira o trabalho repetitivo da frente do médico e deixa visível, na
hora certa, o que importa para decidir, sempre com ele no comando.

---

## 3. Stack técnica

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 14 (App Router, Server Components, Server Actions, Route Handlers) |
| Linguagem | TypeScript |
| Banco / Auth / Storage | Supabase (PostgreSQL, Auth e-mail+senha, Storage, RLS) |
| IA | Anthropic Claude (SDK @anthropic-ai/sdk), modelo definido por variável de ambiente |
| PDF | pdf-lib (LME) e Chromium headless (impressão) |
| Hospedagem | Vercel (deploy automático a cada push na branch de produção) |
| Estilo | CSS puro (globals.css) com variáveis de tema (navy + dourado) |

Dependências principais: `next`, `react`, `@supabase/ssr`, `@supabase/supabase-js`,
`@anthropic-ai/sdk`, `pdf-lib`.

---

## 4. Estrutura de pastas (onde fica cada coisa)

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
  clinical/                Conteúdo e lógica clínica (ver seção 7)
  aiUsage.ts               Limite diário e registro de uso da IA
  types.ts                 Tipos das tabelas do banco
  util.ts                  Helpers (datas, idade, nome próprio, etc.)
  disclaimer.ts            Textos de "apoio, não substitui"
data/
  grounding_reumatologia.json  Base de conhecimento da IA (fonte do grounding.ts)
supabase/
  schema.sql               Esquema do banco (tabelas, RLS, funções, storage)
```

O conteúdo específico da especialidade (as doenças, protocolos e a base de
conhecimento da IA) vive em `lib/clinical/` e em `data/grounding_*.json`. O restante
(login, cadastro, prontuário, endpoints de IA, UI) é a infraestrutura geral do app.

---

## 5. Modelo de dados (Supabase, `supabase/schema.sql`)

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

Segurança: RLS em todas as tabelas; chave da IA só no servidor; consentimento LGPD do
paciente registrado com data e hora.

---

## 6. Fluxo do usuário

1. Login (e-mail e senha).
2. Lista de pacientes (`/`), com busca, selo de doença(s) e alerta de retorno atrasado.
3. Cadastro guiado (`/paciente/novo`): Passo 1 doença + tipo + fase (com orientação do
   que preencher); Passo 2 "Central de documentos" (print dos dados + exames por
   PDF/foto) + campos do paciente. Ao salvar, abre a ficha já na fase escolhida.
4. Atendimento (`/paciente/[id]`), num roteiro numerado na aba Anamnese: Passo 1 Dados
   e exames, Passo 2 Escuta e avaliação, Passo 3 Cálculos (se necessário), Passo 4 IA
   (gerar insight + conversar). Abas: Anamnese, Conduta (receita/exames/LME) e Evolução
   (prontuário com datas + linha de medicação).

---

## 7. Camada clínica (`lib/clinical/`)

Cada arquivo guarda um "conteúdo" estruturado da especialidade:

- `types.ts`: tipos base. `Disease` = `{ n (nome), cid, conf (exames de confirmação),
  basal? (pré-tratamento), etapas: Etapa[] }`. `Etapa` = `{ id, label, sub?, itens:
  RxItem[], nota? }`. `RxItem` = `{ m (medicamento/conduta), p (posologia), q?
  (quantidade), ceaf? (exige LME) }`.
- `diseases.ts`: objeto `D` com todas as doenças e `ORDER` (grupos do menu). É a
  espinha dorsal: protocolos por etapa de tratamento.
- `grounding.ts` (+ `data/grounding_reumatologia.json`): base de conhecimento da IA em
  "chunks" `{ id, doenca, cid, topico, fonte, texto }`. A IA cita por `[id]`.
- `anamnese.ts`: anamnese guiada por doença (perguntas pontuadas + clínicas) e cálculo
  de insight (critérios como ACR/EULAR).
- `scores.ts`: calculadoras de atividade (DAS28, CDAI, BASDAI, SLEDAI, ASDAS, cJADAS) e
  leitura de DXA (T-score/Z-score).
- `roteiro.ts`: monta o roteiro adaptativo conforme doença + tipo (primeira/retorno) +
  fase; define o escore sugerido por doença.
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

Todos rodam no servidor (chave da IA nunca no cliente), com guarda de limite diário
(`lib/aiUsage.ts`) e registro de uso.

| Rota | Função | Modelo |
| --- | --- | --- |
| `/api/insights` | Gera o insight clínico da consulta (grounding por doença, cita fonte) | principal (raciocínio) |
| `/api/ask` | Chat livre e chat da consulta (aceita histórico + contexto do paciente) | principal |
| `/api/ai-doc` | Redige textos de documento (ex.: anamnese da LME) | principal |
| `/api/extract-exames` | Lê laudo laboratorial (PDF/foto) e extrai valores numéricos | leitura |
| `/api/extract-paciente` | Lê print do sistema e extrai dados cadastrais | leitura |
| `/api/extract-clinico` | Lê print da evolução e organiza em HDA/antecedentes/obs | leitura |
| `/api/extract-dxa` | Lê laudo de densitometria (T-score/Z-score) | leitura |
| `/api/extract-imagem` | Lê o LAUDO ESCRITO de exame de imagem (não interpreta a imagem) | leitura |
| `/api/lme` | Gera o PDF da LME (pdf-lib) | — |

Padrão de grounding (RAG simples): o servidor seleciona os chunks por prefixo da
doença ou por palavras-chave da pergunta, injeta no prompt e manda a IA citar `[id]`.

Importante: a IA lê texto, imagem e PDF, mas NÃO é dispositivo de diagnóstico por
imagem. O app lê LAUDOS (texto), não "lauda" radiografia ou foto clínica.

---

## 9. Variáveis de ambiente

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: conexão Supabase.
- `ANTHROPIC_API_KEY`: chave da IA (somente servidor).
- `ANTHROPIC_MODEL`: modelo principal (padrão claude-opus-4-8).
- `ANTHROPIC_MODEL_LEITURA`: modelo das leituras de laudo (opcional; cai no principal).
- `AI_DAILY_LIMIT`: teto de chamadas de IA por médico por dia (padrão 40).

---

## 10. Deploy

- Vercel conectado ao repositório; a branch de produção publica automaticamente a cada
  push.
- Supabase: rodar `supabase/schema.sql` no SQL Editor cria tabelas, RLS, storage e
  funções. Novas colunas são adicionadas com `alter table ... add column if not exists`.
- Custos: API Anthropic por uso (centavos por leitura/insight); Vercel e Supabase têm
  plano grátis e planos Pro (~US$20 e ~US$25/mês) quando o volume cresce.

---

## 11. O código

O código-fonte completo acompanha este documento (pasta do projeto, sem
`node_modules` e sem `.next`, que são gerados por `npm install` e `npm run build`).
Para rodar localmente: `npm install`, criar um arquivo `.env.local` com as variáveis
da seção 9, e `npm run dev`. Para publicar: conectar o repositório ao Vercel e rodar
o `supabase/schema.sql` no Supabase.

Todo o conteúdo clínico (doses, protocolos, escores, interações, base de
conhecimento) é material de apoio e deve ser validado pelo médico responsável antes
de ser usado em produção.
