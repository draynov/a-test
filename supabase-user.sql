-- Paste this into Supabase SQL Editor.

create table if not exists "User" (
  id text primary key,
  email text not null unique,
  "passwordHash" text not null,
  name text,
  role text not null default 'USER',
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null default current_timestamp
);

create or replace function set_user_updated_at()
returns trigger as $$
begin
  new."updatedAt" = current_timestamp;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_user_updated_at on "User";

create trigger set_user_updated_at
before update on "User"
for each row
execute function set_user_updated_at();
