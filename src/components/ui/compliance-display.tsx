import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ComplianceItem {
  id: string;
  name: string;
  status: "compliant" | "non-compliant" | "pending" | "partial";
  description?: string;
  lastChecked?: Date;
  score?: number;
  details?: string[];
}

interface ComplianceDisplayProps {
  title?: string;
  description?: string;
  items: ComplianceItem[];
  overallScore?: number;
  lastUpdated?: Date;
  className?: string;
}

const statusColors = {
  compliant: "bg-green-100 text-green-800 border-green-200",
  "non-compliant": "bg-red-100 text-red-800 border-red-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  partial: "bg-orange-100 text-orange-800 border-orange-200",
};

const statusIcons = {
  compliant: "✓",
  "non-compliant": "✗",
  pending: "⏳",
  partial: "⚠",
};

function ComplianceStatusBadge({ status }: { status: ComplianceItem["status"] }) {
  return (
    <Badge className={cn("border", statusColors[status])}>
      <span className="mr-1">{statusIcons[status]}</span>
      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
    </Badge>
  );
}

function ComplianceProgressBar({ score }: { score?: number }) {
  if (typeof score !== "number") return null;

  const getColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-yellow-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Compliance Score</span>
        <span className="font-medium">{score}%</span>
      </div>
      <Progress value={score} className="h-2" />
    </div>
  );
}

export function ComplianceDisplay({
  title = "Compliance Status",
  description,
  items,
  overallScore,
  lastUpdated,
  className,
}: ComplianceDisplayProps) {
  const statusCounts = items.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    {} as Record<ComplianceItem["status"], number>,
  );

  const getOverallStatus = (): ComplianceItem["status"] => {
    if (statusCounts["non-compliant"] > 0) return "non-compliant";
    if (statusCounts.pending > 0) return "pending";
    if (statusCounts.partial > 0) return "partial";
    return "compliant";
  };

  return (
    <Card className={cn("w-full max-w-4xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description && <CardDescription className="mt-2">{description}</CardDescription>}
          </div>
          <ComplianceStatusBadge status={getOverallStatus()} />
        </div>
        
        {typeof overallScore === "number" && (
          <ComplianceProgressBar score={overallScore} />
        )}
        
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleDateString()} {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {typeof item.score === "number" && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{item.score}%</div>
                      <Progress value={item.score} className="w-16 h-1 mt-1" />
                    </div>
                  )}
                  <ComplianceStatusBadge status={item.status} />
                </div>
              </div>

              {item.lastChecked && (
                <p className="text-xs text-muted-foreground">
                  Last checked: {item.lastChecked.toLocaleDateString()}
                </p>
              )}

              {item.details && item.details.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Details</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {item.details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground mt-0.5">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {Object.keys(statusCounts).length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {status.replace("-", " ")}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export { type ComplianceDisplayProps, type ComplianceItem };