import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'current' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent' | 'muted';
  label?: React.ReactNode;
  labelClassName?: string;
  spinnerClassName?: string;
}

const sizeMap: Record<string, string> = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-11 h-11',
  xl: 'w-16 h-16',
};

const strokeMap: Record<string, number> = {
  sm: 3,
  md: 3.5,
  lg: 3.5,
  xl: 4,
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label,
  labelClassName,
  spinnerClassName,
  className,
  ...props
}) => {
  const colorClass =
    color === 'primary' || color === 'accent'
      ? 'text-amber-400'
      : color === 'success'
      ? 'text-emerald-400'
      : color === 'warning'
      ? 'text-yellow-400'
      : color === 'danger'
      ? 'text-rose-500'
      : color === 'secondary'
      ? 'text-purple-400'
      : color === 'muted'
      ? 'text-neutral-500'
      : 'text-current';

  return (
    <div
      className={cn('inline-flex flex-col items-center justify-center gap-3', className)}
      {...props}
    >
      <div className={cn('relative flex items-center justify-center', sizeMap[size] || sizeMap.md, colorClass, spinnerClassName)}>
        {/* Subtle Ambient Glow for XL & LG */}
        {(size === 'xl' || size === 'lg') && (
          <div className="absolute inset-0 rounded-full bg-amber-400/15 blur-xl pointer-events-none" />
        )}

        {/* HeroUI / NextUI Signature Double-Track Smooth Spinner */}
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Background Track Ring */}
          <circle
            cx="24"
            cy="24"
            r="19"
            stroke="currentColor"
            strokeWidth={strokeMap[size] || 3.5}
            strokeLinecap="round"
            className="opacity-20"
          />
          {/* Dynamic Foreground Spinning Arc */}
          <circle
            cx="24"
            cy="24"
            r="19"
            stroke="currentColor"
            strokeWidth={strokeMap[size] || 3.5}
            strokeLinecap="round"
            strokeDasharray="80 140"
            strokeDashoffset="0"
            className="opacity-95 drop-shadow-[0_0_8px_currentColor]"
          />
        </svg>
      </div>

      {label && (
        <span
          className={cn(
            'text-sm tracking-wider font-medium text-amber-200/90 font-montserrat',
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};
