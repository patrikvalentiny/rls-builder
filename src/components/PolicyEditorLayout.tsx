import { useMemo } from 'react';
import type { CreatePolicy } from '../types/createPolicy';
import PolicyForm from './PolicyForm';
import SqlPreview from './SqlPreview';
import { usePolicies } from '../hooks/usePolicies';

interface PolicyEditorLayoutProps {
    policy: CreatePolicy & { documentation?: string; collection?: string };
    onChange: (field: keyof CreatePolicy, value: string) => void;
    onDocumentationChange?: (value: string) => void;
    onCollectionChange?: (value: string) => void;
    sql: string;
    rightColumnHeader?: React.ReactNode;
}

export default function PolicyEditorLayout({
    policy,
    onChange,
    onDocumentationChange,
    onCollectionChange,
    sql,
    rightColumnHeader
}: PolicyEditorLayoutProps) {
    const { policies } = usePolicies();
    
    const collectionOptions = useMemo(() => {
        const set = new Set<string>();
        for (const p of policies) {
            if (p.collection?.trim()) set.add(p.collection.trim());
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [policies]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-6">
                <PolicyForm policy={policy} onChange={onChange} />
            </div>

            <div className="flex flex-col gap-3">
                {rightColumnHeader}
                <SqlPreview code={sql} />
            </div>

            <div className="flex flex-col gap-6">
                <div className="card bg-base-100 shadow-xl border border-base-300 h-full">
                    <div className="card-body">
                        <h4 className="card-title text-xl">Documentation</h4>
                        
                        {onCollectionChange && (
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Collection</span>
                                </label>
                                <input
                                    type="text"
                                    list="collection-options"
                                    className="input input-bordered"
                                    value={policy.collection || ''}
                                    onChange={(e) => onCollectionChange(e.target.value)}
                                    placeholder="Group name for policies"
                                />
                                <datalist id="collection-options">
                                    {collectionOptions.map(c => (
                                        <option key={c} value={c} />
                                    ))}
                                </datalist>
                            </div>
                        )}

                        {onDocumentationChange && (
                            <textarea
                                className="textarea textarea-bordered w-full flex-1 min-h-[200px]"
                                value={policy.documentation || ''}
                                onChange={(e) => onDocumentationChange(e.target.value)}
                                placeholder="Notes, rationale, links, examples…"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
