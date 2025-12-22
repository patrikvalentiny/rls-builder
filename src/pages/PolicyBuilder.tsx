import { useState, useMemo, useEffect } from "react";
import type { CreatePolicy } from "../types/createPolicy";
import PolicyEditorLayout from "../components/PolicyEditorLayout";
import { buildCreatePolicySql } from "../utils/policyBuilder";
import { parsePolicy } from "../utils/policyParser";
import { makeBlankPolicy, upsertPolicy } from "../utils/policyStore";
import { BUILDER_LAST_SQL } from "../utils/storageKeys";
import { rls_store } from "../utils/storage";
import type { BuilderPolicy } from "../types/builderPolicy";
import { DEFAULT_POLICY } from "../types/builderPolicy";

const PolicyBuilder = () => {
    const [policy, setPolicy] = useState<BuilderPolicy>(DEFAULT_POLICY);

    const code = useMemo(() => buildCreatePolicySql(policy), [policy]);

    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const [importSql, setImportSql] = useState('');
    const [importError, setImportError] = useState<string | null>(null);

    useEffect(() => {
        const loadSavedPolicy = async () => {
            const savedPolicy = await rls_store.getItem<BuilderPolicy>(BUILDER_LAST_SQL);
            if (savedPolicy) {
                setPolicy(savedPolicy);
            }
        };
        loadSavedPolicy();
    }, []);

    const handleChange = (field: keyof CreatePolicy, value: string) => {
        setPolicy(prev => ({ ...prev, [field]: value }));
        rls_store.setItem(BUILDER_LAST_SQL, { ...policy, [field]: value });
    };

    const handleDocumentationChange = (value: string) => {
        setPolicy(prev => ({ ...prev, documentation: value }));
        rls_store.setItem(BUILDER_LAST_SQL, { ...policy, documentation: value });
    };

    const handleCollectionChange = (value: string) => {
        setPolicy(prev => ({ ...prev, collection: value }));
        rls_store.setItem(BUILDER_LAST_SQL, { ...policy, collection: value });
    };

    const handleSaveToOverview = async () => {
        const base = makeBlankPolicy();
        await upsertPolicy({
            ...base,
            ...policy
        });
        setSaveStatus('Saved to Overview');
        window.setTimeout(() => setSaveStatus(null), 2000);
    };

    const handleReset = () => {
        setPolicy(DEFAULT_POLICY);
        rls_store.setItem(BUILDER_LAST_SQL, DEFAULT_POLICY);
    };

    const handleImport = () => {
        try {
            const parsed = parsePolicy(importSql);
            setPolicy(prev => ({
                ...prev,
                ...parsed
            }));
            setImportSql('');
            setImportError(null);
            (document.getElementById('import_modal') as HTMLDialogElement).close();
        } catch (err) {
            if (err instanceof Error) {
                setImportError(err.message);
            } else {
                setImportError('Failed to parse policy SQL');
            }
        }
    };

    return (
        <div className="min-h-full bg-base-100 p-6">
            <div className="max-w-full mx-auto">
                <PolicyEditorLayout
                    policy={policy}
                    onChange={handleChange}
                    onDocumentationChange={handleDocumentationChange}
                    onCollectionChange={handleCollectionChange}
                    sql={code}
                    rightColumnHeader={
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <button className="btn btn-primary btn-sm" onClick={handleSaveToOverview}>
                                    Save to Overview
                                </button>
                                <button className="btn btn-neutral btn-sm" onClick={() => (document.getElementById('import_modal') as HTMLDialogElement).showModal()}>
                                    Import SQL
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                                    Reset
                                </button>
                            </div>
                            {saveStatus && <div className="text-sm text-success">{saveStatus}</div>}
                        </div>
                    }
                />
            </div>

            {/* Import Modal */}
            <dialog id="import_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Import Policy SQL</h3>
                    <p className="py-4">Paste your CREATE POLICY statement here.</p>
                    <textarea 
                        className="textarea textarea-bordered w-full h-48 font-mono text-xs" 
                        placeholder="CREATE POLICY ..."
                        value={importSql}
                        onChange={e => setImportSql(e.target.value)}
                    ></textarea>
                    {importError && <div className="text-error text-sm mt-2">{importError}</div>}
                    <div className="modal-action">
                        <button className="btn btn-ghost" onClick={() => {
                            setImportSql('');
                            setImportError(null);
                            (document.getElementById('import_modal') as HTMLDialogElement).close();
                        }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleImport}>Import</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default PolicyBuilder;
