# Database

No application tables are created in Phase 1.

Next phase should define:
- `couples`
- `couple_members`
- `memories`
- `memory_reactions`
- `memory_comments`
- `special_dates`

Every exposed table must have RLS enabled. Policies must scope rows to the authenticated user's couple membership. Do not authorize using editable `user_metadata` claims.

Storage should use a private bucket and policies that verify couple membership for each object path.