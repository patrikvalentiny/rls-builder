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
        expect(() => parsePolicy(invalidString)).toThrow('Invalid CREATE POLICY statement');
    });

    it('should throw an error for missing name', () => {
        const invalidString = 'CREATE POLICY ON "public"."users" AS PERMISSIVE FOR SELECT TO "role";';
        expect(() => parsePolicy(invalidString)).toThrow('Invalid CREATE POLICY statement');
    });
});
