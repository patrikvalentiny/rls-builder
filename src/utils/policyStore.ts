import localforage from 'localforage';
import type { CreatePolicy } from '../types/createPolicy';

export interface StoredPolicy extends CreatePolicy {
    id: string;
    documentation: string;
    createdAt: number;
    updatedAt: number;
}

const store = localforage.createInstance({
    name: 'rls-builder',
    storeName: 'policies'
});

const POLICIES_KEY = 'policies:v1';

function makeId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `p_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function makeBlankPolicy(): StoredPolicy {
    const now = Date.now();
    return {
        id: makeId(),
        name: '',
        schema: 'public',
        table: '',
        as: 'PERMISSIVE',
        for: 'ALL',
        to: 'public',
        using: '',
        withCheck: '',
        documentation: '',
        createdAt: now,
        updatedAt: now
    };
}

export async function listPolicies(): Promise<StoredPolicy[]> {
    const policies = await store.getItem<StoredPolicy[]>(POLICIES_KEY);
    return Array.isArray(policies) ? policies : [];
}

async function writePolicies(policies: StoredPolicy[]): Promise<void> {
    await store.setItem(POLICIES_KEY, policies);
}

export async function upsertPolicy(policy: StoredPolicy): Promise<void> {
    const policies = await listPolicies();
    const now = Date.now();

    const index = policies.findIndex(p => p.id === policy.id);
    if (index === -1) {
        policies.unshift({ ...policy, createdAt: policy.createdAt ?? now, updatedAt: now });
    } else {
        policies[index] = { ...policy, updatedAt: now };
    }

    await writePolicies(policies);
}

export async function deletePolicy(id: string): Promise<void> {
    const policies = await listPolicies();
    await writePolicies(policies.filter(p => p.id !== id));
}