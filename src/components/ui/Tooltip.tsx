interface TooltipProps {
    text: string;
}

const Tooltip = ({ text }: TooltipProps) => {
    return (
        <div className="tooltip tooltip-right ml-2" data-tip={text}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 cursor-help opacity-70 hover:opacity-100">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
        </div>
    );
};

export default Tooltip;
