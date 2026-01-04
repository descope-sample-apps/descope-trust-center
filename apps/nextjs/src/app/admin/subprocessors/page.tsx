"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

interface SubprocessorType {
  id: string;
  name: string;
  purpose: string;
  dataProcessed: unknown;
  location: string;
  contractUrl: string;
  status: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export default function SubprocessorsPage() {
  const trpc = useTRPC();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubprocessor, setEditingSubprocessor] =
    useState<SubprocessorType | null>(null);

  const {
    data: subprocessors,
    isLoading,
    refetch,
  } = useQuery(trpc.admin.subprocessors.getAll.queryOptions());

  const createMutation = useMutation(
    trpc.admin.subprocessors.create.mutationOptions({
      onSuccess: () => {
        void refetch();
        setIsModalOpen(false);
        setEditingSubprocessor(null);
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.admin.subprocessors.update.mutationOptions({
      onSuccess: () => {
        void refetch();
        setIsModalOpen(false);
        setEditingSubprocessor(null);
      },
    }),
  );

  const publishMutation = useMutation(
    trpc.admin.subprocessors.publish.mutationOptions({
      onSuccess: () => void refetch(),
    }),
  );

  const unpublishMutation = useMutation(
    trpc.admin.subprocessors.unpublish.mutationOptions({
      onSuccess: () => void refetch(),
    }),
  );

  const deleteMutation = useMutation(
    trpc.admin.subprocessors.delete.mutationOptions({
      onSuccess: () => void refetch(),
    }),
  );

  const handleAdd = () => {
    setEditingSubprocessor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subprocessor: SubprocessorType) => {
    setEditingSubprocessor(subprocessor);
    setIsModalOpen(true);
  };

  const handlePublish = (id: string) => {
    publishMutation.mutate({ id });
  };

  const handleUnpublish = (id: string) => {
    unpublishMutation.mutate({ id });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subprocessor?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (formData: FormData) => {
    const dataProcessedValue = formData.get("dataProcessed") as string;
    let dataProcessed: string[] = [];
    if (dataProcessedValue) {
      try {
        const parsed = JSON.parse(dataProcessedValue);
        if (
          !Array.isArray(parsed) ||
          !parsed.every((item) => typeof item === "string")
        ) {
          alert("Data processed must be an array of strings");
          return;
        }
        dataProcessed = parsed;
      } catch {
        alert("Invalid JSON for data processed");
        return;
      }
    }
    const data = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      purpose: formData.get("purpose") as string,
      dataProcessed,
      location: formData.get("location") as string,
      contractUrl: formData.get("contractUrl") as string,
      status: formData.get("status") as "draft" | "published",
    };

    if (editingSubprocessor) {
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
        <h2 className="text-2xl font-bold text-gray-900">Subprocessors</h2>
        <button
          onClick={handleAdd}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Subprocessor
        </button>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {subprocessors?.map((subprocessor: SubprocessorType) => (
            <li key={subprocessor.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {subprocessor.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {subprocessor.location} • {subprocessor.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(subprocessor)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    {subprocessor.status === "draft" ? (
                      <button
                        onClick={() => handlePublish(subprocessor.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnpublish(subprocessor.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(subprocessor.id)}
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
        <SubprocessorModal
          subprocessor={editingSubprocessor}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

function SubprocessorModal({
  subprocessor,
  onClose,
  onSubmit,
  isLoading,
}: {
  subprocessor: SubprocessorType | null;
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
          {subprocessor ? "Edit Subprocessor" : "Add Subprocessor"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID
            </label>
            <input
              name="id"
              type="text"
              defaultValue={subprocessor?.id ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              name="name"
              type="text"
              defaultValue={subprocessor?.name ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Purpose
            </label>
            <textarea
              name="purpose"
              defaultValue={subprocessor?.purpose ?? ""}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Data Processed (JSON array)
            </label>
            <input
              name="dataProcessed"
              type="text"
              defaultValue={JSON.stringify(subprocessor?.dataProcessed ?? [])}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              name="location"
              type="text"
              defaultValue={subprocessor?.location ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contract URL
            </label>
            <input
              name="contractUrl"
              type="url"
              defaultValue={subprocessor?.contractUrl ?? ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              name="status"
              defaultValue={subprocessor?.status ?? "draft"}
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
