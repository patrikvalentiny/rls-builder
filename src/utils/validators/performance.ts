import type { PolicyValidator } from "../../types/validation";
import { STANDARD_FUNCTIONS } from "../validationConstants";

export const performanceValidators: PolicyValidator[] = [
    // Scalar Subqueries vs. EXISTS
    (policy) => {
        const scalarSubqueryRegex = /\b=\s*\(\s*SELECT\b/i;
        if ((policy.using && scalarSubqueryRegex.test(policy.using)) || (policy.withCheck && scalarSubqueryRegex.test(policy.withCheck))) {
            return [{
                severity: 'warning',
                title: 'Performance Warning',
                message: 'Scalar subquery detected (e.g., "col = (SELECT ...)"). Consider using "EXISTS (SELECT 1 ...)" for better performance.'
            }];
        }
        return [];
    },

    // Volatile Function Detection
    (policy) => {
        const functionCallRegex = /\b([a-zA-Z0-9_.]+)\s*\(/g;
        const combinedSql = (policy.using || '') + ' ' + (policy.withCheck || '');
        let match;
        const foundFunctions = new Set<string>();
        while ((match = functionCallRegex.exec(combinedSql)) !== null) {
            const funcName = match[1].toLowerCase();
            if (!STANDARD_FUNCTIONS.has(funcName) && !foundFunctions.has(funcName)) {
                foundFunctions.add(funcName);
            }
        }

        if (foundFunctions.size > 0) {
            return [{
                severity: 'info',
                title: 'Potential Volatile Function',
                message: `Custom or non-standard functions detected: ${Array.from(foundFunctions).join(', ')}. Ensure these are marked STABLE or IMMUTABLE for performance.`
            }];
        }
        return [];
    }
];
