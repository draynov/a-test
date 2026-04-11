-- Paste this into Supabase SQL Editor.

do $$
begin
  create type "EducationLevel" as enum (
    'SCHOOL',
    'PROFESSIONAL_BACHELOR',
    'BACHELOR',
    'MASTER',
    'DOCTOR',
    'DOCTOR_OF_SCIENCES'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists "AttestationCard" (
  id text primary key,
  "firstInitial" "EducationLevel" not null,
  "otherAfterInitial" "EducationLevel",
  "createdAt" timestamp(3) not null default current_timestamp,
  "updatedAt" timestamp(3) not null default current_timestamp
);

create or replace function set_attestation_card_updated_at()
returns trigger as $$
begin
  new."updatedAt" = current_timestamp;
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_attestation_card_updated_at on "AttestationCard";

create trigger set_attestation_card_updated_at
before update on "AttestationCard"
for each row
execute function set_attestation_card_updated_at();
