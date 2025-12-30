import "server-only";

import { session } from "@descope/nextjs-sdk/server";

export const getSession = () => session();
