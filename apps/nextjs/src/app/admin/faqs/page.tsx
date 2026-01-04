"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

interface FaqType {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: "draft" | "published";
}

export default function FAQsPage() {
  const trpc = useTRPC();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqType | null>(null);

  const {
    data: faqs,
    isLoading,
    refetch,
  } = useQuery(trpc.admin.faqs.getAll.queryOptions());

  const createMutation = useMutation(
    trpc.admin.faqs.create.mutationOptions({
      onSuccess: () => {
        void refetch();
        setIsModalOpen(false);
        setEditingFaq(null);
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.admin.faqs.update.mutationOptions({
      onSuccess: () => {
        void refetch();
        setIsModalOpen(false);
        setEditingFaq(null);
      },
    }),
  );

  const publishMutation = useMutation(
    trpc.admin.faqs.publish.mutationOptions({
      onSuccess: () => void refetch(),
    }),
  );

  const unpublishMutation = useMutation(
    trpc.admin.faqs.unpublish.mutationOptions({
      onSuccess: () => void refetch(),
    }),
  );

  const deleteMutation = useMutation(
    trpc.admin.faqs.delete.mutationOptions({
      onSuccess: () => void refetch(),
    }),
  );

  const handleAdd = () => {
    setEditingFaq(null);
    setIsModalOpen(true);
  };

  const handleEdit = (faq: FaqType) => {
    setEditingFaq(faq);
    setIsModalOpen(true);
  };

  const handlePublish = (id: string) => {
    publishMutation.mutate({ id });
  };

  const handleUnpublish = (id: string) => {
    unpublishMutation.mutate({ id });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (formData: FormData) => {
    const data = {
      id: formData.get("id") as string,
      question: formData.get("question") as string,
      answer: formData.get("answer") as string,
      category: formData.get("category") as
        | "security"
        | "compliance"
        | "privacy"
        | "data-handling"
        | "authentication",
      status: formData.get("status") as "draft" | "published",
    };

    if (editingFaq) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">FAQs</h2>
        <button
          onClick={handleAdd}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add FAQ
        </button>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {(faqs as FaqType[])?.map((faq) => (
            <li key={faq.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {faq.question}
                      </div>
                      <div className="text-sm text-gray-500">
                        {faq.category} • {faq.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    {faq.status === "draft" ? (
                      <button
                        onClick={() => handlePublish(faq.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnpublish(faq.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {isModalOpen && (
        <FAQModal
          faq={editingFaq}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending ?? updateMutation.isPending}
        />
      )}
    </div>
  );
}

function FAQModal({
  faq,
  onClose,
  onSubmit,
  isLoading,
}: {
  faq: FaqType | null;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h3 className="text-lg font-medium text-gray-900">
          {faq ? "Edit FAQ" : "Add FAQ"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID
            </label>
            <input
              name="id"
              type="text"
              defaultValue={faq?.id ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Question
            </label>
            <input
              name="question"
              type="text"
              defaultValue={faq?.question ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Answer
            </label>
            <textarea
              name="answer"
              defaultValue={faq?.answer ?? ""}
              required
              rows={4}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              defaultValue={faq?.category ?? "security"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="security">Security</option>
              <option value="compliance">Compliance</option>
              <option value="privacy">Privacy</option>
              <option value="data-handling">Data Handling</option>
              <option value="authentication">Authentication</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              defaultValue={faq?.status || "draft"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
