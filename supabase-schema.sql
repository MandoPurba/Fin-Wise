-- FinWise Database Schema for Supabase

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Users profiles (additional data beyond auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  currency text default 'IDR',
  created_at timestamp default timezone('utc'::text, now()) not null,
  updated_at timestamp default timezone('utc'::text, now()) not null
);

-- Categories for income and expenses
create table categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  icon text,
  color text,
  type text check (type in ('income', 'expense')) not null,
  created_at timestamp default timezone('utc'::text, now()) not null
);

-- Financial accounts (Bank accounts, Credit cards, Cash)
create table accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text,
  balance decimal(15,2) default 0,
  currency text default 'IDR',
  created_at timestamp default timezone('utc'::text, now()) not null
);

-- Financial transactions
create table transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references accounts on delete cascade,
  category_id uuid references categories on delete set null,
  from_account_id uuid references accounts on delete cascade,
  to_account_id uuid references accounts on delete cascade,
  type text check (type in ('income', 'expense', 'transfer')) not null,
  amount decimal(15,2) not null,
  description text,
  date date not null,
  receipt_url text,
  tags text[],
  created_at timestamp default timezone('utc'::text, now()) not null,
  updated_at timestamp default timezone('utc'::text, now()) not null
);

-- Budget management
create table budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references categories on delete cascade not null,
  amount decimal(15,2) not null,
  period text check (period in ('weekly', 'monthly', 'yearly')) not null,
  start_date date not null,
  end_date date not null,
  created_at timestamp default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table profiles enable row level security;
alter table categories enable row level security;
alter table accounts enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Categories policies
create policy "Users can view own categories" on categories for select using (auth.uid() = user_id);
create policy "Users can create own categories" on categories for insert with check (auth.uid() = user_id);
create policy "Users can update own categories" on categories for update using (auth.uid() = user_id);
create policy "Users can delete own categories" on categories for delete using (auth.uid() = user_id);

-- Accounts policies
create policy "Users can view own accounts" on accounts for select using (auth.uid() = user_id);
create policy "Users can create own accounts" on accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own accounts" on accounts for update using (auth.uid() = user_id);
create policy "Users can delete own accounts" on accounts for delete using (auth.uid() = user_id);

-- Transactions policies
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can create own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- Budgets policies
create policy "Users can view own budgets" on budgets for select using (auth.uid() = user_id);
create policy "Users can create own budgets" on budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on budgets for delete using (auth.uid() = user_id);

-- Trigger for updating updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles
  for each row execute procedure update_updated_at_column();

create trigger update_transactions_updated_at before update on transactions
  for each row execute procedure update_updated_at_column();

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, currency)
  values (new.id, new.email, 'IDR');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert default categories for new users
create or replace function create_default_categories(user_uuid uuid)
returns void as $$
begin
  insert into categories (user_id, name, icon, color, type) values
  -- Income categories
  (user_uuid, 'Gaji', '💰', '#10B981', 'income'),
  (user_uuid, 'Freelance', '💻', '#3B82F6', 'income'),
  (user_uuid, 'Investasi', '📈', '#8B5CF6', 'income'),
  (user_uuid, 'Lainnya', '💵', '#6B7280', 'income'),
  
  -- Expense categories
  (user_uuid, 'Makanan & Minuman', '🍽️', '#EF4444', 'expense'),
  (user_uuid, 'Transportasi', '🚗', '#F59E0B', 'expense'),
  (user_uuid, 'Belanja', '🛒', '#EC4899', 'expense'),
  (user_uuid, 'Hiburan', '🎬', '#8B5CF6', 'expense'),
  (user_uuid, 'Kesehatan', '🏥', '#10B981', 'expense'),
  (user_uuid, 'Pendidikan', '📚', '#3B82F6', 'expense'),
  (user_uuid, 'Utilities', '⚡', '#F59E0B', 'expense'),
  (user_uuid, 'Asuransi', '🛡️', '#6B7280', 'expense'),
  (user_uuid, 'Lainnya', '📋', '#6B7280', 'expense');
end;
$$ language plpgsql;

-- Insert default accounts for new users
create or replace function create_default_accounts(user_uuid uuid)
returns void as $$
begin
  insert into accounts (user_id, name, type, balance, currency) values
  (user_uuid, 'Kas', 'cash', 0, 'IDR'),
  (user_uuid, 'Bank BCA', 'bank', 0, 'IDR'),
  (user_uuid, 'Kartu Kredit', 'credit_card', 0, 'IDR');
end;
$$ language plpgsql;

-- Trigger to create default data on user creation
create or replace function public.handle_new_user_complete()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, currency)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email), 'IDR');
  
  perform create_default_categories(new.id);
  perform create_default_accounts(new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Replace the previous trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_complete();
