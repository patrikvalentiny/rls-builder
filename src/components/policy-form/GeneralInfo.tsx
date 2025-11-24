import { POLICY_TYPES, COMMAND_TYPES, type CreatePolicy } from "../../types/createPolicy";
import FormInput from "../ui/FormInput";
import FormSelect from "../ui/FormSelect";
import HorizontalTextArea from "../ui/HorizontalTextArea";

interface GeneralInfoProps {
    policy: CreatePolicy;
    onChange: (field: keyof CreatePolicy, value: string) => void;
}

const GeneralInfo = ({ policy, onChange }: GeneralInfoProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HorizontalTextArea
                label="Policy Name"
                value={policy.name}
                onChange={(val) => onChange('name', val)}
                placeholder="Enter policy name"
                className="md:col-span-2"
                labelClassName="font-semibold text-sm whitespace-nowrap"
                tooltip="A descriptive name for the policy."
            />
            
            <FormInput
                label="Schema"
                value={policy.schema}
                onChange={(val) => onChange('schema', val)}
                placeholder="public"
                tooltip="The database schema (default: public)."
            />

            <FormInput
                label="Table Name"
                value={policy.table}
                onChange={(val) => onChange('table', val)}
                placeholder="table_name"
                tooltip="The table this policy applies to."
            />

            <FormSelect
                label="Policy Type"
                value={policy.as}
                onChange={(val) => onChange('as', val)}
                options={[...POLICY_TYPES]}
                tooltip="PERMISSIVE (additive) or RESTRICTIVE (must pass)."
            />

            <FormSelect
                label="Command"
                value={policy.for}
                onChange={(val) => onChange('for', val)}
                options={[...COMMAND_TYPES]}
                tooltip="The operation this policy applies to (SELECT, INSERT, etc.)."
            />
        </div>
    );
};

export default GeneralInfo;
