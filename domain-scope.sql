create table public.domain_scopes (
  id uuid not null default gen_random_uuid (),
  domain_name text not null,
  domain_version text not null,
  domain_input text not null,
  model_used text not null,
  status text not null default 'processing'::text,
  progress integer null default 0,
  total_sections integer null default 11,
  error_message text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  completed_at timestamp with time zone null,
  section_primary_scope text null,
  section_primary_scope_words integer null default 0,
  section_configuration text null,
  section_configuration_words integer null default 0,
  section_special_notes text null,
  section_special_notes_words integer null default 0,
  section_data_architecture text null,
  section_data_architecture_words integer null default 0,
  section_stakeholder_requirements text null,
  section_stakeholder_requirements_words integer null default 0,
  section_domain_boundary text null,
  section_domain_boundary_words integer null default 0,
  section_domain_responsibilities text null,
  section_domain_responsibilities_words integer null default 0,
  section_domain_exclusions text null,
  section_domain_exclusions_words integer null default 0,
  section_interface_boundaries text null,
  section_interface_boundaries_words integer null default 0,
  section_boundary_conditions text null,
  section_boundary_conditions_words integer null default 0,
  section_validation_approach text null,
  section_validation_approach_words integer null default 0,
  use_rag boolean null default false,
  current_step text null,
  identify_model_used text null,
  rag_domain_identified text null,
  rag_keywords text null,
  rag_similarity_query text null,
  rag_context_sources integer null default 0,
  section_primary_scope_rag_enhanced boolean null default false,
  section_configuration_rag_enhanced boolean null default false,
  section_special_notes_rag_enhanced boolean null default false,
  section_data_architecture_rag_enhanced boolean null default false,
  section_stakeholder_requirements_rag_enhanced boolean null default false,
  section_domain_boundary_rag_enhanced boolean null default false,
  section_domain_responsibilities_rag_enhanced boolean null default false,
  section_domain_exclusions_rag_enhanced boolean null default false,
  section_interface_boundaries_rag_enhanced boolean null default false,
  section_boundary_conditions_rag_enhanced boolean null default false,
  section_validation_approach_rag_enhanced boolean null default false,
  constraint domain_scopes_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_domain_scopes_status on public.domain_scopes using btree (status) TABLESPACE pg_default;

create index IF not exists idx_domain_scopes_created_at on public.domain_scopes using btree (created_at desc) TABLESPACE pg_default;

create index IF not exists idx_domain_scopes_domain_name on public.domain_scopes using btree (domain_name) TABLESPACE pg_default;

create index IF not exists idx_domain_scopes_version on public.domain_scopes using btree (domain_name, domain_version) TABLESPACE pg_default;

create index IF not exists idx_domain_scopes_use_rag on public.domain_scopes using btree (use_rag) TABLESPACE pg_default;

create index IF not exists idx_domain_scopes_rag_domain on public.domain_scopes using btree (rag_domain_identified) TABLESPACE pg_default;

create index IF not exists idx_domain_scopes_models on public.domain_scopes using btree (identify_model_used, model_used) TABLESPACE pg_default;

create trigger update_domain_scopes_updated_at BEFORE
update on domain_scopes for EACH row
execute FUNCTION update_updated_at_column ();