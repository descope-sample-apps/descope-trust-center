"use client";

import { useState } from "react";

import { useTRPC } from "~/trpc/react";

export default function SubprocessorsPage() {
  const trpc = useTRPC();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubprocessor, setEditingSubprocessor] = useState<any>(null);

  const {
    data: subprocessors,
    isLoading,
    refetch,
  } = (trpc as any).admin.subprocessors.getAll.useQuery();

  const createMutation = (trpc as any).admin.subprocessors.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      setEditingSubprocessor(null);
    },
  });

  const updateMutation = (trpc as any).admin.subprocessors.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      setEditingSubprocessor(null);
    },
  });

  const publishMutation = (trpc as any).admin.subprocessors.publish.useMutation(
    {
      onSuccess: refetch,
    },
  );

  const unpublishMutation = (
    trpc as any
  ).admin.subprocessors.unpublish.useMutation({
    onSuccess: refetch,
  });

  const deleteMutation = (trpc as any).admin.subprocessors.delete.useMutation({
    onSuccess: refetch,
  });

  const handleAdd = () => {
    setEditingSubprocessor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subprocessor: any) => {
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
    const data = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      purpose: formData.get("purpose") as string,
      dataProcessed: JSON.parse(formData.get("dataProcessed") as string),
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
          {subprocessors?.map((subprocessor: any) => (
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
          isLoading={createMutation.isLoading || updateMutation.isLoading}
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
  subprocessor: any;
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
              defaultValue={subprocessor?.id || ""}
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
              defaultValue={subprocessor?.name || ""}
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
              defaultValue={subprocessor?.purpose || ""}
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
              defaultValue={JSON.stringify(subprocessor?.dataProcessed || [])}
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
              defaultValue={subprocessor?.location || ""}
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
              defaultValue={subprocessor?.contractUrl || ""}
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
              defaultValue={subprocessor?.status || "draft"}
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
