import type { PolicyValidator } from "../../types/validation";

export const recursionValidators: PolicyValidator[] = [
    // Static Recursion Detection
    (policy) => {
        if (!policy.table) return [];
        
        const schemaPart = policy.schema ? `(?:${policy.schema}\\.)?` : '';
        const tableRegex = new RegExp(`\\bFROM\\s+${schemaPart}${policy.table}\\b`, 'i');

        if ((policy.using && tableRegex.test(policy.using)) || (policy.withCheck && tableRegex.test(policy.withCheck))) {
            return [{
                severity: 'error',
                title: 'Infinite Recursion Detected',
                message: `The policy on table "${policy.schema ? `${policy.schema}.` : ''}${policy.table}" references itself in a subquery. This will cause an infinite recursion error.`
            }];
        }
        return [];
    }
];
