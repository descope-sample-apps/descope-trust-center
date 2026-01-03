import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { StatusPageContent } from "./_components/status-page-content";

export default function StatusPage() {
  prefetch(trpc.trustCenter.getStatusPage.queryOptions());

  return (
    <HydrateClient>
      <StatusPageContent />
    </HydrateClient>
  );
}
