import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';

export interface GooeyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  className?: string;
}

export const GooeyInput: React.FC<GooeyInputProps> = ({
  placeholder = 'Pesquisar notícias, eventos, workshops...',
  value,
  onChange,
  onClear,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = Boolean(value && value.length > 0);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      const syntheticEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center justify-center w-full max-w-xl mx-auto ${className}`}>
      {/* SVG Gooey Filter definition */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Ambient background glow */}
      <motion.div
        animate={{
          scale: isFocused ? 1.03 : 1,
          opacity: isFocused ? 0.9 : 0.4,
        }}
        transition={{ duration: 0.3 }}
        className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-600/30 blur-xl pointer-events-none"
      />

      {/* Main interactive search container */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        className={`relative w-full flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#0c0c0f]/90 border transition-colors duration-300 shadow-2xl backdrop-blur-xl ${
          isFocused
            ? 'border-amber-500/70 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
            : 'border-white/10 hover:border-amber-500/40'
        }`}
      >
        {/* Search Icon with subtle pulse animation */}
        <motion.div
          animate={{
            scale: isFocused ? [1, 1.15, 1] : 1,
            color: isFocused ? '#fbbf24' : '#9ca3af',
          }}
          transition={{ duration: 0.3 }}
          className="shrink-0 flex items-center justify-center text-neutral-400"
        >
          <Search className="w-5 h-5 text-amber-400" />
        </motion.div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm sm:text-base text-white placeholder-neutral-500 font-medium focus:outline-none tracking-wide"
          {...props}
        />

        {/* Clear Button */}
        <AnimatePresence>
          {hasValue && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleClear}
              type="button"
              className="p-1 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black text-neutral-400 transition-colors cursor-pointer shrink-0"
              aria-label="Limpar pesquisa"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default GooeyInput;
