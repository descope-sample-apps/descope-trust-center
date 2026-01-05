## Context

The Trust Center currently uses static JSON files for content storage, requiring Git deployments for any content changes. This creates a bottleneck for content managers who need to update certifications, documents, subprocessors, and FAQs. The admin portal will provide a web-based interface for these operations while maintaining data integrity and audit trails.

## Goals / Non-Goals

### Goals

- Enable CRUD operations on all Trust Center content types via web UI
- Implement draft/publish workflow for content approval
- Provide audit logging for all content changes
- Maintain security with role-based access control
- Use database for scalable, queryable content storage

### Non-Goals

- Replace or modify the public Trust Center user interface
- Change the existing public API endpoints
- Implement advanced CMS features (versioning, workflows, etc.)
- Support for rich text editing beyond basic markdown

## Decisions

### Architecture

- **Database Storage**: Use PostgreSQL via Drizzle ORM for content storage, replacing static JSON files
- **API Layer**: tRPC for type-safe API communication between frontend and backend
- **Frontend Framework**: Next.js 16 with React 19 for admin UI
- **Authentication**: Descope for admin role-based access control
- **File Storage**: For documents/certifications, store file URLs (assume cloud storage integration)

### Content Models

- **Certifications**: id, name, description, logo_url, issue_date, expiry_date, status
- **Documents**: id, title, description, file_url, access_level, status
- **Subprocessors**: id, vendor_name, purpose, location, data_types, status
- **FAQs**: id, question, answer, category, status
- **Audit Log**: id, action, entity_type, entity_id, user_id, changes, timestamp

### Draft/Publish Workflow

- All content starts as 'draft' status
- Admin can edit drafts without affecting public view
- Publish action changes status to 'published' and updates public queries
- Audit log captures all changes including publishes

### Security

- Admin routes protected by Descope role check (admin or @descope.com email)
- API mutations include user context for audit logging
- File uploads validated for type and size
- Input validation using Zod schemas

## Risks / Trade-offs

### Data Migration Risk

- **Risk**: Migrating static content to database could lose data or break references
- **Mitigation**: Create migration script with rollback capability, test thoroughly

### Performance Impact

- **Risk**: Database queries could slow down public pages
- **Mitigation**: Add proper indexes, use caching for public content, monitor query performance

### Security Surface Area

- **Risk**: New admin interface increases attack surface
- **Mitigation**: Minimal API surface, strict validation, rate limiting, audit logging

### Complexity Trade-off

- **Trade-off**: Database complexity vs static file simplicity
- **Rationale**: Database enables the required CRUD operations and audit trails that static files cannot provide

## Migration Plan

1. Deploy database schema changes first
2. Create migration script to import existing static data
3. Update public API to read from database with fallback to static files
4. Deploy admin portal behind feature flag
5. Test end-to-end with production data
6. Switch public API to database-only, remove static fallbacks
7. Clean up static files and migration code

## Open Questions

- How to handle file uploads for documents/certifications? (Cloud storage integration needed)
- Should we implement soft deletes for audit purposes?
- What are the exact Descope role names for admin access?
