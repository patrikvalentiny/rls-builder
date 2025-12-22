import { useState, useEffect } from 'react';
import type { StoredPolicy } from '../types/storedPolicy';
import type { CreatePolicy } from '../types/createPolicy';
import { buildCreatePolicySql } from '../utils/policyBuilder';
import PolicyEditorLayout from './PolicyEditorLayout';

interface PolicyEditorProps {
    initialPolicy: StoredPolicy;
    isOpen: boolean;
    onSave: (policy: StoredPolicy) => void;
    onCancel: () => void;
}

export default function PolicyEditorDialog({ initialPolicy, isOpen, onSave, onCancel }: PolicyEditorProps) {
    const [policy, setPolicy] = useState<StoredPolicy>(initialPolicy);

    useEffect(() => {
        setPolicy(initialPolicy);
    }, [initialPolicy]);

    const updateField = (field: keyof CreatePolicy, value: string) => {
        setPolicy(prev => ({ ...prev, [field]: value }));
    };

    const updateMeta = (field: keyof StoredPolicy, value: string) => {
        setPolicy(prev => ({ ...prev, [field]: value }));
    };

    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-7xl">
                <h3 className="font-bold text-lg mb-4">{policy.name ? 'Edit Policy' : 'New Policy'}</h3>
                
                <PolicyEditorLayout
                    policy={policy}
                    onChange={updateField}
                    onDocumentationChange={(val) => updateMeta('documentation', val)}
                    onCollectionChange={(val) => updateMeta('collection', val)}
                    sql={buildCreatePolicySql(policy)}
                />

                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => onSave(policy)}>Save</button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onCancel}>close</button>
            </form>
        </dialog>
    );
}
