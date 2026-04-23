import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-green-100 text-green-800",
        secondary:
          "border-transparent bg-slate-100 text-slate-800",
        destructive:
          "border-transparent bg-red-100 text-red-800",
        outline: "text-slate-700 border-slate-300",
        harmful:
          "border-transparent bg-red-100 text-red-800",
        harmless:
          "border-transparent bg-green-100 text-green-800",
        unknown:
          "border-transparent bg-purple-100 text-purple-800",
        pending:
          "border-transparent bg-amber-100 text-amber-800",
        annotated:
          "border-transparent bg-blue-100 text-blue-800",
        verified:
          "border-transparent bg-green-100 text-green-800",
        exported:
          "border-transparent bg-violet-100 text-violet-800",
        rejected:
          "border-transparent bg-red-100 text-red-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
