-- ============================================================
-- App Reumatologia — Fase 1
-- Rode este SQL no SQL Editor do Supabase (uma vez).
-- ============================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id),
  nome text, crm text, especialidade text default 'Reumatologia',
  clinica text, endereco text, cidade text, cnes text, cns_medico text,
  created_at timestamptz default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null default auth.uid() references auth.users(id),
  nome text not null, idade text, nascimento date,
  whats text, cpf text, email text,
  endereco text, cidade text, estado text, cep text,
  created_at timestamptz default now()
);

-- Endereço detalhado (idempotente, para bancos já criados).
alter table patients add column if not exists cidade text;
alter table patients add column if not exists estado text;
alter table patients add column if not exists cep text;

create table if not exists consultas (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null default auth.uid() references auth.users(id),
  data timestamptz default now(),
  doenca_id text, doenca_nome text, etapa text, consulta_tipo text,
  hda text, antecedentes text, exam_results text, insight text,
  exames_texto text, receita_texto text, lme_json jsonb,
  ia_insight text,
  created_at timestamptz default now()
);

-- Fase 2: coluna do insight gerado pela IA (idempotente, para bancos já criados).
alter table consultas add column if not exists ia_insight text;

-- ============================================================
-- Fase 3
-- ============================================================

-- Valores de exame/escore numéricos com data (base dos gráficos de evolução).
create table if not exists exam_values (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null default auth.uid() references auth.users(id),
  marcador text not null,        -- ex.: VHS, PCR, Ácido úrico, Creatinina, TFG, DAS28, BASDAI...
  valor numeric not null,
  unidade text,
  data date not null,
  tipo text not null default 'lab',   -- 'lab' | 'escore'
  created_at timestamptz default now()
);
alter table exam_values enable row level security;
drop policy if exists "exam_values proprios" on exam_values;
create policy "exam_values proprios" on exam_values for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- Avaliação das sugestões da IA pelo médico (feedback loop).
create table if not exists ai_feedback (
  id uuid primary key default gen_random_uuid(),
  consulta_id uuid references consultas(id) on delete set null,
  patient_id uuid references patients(id) on delete set null,
  doctor_id uuid not null default auth.uid() references auth.users(id),
  doenca_id text,
  ai_model text,
  ai_response text,
  rating int not null check (rating between 1 and 5),
  disagreement text,             -- obrigatório quando rating <= 3
  created_at timestamptz default now()
);
alter table ai_feedback enable row level security;
drop policy if exists "ai_feedback proprio" on ai_feedback;
create policy "ai_feedback proprio" on ai_feedback for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- Consentimento de marketing (LGPD) — usado no módulo de marketing (futuro).
alter table patients add column if not exists consent_marketing boolean default false;
alter table patients add column if not exists consent_marketing_at timestamptz;

-- Row Level Security: cada médico só enxerga os próprios dados.
alter table profiles enable row level security;
alter table patients enable row level security;
alter table consultas enable row level security;

-- (idempotente) recria as policies
drop policy if exists "perfil proprio" on profiles;
drop policy if exists "pacientes proprios" on patients;
drop policy if exists "consultas proprias" on consultas;

create policy "perfil proprio" on profiles for all
  using (id = auth.uid()) with check (id = auth.uid());
create policy "pacientes proprios" on patients for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());
create policy "consultas proprias" on consultas for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());
