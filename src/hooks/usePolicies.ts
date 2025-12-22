import { useState, useEffect, useCallback } from 'react';
import { listPolicies, deletePolicy as deletePolicyStore, upsertPolicy as upsertPolicyStore } from '../utils/policyStore';
import type { StoredPolicy } from '../types/storedPolicy';

export function usePolicies() {
    const [policies, setPolicies] = useState<StoredPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await listPolicies();
            setPolicies(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load policies');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const deletePolicy = useCallback(async (id: string) => {
        await deletePolicyStore(id);
        await refresh();
    }, [refresh]);

    const upsertPolicy = useCallback(async (policy: StoredPolicy) => {
        await upsertPolicyStore(policy);
        await refresh();
    }, [refresh]);
    
    return { policies, loading, error, refresh, deletePolicy, upsertPolicy };
}
