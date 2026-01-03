"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@descope-trust-center/ui/button";

import { useTRPC } from "~/trpc/react";

export function SubprocessorsTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: subprocessors, isLoading } = useQuery(
    trpc.adminContent.getSubprocessors.queryOptions(),
  );

  const publishMutation = useMutation({
    ...trpc.adminContent.publishSubprocessor.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: trpc.adminContent.getSubprocessors.queryKey(),
      });
    },
  });

  const deleteMutation = useMutation({
    ...trpc.adminContent.deleteSubprocessor.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: trpc.adminContent.getSubprocessors.queryKey(),
      });
    },
  });

  const handlePublishToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    publishMutation.mutate({ id, publishStatus: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subprocessor?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-card rounded-lg border">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">All Subprocessors</h3>
          <Button>Add Subprocessor</Button>
        </div>
      </div>

      <div className="p-4">
        {subprocessors?.length === 0 ? (
          <p className="text-muted-foreground">No subprocessors found.</p>
        ) : (
          <div className="space-y-4">
            {subprocessors?.map((subprocessor) => (
              <div
                key={subprocessor.id}
                className="flex items-center justify-between border-b pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{subprocessor.name}</h4>
                  <p className="text-muted-foreground text-sm">
                    Location: {subprocessor.location} | Status:{" "}
                    {subprocessor.status}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Publish: {subprocessor.publishStatus}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePublishToggle(
                        subprocessor.id,
                        subprocessor.publishStatus,
                      )
                    }
                  >
                    {subprocessor.publishStatus === "published"
                      ? "Unpublish"
                      : "Publish"}
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(subprocessor.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
