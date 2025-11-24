# Supabase

--- 
## Enable Row Level Security
```sql
alter table <schema_name>.<table_name>
enable row level security;
```

If row-level security is enabled for a table, but no applicable policies exist, a “default deny” policy is assumed, so that no rows will be visible or updatable.

## Policies

```sql 
create policy "Individuals can view their own todos."
on todos for select
using ( (select auth.uid()) = user_id );
```

equals

```sql 
select *
from todos
where auth.uid() = todos.user_id;
```

## SELECT policies
You can specify select policies with the using clause.

```sql 
create policy "Public profiles are visible to everyone."
on profiles for select
to anon         -- the Postgres Role (recommended)
using ( true ); -- the actual Policy
```

```sql 
create policy "User can see their own profile only."
on profiles
for select using ( (select auth.uid()) = user_id );
```

## INSERT policies
You can specify insert policies with the `with check` clause. The `with check` expression ensures that any new row data adheres to the policy constraints.

```sql
create policy "Users can create a profile."
on profiles for insert
to authenticated                          -- the Postgres Role (recommended)
with check ( (select auth.uid()) = user_id );      -- the actual Policy
```

## UPDATE policies

You can specify update policies by combining both the `using` and `with check` expressions.

The `using` clause represents the condition that must be true for the update to be allowed, and `with check` clause ensures that the updates made adhere to the policy constraints.

```sql 
create policy "Users can update their own profile."
on profiles for update
to authenticated                    -- the Postgres Role (recommended)
using ( (select auth.uid()) = user_id )       -- checks if the existing row complies with the policy expression
with check ( (select auth.uid()) = user_id ); -- checks if the new row complies with the policy expression
```

If no with check expression is defined, then the using expression will be used both to determine which rows are visible (normal USING case) and which new rows will be allowed to be added (WITH CHECK case).

!!! To perform an UPDATE operation, a corresponding SELECT policy is required. Without a SELECT policy, the UPDATE operation will not work as expected.

## DELETE policies
You can specify delete policies with the using clause.

```sql 
create policy "Users can delete a profile."
on profiles for delete
to authenticated                     -- the Postgres Role (recommended)
using ( (select auth.uid()) = user_id );      -- the actual Policy
```