import type { PolicyValidator } from "../../types/validation";

export const logicalValidators: PolicyValidator[] = [
    // SELECT Policies with WITH CHECK
    (policy) => {
        if (policy.for === 'SELECT' && policy.withCheck && policy.withCheck.trim() !== '') {
            return [{
                severity: 'warning',
                title: 'Invalid Clause Combination',
                message: 'PostgreSQL allows USING for SELECT but ignores WITH CHECK. This clause will be ignored.'
            }];
        }
        return [];
    },

    // INSERT Policies with USING
    (policy) => {
        if (policy.for === 'INSERT' && policy.using && policy.using.trim() !== '') {
            return [{
                severity: 'warning',
                title: 'Invalid Clause Combination',
                message: 'INSERT policies only use WITH CHECK. The USING clause will be ignored.'
            }];
        }
        return [];
    },

    // Redundant FOR ALL Defaults
    (policy) => {
        if (policy.for === 'ALL' && (!policy.withCheck || policy.withCheck.trim() === '')) {
            return [{
                severity: 'warning',
                title: 'Potential Unsafe Writes',
                message: 'Policy defined for ALL but lacks a WITH CHECK clause. This may unintentionally allow unsafe writes/updates if the USING clause is only designed for visibility.'
            }];
        }
        return [];
    },

    // Missing TO Role
    (policy) => {
        if (!policy.to || policy.to.trim() === '') {
            return [{
                severity: 'info',
                title: 'Implicit Public Role',
                message: 'The TO clause is omitted, defaulting to PUBLIC. Consider explicitly stating TO PUBLIC or a specific role.'
            }];
        }
        return [];
    }
];
