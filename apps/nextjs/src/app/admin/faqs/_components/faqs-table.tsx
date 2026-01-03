"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@descope-trust-center/ui/button";

import { useTRPC } from "~/trpc/react";

export function FAQsTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: faqs, isLoading } = useQuery(
    trpc.adminContent.getFAQs.queryOptions(),
  );

  const publishMutation = useMutation({
    ...trpc.adminContent.publishFAQ.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: trpc.adminContent.getFAQs.queryKey(),
      });
    },
  });

  const deleteMutation = useMutation({
    ...trpc.adminContent.deleteFAQ.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: trpc.adminContent.getFAQs.queryKey(),
      });
    },
  });

  const handlePublishToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    publishMutation.mutate({ id, publishStatus: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
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
          <h3 className="text-lg font-semibold">All FAQs</h3>
          <Button>Add FAQ</Button>
        </div>
      </div>

      <div className="p-4">
        {faqs?.length === 0 ? (
          <p className="text-muted-foreground">No FAQs found.</p>
        ) : (
          <div className="space-y-4">
            {faqs?.map((faq) => (
              <div
                key={faq.id}
                className="flex items-center justify-between border-b pb-4 last:border-b-0"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{faq.question}</h4>
                  <p className="text-muted-foreground text-sm">
                    Category: {faq.category} | Status: {faq.publishStatus}
                  </p>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {faq.answer.substring(0, 100)}...
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePublishToggle(faq.id, faq.publishStatus)
                    }
                  >
                    {faq.publishStatus === "published"
                      ? "Unpublish"
                      : "Publish"}
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(faq.id)}
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
