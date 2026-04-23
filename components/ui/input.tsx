import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-white/20 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors backdrop-blur-sm [&::-webkit-datetime-edit]:text-slate-400 [&::-webkit-datetime-edit-fields-wrapper]:text-slate-400 [&:not(:placeholder-shown)::-webkit-datetime-edit]:text-slate-100 [&:not(:placeholder-shown)::-webkit-datetime-edit-fields-wrapper]:text-slate-100",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
