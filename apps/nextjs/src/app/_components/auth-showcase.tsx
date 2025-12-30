"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@descope-trust-center/ui/button";

import {
  Descope,
  DESCOPE_FLOW_ID,
  useDescope,
  useSession,
  useUser,
} from "~/auth/client";

export function AuthShowcase() {
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user } = useUser();
  const { logout } = useDescope();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [logout, router]);

  if (isSessionLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Descope
        flowId={DESCOPE_FLOW_ID}
        onSuccess={() => router.refresh()}
        onError={(e: unknown) => console.error("Auth error:", e)}
      />
    );
  }

  const displayName = user.name ?? user.email ?? "User";

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        <span>Logged in as {displayName}</span>
      </p>

      <Button size="lg" onClick={handleLogout}>
        Sign out
      </Button>
    </div>
  );
}
