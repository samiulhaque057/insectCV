import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("bg-gradient-to-br from-slate-900/70 to-slate-800/40", className)}>
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-start justify-between gap-2">
                   <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-tight break-words">
              {title}
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-50">{value}</p>
            {description && (
               <p className="text-xs sm:text-sm text-slate-300/90 leading-tight break-words">
                {description}
              </p>
            )}
            {trend && (
              <p
                className={cn(
                  "text-xs sm:text-sm font-medium",
                  trend.value >= 0 ? "text-emerald-300" : "text-rose-300"
                )}
              >
                {trend.value >= 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/25 to-indigo-500/25 border border-cyan-300/20 p-2 sm:p-3 shrink-0">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-cyan-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
