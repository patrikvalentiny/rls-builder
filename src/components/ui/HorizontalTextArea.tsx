interface HorizontalTextAreaProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    className?: string;
    labelClassName?: string;
    alignTop?: boolean;
}

const HorizontalTextArea = ({ 
    label, 
    value, 
    onChange, 
    placeholder, 
    rows = 2, 
    className = "",
    labelClassName = "md:w-1/3 font-semibold text-sm",
    alignTop = false
}: HorizontalTextAreaProps) => {
    return (
        <div className={`form-control flex flex-col md:flex-row gap-4 ${alignTop ? 'md:items-start' : 'md:items-center'} ${className}`}>
            <label className={`${labelClassName} ${alignTop ? 'pt-3' : ''}`}>{label}</label>
            <textarea
                className="textarea textarea-bordered textarea-primary focus:textarea-primary-focus flex-1"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
            />
        </div>
    );
};

export default HorizontalTextArea;
