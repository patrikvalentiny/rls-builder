
import type { CreatePolicy } from "../types/createPolicy";
import type { ValidationResult, PolicyValidator } from "../types/validation";
import { logicalValidators } from "./validators/logical";
import { recursionValidators } from "./validators/recursion";
import { performanceValidators } from "./validators/performance";
import { securityValidators } from "./validators/security";

const validators: PolicyValidator[] = [
    ...logicalValidators,
    ...recursionValidators,
    ...performanceValidators,
    ...securityValidators
];

export function validatePolicy(policy: CreatePolicy): ValidationResult[] {
    return validators.flatMap(validator => validator(policy));
}

