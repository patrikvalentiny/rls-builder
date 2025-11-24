import { useState, useMemo } from "react";
import CodeEditor from '@uiw/react-textarea-code-editor';
import { format } from 'sql-formatter';

interface SqlPreviewProps {
    code: string;
}

const SqlPreview = ({ code }: SqlPreviewProps) => {
    const [copied, setCopied] = useState(false);

    const formattedCode = useMemo(() => {
        try {
            return format(code, { language: 'postgresql', keywordCase: 'upper' });
        } catch (e) {
            console.error("Formatting error:", e);
            return code;
        }
    }, [code]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(formattedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
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
                        value={formattedCode}
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
    );
};

export default SqlPreview;
