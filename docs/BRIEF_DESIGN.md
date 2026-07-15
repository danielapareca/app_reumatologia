# Brief de Design — App de Reumatologia (Dr. Willian)

> **Como usar este documento:** cole o conteúdo da seção **“PROMPT PRONTO PARA COLAR”** (no final)
> em uma conversa nova com o Claude, junto de 3 a 5 prints das telas atuais do app. O restante do
> documento é o contexto completo, caso o Claude peça mais detalhes.

---

## 1. O que é o app

Ferramenta **de apoio ao médico reumatologista** (não substitui o médico). Num único atendimento o
médico:

1. **Anamnese** — perguntas guiadas por doença, ditado por voz, escore ACR/EULAR, calculadoras
   (DAS28, CDAI, BASDAI, SLEDAI), checklist pré-biológico.
2. **Conduta** — insight da IA (fundamentado nos PCDTs/diretrizes, citando a fonte), solicitação de
   exames, receituário e LME oficial (PDF), tudo editável.
3. **Evolução** — histórico de consultas, gráficos de exames laboratoriais, linha do tempo de
   medicação, alertas de monitorização.

O médico **copia/cola** exames e receita no sistema próprio da clínica/hospital. O app **não** faz
receita digital, WhatsApp, agenda nem chat.

**Público:** médicos. **Tom:** clínico, sóbrio, confiável, brasileiro. Tudo em **português**.

---

## 2. Restrições técnicas (não podem quebrar)

- **Stack:** Next.js 14 (App Router) + React + TypeScript. Estilo em **CSS puro** em
  `app/globals.css` (sem Tailwind, sem styled-components, sem biblioteca de UI). Gráficos são **SVG
  próprios** (`components/LineChart.tsx`), sem lib de charts.
- **Redesign = CSS + pequenos ajustes de JSX/classe.** Não trocar de framework, não adicionar
  dependências pesadas. Pode introduzir variáveis CSS, utilitários de classe e refinar marcações.
- **Imprimível:** as áreas com classe `.doc` (exames, receita, LME) são impressas em papel. Existem
  regras `@media print` e classes `no-print` / `print-only`. **Preservar a impressão limpa** (fundo
  branco, sem sombras, sem cores fortes ao imprimir).
- **Responsivo:** layout de 2 colunas (`.layout` = `360px 1fr`) que vira 1 coluna abaixo de 920px.
  Precisa funcionar bem em notebook e em tablet.
- **Acessibilidade:** médico usa muito tempo, muitas vezes com pouca luz. Contraste alto, alvos de
  toque ≥ 40px, foco visível.

---

## 3. Identidade visual atual (ponto de partida — pode evoluir, não destruir)

Paleta em `:root` de `app/globals.css`:

| Papel            | Token          | Cor       |
|------------------|----------------|-----------|
| Fundo do app     | `--app`        | `#F5F3EE` (bege claro) |
| Papel/cartão     | `--paper`      | `#ffffff` |
| Texto            | `--ink`        | `#1b1b1b` |
| Texto suave      | `--muted`      | `#6a6a6a` |
| Linha/borda      | `--line`       | `#E4DFD4` |
| **Destaque**     | `--gold`       | `#8A6D3B` (dourado/ocre) |
| Destaque suave   | `--gold-soft`  | `#F3EEE3` |
| Alerta/erro      | `--red`        | `#9B2D22` |
| Aviso            | `--amber` / `--amber-bg` | `#8a5a1b` / `#FBF1E0` |

- **Tipografia:** stack de sistema (`-apple-system, Segoe UI, Roboto…`). Base 15px, títulos 17px.
- **Formas:** cantos arredondados 6–8px, chips com `border-radius:20px`, botões dourados sólidos +
  botões “ghost” (branco com borda).
- **Personalidade:** clínica sóbria, papel + dourado, sensação de documento oficial. **Manter essa
  alma** — a intenção é *refinar e deixar mais bonito e profissional*, não virar um SaaS colorido.

---

