import React from 'react';
import { ArrowRight } from 'lucide-react';

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  text?: string;
  className?: string;
  variant?: 'primary' | 'white' | 'outline' | 'dark';
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, text, className = '', onClick, type = 'button', variant = 'primary', ...props }, ref) => {
  const content = children || text || 'Clique Aqui';

  let baseStyles = '';
  let slideBg = '';
  let defaultTextColor = '';
  let hoverTextColor = '';
  let arrowColor = '';

  if (variant === 'outline') {
    baseStyles =
      'border border-white/20 bg-black/50 text-white shadow-sm hover:border-[#EEDC9A] hover:shadow-[0_0_20px_rgba(238,220,154,0.35)]';
    slideBg = 'bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887]';
    defaultTextColor = 'text-white';
    hoverTextColor = 'text-black';
    arrowColor = 'text-black';
  } else {
    // Default & White: White button with Soft Golden Champagne hover effect
    baseStyles =
      'border border-white/95 bg-white text-neutral-950 shadow-[0_2px_12px_rgba(255,255,255,0.12)] hover:border-[#EEDC9A] hover:shadow-[0_0_22px_rgba(238,220,154,0.4)]';
    slideBg = 'bg-gradient-to-r from-[#F6E7B8] via-[#EED89F] to-[#E3C887]';
    defaultTextColor = 'text-neutral-950';
    hoverTextColor = 'text-black';
    arrowColor = 'text-black';
  }

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center cursor-pointer overflow-hidden rounded-full px-5 py-2.5 text-center font-syne text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 ${baseStyles} ${className}`.trim()}
      {...props}
    >
      {/* Expanding hover backdrop */}
      <span className={`absolute inset-0 ${slideBg} translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-full`} />

      {/* Default visible text layer */}
      <span className={`relative z-10 flex items-center justify-center gap-1.5 group-hover:opacity-0 transition-opacity duration-200 font-extrabold ${defaultTextColor}`}>
        {content}
      </span>

      {/* Hover reveal text layer with Arrow */}
      <span className={`absolute inset-0 z-20 flex items-center justify-center gap-1.5 font-extrabold opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${hoverTextColor}`}>
        <span>{content}</span>
        <ArrowRight className={`w-3.5 h-3.5 ${arrowColor} transform group-hover:translate-x-1 transition-transform duration-300 shrink-0`} />
      </span>
    </button>
  );
});

InteractiveHoverButton.displayName = 'InteractiveHoverButton';

export default InteractiveHoverButton;
