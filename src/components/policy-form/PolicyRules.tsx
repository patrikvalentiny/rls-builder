import type { CreatePolicy } from "../../types/createPolicy";
import HorizontalInput from "../ui/HorizontalInput";
import HorizontalTextArea from "../ui/HorizontalTextArea";

interface PolicyRulesProps {
    policy: CreatePolicy;
    onChange: (field: keyof CreatePolicy, value: string) => void;
}

const PolicyRules = ({ policy, onChange }: PolicyRulesProps) => {
    return (
        <div className="mt-6 space-y-6">
            <HorizontalInput
                label="Roles"
                value={policy.to}
                onChange={(val) => onChange('to', val)}
                placeholder="PUBLIC, role1, role2"
                tooltip="Roles this policy applies to (e.g., authenticated, anon)."
            />

            <HorizontalTextArea
                label="USING Expression"
                value={policy.using}
                onChange={(val) => onChange('using', val)}
                placeholder="SQL expression for USING clause"
                rows={3}
                alignTop={true}
                tooltip="Expression to check for existing rows (SELECT, UPDATE, DELETE)."
            />

            <HorizontalTextArea
                label="WITH CHECK Expression"
                value={policy.withCheck}
                onChange={(val) => onChange('withCheck', val)}
                placeholder="SQL expression for WITH CHECK clause"
                rows={3}
                alignTop={true}
                tooltip="Expression to check for new rows (INSERT, UPDATE)."
            />
        </div>
    );
};

export default PolicyRules;
