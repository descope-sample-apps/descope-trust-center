"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@descope-trust-center/ui/button";

import { useTRPC } from "~/trpc/react";

export function CertificationsTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: certifications, isLoading } = useQuery(
    trpc.adminContent.getCertifications.queryOptions(),
  );

  const publishMutation = useMutation({
    ...trpc.adminContent.publishCertification.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.adminContent.getCertifications.queryKey(),
      });
    },
  });

  const deleteMutation = useMutation({
    ...trpc.adminContent.deleteCertification.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.adminContent.getCertifications.queryKey(),
      });
    },
  });

  const handlePublishToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    publishMutation.mutate({ id, publishStatus: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this certification?")) {
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
          <h3 className="text-lg font-semibold">All Certifications</h3>
          <Button>Add Certification</Button>
        </div>
      </div>

      <div className="p-4">
        {certifications?.length === 0 ? (
          <p className="text-muted-foreground">No certifications found.</p>
        ) : (
          <div className="space-y-4">
            {certifications?.map((certification) => (
              <div
                key={certification.id}
                className="flex items-center justify-between border-b pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{certification.name}</h4>
                  <p className="text-muted-foreground text-sm">
                    Status: {certification.status} | Publish:{" "}
                    {certification.publishStatus}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Expires:{" "}
                    {certification.expiryDate
                      ? new Date(certification.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePublishToggle(
                        certification.id,
                        certification.publishStatus,
                      )
                    }
                  >
                    {certification.publishStatus === "published"
                      ? "Unpublish"
                      : "Publish"}
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(certification.id)}
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
