-- DUITku: one monthly budget per user, protected by Row Level Security.
-- Depends on public.set_updated_at() from the transactions migration.

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month integer not null check (month between 1 and 12),
  year integer not null check (year >= 2020),
  amount numeric(14, 2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_user_month_year_unique unique (user_id, month, year)
);

create index if not exists budgets_user_id_idx on public.budgets (user_id);
create index if not exists budgets_user_year_month_idx on public.budgets (user_id, year, month);

drop trigger if exists budgets_set_updated_at on public.budgets;
create trigger budgets_set_updated_at
  before update on public.budgets
  for each row
  execute function public.set_updated_at();

alter table public.budgets enable row level security;

drop policy if exists "budgets_select_own" on public.budgets;
create policy "budgets_select_own"
  on public.budgets for select
  using (auth.uid() = user_id);

drop policy if exists "budgets_insert_own" on public.budgets;
create policy "budgets_insert_own"
  on public.budgets for insert
  with check (auth.uid() = user_id);

drop policy if exists "budgets_update_own" on public.budgets;
create policy "budgets_update_own"
  on public.budgets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "budgets_delete_own" on public.budgets;
create policy "budgets_delete_own"
  on public.budgets for delete
  using (auth.uid() = user_id);
