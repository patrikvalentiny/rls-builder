import { v6 as uuidv6 } from 'uuid';
import type { StoredPolicy } from '../types/storedPolicy';
import { POLICIES_KEY } from './storageKeys';
import { rls_store } from './storage';



function makeId(): string {
    return uuidv6();
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
    const policies = await rls_store.getItem<StoredPolicy[]>(POLICIES_KEY);
    return Array.isArray(policies) ? policies : [];
}

async function writePolicies(policies: StoredPolicy[]): Promise<void> {
    await rls_store.setItem(POLICIES_KEY, policies);
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