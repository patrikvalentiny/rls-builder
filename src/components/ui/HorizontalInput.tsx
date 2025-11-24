import Tooltip from "./Tooltip";

interface HorizontalInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    tooltip?: string;
}

const HorizontalInput = ({ label, value, onChange, placeholder, tooltip }: HorizontalInputProps) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="md:w-1/3 font-semibold text-sm flex items-center">
                {label}
                {tooltip && <Tooltip text={tooltip} />}
            </label>
            <input
                type="text"
                className="input input-bordered input-primary focus:input-primary-focus flex-1"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
};

export default HorizontalInput;