## 4. Telas / componentes a cuidar

| Tela / componente | Arquivo | Observação de design |
|---|---|---|
| Login | `app/login` | Primeira impressão. Hoje é básico. Merece um cartão centralizado elegante. |
| Lista de pacientes | `app/page.tsx`, `components/PatientSearch.tsx` | Busca + lista. Densidade e legibilidade. |
| Novo paciente | `app/paciente/novo` | Formulário simples. |
| Perfil do médico | `app/perfil` | Cabeçalho do médico (sai nos documentos). |
| **Atendimento (principal)** | `app/paciente/[id]/Atendimento.tsx` | Coração do app: coluna de controles à esquerda + 3 abas (Anamnese / Conduta / Evolução). |
| Documentos imprimíveis | dentro de Atendimento (`.doc`) | Exames, Receita, LME. Precisam ficar bonitos **na tela e no papel**. |
| Insight da IA | `IAInsights` + `InsightRender` | Bloco de texto com títulos e listas. Hoje simples; pode virar um “cartão de laudo” bem tratado. |
| Gráficos | `components/LineChart.tsx` | SVG. Podem ganhar grade, rótulos e cor mais refinados. |
| Painel do gestor | `app/gestor/page.tsx` | Tiles + barra de distribuição de notas + QA. |
| Barra de tarja/aviso | `.safety`, `.stage-banner`, `.an-flag` | Avisos de segurança clínica — devem chamar atenção sem parecer erro de sistema. |

### Classes-chave já existentes (reaproveitar/refinar, não renomear sem motivo)
`.topbar` · `.layout` · `.controls` · `.block` · `.eyebrow` · `.field` · `.chip/.chip.on` ·
`.stage-opt` · `.btn-primary/.btn-ghost` · `.card` · `.maintabs/.maintab` · `.doc/.doc-title/.doc-meta` ·
`.insight` · `.evo-item` · `.safety` · `.flashmsg`.

---

## 5. Objetivos do redesign (em ordem de prioridade)

1. **Hierarquia visual mais clara** no Atendimento: a coluna de controles é densa. Melhorar
   agrupamento, espaçamento e “respiro”, deixando óbvio o fluxo 1→2→3.
2. **Cartões e documentos mais elegantes** — sombra sutil, cabeçalho do documento com mais presença,
   assinatura bem tratada. Sensação de “papel timbrado premium”.
3. **Insight da IA como peça de destaque** — hoje é um bloco de texto. Transformar em um cartão bem
   diagramado (título, seções, fontes citadas, selo “apoio — não substitui o médico”).
4. **Estados vazios e de carregamento** com capricho (ilustração leve/ícone + microcopy).
5. **Micro-interações discretas** — hover, foco, transições curtas. Nada de animação chamativa.
6. **Login e lista de pacientes** com primeira impressão profissional.
7. **Consistência**: escala tipográfica, espaçamentos (grid de 4px), raios e sombras padronizados em
   variáveis CSS.

### O que **NÃO** mudar
- A alma bege+dourado (pode refinar tons, não trocar por azul/roxo de SaaS).
- A impressão dos documentos (continua branca e limpa).
- A estrutura de 3 abas e a coluna de controles.
- Nenhuma lógica clínica, texto de responsabilidade médica ou fonte citada.

---

## 6. Requisitos de conteúdo sensível

- Manter **sempre visível** o aviso “**Apoio ao médico — não substitui o médico**” e os textos de
  responsabilidade (`lib/disclaimer.ts`). Podem ser reestilizados, **não removidos nem enfraquecidos**.
- A **tarja LME** e os **alertas de segurança/monitorização** precisam continuar destacados.
- Nada de deixar o app com cara de “diagnóstico automático”: a IA é **apoio**.

---

## 7. Entregáveis esperados do Claude de design

1. **Proposta visual** descrita + (se possível) um **mock em HTML/CSS estático** de 2–3 telas-chave
   (Atendimento, um documento imprimível, o cartão de Insight da IA) para o médico aprovar.
