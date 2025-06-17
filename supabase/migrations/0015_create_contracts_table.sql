-- Create contracts table for managing agreements between hiring orgs and AI agent team pilots
create table if not exists public.contracts (
  id serial primary key,
  client_id uuid references auth.users not null, -- The hiring organization
  pilot_id uuid references auth.users not null,  -- The AI agent team pilot
  resource_id integer references public.resources, -- The specific resource/team being contracted
  title text not null,
  description text not null,
  
  -- Contract terms
  hourly_rate numeric(10, 2) check (hourly_rate >= 0),
  total_budget numeric(10, 2) check (total_budget >= 0),
  estimated_hours integer check (estimated_hours >= 0),
  start_date date,
  end_date date,
  payment_terms text, -- e.g., "Net 30", "Weekly", "Upon completion"
  deliverables text[], -- Array of deliverable descriptions
  
  -- Contract status and workflow
  status text default 'draft' check (status in ('draft', 'sent_for_review', 'under_negotiation', 'approved', 'signed', 'active', 'completed', 'cancelled')),
  created_by uuid references auth.users not null,
  
  -- Revision tracking
  version integer default 1,
  parent_contract_id integer references public.contracts, -- For tracking revisions
  
  -- AI-specific terms
  ai_capabilities_required text[], -- Specific AI capabilities needed
  computational_requirements text, -- Hardware/performance requirements
  data_handling_terms text, -- How data will be processed and stored
  
  -- Timestamps
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  signed_at timestamp with time zone,
  approved_at timestamp with time zone
);

-- Create indexes for better query performance
create index if not exists idx_contracts_client on public.contracts(client_id);
create index if not exists idx_contracts_pilot on public.contracts(pilot_id);
create index if not exists idx_contracts_resource on public.contracts(resource_id);
create index if not exists idx_contracts_status on public.contracts(status);
create index if not exists idx_contracts_parent on public.contracts(parent_contract_id);

-- Create contract_comments table for negotiation discussions
create table if not exists public.contract_comments (
  id serial primary key,
  contract_id integer references public.contracts not null,
  commenter_id uuid references auth.users not null,
  comment text not null,
  comment_type text default 'general' check (comment_type in ('general', 'revision_request', 'approval', 'concern')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_contract_comments_contract on public.contract_comments(contract_id);
create index if not exists idx_contract_comments_commenter on public.contract_comments(commenter_id);

-- Enable RLS on contracts table
alter table public.contracts enable row level security;

-- Allow users to read contracts where they are client or pilot
drop policy if exists "Users can read their own contracts" on public.contracts;
create policy "Users can read their own contracts" 
on public.contracts for select
using (auth.uid() = client_id or auth.uid() = pilot_id);

-- Allow users to create contracts where they are the client
drop policy if exists "Clients can create contracts" on public.contracts;
create policy "Clients can create contracts"
on public.contracts for insert
with check (auth.uid() = client_id and auth.uid() = created_by);

-- Allow users to update their own contracts (with restrictions based on status)
drop policy if exists "Users can update their contracts" on public.contracts;
create policy "Users can update their contracts"
on public.contracts for update
using (auth.uid() = client_id or auth.uid() = pilot_id)
with check (
  -- Only allow updates in certain statuses
  status in ('draft', 'sent_for_review', 'under_negotiation') and
  (auth.uid() = client_id or auth.uid() = pilot_id)
);

-- Enable RLS on contract_comments table
alter table public.contract_comments enable row level security;

-- Allow users to read comments on contracts they're involved in
drop policy if exists "Users can read contract comments" on public.contract_comments;
create policy "Users can read contract comments"
on public.contract_comments for select
using (
  contract_id in (
    select id from public.contracts 
    where auth.uid() = client_id or auth.uid() = pilot_id
  )
);

-- Allow users to add comments to contracts they're involved in
drop policy if exists "Users can add contract comments" on public.contract_comments;
create policy "Users can add contract comments"
on public.contract_comments for insert
with check (
  auth.uid() = commenter_id and
  contract_id in (
    select id from public.contracts 
    where auth.uid() = client_id or auth.uid() = pilot_id
  )
);

-- Create function to update contract updated_at timestamp
create or replace function public.update_contract_updated_at()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create trigger to automatically update updated_at
drop trigger if exists update_contracts_updated_at on public.contracts;
create trigger update_contracts_updated_at
  before update on public.contracts
  for each row execute procedure public.update_contract_updated_at(); 