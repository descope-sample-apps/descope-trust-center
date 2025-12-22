import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LoadingState, LoadingSpinner } from "@/components/ui/loading";
import { ErrorDisplay, InlineError } from "@/components/ui/error-display";
import { useRef, useState, type FormEvent } from "react";

export function APITester() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const testEndpoint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const endpoint = formData.get("endpoint") as string;
      
      if (!endpoint) {
        throw new Error("Endpoint is required");
      }
      
      const url = new URL(endpoint, location.href);
      const method = formData.get("method") as string;
      
      const res = await fetch(url, { method });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }

      const data = await res.json();
      responseInputRef.current!.value = JSON.stringify(data, null, 2);
    } catch (error) {
      const errorMessage = error instanceof Error ? error : String(error);
      setError(errorMessage);
      responseInputRef.current!.value = JSON.stringify(
        { 
          error: true, 
          message: errorMessage instanceof Error ? errorMessage.message : errorMessage,
          timestamp: new Date().toISOString()
        }, 
        null, 
        2
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    const form = document.querySelector("form") as HTMLFormElement;
    if (form) {
      form.dispatchEvent(new Event("submit", { cancelable: true }));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={testEndpoint} className="flex items-center gap-2">
        <Label htmlFor="method" className="sr-only">
          Method
        </Label>
        <Select name="method" defaultValue="GET">
          <SelectTrigger className="w-[100px]" id="method">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
          </SelectContent>
        </Select>
        <Label htmlFor="endpoint" className="sr-only">
          Endpoint
        </Label>
        <Input id="endpoint" type="text" name="endpoint" defaultValue="/api/hello" placeholder="/api/hello" />
        <Button type="submit" variant="secondary">
          Send
        </Button>
      </form>
      <Label htmlFor="response" className="sr-only">
        Response
      </Label>
      <Textarea
        ref={responseInputRef}
        id="response"
        readOnly
        placeholder="Response will appear here..."
        className="min-h-[140px] font-mono resize-y"
      />
    </div>
  );
}
