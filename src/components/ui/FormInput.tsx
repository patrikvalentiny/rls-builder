import Tooltip from "./Tooltip";

interface FormInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    tooltip?: string;
}

const FormInput = ({ label, value, onChange, placeholder, tooltip }: FormInputProps) => {
    return (
        <div className="form-control">
            <label className="label flex justify-start items-center">
                <span className="label-text font-semibold">{label}</span>
                {tooltip && <Tooltip text={tooltip} />}
            </label>
            <input
                type="text"
                className="input input-bordered input-primary focus:input-primary-focus"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};

export default FormInput;
