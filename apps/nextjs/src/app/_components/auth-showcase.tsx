"use client";

import { useRouter } from "next/navigation";

import { Button } from "@descope-trust-center/ui/button";

import { Descope, useSession, useUser } from "~/auth/client";

export function AuthShowcase() {
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user } = useUser();

  if (isSessionLoading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Descope
        flowId="sign-up-or-in"
        onSuccess={() => router.refresh()}
        onError={(e: unknown) => console.error("Auth error:", e)}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl">
        <span>Logged in as {user?.name ?? user?.email ?? "User"}</span>
      </p>

      <Button
        size="lg"
        onClick={() => {
          window.location.href = "/api/auth/logout";
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
