import React from "react";
import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  onClick,
  children,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "row-span-1 rounded-3xl group/bento transition duration-300",
        onClick ? "cursor-pointer" : "",
        className
      )}
    >
      {children ? (
        children
      ) : (
        <div className="h-full flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-[#08080a] border border-white/10 group-hover/bento:border-white/25 shadow-xl transition-all">
          {header}
          <div className="group-hover/bento:translate-x-1 transition duration-200 mt-4">
            {icon}
            <div className="font-syne font-bold text-white text-lg sm:text-xl mb-2 mt-2 group-hover/bento:text-amber-400 transition-colors">
              {title}
            </div>
            <div className="font-light text-neutral-300 text-xs sm:text-sm leading-relaxed">
              {description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BentoGrid;
