import { execSync } from "child_process";
import path from "path";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import {
  AuditLog,
  DocumentAccessRequest,
  DocumentDownload,
  FormSubmission,
  Post,
} from "@descope-trust-center/db";

import { appRouter } from "../root";
import { createCallerFactory } from "../trpc";

const schema = {
  Post,
  DocumentDownload,
  FormSubmission,
  DocumentAccessRequest,
  AuditLog,
};

export type TestDB = ReturnType<typeof drizzle<typeof schema>>;

let container: StartedPostgreSqlContainer | null = null;
let pool: pg.Pool | null = null;
let testDb: TestDB | null = null;

export function isDockerAvailable(): boolean {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export async function startTestDatabase(): Promise<TestDB> {
  if (testDb) return testDb;

  const dockerAvailable = isDockerAvailable();
  if (!dockerAvailable) {
    throw new Error(
      "Docker is not available. Integration tests require Docker to run PostgreSQL containers.",
    );
  }

  try {
    container = await new PostgreSqlContainer("postgres:16-alpine")
      .withDatabase("test_db")
      .withUsername("test")
      .withPassword("test")
      .start();

    pool = new pg.Pool({
      connectionString: container.getConnectionUri(),
    });

    testDb = drizzle(pool, { schema, casing: "snake_case" });

    pushSchema(container.getConnectionUri());

    return testDb;
  } catch (error) {
    await stopTestDatabase();
    throw error;
  }
}

export async function stopTestDatabase(): Promise<void> {
  if (pool) {
    await pool.end().catch(() => undefined);
    pool = null;
  }
  if (container) {
    await container.stop().catch(() => undefined);
    container = null;
  }
  testDb = null;
}

export function getTestDb(): TestDB {
  if (!testDb) {
    throw new Error(
      "Test database not initialized. Call startTestDatabase() first.",
    );
  }
  return testDb;
}

export async function cleanTestData(db: TestDB): Promise<void> {
  await db.execute(`DELETE FROM audit_log`);
  await db.execute(`DELETE FROM document_access_request`);
  await db.execute(`DELETE FROM form_submission`);
  await db.execute(`DELETE FROM document_download`);
  await db.execute(`DELETE FROM post`);
}

function pushSchema(connectionUri: string): void {
  const dbPackagePath = path.resolve(process.cwd(), "../../packages/db");

  execSync(
    `npx drizzle-kit push --dialect postgresql --schema ./src/schema.ts --casing snake_case --url "${connectionUri}"`,
    {
      cwd: dbPackagePath,
      stdio: "inherit",
    },
  );
}

export interface MockUser {
  id: string;
  email: string;
  name?: string;
  roles?: string[];
}

export interface TestContext {
  db: TestDB;
  session: {
    user: { id: string; email: string; name: string; roles: string[] };
  } | null;
  authApi: never;
}

export function createTestContext(options?: {
  user?: MockUser | null;
  db?: TestDB;
}): TestContext {
  const db = options?.db ?? getTestDb();
  const user = options?.user;

  return {
    db,
    session: user
      ? {
          user: {
            id: user.id,
            email: user.email,
            name: user.name ?? "Test User",
            roles: user.roles ?? [],
          },
        }
      : null,
    authApi: {} as never,
  };
}

export function createAdminContext(db?: TestDB): TestContext {
  return createTestContext({
    user: {
      id: "admin-123",
      email: "admin@descope.com",
      name: "Admin User",
      roles: ["admin"],
    },
    db,
  });
}

export function createUserContext(db?: TestDB): TestContext {
  return createTestContext({
    user: {
      id: "user-456",
      email: "user@example.com",
      name: "Regular User",
      roles: [],
    },
    db,
  });
}

export function createPublicContext(db?: TestDB): TestContext {
  return createTestContext({
    user: null,
    db,
  });
}

const callerFactory = createCallerFactory(appRouter);

type AppRouterCaller = ReturnType<typeof callerFactory>;

export function createCaller(ctx: TestContext): AppRouterCaller {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- Test context provides db and session.user for router procedures; authApi is unused in tests
  return callerFactory(ctx as any);
}
