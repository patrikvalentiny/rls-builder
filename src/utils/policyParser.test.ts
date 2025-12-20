import { describe, it, expect } from 'vitest';
import { parsePolicy } from './policyParser';
import type { CreatePolicy } from '../types/createPolicy';

describe('parsePolicy', () => {
    it('should parse a full CREATE POLICY statement', () => {
        const policyString = 'CREATE POLICY "test_policy" ON "public"."users" AS PERMISSIVE FOR SELECT TO "user_role" USING (user_id = current_user_id) WITH CHECK (user_id = current_user_id);';
        const result: CreatePolicy = parsePolicy(policyString);
        expect(result).toEqual({
            name: 'test_policy',
            schema: 'public',
            table: 'users',
            as: 'PERMISSIVE',
            for: 'SELECT',
            to: 'user_role',
            using: 'user_id = current_user_id',
            withCheck: 'user_id = current_user_id',
        });
    });

    it('should parse a policy without USING and WITH CHECK', () => {
        const policyString = 'CREATE POLICY "simple_policy" ON "schema"."table" AS RESTRICTIVE FOR INSERT TO "role";';
        const result: CreatePolicy = parsePolicy(policyString);
        expect(result).toEqual({
            name: 'simple_policy',
            schema: 'schema',
            table: 'table',
            as: 'RESTRICTIVE',
            for: 'INSERT',
            to: 'role',
            using: '',
            withCheck: '',
        });
    });

    it('should parse a policy with only USING', () => {
        const policyString = 'CREATE POLICY "using_only" ON "public"."posts" AS PERMISSIVE FOR UPDATE TO "editor" USING (author_id = current_user_id);';
        const result: CreatePolicy = parsePolicy(policyString);
        expect(result).toEqual({
            name: 'using_only',
            schema: 'public',
            table: 'posts',
            as: 'PERMISSIVE',
            for: 'UPDATE',
            to: 'editor',
            using: 'author_id = current_user_id',
            withCheck: '',
        });
    });

    it('should parse a policy with only WITH CHECK', () => {
        const policyString = 'CREATE POLICY "check_only" ON "public"."comments" AS RESTRICTIVE FOR DELETE TO "admin" WITH CHECK (moderated = true);';
        const result: CreatePolicy = parsePolicy(policyString);
        expect(result).toEqual({
            name: 'check_only',
            schema: 'public',
            table: 'comments',
            as: 'RESTRICTIVE',
            for: 'DELETE',
            to: 'admin',
            using: '',
            withCheck: 'moderated = true',
        });
    });

    it('should throw an error for invalid policy string', () => {
        const invalidString = 'INVALID POLICY STATEMENT;';
        expect(() => parsePolicy(invalidString)).toThrow(/Expected keyword CREATE/);
    });

    it('should throw an error for missing name', () => {
        const invalidString = 'CREATE POLICY ON "public"."users" AS PERMISSIVE FOR SELECT TO "role";';
        expect(() => parsePolicy(invalidString)).toThrow(/Expected identifier/);
    });

    it('should throw an error when table name is missing', () => {
        const invalidString = 'CREATE POLICY "Authenticated users can delete their own records" ON  AS PERMISSIVE FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = user_id))';
        expect(() => parsePolicy(invalidString)).toThrow(/Expected identifier, found keyword AS/);
    });

    it('should parse unquoted identifiers', () => {
        const policyString = 'CREATE POLICY my_policy ON public.users AS PERMISSIVE FOR SELECT TO authenticated USING (true);';
        const result = parsePolicy(policyString);
        expect(result).toEqual({
            name: 'my_policy',
            schema: 'public',
            table: 'users',
            as: 'PERMISSIVE',
            for: 'SELECT',
            to: 'authenticated',
            using: 'true',
            withCheck: '',
        });
    });

    it('should parse policy without semicolon', () => {
        const policyString = 'CREATE POLICY "no_semi" ON "t" FOR ALL TO public';
        const result = parsePolicy(policyString);
        expect(result.name).toBe('no_semi');
    });

    it('should parse nested parentheses in expressions', () => {
        const policyString = 'CREATE POLICY "nested" ON t FOR ALL TO public USING ((a = 1 AND (b = 2)) OR c = 3)';
        const result = parsePolicy(policyString);
        expect(result.using).toBe('(a = 1 AND (b = 2)) OR c = 3');
    });

    it('should parse string literals containing parentheses', () => {
        const policyString = "CREATE POLICY \"strings\" ON t FOR ALL TO public USING (name = 'some ( name )')";
        const result = parsePolicy(policyString);
        expect(result.using).toBe("name = 'some ( name )'");
    });

    it('should parse table without schema defaulting to public', () => {
        const policyString = 'CREATE POLICY "def_schema" ON my_table FOR ALL TO public';
        const result = parsePolicy(policyString);
        expect(result.schema).toBe('public');
        expect(result.table).toBe('my_table');
    });
    
    it('should parse complex TO clause', () => {
         const policyString = 'CREATE POLICY "multi_role" ON t FOR ALL TO role1, role2 USING (true)';
         const result = parsePolicy(policyString);
         expect(result.to).toBe('role1, role2');
    });
});
