import type { PolicyValidator } from "../../types/validation";

export const securityValidators: PolicyValidator[] = [
    // The USING (true) Smell
    (policy) => {
        if ((policy.for === 'DELETE' || policy.for === 'UPDATE') && policy.using && policy.using.trim().toLowerCase() === 'true') {
            return [{
                severity: 'warning',
                title: 'Broad Access Warning',
                message: `USING (true) on ${policy.for} allows all rows to be modified/deleted. Verify this is intended.`
            }];
        }
        return [];
    },

    // Implicit Type Casting in Expressions
    (policy) => {
        const functionCallRegex = /\b(?!(?:AND|OR|NOT|IN)\b)\w+\s*\([^)]*\)(?!\s*::)/i;
        if ((policy.using && functionCallRegex.test(policy.using)) || (policy.withCheck && functionCallRegex.test(policy.withCheck))) {
            return [{
                severity: 'warning',
                title: 'Potential Implicit Type Casting',
                message: 'A function call is used without an explicit cast. Ensure the return type matches the column type to avoid performance issues or errors.'
            }];
        }
        return [];
    }
];