2. **Novo `app/globals.css`** (ou um diff bem organizado) implementando o redesign, mantendo os nomes
   de classe atuais sempre que possível.
3. **Ajustes mínimos de JSX** apenas onde a marcação precisar (ex.: envolver um bloco, adicionar uma
   classe). Listar cada arquivo tocado.
4. **Checklist de verificação**: impressão dos 3 documentos OK, responsivo < 920px OK, contraste OK,
   `npm run build` passando.

---

## 8. PROMPT PRONTO PARA COLAR

> Copie tudo abaixo desta linha para uma conversa nova com o Claude e anexe prints das telas.

---

Você é um designer de produto e front-end sênior. Vou te dar um app clínico real e quero que você o
deixe **mais bonito e profissional**, sem quebrar nada.

**Contexto:** app de apoio ao médico reumatologista (Dr. Willian), em **Next.js 14 (App Router) +
React + TypeScript**, com **CSS puro** em `app/globals.css` (sem Tailwind, sem lib de UI, sem lib de
gráficos — os gráficos são SVG próprios). É uma ferramenta de **apoio ao médico, que não o substitui**.
Tem 3 partes num atendimento: **Anamnese**, **Conduta** (insight de IA + exames + receita + LME em
PDF) e **Evolução** (histórico + gráficos + linha do tempo de medicação). O médico copia/cola exames
e receita no sistema da clínica. Tudo em **português**.

**Identidade atual (refinar, não destruir):** paleta bege/papel + dourado ocre (`--app #F5F3EE`,
`--gold #8A6D3B`, `--red #9B2D22`), tipografia de sistema, cantos 6–8px, cara de “documento oficial
sóbrio”. Quero manter essa alma e elevar o acabamento.

**Restrições rígidas:**
- Redesign = **CSS + ajustes pontuais de classe/JSX**. Sem trocar de framework, sem adicionar
  dependências pesadas, sem Tailwind.
- Preservar a **impressão limpa** das áreas `.doc` (fundo branco, sem sombra/cor ao imprimir; há
  `@media print` e classes `no-print`/`print-only`).
- Preservar o layout de 2 colunas que vira 1 abaixo de 920px, e a estrutura de 3 abas.
- **Não** remover nem enfraquecer os avisos “Apoio ao médico — não substitui o médico”, a tarja
  **LME** e os alertas de segurança. Não mexer em lógica clínica nem em fontes citadas.
- Reaproveitar os nomes de classe existentes sempre que possível (`.topbar`, `.controls`, `.card`,
  `.chip`, `.stage-opt`, `.btn-primary/.btn-ghost`, `.maintabs`, `.doc`, `.insight`, `.evo-item`,
  `.safety`, `.flashmsg`).

**Objetivos, em ordem:** (1) hierarquia e respiro melhores na coluna de controles e no fluxo 1→2→3;
(2) cartões e documentos mais elegantes (sombra sutil, papel timbrado premium); (3) transformar o
**Insight da IA** num cartão bem diagramado com selo de “apoio”; (4) estados vazios/carregamento com
capricho; (5) micro-interações discretas; (6) login e lista de pacientes com primeira impressão
profissional; (7) padronizar escala tipográfica, espaçamentos (grid 4px), raios e sombras em
variáveis CSS.

**Quero que você entregue:**
1. Uma proposta visual curta em texto + **um mock estático em HTML/CSS** de 2–3 telas-chave
   (Atendimento, um documento imprimível e o cartão de Insight da IA) para eu aprovar antes.
2. Depois de eu aprovar, um **`app/globals.css` novo** (ou diff organizado) implementando tudo,
   mantendo os nomes de classe.
3. A lista dos arquivos de JSX que precisaram de ajuste mínimo e qual foi.
4. Um checklist final: impressão dos 3 documentos OK, responsivo < 920px OK, contraste AA OK,
   `npm run build` passando.

Comece me fazendo no máximo 3 perguntas de esclarecimento e propondo a direção visual. Não escreva
código ainda.
