import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ 
  title = "Error", 
  message, 
  error, 
  onRetry,
  className 
}: ErrorDisplayProps) {
  const errorMessage = error instanceof Error ? error.message : error;
  const fullMessage = message || errorMessage || "An unexpected error occurred";

  return (
    <Card className={cn("border-destructive/50 bg-destructive/5", className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">{title}</CardTitle>
        </div>
        {fullMessage && (
          <CardDescription>{fullMessage}</CardDescription>
        )}
      </CardHeader>
      {error && (
        <CardContent>
          <details className="text-sm">
            <summary className="cursor-pointer font-mono text-muted-foreground hover:text-foreground">
              Technical details
            </summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground bg-muted p-2 rounded">
              {error instanceof Error ? error.stack || error.toString() : error}
            </pre>
          </details>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-destructive text-sm", className)}>
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}