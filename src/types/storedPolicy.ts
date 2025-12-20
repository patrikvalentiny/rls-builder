import type { CreatePolicy } from "./createPolicy";

export interface StoredPolicy extends CreatePolicy {
    id: string;
    documentation: string;
    createdAt: number;
    updatedAt: number;
}