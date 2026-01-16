## 1. Database Schema Design

- [x] Design certifications table: id, name, description, logo_url, issue_date, expiry_date, status (draft/published), created_by, updated_by, created_at, updated_at
- [x] Design documents table: id, title, description, file_url, access_level, status, created_by, updated_by, created_at, updated_at
- [x] Design subprocessors table: id, vendor_name, purpose, location, data_types, status, created_by, updated_by, created_at, updated_at
- [x] Design faqs table: id, question, answer, category, status, created_by, updated_by, created_at, updated_at
- [x] Design audit_log table: id, action (create/update/delete/publish), entity_type, entity_id, user_id, old_values, new_values, timestamp

## 2. Database Implementation

- [x] Update packages/db/src/schema.ts with new tables
- [x] Run database migration: pnpm db:push
- [x] Add any necessary indexes for performance

## 3. API Implementation (tRPC)

- [x] Create packages/api/src/router/admin/ directory
- [x] Implement certifications router with CRUD operations
- [x] Implement documents router with CRUD operations
- [x] Implement subprocessors router with CRUD operations
- [x] Implement faqs router with CRUD operations
- [x] Add draft/publish mutations for all content types
- [x] Implement audit logging in mutation procedures

## 4. Authentication & Authorization

- [x] Add admin role check middleware in packages/api/src/router/admin/
- [x] Update auth configuration to recognize admin role
- [x] Add admin route protection in Next.js middleware

## 5. UI Implementation

- [x] Create apps/nextjs/src/app/admin/ directory structure
- [x] Build admin layout component with navigation
- [x] Create certifications management page with CRUD table/form
- [x] Create documents management page with file upload
- [x] Create subprocessors management page
- [x] Create FAQs management page
- [x] Implement draft/publish toggle UI
- [x] Build audit log viewer page

## 6. Draft/Publish Workflow

- [x] Add status field handling in all CRUD operations
- [x] Implement publish mutation that sets status to 'published'
- [x] Update frontend queries to filter by status appropriately
- [x] Add draft preview functionality

## 7. Audit Logging

- [x] Create audit logging utility function
- [x] Integrate audit logging into all content mutations
- [x] Build audit log API endpoint for fetching logs
- [x] Display audit logs in admin UI

## 8. Testing

- [x] Write unit tests for tRPC routers
- [x] Write integration tests for admin pages
- [x] Test draft/publish workflow
- [x] Test audit logging functionality

## 9. Migration & Deployment

- [x] Migrate existing static JSON data to database (if applicable)
- [x] Update public API to use database instead of static files
- [x] Test end-to-end functionality
- [x] Update documentation
