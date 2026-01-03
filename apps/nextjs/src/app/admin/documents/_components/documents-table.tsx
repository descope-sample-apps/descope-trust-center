"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@descope-trust-center/ui/button";

import { useTRPC } from "~/trpc/react";

export function DocumentsTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery(
    trpc.adminContent.getDocuments.queryOptions(),
  );

  const publishMutation = useMutation({
    ...trpc.adminContent.publishDocument.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: trpc.adminContent.getDocuments.queryKey(),
      });
    },
  });

  const deleteMutation = useMutation({
    ...trpc.adminContent.deleteDocument.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: trpc.adminContent.getDocuments.queryKey(),
      });
    },
  });

  const handlePublishToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    publishMutation.mutate({ id, publishStatus: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
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
          <h3 className="text-lg font-semibold">All Documents</h3>
          <Button>Add Document</Button>
        </div>
      </div>

      <div className="p-4">
        {documents?.length === 0 ? (
          <p className="text-muted-foreground">No documents found.</p>
        ) : (
          <div className="space-y-4">
            {documents?.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between border-b pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{document.title}</h4>
                  <p className="text-muted-foreground text-sm">
                    Category: {document.category} | Access:{" "}
                    {document.accessLevel}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Status: {document.publishStatus} | Size:{" "}
                    {document.fileSize || "N/A"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePublishToggle(document.id, document.publishStatus)
                    }
                  >
                    {document.publishStatus === "published"
                      ? "Unpublish"
                      : "Publish"}
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(document.id)}
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
