"use client";
import React, { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GooeyInputClassNames {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
}

export interface GooeyInputProps {
  placeholder?: string;
  className?: string;
  classNames?: GooeyInputClassNames;
  collapsedWidth?: number;
  expandedWidth?: number | string;
  expandedOffset?: number;
  gooeyBlur?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export const GooeyInput: React.FC<GooeyInputProps> = ({
  placeholder = "Search...",
  className,
  classNames,
  collapsedWidth = 130,
  expandedWidth = "min(520px, 85vw)",
  expandedOffset = 48,
  gooeyBlur = 5,
  value: controlledValue,
  defaultValue = "",
  onChange,
  onValueChange,
  onOpenChange,
  onClear,
  disabled = false,
}) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = isControlled ? controlledValue : internalValue;

  const [isOpen, setIsOpen] = useState(Boolean(currentValue));
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterId = useId().replace(/:/g, "_");

  // Keep open if text exists
  useEffect(() => {
    if (currentValue && !isOpen) {
      setIsOpen(true);
      onOpenChange?.(true);
    }
  }, [currentValue, isOpen, onOpenChange]);

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    onOpenChange?.(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleClose = () => {
    if (!currentValue) {
      setIsOpen(false);
      onOpenChange?.(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isControlled) {
      setInternalValue(val);
    }
    onChange?.(e);
    onValueChange?.(val);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isControlled) {
      setInternalValue("");
    }
    if (onChange) {
      const syntheticEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
    onValueChange?.("");
    onClear?.();
    inputRef.current?.focus();
  };

  // Close on outside click if empty
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (!currentValue) {
          setIsOpen(false);
          onOpenChange?.(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [currentValue, onOpenChange]);

  const targetExpandedWidth =
    typeof expandedWidth === "number" ? `${expandedWidth}px` : expandedWidth;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center py-2 select-none",
        classNames?.root,
        className
      )}
    >
      {/* SVG Gooey Filter */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={`gooey-filter-${filterId}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyBlur} result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Outer wrapper with filter */}
      <div
        className={cn("relative flex items-center justify-center", classNames?.filterWrap)}
        style={{ filter: `url(#gooey-filter-${filterId})` }}
      >
        {/* Detaching Bubble / Search Icon */}
        <motion.div
          animate={{
            x: isOpen ? -expandedOffset : 0,
            scale: isOpen ? 1 : 0.95,
          }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 28,
            mass: 0.8,
          }}
          onClick={handleOpen}
          className={cn(
            "relative z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-lg cursor-pointer",
            classNames?.bubble,
            classNames?.bubbleSurface
          )}
        >
          <Search className="h-4 w-4 text-neutral-800" />
        </motion.div>

        {/* Morphing Input Body */}
        <motion.div
          animate={{
            width: isOpen ? targetExpandedWidth : `${collapsedWidth}px`,
            x: isOpen ? expandedOffset / 2 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 28,
            mass: 0.8,
          }}
          onClick={!isOpen ? handleOpen : undefined}
          className={cn(
            "absolute flex h-11 items-center rounded-full bg-white text-neutral-900 shadow-lg overflow-hidden transition-colors cursor-pointer",
            isOpen && "cursor-text",
            classNames?.buttonRow
          )}
          style={{ maxWidth: "min(92vw, 560px)" }}
        >
          {!isOpen ? (
            <div className="flex h-full w-full items-center justify-center pl-7 pr-4 text-xs font-semibold text-neutral-700 font-syne tracking-wide">
              {placeholder}
            </div>
          ) : (
            <div className="flex h-full w-full items-center px-4">
              <input
                ref={inputRef}
                type="text"
                value={currentValue}
                onChange={handleInputChange}
                onBlur={handleClose}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "w-full bg-transparent text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none",
                  classNames?.input
                )}
              />

              <AnimatePresence>
                {currentValue && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    type="button"
                    onClick={handleClear}
                    className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-600 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GooeyInput;
