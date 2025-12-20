import { useState, useMemo, useEffect } from "react";
import type { CreatePolicy } from "../types/createPolicy";
import Header from "../components/Header";
import PolicyForm from "../components/PolicyForm";
import SqlPreview from "../components/SqlPreview";
import localforage from "localforage";
import { buildCreatePolicySql } from "../utils/policySql";
import { makeBlankPolicy, upsertPolicy } from "../utils/policyStore";

const PolicyBuilder = () => {
    const [policy, setPolicy] = useState<CreatePolicy>(
        {
        name: 'Authenticated users can delete their own records',
        schema: 'public',
        table: 'user_details',
        as: 'PERMISSIVE',
        for: 'DELETE',
        to: 'authenticated',
        using: '(( SELECT auth.uid() AS uid) = user_id)',
        withCheck: ''
    });

    const code = useMemo(() => buildCreatePolicySql(policy), [policy]);

    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    useEffect(() => {
        const loadSavedPolicy = async () => {
            const savedPolicy = await localforage.getItem<CreatePolicy>('savedPolicy');
            if (savedPolicy) {
                setPolicy(savedPolicy);
            }
        };
        loadSavedPolicy();
    }, []);

    const handleChange = (field: keyof CreatePolicy, value: string) => {
        setPolicy(prev => ({ ...prev, [field]: value }));
        localforage.setItem('savedPolicy', { ...policy, [field]: value });
    };

    const handleSaveToOverview = async () => {
        const base = makeBlankPolicy();
        await upsertPolicy({
            ...base,
            ...policy,
            documentation: ''
        });
        setSaveStatus('Saved to Overview');
        window.setTimeout(() => setSaveStatus(null), 2000);
    };

    return (
        <div className="min-h-screen bg-base-100 p-6">
            <div className="max-w-7xl mx-auto">
                <Header />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PolicyForm policy={policy} onChange={handleChange} />
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <button className="btn btn-primary btn-sm" onClick={handleSaveToOverview}>
                                Save to Overview
                            </button>
                            {saveStatus && <div className="text-sm text-success">{saveStatus}</div>}
                        </div>
                        <SqlPreview code={code} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyBuilder;
