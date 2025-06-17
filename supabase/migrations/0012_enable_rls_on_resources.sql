-- Enable RLS on the resources table
alter table public.resources enable row level security;

-- Allow public read access to all resources
drop policy if exists "Public resources are viewable by everyone" on public.resources;
create policy "Public resources are viewable by everyone"
on public.resources for select
using (true);

-- Allow users to manage their own resources
drop policy if exists "Users can insert their own resource" on public.resources;
create policy "Users can insert their own resource"
on public.resources for insert
with check (auth.uid() = profile_id);

drop policy if exists "Users can update their own resource" on public.resources;
create policy "Users can update their own resource"
on public.resources for update
using (auth.uid() = profile_id);

drop policy if exists "Users can delete their own resource" on public.resources;
create policy "Users can delete their own resource"
on public.resources for delete
using (auth.uid() = profile_id); 