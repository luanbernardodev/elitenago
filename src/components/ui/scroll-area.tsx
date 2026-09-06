import React from 'react';

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export default ScrollArea;
