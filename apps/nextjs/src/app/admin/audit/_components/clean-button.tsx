"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@descope-trust-center/ui/button";

import { useTRPC } from "~/trpc/react";

export function CleanButton() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isCleaning, setIsCleaning] = useState(false);

  const handleClean = async () => {
    if (
      !confirm(
        "Are you sure you want to clean old audit logs? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsCleaning(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = (await (trpc.audit as any).clean.mutate({
        daysOld: 90,
      })) as {
        deletedCount: number | null;
        cutoffDate: string;
      };
      alert(
        `Cleaned ${result.deletedCount ?? 0} audit logs older than ${result.cutoffDate}`,
      );
      // Refresh the audit data
      await queryClient.invalidateQueries({
        queryKey: trpc.audit.list.queryKey(),
      });
      await queryClient.invalidateQueries({
        queryKey: trpc.audit.getStats.queryKey(),
      });
    } catch (error) {
      console.error("Clean failed:", error);
      alert("Failed to clean audit logs");
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <Button
      onClick={handleClean}
      disabled={isCleaning}
      variant="destructive"
      size="sm"
    >
      {isCleaning ? "Cleaning..." : "Clean Old Logs"}
    </Button>
  );
}
