export default function CheckButton({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 focus:ring-2 focus:ring-primary/20 focus:outline-none
        ${checked 
          ? 'border-primary bg-primary text-primary-foreground shadow-sm' 
          : 'border-border hover:border-primary/50 bg-background hover:bg-primary/5'
        }
      `}
    >
      {/* Checkmark with smooth animation */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 transition-all duration-300 ${
          checked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
      
      {/* Subtle hover effect */}
      <div className="absolute inset-0 rounded-lg bg-current opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
    </button>
  );
}

