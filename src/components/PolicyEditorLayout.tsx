import { useMemo } from 'react';
import type { CreatePolicy } from '../types/createPolicy';
import PolicyForm from './PolicyForm';
import SqlPreview from './SqlPreview';
import { usePolicies } from '../hooks/usePolicies';
import { validatePolicy } from '../utils/policyValidation';

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

    const validationResults = useMemo(() => validatePolicy(policy), [policy]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-6">
                <PolicyForm policy={policy} onChange={onChange} />
            </div>

            <div className="flex flex-col gap-3">
                {rightColumnHeader}
                
                {validationResults.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {validationResults.map((result, idx) => (
                            <div key={idx} role="alert" className={`alert ${result.severity === 'error' ? 'alert-error' : result.severity === 'warning' ? 'alert-warning' : 'alert-info'} shadow-sm`}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <div>
                                    <h3 className="font-bold text-sm">{result.title}</h3>
                                    <div className="text-xs">{result.message}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
