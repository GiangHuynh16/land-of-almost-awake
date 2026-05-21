-- Run this in Supabase SQL Editor

-- Drop old tables if they exist
drop table if exists achievements cascade;
drop table if exists kingdoms cascade;
drop table if exists users cascade;
drop table if exists workspaces cascade;

-- Workspaces
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  invite_used boolean not null default false,
  achievement_threshold integer not null default 10 check (achievement_threshold between 1 and 50),
  created_at timestamptz not null default now()
);

-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  display_name text not null,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Kingdoms (seed data inserted separately)
create table kingdoms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  meaning text not null,
  "order" integer not null unique check ("order" between 1 and 6),
  accent_color text not null,
  lore_quote text not null,
  unlocked_at timestamptz
);

-- Achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  kingdom_id uuid not null references kingdoms(id),
  title text not null,
  note text,
  created_by uuid not null references users(id),
  completed_by uuid references users(id),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Index for progression queries
create index achievements_progression_idx
  on achievements(workspace_id, kingdom_id, completed_at);

-- Enable Realtime on achievements
alter publication supabase_realtime add table achievements;

-- RPC for atomic achievement completion (run this separately after tables are created)
create or replace function complete_achievement(
  p_id uuid,
  p_user_id uuid,
  p_workspace_id uuid
)
returns setof achievements
language sql
as $$
  update achievements
  set completed_by = p_user_id, completed_at = now()
  where id = p_id
    and workspace_id = p_workspace_id
    and completed_by is null
  returning *;
$$;
