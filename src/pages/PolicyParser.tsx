import { useEffect, useState } from "react";
import CodeEditor from '@uiw/react-textarea-code-editor';
import { parsePolicy } from "../utils/policyParser";
import type { CreatePolicy } from "../types/createPolicy";
import { makeBlankPolicy, upsertPolicy } from "../utils/policyStore";
import { PARSER_LAST_SQL } from "../utils/storageKeys";
import { rls_store } from "../utils/storage";

const PolicyParser = () => {
    const [sqlInput, setSqlInput] = useState("");
    const [parsedPolicy, setParsedPolicy] = useState<CreatePolicy | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

  

    useEffect(() => {
        const loadSavedSql = async () => {
            const savedSql = await rls_store.getItem<string>(PARSER_LAST_SQL);
            if (savedSql) {
                setSqlInput(savedSql);
                try {
                    const result = parsePolicy(savedSql);
                    setParsedPolicy(result);
                    setError(null);
                } catch (err) {
                    setParsedPolicy(null);
                    setError((err as Error).message);
                }
            }
        };
        loadSavedSql();
    }, []);

    const handleSqlChange = (value: string) => {
        setSqlInput(value);
        rls_store.setItem(PARSER_LAST_SQL, value);

        if (!value.trim()) {
            setParsedPolicy(null);
            setError(null);
            return;
        }

        try {
            const result = parsePolicy(value);
            setParsedPolicy(result);
            setError(null);
        } catch (err) {
            setParsedPolicy(null);
            setError((err as Error).message);
        }
    };

    const handleSaveToOverview = async () => {
        const base = makeBlankPolicy();
        await upsertPolicy({
            ...base,
            ...parsedPolicy,
            documentation: ''
        });
        setSaveStatus('Saved to Overview');
        window.setTimeout(() => setSaveStatus(null), 2000);
    };

    const renderRow = (label: string, value: string) => (
        <>
            <div className="py-3 font-semibold text-base-content/70 border-b border-base-200">{label}</div>
            <div className="py-3 font-mono text-sm wrap-break-word border-b border-base-200">{value || <span className="opacity-30">-</span>}</div>
        </>
    );

    return (
        <div className="min-h-full bg-base-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="card bg-base-100 shadow-xl border border-base-300">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">Input SQL Policy</h2>
                            <div className="border border-base-300 rounded-lg overflow-hidden">
                                <CodeEditor
                                    value={sqlInput}
                                    language="sql"
                                    placeholder="Paste your CREATE POLICY statement here..."
                                    onChange={(evn) => handleSqlChange(evn.target.value)}
                                    padding={15}
                                    style={{
                                        fontSize: 14,
                                        backgroundColor: "var(--fallback-b1,oklch(var(--b1)/1))",
                                        fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                                        minHeight: '400px',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl border border-base-300">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">Parsed Details</h2>
                            {error ? (
                                <div className="alert alert-error">
                                    <span>{error}</span>
                                </div>
                            ) : parsedPolicy ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <button className="btn btn-primary btn-sm" onClick={handleSaveToOverview}>
                                            Save to Overview
                                        </button>
                                        {saveStatus && <div className="text-sm text-success">{saveStatus}</div>}
                                    </div>

                                    <div className="grid grid-cols-[120px_1fr] gap-x-4">
                                        {renderRow("Name", parsedPolicy.name)}
                                        {renderRow("Schema", parsedPolicy.schema)}
                                        {renderRow("Table", parsedPolicy.table)}
                                        {renderRow("As", parsedPolicy.as)}
                                        {renderRow("For", parsedPolicy.for)}
                                        {renderRow("To", parsedPolicy.to)}
                                        {renderRow("Using", parsedPolicy.using)}
                                        {renderRow("With Check", parsedPolicy.withCheck)}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full min-h-[400px] text-base-content/50 italic bg-base-200/50 rounded-lg">
                                    Enter a valid SQL policy to see details
                                </div>

                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyParser;
