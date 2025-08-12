import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  description?: string;
}

export function ChartCard({ title, children, className, description }: ChartCardProps) {
  return (
    <Card className={cn("", className)} data-testid={`chart-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-neutral-800">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-neutral-600" data-testid={`chart-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
