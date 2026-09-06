import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'current' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'accent' | 'muted' | 'gold';
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
  xl: 3.5,
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'gold',
  label,
  labelClassName,
  spinnerClassName,
  className,
  ...props
}) => {
  const colorClass =
    color === 'gold' || color === 'primary' || color === 'accent'
      ? 'text-[#eedc9a]'
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
        {/* Pure circular SVG with zero blur/drop-shadow box artifacts */}
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
            strokeDasharray="75 145"
            strokeDashoffset="0"
            className="opacity-90"
          />
        </svg>
      </div>

      {label && (
        <span
          className={cn(
            'text-xs md:text-sm tracking-[0.2em] font-medium text-[#eedc9a]/90 font-montserrat',
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};
