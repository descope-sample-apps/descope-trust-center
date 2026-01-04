# Change: Add Trust Center Admin Portal

## Why

The current Trust Center content management relies on Git-based deployments, which requires developer involvement for any content updates. This creates inefficiencies and bottlenecks for non-technical users who need to manage certifications, documents, subprocessors, and FAQs without waiting for code deployments.

## What Changes

- Add new admin-portal capability with full CRUD operations for Trust Center content
- Implement database-backed content storage instead of static files
- Add draft/publish workflow for content changes
- Include audit logging to track who made what changes
- Protect admin routes with Descope admin role authentication

## Impact

- Affected specs: New admin-portal capability
- Affected code: New database schema, tRPC routers, admin UI pages, authentication middleware
- No breaking changes to existing functionality
