"use client";

import { useState } from "react";

import { useTRPC } from "~/trpc/react";

interface CertificationType {
  id: string;
  name: string;
  logo: string;
  status: "draft" | "published";
  description: string;
  standards: string[];
  lastAuditDate?: string;
  expiryDate?: string;
  certificateUrl?: string;
}

export default function CertificationsPage() {
  const trpc = useTRPC();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<CertificationType | null>(
    null,
  );

  const {
    data: certifications,
    isLoading,
    refetch,
  } = (trpc as any).admin.certifications.getAll.useQuery();

  const createMutation = (trpc as any).admin.certifications.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      setEditingCert(null);
    },
  });

  const updateMutation = (trpc as any).admin.certifications.update.useMutation({
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      setEditingCert(null);
    },
  });

  const publishMutation = (
    trpc as any
  ).admin.certifications.publish.useMutation({
    onSuccess: refetch,
  });

  const unpublishMutation = (
    trpc as any
  ).admin.certifications.unpublish.useMutation({
    onSuccess: refetch,
  });

  const deleteMutation = (trpc as any).admin.certifications.delete.useMutation({
    onSuccess: refetch,
  });

  const handleAdd = () => {
    setEditingCert(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cert: CertificationType) => {
    setEditingCert(cert);
    setIsModalOpen(true);
  };

  const handlePublish = (id: string) => {
    publishMutation.mutate({ id });
  };

  const handleUnpublish = (id: string) => {
    unpublishMutation.mutate({ id });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this certification?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (formData: FormData) => {
    const data = {
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      logo: formData.get("logo") as string,
      status: formData.get("status") as "draft" | "published",
      description: formData.get("description") as string,
      standards: JSON.parse(formData.get("standards") as string),
      lastAuditDate: (formData.get("lastAuditDate") as string) || undefined,
      expiryDate: (formData.get("expiryDate") as string) || undefined,
      certificateUrl: (formData.get("certificateUrl") as string) || undefined,
    };

    if (editingCert) {
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
        <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
        <button
          onClick={handleAdd}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Certification
        </button>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {(certifications as CertificationType[])?.map((cert) => (
            <li key={cert.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={cert.logo}
                        alt=""
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {cert.name}
                      </div>
                      <div className="text-sm text-gray-500">{cert.status}</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(cert)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    {cert.status === "draft" ? (
                      <button
                        onClick={() => handlePublish(cert.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnpublish(cert.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cert.id)}
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
        <CertificationModal
          certification={editingCert}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          isLoading={createMutation.isLoading || updateMutation.isLoading}
        />
      )}
    </div>
  );
}

function CertificationModal({
  certification,
  onClose,
  onSubmit,
  isLoading,
}: {
  certification: CertificationType | null;
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
          {certification ? "Edit Certification" : "Add Certification"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              ID
            </label>
            <input
              name="id"
              type="text"
              defaultValue={certification?.id || ""}
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
              defaultValue={certification?.name || ""}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo URL
            </label>
            <input
              name="logo"
              type="url"
              defaultValue={certification?.logo || ""}
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
              defaultValue={certification?.status || "draft"}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={certification?.description || ""}
              required
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Standards (JSON array)
            </label>
            <input
              name="standards"
              type="text"
              defaultValue={JSON.stringify(certification?.standards || [])}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Audit Date
            </label>
            <input
              name="lastAuditDate"
              type="date"
              defaultValue={certification?.lastAuditDate || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              name="expiryDate"
              type="date"
              defaultValue={certification?.expiryDate || ""}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certificate URL
            </label>
            <input
              name="certificateUrl"
              type="url"
              defaultValue={certification?.certificateUrl || ""}
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
