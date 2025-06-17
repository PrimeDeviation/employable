-- Create messages table for communication between hiring orgs and AI agent team pilots
create table if not exists public.messages (
  id serial primary key,
  sender_id uuid references auth.users not null,
  recipient_id uuid references auth.users not null,
  resource_id integer references public.resources,
  subject text not null,
  content text not null,
  thread_id integer, -- For grouping messages in conversations
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for better query performance
create index if not exists idx_messages_recipient on public.messages(recipient_id);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_thread on public.messages(thread_id);
create index if not exists idx_messages_resource on public.messages(resource_id);

-- Enable RLS on messages table
alter table public.messages enable row level security;

-- Allow users to read messages where they are sender or recipient
drop policy if exists "Users can read their own messages" on public.messages;
create policy "Users can read their own messages" 
on public.messages for select
using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- Allow users to send messages
drop policy if exists "Users can send messages" on public.messages;
create policy "Users can send messages"
on public.messages for insert
with check (auth.uid() = sender_id);

-- Allow users to mark their received messages as read
drop policy if exists "Users can mark received messages as read" on public.messages;
create policy "Users can mark received messages as read"
on public.messages for update
using (auth.uid() = recipient_id)
with check (auth.uid() = recipient_id);

-- Create a function to automatically set thread_id for new messages
create or replace function public.handle_new_message()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  -- If this is the first message in a conversation, set thread_id to the message id
  if new.thread_id is null then
    new.thread_id = new.id;
  end if;
  
  return new;
end;
$$;

-- Create trigger to automatically handle thread_id
drop trigger if exists on_message_created on public.messages;
create trigger on_message_created
  before insert on public.messages
  for each row execute procedure public.handle_new_message(); 