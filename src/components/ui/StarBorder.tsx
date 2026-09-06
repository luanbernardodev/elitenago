import React from 'react';

export type StarBorderProps<T extends React.ElementType = 'span'> = {
  as?: T;
  className?: string;
  innerClassName?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties['animationDuration'];
  thickness?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'color' | 'children'>;

export const StarBorder = <T extends React.ElementType = 'span'>({
  as,
  className = '',
  innerClassName = '',
  color = 'rgba(255, 255, 255, 0.9)',
  speed = '4s',
  thickness = 1,
  backgroundColor = 'rgba(10, 10, 14, 0.85)',
  textColor = '#ffffff',
  borderColor = 'rgba(255, 255, 255, 0.15)',
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = as || 'span';

  return (
    <Component
      className={`relative inline-flex overflow-hidden rounded-full ${className}`.trim()}
      {...(rest as any)}
      style={{
        padding: `${thickness}px`,
        ...(rest as any).style,
      }}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-75 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[300%] h-[50%] opacity-75 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className={`relative z-10 border text-center rounded-full flex items-center justify-center gap-1.5 transition-all ${innerClassName}`.trim()}
        style={{ background: backgroundColor, color: textColor, borderColor }}
      >
        {children}
      </div>
    </Component>
  );
};

export default StarBorder;
