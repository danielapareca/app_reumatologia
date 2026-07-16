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

-- Observação livre do médico por consulta (idempotente). O app salva mesmo sem esta coluna;
-- rode este ALTER para as observações ficarem guardadas no histórico.
alter table consultas add column if not exists observacoes text;

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

-- Consentimento do paciente para tratamento de dados de saúde (LGPD).
alter table patients add column if not exists consent_data boolean default false;
alter table patients add column if not exists consent_data_at timestamptz;

-- Uso da IA (para limite diário / controle de custo por médico).
create table if not exists ai_usage (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null default auth.uid() references auth.users(id),
  kind text not null,            -- 'insight' | 'ai-doc' | 'extract'
  model text,
  created_at timestamptz default now()
);
create index if not exists ai_usage_doctor_dia on ai_usage (doctor_id, created_at);
alter table ai_usage enable row level security;
drop policy if exists "ai_usage proprio" on ai_usage;
create policy "ai_usage proprio" on ai_usage for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- Rastreio pré-biológico (TB, HBV, HCV, HIV, vacinas) por paciente.
alter table patients add column if not exists screening jsonb;

-- Linha do tempo de medicação (início, troca, aumento, redução, suspensão).
create table if not exists medication_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  doctor_id uuid not null default auth.uid() references auth.users(id),
  medicamento text not null,
  evento text not null,        -- inicio | troca | aumento | reducao | suspensao
  dose text,
  motivo text,
  data date not null,
  created_at timestamptz default now()
);
alter table medication_events enable row level security;
drop policy if exists "med_events proprios" on medication_events;
create policy "med_events proprios" on medication_events for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- ---- Painel do gestor / QA da IA (apenas admin) ----
create table if not exists app_admins (user_id uuid primary key references auth.users(id));

-- Agregados globais (sem identidade de paciente). Só para admin.
create or replace function admin_stats() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r jsonb;
begin
  if not exists (select 1 from app_admins where user_id = auth.uid()) then
    raise exception 'not_admin';
  end if;
  select jsonb_build_object(
    'medicos', (select count(*) from profiles),
    'pacientes', (select count(*) from patients),
    'consultas', (select count(*) from consultas),
    'exames', (select count(*) from exam_values),
    'ia_total', (select count(*) from ai_feedback),
    'ia_media', (select round(coalesce(avg(rating),0)::numeric, 2) from ai_feedback),
    'ia_baixas', (select count(*) from ai_feedback where rating <= 3),
    'ia_dist', (select coalesce(jsonb_object_agg(rating, c), '{}'::jsonb)
                from (select rating, count(*) c from ai_feedback group by rating) t)
  ) into r;
  return r;
end $$;

-- Avaliações da IA de-identificadas (paciente vira um código). Só para admin.
create or replace function admin_ai_feedback(lim int default 100) returns table(
  id uuid, created_at timestamptz, doenca_id text, ai_model text, rating int,
  disagreement text, ai_response text, patient_ref text
) language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from app_admins where user_id = auth.uid()) then
    raise exception 'not_admin';
  end if;
  return query
    select f.id, f.created_at, f.doenca_id, f.ai_model, f.rating, f.disagreement, f.ai_response,
           substr(md5(coalesce(f.patient_id::text, f.id::text)), 1, 6) as patient_ref
    from ai_feedback f order by f.rating asc, f.created_at desc limit lim;
end $$;

-- Pacientes por doença e fase (a fase atual = etapa da última consulta). Só para admin.
create or replace function admin_fase_stats() returns table(doenca text, etapa text, n bigint)
language plpgsql stable security definer set search_path = public as $$
begin
  if not exists (select 1 from app_admins where user_id = auth.uid()) then
    raise exception 'not_admin';
  end if;
  return query
    with ult as (
      select distinct on (patient_id) patient_id, doenca_nome, etapa
      from consultas
      order by patient_id, data desc
    )
    select coalesce(doenca_nome, '—') as doenca, coalesce(etapa, '—') as etapa, count(*) as n
    from ult
    group by 1, 2
    order by 3 desc, 1 asc;
end $$;

grant execute on function admin_stats() to authenticated;
grant execute on function admin_ai_feedback(int) to authenticated;
grant execute on function admin_fase_stats() to authenticated;

-- Para virar admin: descubra seu user id em Authentication → Users e rode:
--   insert into app_admins (user_id) values ('SEU-UUID-AQUI');

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

-- ============================================================
-- Proteção (RLS) das tabelas da Fase 3 + lista de admins.
-- IMPORTANTE: rode este bloco. Sem ele, um médico poderia ver dados de outro
-- ou se tornar admin. As funções admin_* são SECURITY DEFINER e continuam
-- funcionando (elas ignoram o RLS de propósito).
-- ============================================================
alter table exam_values       enable row level security;
alter table medication_events enable row level security;
alter table ai_feedback       enable row level security;
alter table app_admins        enable row level security;  -- sem policy: ninguém lê/grava via API

drop policy if exists "exames proprios"   on exam_values;
drop policy if exists "meds proprios"     on medication_events;
drop policy if exists "feedback proprio"  on ai_feedback;

create policy "exames proprios" on exam_values for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());
create policy "meds proprios" on medication_events for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());
create policy "feedback proprio" on ai_feedback for all
  using (doctor_id = auth.uid()) with check (doctor_id = auth.uid());

-- Detecta se o usuário logado é admin (para mostrar o link do painel).
-- Não expõe a tabela app_admins.
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from app_admins where user_id = auth.uid());
$$;
grant execute on function is_admin() to authenticated;
