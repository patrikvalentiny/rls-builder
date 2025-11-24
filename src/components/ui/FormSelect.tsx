interface FormSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
}

const FormSelect = ({ label, value, onChange, options }: FormSelectProps) => {
    return (
        <div className="form-control">
            <label className="label">
                <span className="label-text font-semibold">{label}</span>
            </label>
            <select
                className="select select-bordered select-primary focus:select-primary-focus"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
};

export default FormSelect;
