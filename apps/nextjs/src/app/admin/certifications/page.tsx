"use client";

import { useState } from "react";

import { useTRPC } from "~/trpc/react";

export default function CertificationsPage() {
  const trpc = useTRPC();
  const { data: certifications, isLoading } =
    trpc.admin.certifications.getAll.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Certifications</h2>
        <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Add Certification
        </button>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-md">
        <ul role="list" className="divide-y divide-gray-200">
          {certifications?.map((cert) => (
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
                    <button className="text-blue-600 hover:text-blue-900">
                      Edit
                    </button>
                    {cert.status === "draft" ? (
                      <button className="text-green-600 hover:text-green-900">
                        Publish
                      </button>
                    ) : (
                      <button className="text-yellow-600 hover:text-yellow-900">
                        Unpublish
                      </button>
                    )}
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
