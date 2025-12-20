import type { CreatePolicy } from '../types/createPolicy';

export function parsePolicy(policyString: string): CreatePolicy {
    // Regex to match CREATE POLICY components
    const regex = /CREATE POLICY\s+"([^"]+)"\s+ON\s+"([^"]+)"\."([^"]+)"\s+AS\s+(PERMISSIVE|RESTRICTIVE)\s+FOR\s+(ALL|SELECT|INSERT|UPDATE|DELETE)\s+TO\s+([^;]+?)(?:\s+USING\s*\(([^)]*)\))?(?:\s+WITH CHECK\s*\(([^)]*)\))?\s*;/i;
    const match = policyString.trim().match(regex);
    
    if (!match) {
        throw new Error('Invalid CREATE POLICY statement');
    }
        
    return {
        name: match[1],
        schema: match[2],
        table: match[3],
        as: match[4] as 'PERMISSIVE' | 'RESTRICTIVE',
        for: match[5] as 'ALL' | 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
        to: match[6].trim().replace(/^"|"$/g, ''),
        using: match[7] || '',
        withCheck: match[8] || '',
    };
}
