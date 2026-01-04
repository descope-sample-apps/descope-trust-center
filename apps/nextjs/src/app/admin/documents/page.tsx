"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

interface DocumentType {
  id: string;
  title: string;
  category: string;
  description: string;
  accessLevel: string;
  fileUrl: string | null;
  fileSize: string | null;
  status: string;
  tags: unknown;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export default function DocumentsPage() {
  const trpc = useTRPC();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentType | null>(null);

  const {
    data: documents,
    isLoading,
    refetch,
  } = useQuery(trpc.admin.documents.getAll.queryOptions());

  const createMutation = useMutation(
    trpc.admin.documents.create.mutationOptions({
      onSuccess: () => {
        void refetch();
        setIsModalOpen(false);
        setEditingDoc(null);
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.admin.documents.update.mutationOptions({
      onSuccess: () => {
        void refetch();
        setIsModalOpen(false);
        setEditingDoc(null);
      },
    }),
  );

  const publishMutation = useMutation(
    trpc.admin.documents.publish.mutationOptions({
      onSuccess: () => void refetch(),
    }),
  );

  const unpublishMutation = useMutation(
    trpc.admin.documents.unpublish.mutationOptions({
      onSuccess: () => void refetch(),
    }),
  );

  const deleteMutation = useMutation(
    trpc.admin.documents.delete.mutationOptions({
      onSuccess: () => void refetch(),
    }),
  );

  const handleAdd = () => {
    setEditingDoc(null);
    setIsModalOpen(true);
  };

  const handleEdit = (doc: DocumentType) => {
    setEditingDoc(doc);
    setIsModalOpen(true);
  };

  const handlePublish = (id: string) => {
    publishMutation.mutate({ id });
  };

  const handleUnpublish = (id: string) => {
    unpublishMutation.mutate({ id });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (formData: FormData) => {
    const data = {
      id: formData.get("id") as string,
      title: formData.get("title") as string,
      category: formData.get("category") as
        | "security-policy"
        | "audit-report"
        | "legal"
        | "questionnaire",
      description: formData.get("description") as string,
      accessLevel: formData.get("accessLevel") as
        | "public"
        | "login-required"
        | "nda-required",
      fileUrl: (formData.get("fileUrl") as string) || undefined,
      fileSize: (formData.get("fileSize") as string) || undefined,
      status: formData.get("status") as "draft" | "published",
      tags: JSON.parse(formData.get("tags") as string) as string[],
    };

    if (editingDoc) {
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
        <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
        <button
          onClick={handleAdd}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Document
        </button>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {documents?.map((doc) => (
            <li key={doc.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {doc.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {doc.category} • {doc.accessLevel} • {doc.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(doc)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    {doc.status === "draft" ? (
                      <button
                        onClick={() => handlePublish(doc.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnpublish(doc.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
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
        <DocumentModal
          document={editingDoc}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function DocumentModal({
  document,
  onClose,
  onSubmit,
  isLoading,
}: {
  document: DocumentType | null;
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
          {document ? "Edit Document" : "Add Document"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID
            </label>
            <input
              name="id"
              type="text"
              defaultValue={document?.id ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              name="title"
              type="text"
              defaultValue={document?.title ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              defaultValue={document?.category ?? "security-policy"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="security-policy">Security Policy</option>
              <option value="audit-report">Audit Report</option>
              <option value="legal">Legal</option>
              <option value="questionnaire">Questionnaire</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={document?.description ?? ""}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Access Level
            </label>
            <select
              name="accessLevel"
              defaultValue={document?.accessLevel ?? "public"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="public">Public</option>
              <option value="login-required">Login Required</option>
              <option value="nda-required">NDA Required</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              File URL
            </label>
            <input
              name="fileUrl"
              type="url"
              defaultValue={document?.fileUrl ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              File Size
            </label>
            <input
              name="fileSize"
              type="text"
              defaultValue={document?.fileSize ?? ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              defaultValue={document?.status ?? "draft"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tags (JSON array)
            </label>
            <input
              name="tags"
              type="text"
              defaultValue={JSON.stringify(document?.tags ?? [])}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
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
