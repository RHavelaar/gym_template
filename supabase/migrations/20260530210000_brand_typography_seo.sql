-- Brand typography and SEO settings on gym_branding

alter table gym_branding
  add column if not exists typography jsonb not null default '{}'::jsonb,
  add column if not exists seo jsonb not null default '{}'::jsonb;
