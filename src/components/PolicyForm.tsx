import type { CreatePolicy } from "../types/createPolicy";
import GeneralInfo from "./policy-form/GeneralInfo";
import PolicyRules from "./policy-form/PolicyRules";

interface PolicyFormProps {
    policy: CreatePolicy;
    onChange: (field: keyof CreatePolicy, value: string) => void;
}

const PolicyForm = ({ policy, onChange }: PolicyFormProps) => {
    return (
        <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
                <h2 className="card-title text-3xl mb-6 text-base-content">Policy Configuration</h2>
                <GeneralInfo policy={policy} onChange={onChange} />
                <PolicyRules policy={policy} onChange={onChange} />
            </div>
        </div>
    );
};

export default PolicyForm;
