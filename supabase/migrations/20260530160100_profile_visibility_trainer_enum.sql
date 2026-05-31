-- Must be separate from migrations that reference the new enum value (Postgres 55P04).

alter type profile_visibility add value if not exists 'trainer';
