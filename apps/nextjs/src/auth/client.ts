"use client";

export {
  useDescope,
  useSession,
  useUser,
  getSessionToken,
  getRefreshToken,
  refresh,
} from "@descope/nextjs-sdk/client";

export { AuthProvider, Descope } from "@descope/nextjs-sdk";

export const DESCOPE_FLOW_ID = "sign-up-or-in";
