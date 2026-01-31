-- Create table for vehicles
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  plate_number text not null unique,
  color text not null,
  make_model text not null,
  owner_name text
);

-- Enable Row Level Security (RLS)
alter table public.vehicles enable row level security;

-- Create policies (Allow full access for now, can be restricted to authenticated users)
create policy "Enable all access for all users" on public.vehicles
  for all using (true) with check (true);

-- Create Realtime publication
alter publication supabase_realtime add table public.vehicles;
