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
  triggerLabel?: string;
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
  placeholder = "Digite para pesquisar...",
  triggerLabel = "Pesquisar",
  className,
  classNames,
  collapsedWidth = 130,
  expandedWidth = "min(400px, calc(100vw - 80px))",
  expandedOffset = 26,
  gooeyBlur = 3.5,
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
  const currentValue = isControlled ? (controlledValue ?? "") : internalValue;

  const [isOpen, setIsOpen] = useState(Boolean(currentValue && currentValue.length > 0));
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterId = useId().replace(/:/g, "_");

  // Keep open if text exists
  useEffect(() => {
    if (currentValue && currentValue.length > 0 && !isOpen) {
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
    }, 80);
  };

  const handleClose = () => {
    if (!currentValue || currentValue.length === 0) {
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
        if (!currentValue || currentValue.length === 0) {
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
        "relative flex items-center justify-center py-3 w-full max-w-full select-none",
        classNames?.root,
        className
      )}
    >
      {/* SVG Gooey Filter */}
      <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={`gooey-filter-${filterId}`} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation={gooeyBlur} result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Filter wrap containing the gooey animated elements */}
      <div
        className={cn(
          "relative flex items-center justify-center h-11",
          classNames?.filterWrap
        )}
        style={{ filter: `url(#gooey-filter-${filterId})` }}
      >
        {/* Detaching Circular Bubble with Search Icon */}
        <motion.div
          animate={{
            x: isOpen ? -expandedOffset : 0,
            opacity: isOpen ? 1 : 0,
            scale: isOpen ? 1 : 0.5,
            pointerEvents: isOpen ? "auto" : "none",
          }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 28,
            mass: 0.7,
          }}
          onClick={handleOpen}
          className={cn(
            "absolute left-0 z-20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md cursor-pointer",
            classNames?.bubble,
            classNames?.bubbleSurface
          )}
          aria-hidden={!isOpen}
        >
          <Search className="h-4 w-4 text-neutral-900" />
        </motion.div>

        {/* Morphing Input Body & Trigger Pill */}
        <motion.div
          animate={{
            width: isOpen ? targetExpandedWidth : `${collapsedWidth}px`,
            x: isOpen ? expandedOffset : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 28,
            mass: 0.7,
          }}
          onClick={!isOpen ? handleOpen : undefined}
          className={cn(
            "relative flex h-10 items-center rounded-full bg-white text-neutral-900 shadow-md overflow-hidden transition-colors cursor-pointer",
            isOpen && "cursor-text",
            classNames?.buttonRow
          )}
        >
          {!isOpen ? (
            /* CLOSED STATE: Clean trigger button with Search Icon + Pesquisar */
            <div className="flex h-full w-full items-center justify-center gap-2 px-3.5 text-xs font-bold uppercase tracking-wider text-neutral-900 font-syne whitespace-nowrap select-none hover:opacity-90">
              <Search className="h-3.5 w-3.5 text-neutral-900 shrink-0" />
              <span>{triggerLabel}</span>
            </div>
          ) : (
            /* OPENED STATE: Full input field with placeholder and clear button */
            <div className="flex h-full w-full items-center pl-3.5 pr-2.5">
              <input
                ref={inputRef}
                type="text"
                value={currentValue}
                onChange={handleInputChange}
                onBlur={handleClose}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "w-full bg-transparent text-xs sm:text-sm font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none tracking-wide",
                  classNames?.input
                )}
              />

              <AnimatePresence>
                {currentValue && currentValue.length > 0 && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    type="button"
                    onClick={handleClear}
                    className="ml-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition-colors cursor-pointer"
                    aria-label="Limpar pesquisa"
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
