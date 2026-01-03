"use client";

import type { DefinedInitialDataOptions } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

interface Incident {
  id: string;
  name: string;
  status: string;
  body?: string;
}

interface Maintenance {
  id: string;
  name: string;
  status: string;
  body?: string;
}

interface StatusPageData {
  page: {
    name: string;
    url: string;
    status: "UP" | "DOWN" | "UNKNOWN";
  };
  activeIncidents: Incident[];
  activeMaintenances: Maintenance[];
}

export default function StatusPage() {
  const trpc = useTRPC();

  const { data, error } = useQuery(
    trpc.trustCenter.getStatusPage.queryOptions() as DefinedInitialDataOptions<
      StatusPageData,
      Error,
      StatusPageData
    >,
  );

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold">System Status</h1>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800">
              Failed to load status
            </h2>
            <p className="mt-2 text-red-700">
              Unable to fetch current system status. Please try again later.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const typedData = data;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">System Status</h1>

        {/* Page Status */}
        <div className="mb-8 rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <div
              className={`h-4 w-4 rounded-full ${
                typedData.page.status === "UP"
                  ? "bg-green-500"
                  : typedData.page.status === "DOWN"
                    ? "bg-red-500"
                    : "bg-yellow-500"
              }`}
            />
            <div>
              <h2 className="text-xl font-semibold">{typedData.page.name}</h2>
              <p className="text-muted-foreground text-sm">
                Status: {typedData.page.status}
              </p>
            </div>
          </div>
          <a
            href={typedData.page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            View full status page →
          </a>
        </div>

        {/* Active Incidents */}
        {typedData.activeIncidents.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-red-600">
              Active Incidents
            </h2>
            <div className="space-y-4">
              {typedData.activeIncidents.map((incident: Incident) => (
                <div
                  key={incident.id}
                  className="rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <h3 className="font-semibold">{incident.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {incident.status}
                  </p>
                  {incident.body && (
                    <p className="mt-2 text-sm">{incident.body}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Maintenances */}
        {typedData.activeMaintenances.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-yellow-600">
              Scheduled Maintenance
            </h2>
            <div className="space-y-4">
              {typedData.activeMaintenances.map((maintenance: Maintenance) => (
                <div
                  key={maintenance.id}
                  className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
                >
                  <h3 className="font-semibold">{maintenance.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {maintenance.status}
                  </p>
                  {maintenance.body && (
                    <p className="mt-2 text-sm">{maintenance.body}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No issues */}
        {typedData.activeIncidents.length === 0 &&
          typedData.activeMaintenances.length === 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
              <h2 className="text-xl font-semibold text-green-800">
                All Systems Operational
              </h2>
              <p className="mt-2 text-green-700">
                No active incidents or scheduled maintenance at this time.
              </p>
            </div>
          )}
      </div>
    </main>
  );
}
