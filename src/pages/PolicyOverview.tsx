import { useEffect, useMemo, useState } from 'react';
import Header from "../components/Header";
import { deletePolicy, listPolicies, makeBlankPolicy, upsertPolicy } from '../utils/policyStore';
import { buildCreatePolicySql } from '../utils/policyBuilder';
import PolicyForm from '../components/PolicyForm';
import SqlPreview from '../components/SqlPreview';
import type { CreatePolicy } from '../types/createPolicy';
import type { StoredPolicy } from '../types/storedPolicy';

const cellClass = 'align-top text-xs';

const initialFilters = {
    name: '',
    schema: '',
    table: '',
    as: '' as '' | StoredPolicy['as'],
    for: '' as '' | StoredPolicy['for'],
    to: '',
    using: '',
    withCheck: '',
    documentation: '',
    sql: ''
};

const PolicyOverview = () => {
    const [policies, setPolicies] = useState<StoredPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const [filters, setFilters] = useState(initialFilters);

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [draft, setDraft] = useState<StoredPolicy | null>(null);

    const refresh = async () => {
        const next = await listPolicies();
        setPolicies(next);
    };

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                await refresh();
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load policies');
            } finally {
                setLoading(false);
            }
        };

        run();
    }, []);

    const filtered = useMemo(() => {
        const globalQuery = search.trim().toLowerCase();
        const normalizedFilters = {
            name: filters.name.trim().toLowerCase(),
            schema: filters.schema.trim().toLowerCase(),
            table: filters.table.trim().toLowerCase(),
            as: filters.as,
            for: filters.for,
            to: filters.to.trim().toLowerCase(),
            using: filters.using.trim().toLowerCase(),
            withCheck: filters.withCheck.trim().toLowerCase(),
            documentation: filters.documentation.trim().toLowerCase(),
            sql: filters.sql.trim().toLowerCase()
        };

        return policies.filter(p => {
            const sql = buildCreatePolicySql(p);
            const sqlLower = sql.toLowerCase();

            if (globalQuery) {
                const blob = [
                    p.name,
                    p.schema,
                    p.table,
                    p.as,
                    p.for,
                    p.to,
                    p.using,
                    p.withCheck,
                    p.documentation,
                    sql
                ].join(' ').toLowerCase();
                if (!blob.includes(globalQuery)) return false;
            }

            if (normalizedFilters.name && !p.name.toLowerCase().includes(normalizedFilters.name)) return false;
            if (normalizedFilters.schema && !p.schema.toLowerCase().includes(normalizedFilters.schema)) return false;
            if (normalizedFilters.table && !p.table.toLowerCase().includes(normalizedFilters.table)) return false;
            if (normalizedFilters.as && p.as !== normalizedFilters.as) return false;
            if (normalizedFilters.for && p.for !== normalizedFilters.for) return false;
            if (normalizedFilters.to && !p.to.toLowerCase().includes(normalizedFilters.to)) return false;
            if (normalizedFilters.using && !p.using.toLowerCase().includes(normalizedFilters.using)) return false;
            if (normalizedFilters.withCheck && !p.withCheck.toLowerCase().includes(normalizedFilters.withCheck)) return false;
            if (normalizedFilters.documentation && !p.documentation.toLowerCase().includes(normalizedFilters.documentation)) return false;
            if (normalizedFilters.sql && !sqlLower.includes(normalizedFilters.sql)) return false;

            return true;
        });
    }, [policies, search, filters]);

    const schemaOptions = useMemo(() => {
        const set = new Set<string>();
        for (const p of policies) {
            if (p.schema.trim()) set.add(p.schema.trim());
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [policies]);

    const tableOptions = useMemo(() => {
        const set = new Set<string>();
        for (const p of policies) {
            if (p.table.trim()) set.add(p.table.trim());
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [policies]);

    const toOptions = useMemo(() => {
        const set = new Set<string>();
        for (const p of policies) {
            if (p.to.trim()) set.add(p.to.trim());
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [policies]);

    const openEditor = (policy: StoredPolicy) => {
        setDraft({ ...policy });
        setIsEditorOpen(true);
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
        setDraft(null);
    };

    const saveDraft = async () => {
        if (!draft) return;
        await upsertPolicy(draft);
        await refresh();
        closeEditor();
    };

    const addNew = () => {
        openEditor(makeBlankPolicy());
    };

    const resetAll = () => {
        setSearch('');
        setFilters(initialFilters);
    };

    const remove = async (id: string) => {
        if (!confirm('Delete this policy?')) return;
        await deletePolicy(id);
        await refresh();
    };

    const updateDraft = <K extends keyof StoredPolicy>(key: K, value: StoredPolicy[K]) => {
        setDraft(prev => (prev ? { ...prev, [key]: value } : prev));
    };

    const updatePolicyField = (field: keyof CreatePolicy, value: string) => {
        setDraft(prev => (prev ? { ...prev, [field]: value } : prev));
    };

    return (
        <div className="min-h-dvh bg-base-100 p-6">
            <div className="mx-auto">
                <Header />

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">Policy Overview</h2>
                    </div>

                    <div className="flex gap-2 items-center">
                        <input
                            className="input input-bordered input-sm w-72"
                            placeholder="Search policies…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="btn btn-ghost btn-sm" onClick={resetAll}>
                            Reset
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={addNew}>
                            Add policy
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                    </div>
                )}

                <div className="text-sm text-base-content/70 mb-2">
                    {loading ? 'Loading…' : `${filtered.length} policy${filtered.length === 1 ? '' : 'ies'}`}
                </div>

                <div className="overflow-x-auto border border-base-300 rounded-box">
                    <table className="table table-zebra table-sm">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Schema.Table</th>
                                <th>As</th>
                                <th>For</th>
                                <th>To</th>
                                <th>Using</th>
                                <th>With Check</th>
                                <th>Documentation</th>
                                <th>SQL</th>
                                <th></th>
                            </tr>
                            <tr>
                                <th>
                                    <input
                                        className="input input-bordered input-xs w-48"
                                        placeholder="Filter…"
                                        value={filters.name}
                                        onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </th>
                                <th>
                                    <div className="flex flex-col gap-2">
                                        <select
                                            className="select select-bordered select-xs w-44"
                                            value={filters.schema}
                                            onChange={(e) => setFilters(prev => ({ ...prev, schema: e.target.value }))}
                                        >
                                            <option value="">All schemas</option>
                                            {schemaOptions.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>

                                        <select
                                            className="select select-bordered select-xs w-44"
                                            value={filters.table}
                                            onChange={(e) => setFilters(prev => ({ ...prev, table: e.target.value }))}
                                        >
                                            <option value="">All tables</option>
                                            {tableOptions.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                </th>
                                <th>
                                    <select
                                        className="select select-bordered select-xs w-36"
                                        value={filters.as}
                                        onChange={(e) => setFilters(prev => ({ ...prev, as: e.target.value as typeof filters.as }))}
                                    >
                                        <option value="">All</option>
                                        <option value="PERMISSIVE">PERMISSIVE</option>
                                        <option value="RESTRICTIVE">RESTRICTIVE</option>
                                    </select>
                                </th>
                                <th>
                                    <select
                                        className="select select-bordered select-xs w-28"
                                        value={filters.for}
                                        onChange={(e) => setFilters(prev => ({ ...prev, for: e.target.value as typeof filters.for }))}
                                    >
                                        <option value="">All</option>
                                        <option value="ALL">ALL</option>
                                        <option value="SELECT">SELECT</option>
                                        <option value="INSERT">INSERT</option>
                                        <option value="UPDATE">UPDATE</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </th>
                                <th>
                                    <select
                                        className="select select-bordered select-xs w-44"
                                        value={filters.to}
                                        onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
                                    >
                                        <option value="">All</option>
                                        {toOptions.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </th>
                                <th>
                                    <input
                                        className="input input-bordered input-xs w-48"
                                        placeholder="Filter…"
                                        value={filters.using}
                                        onChange={(e) => setFilters(prev => ({ ...prev, using: e.target.value }))}
                                    />
                                </th>
                                <th>
                                    <input
                                        className="input input-bordered input-xs w-48"
                                        placeholder="Filter…"
                                        value={filters.withCheck}
                                        onChange={(e) => setFilters(prev => ({ ...prev, withCheck: e.target.value }))}
                                    />
                                </th>
                                <th>
                                    <input
                                        className="input input-bordered input-xs w-48"
                                        placeholder="Filter…"
                                        value={filters.documentation}
                                        onChange={(e) => setFilters(prev => ({ ...prev, documentation: e.target.value }))}
                                    />
                                </th>
                                <th>
                                    <input
                                        className="input input-bordered input-xs w-48"
                                        placeholder="Filter SQL…"
                                        value={filters.sql}
                                        onChange={(e) => setFilters(prev => ({ ...prev, sql: e.target.value }))}
                                    />
                                </th>
                                <th className="text-right">
                                    <button
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => setFilters(initialFilters)}
                                    >
                                        Clear
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => {
                                const sql = buildCreatePolicySql(p);

                                return (
                                    <tr key={p.id}>
                                        <td className={cellClass}>
                                            <div className="max-w-72 truncate" title={p.name}>{p.name || <span className="text-base-content/40">(empty)</span>}</div>
                                        </td>

                                        <td className={cellClass}>
                                            <span title={`${p.schema}.${p.table}`}>{(p.schema ? `${p.schema}.` : '') + p.table}</span>
                                        </td>

                                        <td className={cellClass}>
                                            <span>{p.as}</span>
                                        </td>

                                        <td className={cellClass}>
                                            <span>{p.for}</span>
                                        </td>

                                        <td className={cellClass}>
                                            <span>{p.to}</span>
                                        </td>

                                        <td className={cellClass}>
                                            <div className="max-w-72 whitespace-pre-wrap" title={p.using}>{p.using}</div>
                                        </td>

                                        <td className={cellClass}>
                                            <div className="max-w-72 whitespace-pre-wrap" title={p.withCheck}>{p.withCheck}</div>
                                        </td>

                                        <td className={cellClass}>
                                            <div className="max-w-72 whitespace-pre-wrap" title={p.documentation}>{p.documentation}</div>
                                        </td>

                                        <td className={cellClass}>
                                            <pre className="text-[11px] leading-snug whitespace-pre-wrap max-w-md">{sql}</pre>
                                        </td>

                                        <td className="text-right align-top">
                                            <div className="flex justify-end gap-2">
                                                <button className="btn btn-ghost btn-xs" onClick={() => openEditor(p)}>Edit</button>
                                                <button className="btn btn-ghost btn-xs" onClick={() => remove(p.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {isEditorOpen && draft && (
                    <dialog
                        className="modal modal-open"
                        onCancel={(e) => {
                            e.preventDefault();
                            closeEditor();
                        }}
                    >
                        <div className="modal-box max-w-7xl">
                            <h3 className="font-bold text-lg mb-4">{draft.name ? 'Edit Policy' : 'New Policy'}</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-6">
                                    <PolicyForm policy={draft} onChange={updatePolicyField} />

                                    <div className="card bg-base-100 shadow-xl border border-base-300">
                                        <div className="card-body">
                                            <h4 className="card-title text-xl">Documentation</h4>
                                            <textarea
                                                className="textarea textarea-bordered w-full"
                                                rows={6}
                                                value={draft.documentation}
                                                onChange={(e) => updateDraft('documentation', e.target.value)}
                                                placeholder="Notes, rationale, links, examples…"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <SqlPreview code={buildCreatePolicySql(draft)} />
                            </div>

                            <div className="modal-action">
                                <button className="btn btn-ghost" onClick={closeEditor}>Cancel</button>
                                <button className="btn btn-primary" onClick={saveDraft}>Save</button>
                            </div>
                        </div>

                        <form method="dialog" className="modal-backdrop">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    closeEditor();
                                }}
                            >
                                close
                            </button>
                        </form>
                    </dialog>
                )}
            </div>
        </div>
    );
};

export default PolicyOverview;
