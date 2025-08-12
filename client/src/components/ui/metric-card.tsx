import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  description,
  icon,
  className
}: MetricCardProps) {
  return (
    <Card className={cn("", className)} data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-neutral-400">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-neutral-800" data-testid={`metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          {value}
        </div>
        {change && (
          <div className={cn(
            "text-xs mt-1 flex items-center",
            changeType === "positive" && "text-secondary",
            changeType === "negative" && "text-danger", 
            changeType === "neutral" && "text-neutral-500"
          )} data-testid={`metric-change-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {changeType === "positive" && <span className="mr-1">↗</span>}
            {changeType === "negative" && <span className="mr-1">↘</span>}
            {change}
          </div>
        )}
        {description && (
          <p className="text-xs text-neutral-500 mt-1" data-testid={`metric-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
