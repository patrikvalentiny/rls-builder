import { useState } from 'react';
import { useRoute } from 'wouter';
import { usePolicies } from '../hooks/usePolicies';
import PolicyEditorDialog from '../components/PolicyEditorDialog';
import type { StoredPolicy } from '../types/storedPolicy';
import { exportPolicies, importPolicies } from '../utils/collectionsIO';
import { writePolicies } from '../utils/policyStore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PolicyPdfDocument from '../components/PolicyPdfDocument';

export default function PolicyList() {
    const [match, params] = useRoute("/policies/:collection");
    const collectionFilter = match && params?.collection ? decodeURIComponent(params.collection) : null;

    const { policies, loading, error, upsertPolicy } = usePolicies();
    const [editingPolicy, setEditingPolicy] = useState<StoredPolicy | null>(null);

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="alert alert-error">{error}</div>;

    const filteredPolicies = collectionFilter
        ? policies.filter(p => p.collection === collectionFilter)
        : policies;

    const groupedPolicies = filteredPolicies.reduce((acc, policy) => {
        const schema = policy.schema || 'public';
        const table = policy.table || 'unknown';

        if (!acc[schema]) {
            acc[schema] = {};
        }
        if (!acc[schema][table]) {
            acc[schema][table] = [];
        }
        acc[schema][table].push(policy);
        return acc;
    }, {} as Record<string, Record<string, StoredPolicy[]>>);

    async function importPoliciesButton(file: File) {
        const importedPolicies = await importPolicies(file);
        await writePolicies(importedPolicies);
        // window.location.reload();
        window.location.href = '/policies';
    }

    return (
        <div className="container mx-auto p-4">
            <div className='flex flex-row justify-between items-center'>
                <h2 className="text-3xl font-bold mb-6">
                    {collectionFilter ? `Collection: ${collectionFilter}` : 'All Policies'}
                </h2>
                <div className='flex flex-row gap-2'>
                <button
                    className="btn btn-primary"
                    onClick={() => exportPolicies(policies, 'policies')}
                >Export All Policies
                </button>
                <PDFDownloadLink
                    document={<PolicyPdfDocument policies={policies} />}
                    fileName={'rls-policies.pdf'}
                    className="btn btn-secondary"
                >
                    {({ loading }) => (loading ? 'Loading PDF...' : 'Download PDF')}
                </PDFDownloadLink>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.json';
                        input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                                await importPoliciesButton(file);
                            }
                        };
                        input.click();
                    }}
                >Import Policies
                </button>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                {filteredPolicies.length === 0 ? (
                    <div className="alert alert-info">
                        <span>No policies found in this collection.</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {Object.keys(groupedPolicies).sort().map(schema => (
                            <div key={schema} className="card bg-base-200 shadow-sm">
                                <div className="card-body p-4">
                                    <h3 className="card-title text-xl border-b border-base-300 pb-2 mb-4">
                                        Schema: {schema}
                                    </h3>

                                    {Object.keys(groupedPolicies[schema]).sort().map(table => (
                                        <div key={table} className="mb-4 last:mb-0">
                                            <h4 className="text-lg font-semibold mb-2 px-2 opacity-80 flex items-center gap-2">
                                                <span className="badge badge-ghost">Table</span>
                                                {table}
                                            </h4>
                                            <ul className="menu bg-base-100 w-full rounded-box">
                                                {groupedPolicies[schema][table].map(policy => (
                                                    <li key={policy.id}>
                                                        <a onClick={() => setEditingPolicy(policy)}>
                                                            <span className="font-medium">{policy.name || 'Untitled Policy'}</span>
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editingPolicy && (
                <PolicyEditorDialog
                    initialPolicy={editingPolicy}
                    isOpen={!!editingPolicy}
                    onSave={async (p) => {
                        await upsertPolicy(p);
                        setEditingPolicy(null);
                    }}
                    onCancel={() => setEditingPolicy(null)}
                />
            )}
        </div>
    );
}

