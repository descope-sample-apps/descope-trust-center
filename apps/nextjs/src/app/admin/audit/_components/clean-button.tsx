"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@descope-trust-center/ui/button";

import { useTRPC } from "~/trpc/react";

export function CleanButton() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const cleanMutation = useMutation(
    trpc.audit.clean.mutationOptions({
      onSuccess: (result) => {
        alert(`Successfully deleted ${result.deletedCount} old audit logs.`);
        // Refresh the stats and list
        void queryClient.invalidateQueries({
          queryKey: trpc.audit.getStats.queryKey(),
        });
        void queryClient.invalidateQueries({
          queryKey: trpc.audit.list.queryKey(),
        });
      },
      onError: (error) => {
        console.error("Clean failed:", error);
        alert("Failed to clean audit logs. Please try again.");
      },
    }),
  );

  const handleClean = () => {
    if (
      !confirm(
        "Are you sure you want to delete old audit logs? This action cannot be undone.",
      )
    ) {
      return;
    }
    cleanMutation.mutate({ days: 90 });
  };

  return (
    <Button
      onClick={handleClean}
      disabled={cleanMutation.isPending}
      variant="destructive"
    >
      {cleanMutation.isPending ? "Cleaning..." : "Clean Old Logs"}
    </Button>
  );
}
