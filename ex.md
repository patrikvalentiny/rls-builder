```sql 
SELECT n.nspname AS schemaname,
    c.relname AS tablename,
    pol.polname AS policyname,
    CASE
        WHEN pol.polpermissive THEN 'PERMISSIVE'
        ELSE 'RESTRICTIVE'
    END AS permissive,
    COALESCE(
        (SELECT string_agg(rolname, ', ' ORDER BY rolname)
         FROM unnest(CASE WHEN pol.polroles = '{0}' THEN ARRAY[0::oid] ELSE pol.polroles END) AS r(oid)
         JOIN pg_authid a ON a.oid = r.oid
         WHERE r.oid != 0 OR pol.polroles = '{0}'),
        'public'
    ) AS roles,
    CASE pol.polcmd
        WHEN 'r' THEN 'SELECT'
        WHEN 'a' THEN 'INSERT'
        WHEN 'w' THEN 'UPDATE'
        WHEN 'd' THEN 'DELETE'
        WHEN '*' THEN 'ALL'
        ELSE NULL
    END AS cmd,
    pg_get_expr(pol.polqual, pol.polrelid) AS qual,
    pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check,
    'CREATE POLICY "' || pol.polname || '" ON ' || n.nspname || '.' || c.relname || ' AS ' ||
        CASE WHEN pol.polpermissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END || ' FOR ' ||
        CASE pol.polcmd
            WHEN 'r' THEN 'SELECT'
            WHEN 'a' THEN 'INSERT'
            WHEN 'w' THEN 'UPDATE'
            WHEN 'd' THEN 'DELETE'
            WHEN '*' THEN 'ALL'
            ELSE 'ALL'
        END || ' TO ' || COALESCE(
            (SELECT string_agg(rolname, ', ' ORDER BY rolname)
             FROM unnest(CASE WHEN pol.polroles = '{0}' THEN ARRAY[0::oid] ELSE pol.polroles END) AS r(oid)
             JOIN pg_authid a ON a.oid = r.oid
             WHERE r.oid != 0 OR pol.polroles = '{0}'),
            'public'
        ) ||
        CASE WHEN pg_get_expr(pol.polqual, pol.polrelid) IS NOT NULL THEN ' USING (' || pg_get_expr(pol.polqual, pol.polrelid) || ')' ELSE '' END ||
        CASE WHEN pg_get_expr(pol.polwithcheck, pol.polrelid) IS NOT NULL THEN ' WITH CHECK (' || pg_get_expr(pol.polwithcheck, pol.polrelid) || ')' ELSE '' END AS full_policy
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace;
```

| schemaname | tablename      | policyname                                       | permissive | roles           | cmd    | qual                                    | with_check | full_policy                                                                                                                                                                                         |
| ---------- | -------------- | ------------------------------------------------ | ---------- | --------------- | ------ | --------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| public     | user_details   | Authenticated users can delete their own records | PERMISSIVE | {authenticated} | DELETE | (( SELECT auth.uid() AS uid) = user_id) | null       | CREATE POLICY "Authenticated users can delete their own records" ON public.user_details AS PERMISSIVE FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id))                   |
| public     | weights        | Authenticated users can delete their own records | PERMISSIVE | {authenticated} | DELETE | (( SELECT auth.uid() AS uid) = user_id) | null       | CREATE POLICY "Authenticated users can delete their own records" ON public.weights AS PERMISSIVE FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id))                        |
| public     | user_details   | Authenticated users can insert records           | PERMISSIVE | {authenticated} | INSERT | null                                    | true       | CREATE POLICY "Authenticated users can insert records" ON public.user_details AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true)                                                           |
| public     | weights        | Authenticated users can insert records           | PERMISSIVE | {authenticated} | INSERT | null                                    | true       | CREATE POLICY "Authenticated users can insert records" ON public.weights AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true)                                                                |
| public     | user_details   | Authenticated users can select their own records | PERMISSIVE | {authenticated} | SELECT | (( SELECT auth.uid() AS uid) = user_id) | null       | CREATE POLICY "Authenticated users can select their own records" ON public.user_details AS PERMISSIVE FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id))                   |
| public     | weights        | Authenticated users can select their own records | PERMISSIVE | {authenticated} | SELECT | (( SELECT auth.uid() AS uid) = user_id) | null       | CREATE POLICY "Authenticated users can select their own records" ON public.weights AS PERMISSIVE FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id))                        |
| public     | user_details   | Authenticated users can update their own records | PERMISSIVE | {authenticated} | UPDATE | (( SELECT auth.uid() AS uid) = user_id) | true       | CREATE POLICY "Authenticated users can update their own records" ON public.user_details AS PERMISSIVE FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK (true) |
| public     | weights        | Authenticated users can update their own records | PERMISSIVE | {authenticated} | UPDATE | (( SELECT auth.uid() AS uid) = user_id) | true       | CREATE POLICY "Authenticated users can update their own records" ON public.weights AS PERMISSIVE FOR UPDATE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id)) WITH CHECK (true)      |
| public     | bmi_categories | Enable read access for all users                 | PERMISSIVE | {public}        | SELECT | true                                    | null       | CREATE POLICY "Enable read access for all users" ON public.bmi_categories AS PERMISSIVE FOR SELECT TO public USING (true)                                                                           |