# AI Agent Instructions - Descope Trust Center

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (Next.js on port 3000)
pnpm build            # Production build
pnpm typecheck        # Type checking
pnpm lint             # ESLint
pnpm test             # Run all tests
```

## Running Single Tests

```bash
# Run a single test file
pnpm -F @descope-trust-center/nextjs test src/app/_components/__tests__/hero-section.test.tsx

# Run tests matching a pattern
pnpm -F @descope-trust-center/nextjs test -- -t "HeroSection"

# Run API package tests
pnpm -F @descope-trust-center/api test

# Visual regression tests (Playwright)
pnpm test:visual
pnpm test:visual --update-snapshots  # Update snapshots
```

## Project Structure

```
apps/nextjs/          # Next.js 16 app (React 19)
packages/
  api/                # tRPC routers
  db/                 # Drizzle ORM + PostgreSQL schema
  ui/                 # Shared UI components (shadcn)
  validators/         # Zod schemas
tooling/              # ESLint, Prettier, TypeScript configs
```

## Code Style

### Imports (auto-sorted by Prettier)

```typescript
import type { Foo } from "bar"; // 1. Types first
import { useState } from "react"; // 2. React
import Link from "next/link"; // 3. Next.js
import { z } from "zod/v4"; // 4. Third-party

import type { User } from "@descope-trust-center/db"; // 5. Workspace types
import { db } from "@descope-trust-center/db/client"; // 6. Workspace packages

import type { Props } from "~/types"; // 7. Local types
import { api } from "~/trpc/react"; // 8. Local imports
```

### TypeScript Rules

- **Strict mode** with `noUncheckedIndexedAccess`
- **Type imports**: Use `import type` for type-only imports
- **No non-null assertions**: Avoid `!` operator
- **Unused vars**: Prefix with `_` (e.g., `_unusedParam`)
- **Environment variables**: Use `import { env } from "~/env"` (not `process.env`)

### Naming Conventions

- **Components**: PascalCase (`HeroSection.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE
- **Types/Interfaces**: PascalCase

### Component Patterns

```typescript
// Server Component (default in app router)
export function MyComponent() { ... }

// Client Component
"use client";
export function MyClientComponent() { ... }

// With props - use interface
interface Props {
  title: string;
  onClick?: () => void;
}
export function MyComponent({ title, onClick }: Props) { ... }
```

### tRPC Patterns

```typescript
// In server components - use prefetch
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

// In client components - use hooks pattern
const trpc = useTRPC();
const { data } = useQuery(trpc.router.procedure.queryOptions({ input }));
const mutation = useMutation(trpc.router.procedure.mutationOptions());

prefetch(trpc.router.procedure.queryOptions({ input }));
```

### Error Handling

- Use tRPC's `TRPCError` for API errors
- Use Zod for input validation
- Never suppress errors with empty catch blocks

## GitHub Workflow

### Labels

| Label         | Meaning                           |
| ------------- | --------------------------------- |
| `P0-critical` | Blocking launch - fix immediately |
| `P1-high`     | Needed for milestone              |
| `P2-medium`   | Should have                       |
| `P3-low`      | Nice to have                      |
| `blocked`     | Waiting on another issue          |
| `opencode`    | Managed by AI agents              |

### Working Issues

1. **Claim an issue**: Add `opencode` label + assign yourself
2. **Create branch**: `feat/<issue-slug>` or `fix/<issue-slug>`
3. **Update status**: Add comment when starting work
4. **Create PR**: Reference issue with `Closes #N`
5. **After merge**: Verify issue auto-closes

### Picking Tasks

```bash
gh issue list --state open --label "P0-critical"  # Check critical first
gh issue list --state open --label "P1-high"       # Then high priority
gh issue list --state open --label "opencode"      # AI-managed issues
```

## Pre-Commit Checklist

```bash
pnpm typecheck                    # No type errors
pnpm lint                         # No lint errors
pnpm test                         # Tests pass
ubs <changed-files>               # Bug scanner (exit 0 = safe)
```

## Database

```bash
pnpm db:push      # Push schema changes
pnpm db:studio    # Open Drizzle Studio
```

Schema location: `packages/db/src/schema.ts`

## Testing

- **Unit tests**: Vitest + React Testing Library
- **Visual tests**: Playwright snapshots in `tests/visual/`
- **Integration tests**: Testcontainers for PostgreSQL

Test file location: `__tests__/` directories next to source files

## UI Components

Import from `@descope-trust-center/ui`:

```typescript
import { cn } from "@descope-trust-center/ui"; // Tailwind merge utility
import { Button } from "@descope-trust-center/ui/button";
```

## OpenSpec (for major changes)

For proposals, architecture changes, or big features, see `openspec/AGENTS.md`.

## Common Gotchas

1. **Zod version**: Use `zod/v4` not `zod`
2. **tRPC client**: Use `useTRPC()` hook, not direct imports
3. **Server vs Client**: Default is Server Component - add "use client" only when needed
4. **Tailwind**: Use `cn()` utility for conditional classes
5. **Auth check**: Admin = `@descope.com` email OR in `ADMIN_EMAILS` env var
