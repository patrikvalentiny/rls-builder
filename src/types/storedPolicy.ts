import type { CreatePolicy } from "./createPolicy";

export interface StoredPolicy extends CreatePolicy {
    id: string;
    collection: string;
    documentation: string;
    createdAt: number;
    updatedAt: number;
}