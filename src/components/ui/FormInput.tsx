interface FormInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const FormInput = ({ label, value, onChange, placeholder }: FormInputProps) => {
    return (
        <div className="form-control">
            <label className="label">
                <span className="label-text font-semibold">{label}</span>
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
