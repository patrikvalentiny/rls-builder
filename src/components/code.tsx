import { useState, useMemo } from "react";
import type { CreatePolicy } from "../types/createPolicy";
import Header from "./Header";
import PolicyForm from "./PolicyForm";
import SqlPreview from "./SqlPreview";

const Code = () => {
    const [policy, setPolicy] = useState<CreatePolicy>({
        name: 'Authenticated users can delete their own records',
        schema: 'public',
        table: 'user_details',
        as: 'PERMISSIVE',
        for: 'DELETE',
        to: 'authenticated',
        using: '(( SELECT auth.uid() AS uid) = user_id)',
        withCheck: ''
    });

    const code = useMemo(() => {
        let sql = `CREATE POLICY "${policy.name}" ON ${policy.schema}.${policy.table}`;
        if (policy.as !== 'PERMISSIVE') sql += ` AS ${policy.as}`;
        if (policy.for !== 'ALL') sql += ` FOR ${policy.for}`;
        if (policy.to !== 'PUBLIC') sql += ` TO ${policy.to}`;
        if (policy.using.trim()) sql += ` USING (${policy.using})`;
        if (policy.withCheck.trim()) sql += ` WITH CHECK (${policy.withCheck})`;
        return sql;
    }, [policy]);

    const handleChange = (field: keyof CreatePolicy, value: string) => {
        setPolicy(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="min-h-screen bg-base-100 p-6">
            <div className="max-w-7xl mx-auto">
                <Header />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <PolicyForm policy={policy} onChange={handleChange} />
                    <SqlPreview code={code} />
                </div>
            </div>
        </div>
    );
};

export default Code;