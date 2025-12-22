import * as React from "react";
import { cn } from "@/lib/utils";

interface LiveRegionProps extends React.HTMLAttributes<HTMLDivElement> {
  polite?: boolean;
  assertive?: boolean;
  atomic?: boolean;
  busy?: boolean;
  children?: React.ReactNode;
}

const LiveRegion = React.forwardRef<HTMLDivElement, LiveRegionProps>(
  ({ 
    className, 
    polite = true, 
    assertive = false, 
    atomic = false, 
    busy = false, 
    children, 
    ...props 
  }, ref) => (
    <div
      ref={ref}
      className={cn("sr-only", className)}
      aria-live={polite ? "polite" : assertive ? "assertive" : "off"}
      aria-atomic={atomic}
      aria-busy={busy}
      {...props}
    >
      {children}
    </div>
  )
);
LiveRegion.displayName = "LiveRegion";

const useAnnounce = () => {
  const [announcement, setAnnouncement] = React.useState<string>("");
  const announceRef = React.useRef<HTMLDivElement>(null);

  const announce = React.useCallback((message: string, options?: {
    priority?: "polite" | "assertive";
    atomic?: boolean;
  }) => {
    setAnnouncement(message);
    
    // Clear the announcement after it's been read
    setTimeout(() => {
      setAnnouncement("");
    }, 1000);
  }, []);

  const Announcer = React.useCallback(() => (
    <LiveRegion 
      ref={announceRef}
      polite={!announcement.includes("error") && !announcement.includes("critical")}
      assertive={announcement.includes("error") || announcement.includes("critical")}
      atomic={true}
    >
      {announcement}
    </LiveRegion>
  ), [announcement]);

  return { announce, Announcer };
};

export { LiveRegion, useAnnounce };