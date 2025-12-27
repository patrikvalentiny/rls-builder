import type { CreatePolicy } from "./createPolicy";

export interface ValidationResult {
    severity: 'error' | 'warning' | 'info';
    title: string;
    message: string;
}

export type PolicyValidator = (policy: CreatePolicy) => ValidationResult[];
