import { useState, useMemo } from "react";
import CodeEditor from '@uiw/react-textarea-code-editor';

const Code = () => {
    const [policyName, setPolicyName] = useState('Authenticated users can delete their own records');
    const [schema, setSchema] = useState('public');
    const [tableName, setTableName] = useState('user_details');
    const [asType, setAsType] = useState('PERMISSIVE');
    const [forType, setForType] = useState('DELETE');
    const [toRoles, setToRoles] = useState('authenticated');
    const [usingExpr, setUsingExpr] = useState('(( SELECT auth.uid() AS uid) = user_id)');
    const [withCheckExpr, setWithCheckExpr] = useState('');
    const [copied, setCopied] = useState(false);

    const code = useMemo(() => {
        let policy = `CREATE POLICY "${policyName}" ON ${schema}.${tableName}`;
        if (asType !== 'PERMISSIVE') policy += ` AS ${asType}`;
        if (forType !== 'ALL') policy += ` FOR ${forType}`;
        if (toRoles !== 'PUBLIC') policy += ` TO ${toRoles}`;
        if (usingExpr.trim()) policy += ` USING (${usingExpr})`;
        if (withCheckExpr.trim()) policy += ` WITH CHECK (${withCheckExpr})`;
        return policy;
    }, [policyName, schema, tableName, asType, forType, toRoles, usingExpr, withCheckExpr]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold mb-4">PostgreSQL RLS Policy Builder</h1>
                    <p className="text-lg">Create Row Level Security policies with ease</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Policy Configuration Section */}
                    <div className="card bg-base-100 shadow-xl border border-base-300">
                        <div className="card-body">
                            <h2 className="card-title text-3xl mb-6 text-base-content">Policy Configuration</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Policy Name Input */}
                                <div className="form-control md:col-span-2 flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="font-semibold text-sm whitespace-nowrap">Policy Name</label>
                                    <textarea
                                        className="textarea textarea-bordered textarea-primary focus:textarea-primary-focus flex-1"
                                        value={policyName}
                                        onChange={(e) => setPolicyName(e.target.value)}
                                        placeholder="Enter policy name"
                                        rows={2}
                                    />
                                </div>
                                {/* Schema Input */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Schema</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered input-primary focus:input-primary-focus"
                                        value={schema}
                                        onChange={(e) => setSchema(e.target.value)}
                                        placeholder="public"
                                    />
                                </div>
                                {/* Table Name Input */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Table Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="input input-bordered input-primary focus:input-primary-focus"
                                        value={tableName}
                                        onChange={(e) => setTableName(e.target.value)}
                                        placeholder="table_name"
                                    />
                                </div>
                                {/* Policy Type Dropdown */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Policy Type</span>
                                    </label>
                                    <select
                                        className="select select-bordered select-primary focus:select-primary-focus"
                                        value={asType}
                                        onChange={(e) => setAsType(e.target.value)}
                                    >
                                        <option>PERMISSIVE</option>
                                        <option>RESTRICTIVE</option>
                                    </select>
                                </div>
                                {/* Command Dropdown */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold">Command</span>
                                    </label>
                                    <select
                                        className="select select-bordered select-primary focus:select-primary-focus"
                                        value={forType}
                                        onChange={(e) => setForType(e.target.value)}
                                    >
                                        <option>ALL</option>
                                        <option>SELECT</option>
                                        <option>INSERT</option>
                                        <option>UPDATE</option>
                                        <option>DELETE</option>
                                    </select>
                                </div>
                            </div>
                            {/* Align Roles, USING, and WITH CHECK fields */}
                            <div className="mt-6 space-y-6">
                                {/* Roles Input */}
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <label className="md:w-1/3 font-semibold text-sm">Roles</label>
                                    <input
                                        type="text"
                                        className="input input-bordered input-primary focus:input-primary-focus flex-1"
                                        value={toRoles}
                                        onChange={(e) => setToRoles(e.target.value)}
                                        placeholder="PUBLIC, role1, role2"
                                    />
                                </div>
                                {/* USING Expression Input */}
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    <label className="md:w-1/3 font-semibold text-sm pt-3">USING Expression</label>
                                    <textarea
                                        className="textarea textarea-bordered textarea-primary focus:textarea-primary-focus flex-1"
                                        value={usingExpr}
                                        onChange={(e) => setUsingExpr(e.target.value)}
                                        placeholder="SQL expression for USING clause"
                                        rows={3}
                                    />
                                </div>
                                {/* WITH CHECK Expression Input */}
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    <label className="md:w-1/3 font-semibold text-sm pt-3">WITH CHECK Expression</label>
                                    <textarea
                                        className="textarea textarea-bordered textarea-primary focus:textarea-primary-focus flex-1"
                                        value={withCheckExpr}
                                        onChange={(e) => setWithCheckExpr(e.target.value)}
                                        placeholder="SQL expression for WITH CHECK clause"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Generated SQL Section */}
                    <div className="card bg-base-100 shadow-xl border border-base-300">
                        <div className="card-body">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="card-title text-3xl text-base-content">Generated SQL</h2>
                                <button
                                    className={`btn ${copied ? 'btn-success' : 'btn-primary'} btn-sm`}
                                    onClick={handleCopy}
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="mockup-code p-4 rounded-lg bg-neutral-focus text-neutral-content">
                                <CodeEditor
                                    value={code}
                                    language="sql"
                                    placeholder="Generated SQL will appear here."
                                    readOnly={true}
                                    padding={15}
                                    style={{
                                        backgroundColor: "transparent",
                                        fontFamily: '"Inconsolata", "Monaco", "Consolas", monospace',
                                        fontSize: '14px',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Code;