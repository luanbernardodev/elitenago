"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

export interface StatefulButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => Promise<any> | any;
  className?: string;
  loadingText?: string;
  successText?: string;
  resetDelay?: number;
}

export const Button = React.forwardRef<HTMLButtonElement, StatefulButtonProps>(
  (
    {
      children,
      onClick,
      className = "",
      disabled,
      type = "button",
      loadingText = "Enviando...",
      successText = "Enviado com Sucesso!",
      resetDelay = 3500,
      ...props
    },
    ref
  ) => {
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (status === "loading" || disabled) return;

      if (onClick) {
        try {
          setStatus("loading");
          const result = onClick(e);
          if (result instanceof Promise) {
            await result;
          } else {
            await new Promise((resolve) => setTimeout(resolve, 1500));
          }
          setStatus("success");

          if (resetDelay > 0) {
            setTimeout(() => {
              setStatus("idle");
            }, resetDelay);
          }
        } catch (error) {
          console.error("Stateful button action failed:", error);
          setStatus("idle");
        }
      }
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={status === "loading" || disabled}
        layout
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        className={`relative inline-flex items-center justify-center font-syne text-xs sm:text-sm font-black uppercase tracking-wider rounded-full px-6 py-4 cursor-pointer select-none transition-colors duration-300 border active:scale-98 ${
          status === "success"
            ? "bg-[#1DB954] hover:bg-[#1ed760] text-black border-[#1DB954] shadow-[0_0_30px_rgba(29,185,84,0.45)]"
            : status === "loading"
            ? "bg-white text-neutral-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-wait"
            : "bg-white text-neutral-950 border-white/90 hover:bg-[#EEDC9A] hover:border-[#EEDC9A] hover:shadow-[0_0_25px_rgba(238,220,154,0.4)]"
        } ${className}`.trim()}
        {...(props as any)}
      >
        <AnimatePresence mode="wait" initial={false}>
          {status === "idle" && (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center gap-2"
            >
              {children}
            </motion.span>
          )}

          {status === "loading" && (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center gap-2.5 font-bold"
            >
              <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
              <span>{loadingText}</span>
            </motion.span>
          )}

          {status === "success" && (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 20,
              }}
              className="flex items-center justify-center gap-2 font-black text-black"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 600 }}
                className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center shadow-sm"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </motion.div>
              <span>{successText}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }
);

Button.displayName = "StatefulButton";

export default Button;
