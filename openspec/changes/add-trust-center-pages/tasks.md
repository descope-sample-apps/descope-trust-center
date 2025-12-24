# Trust Center Implementation Tasks

## Overview

These tasks implement the Trust Center application as specified in `proposal.md` and designed in `design.md`. Tasks are organized in phases with clear dependencies and validation criteria.

---

## Phase 1: Foundation & Data Models

### Task 1.1: Create Data Models and Fixtures ✅

- [x] Create `apps/nextjs/src/app/data/certifications.json` with schema
  - Include: SOC 2 Type II, ISO 27001, GDPR, CCPA, HIPAA, PCI DSS
  - Set realistic audit dates and expiry dates
  - Add logo URLs (use placeholder or real Descope brand)
- [x] Create `apps/nextjs/src/app/data/documents.json`
  - Organize into 4 categories: compliance-reports, security-policies, questionnaires, data-processing
  - Include 3-5 documents per category
  - Mark some as public, some as gated
  - Add file sizes and update dates
- [x] Create `apps/nextjs/src/app/data/subprocessors.json`
  - Include 8-10 key vendors (CDN, email, analytics, etc.)
  - Include columns: name, purpose, data processed, location, contract status
- [x] Create `apps/nextjs/src/app/data/faqs.json`
  - Include 8-10 common security questions with detailed answers
  - Organize by category (data, infrastructure, compliance, support)
- [x] **Validation**: Data validates against Zod schemas without errors

### Task 1.2: Create TypeScript Data Schemas ✅

- [x] Create `packages/validators/src/trust-center.ts`
  - Define Zod schemas: `CertificationSchema`, `DocumentSchema`, `SubprocessorSchema`, `FAQSchema`
  - Export typed interfaces for components to use
  - Add validation for file URLs, dates, email format
- [x] Create `packages/api/src/router/trust-center.ts` (or extend existing)
  - tRPC router for contact form: `contact.submit()`
  - tRPC router for document requests: `documents.request()`
  - Input validation with Zod schemas
- [x] **Validation**: `pnpm typecheck` passes, schemas validate sample data

---

## Phase 2: Component Implementation

### Task 2.1: Create Hero Section Component ✅

- [x] Create `apps/nextjs/src/app/_components/hero-section.tsx`
  - Display: Company name, hero tagline, key trust stats (3-4 metrics)
  - Include call-to-action button (scroll to document library)
  - Responsive design (desktop, tablet, mobile)
  - Hero image or gradient background
- [ ] Create unit test: `hero-section.test.tsx`
  - Test props rendering
  - Test accessibility (headings, alt text)
  - Test responsive breakpoints
- [ ] **Validation**: Component renders, accessibility check passes (axe), Lighthouse score > 90

### Task 2.2: Create Compliance Grid Component ✅

- [x] Create `apps/nextjs/src/app/_components/compliance-grid.tsx`
  - Display certification cards with grid layout (3-column responsive)
  - Show: logo, name, status badge, last audit date, expiry date
  - Clickable card opens certificate PDF (external link)
  - Filtering: by status (Active, In Progress, Planned)
- [ ] Create unit test: `compliance-grid.test.tsx`
  - Test rendering with sample certifications
  - Test filter functionality
  - Test external link handling
- [ ] **Validation**: All 6 certifications render, filter works, links are valid

### Task 2.3: Create Security Overview Section ✅

- [x] Create `apps/nextjs/src/app/_components/security-overview.tsx`
  - 3-4 subsections: Infrastructure, Access Control, Data Protection, Incident Response
  - Each subsection: description + 3-4 key points
  - Icons/visual indicators for each point (shields, locks, checkmarks)
  - Responsive layout (stacked on mobile, columns on desktop)
- [ ] Create unit test: `security-overview.test.tsx`
  - Test section rendering
  - Test accessibility (semantic HTML, headings)
- [ ] **Validation**: All subsections render, accessibility check passes

### Task 2.4: Create Document Library Component ✅

- [x] Create `apps/nextjs/src/app/_components/document-library.tsx`
  - Display documents in category tabs or filter buttons
  - Show: title, description, category, download button, file size
  - Public documents: Direct download link
  - Gated documents: "Request Access" button (email form)
  - Search field for document title/description
- [x] Create `document-request-form.tsx` (sub-component)
  - Email input field, optional company/name fields
  - Form validation (email required, rate-limited)
  - Success/error messages
  - Integration with tRPC `documents.request()`
- [ ] Create unit tests: `document-library.test.tsx`, `document-request-form.test.tsx`
  - Test filtering by category
  - Test search functionality
  - Test public vs. gated document handling
  - Test form validation and submission
- [ ] **Validation**: All documents load, filter works, form validation passes, tRPC integration works

### Task 2.5: Create Subprocessors List Component ✅

- [x] Create `apps/nextjs/src/app/_components/subprocessors-list.tsx`
  - Display table with columns: Name, Purpose, Data Processed, Location, Status
  - Searchable/filterable by vendor name
  - Responsive table (horizontal scroll on mobile, or collapse to card view)
  - Subscribe button for update notifications
- [ ] Create `subprocessor-subscribe-form.tsx` (sub-component)
  - Email input field
  - Checkbox: "Notify me when vendors change"
  - Integration with email service (or database logging for now)
- [ ] Create unit tests: `subprocessors-list.test.tsx`, `subprocessor-subscribe-form.test.tsx`
  - Test search filtering
  - Test responsive table layout
  - Test form submission
- [ ] **Validation**: All subprocessors load, search works, table is responsive, form works

### Task 2.6: Create FAQ Section Component ✅

- [x] Create `apps/nextjs/src/app/_components/faq-section.tsx`
  - Accordion component (expandable Q&A pairs)
  - Questions grouped by category (optional)
  - Smooth expand/collapse animation
  - Keyboard-navigable (Enter/Space to toggle, Arrow keys to navigate)
  - ARIA roles for accessibility
- [ ] Create unit test: `faq-section.test.tsx`
  - Test expand/collapse functionality
  - Test keyboard navigation
  - Test accessibility (ARIA attributes)
- [ ] **Validation**: All FAQs render, accordion works, keyboard navigation works, accessibility check passes

### Task 2.7: Create Contact Form Component ✅

- [x] Create `apps/nextjs/src/app/_components/contact-form.tsx`
  - Fields: Name, Email, Company, Message, Type (document request, security review, other)
  - Form validation (email required, message required)
  - Submit to tRPC endpoint `contact.submit()`
  - Loading state while submitting
  - Success/error message display
  - SPAM protection: rate-limiting (1 per IP per minute)
- [ ] Create unit test: `contact-form.test.tsx`
  - Test form validation
  - Test form submission
  - Test error handling
  - Test rate-limiting
- [ ] **Validation**: Form validates, tRPC integration works, rate-limiting works, success message shows

---

## Phase 3: Page Assembly & Layout

### Task 3.1: Create Trust Center Layout & Page ✅

- [x] Create `apps/nextjs/src/app/layout.tsx`
  - Metadata for SEO (title, description, OG tags)
  - Navigation layout (header with logo, nav items)
  - Footer with links
  - Analytics tracking setup (optional for v1)
- [x] Create `apps/nextjs/src/app/page.tsx`
  - Assemble all sections in logical order:
    1. HeroSection
    2. ComplianceGrid
    3. SecurityOverview
    4. DocumentLibrary
    5. SubprocessorsList
    6. FAQSection
    7. ContactForm
  - Data loading (fetch JSON files or import directly)
  - Error boundaries for each section
  - Smooth scroll behavior between sections
- [ ] Create unit test: `trust-center.page.test.tsx`
  - Test page renders all sections
  - Test data loading
  - Test metadata generation
- [ ] **Validation**: Page loads, all sections render, no console errors, Lighthouse score > 90

### Task 3.2: SEO & Metadata Optimization ✅

- [x] Add meta tags to layout:
  - `<title>`: "Trust Center - Descope Security & Compliance"
  - `<meta name="description">`: Security posture summary
  - `<meta name="keywords">`: "SOC 2", "GDPR", "compliance", "security"
  - OpenGraph: og:title, og:description, og:image, og:url
  - Structured data: JSON-LD for Organization, WebSite
- [ ] Create `robots.txt` and `sitemap.xml` (if applicable)
- [ ] Add Google Analytics or similar (optional for v1)
- [ ] **Validation**: SEO validation tool (e.g., Lighthouse) passes, structured data validates

### Task 3.3: Responsive Design & Mobile Optimization

- [ ] Test on desktop, tablet, mobile viewports
  - Hero section: Full width, readable text
  - Grid layouts: Responsive columns (3 desktop, 2 tablet, 1 mobile)
  - Tables: Collapse to card view on mobile (or horizontal scroll)
  - Forms: Full width, readable inputs
- [ ] Optimize images for mobile (next/image, responsive sizes)
- [ ] Test touch interactions (tap targets > 44px, no hover-only buttons)
- [ ] **Validation**: Page responsive across breakpoints, no layout shifts, touch-friendly

### Task 3.4: Accessibility Compliance (WCAG 2.1 AA)

- [ ] Run axe DevTools on all sections
  - Fix contrast issues (text/background)
  - Fix missing alt text on images
  - Fix form label associations
  - Fix heading hierarchy
- [ ] Keyboard navigation testing:
  - Tab through all interactive elements
  - Focus styles visible on all buttons/links
  - Accordion/expandable items keyboard-accessible
  - Form fields keyboard-accessible
- [ ] Screen reader testing (NVDA or VoiceOver):
  - All content is announced correctly
  - Form labels and field descriptions read
  - Dynamic content (search results) announced
- [ ] **Validation**: axe audit passes (zero critical/serious), keyboard navigation works, screen reader compatible

---

## Phase 4: Backend Integration & Deployment

### Task 4.1: Implement tRPC Contact Form Endpoint ✅

- [x] Implement `contact.submit()` in `packages/api/src/router/trust-center.ts`
  - Input validation with Zod
  - Rate-limiting: 5 requests per IP per hour
  - Email delivery (Resend, SendGrid) or database logging
  - Error handling and user-friendly messages
  - Special handling for NDA document requests (flag for manual review)
- [x] Implement `documents.request()` in same router
  - Validate email and document ID
  - Log request to database or email service
  - Send confirmation email to user
  - For NDA-protected docs: Flag request for security team review
- [ ] Create test: `trust-center.router.test.ts`
  - Test input validation
  - Test rate-limiting
  - Test successful submission
  - Test error cases
  - Test NDA document request routing
- [ ] **Validation**: tRPC integration works, rate-limiting works, no console errors

### Task 4.2: Implement Analytics Dashboard Backend

- [ ] Create database schema for tracking:
  - Document downloads (document_id, user_id, company, timestamp, ip_address)
  - Form submissions (submission_id, form_type, email, timestamp, status)
  - Document requests (request_id, document_id, user_id, approval_status, timestamp)
  - User sessions (session_id, user_id, login_time, logout_time)
- [ ] Create tRPC endpoints for analytics:
  - `analytics.getDownloadStats()` - returns download counts by document, date range, company
  - `analytics.getFormStats()` - returns form submission counts by type, date range
  - `analytics.getAccessRequests()` - returns pending/approved NDA requests with status
  - `analytics.approveAccess(requestId)` - approve document access request
  - `analytics.denyAccess(requestId, reason)` - deny request with reason
- [ ] Add Descope middleware to analytics endpoints
  - Verify user is authenticated (Descope session)
  - Verify user has "admin" role or "analytics" permission
  - Reject unauthorized requests
- [ ] Create test: `analytics.router.test.ts`
  - Test authentication/authorization
  - Test data aggregation
  - Test approval workflow
- [ ] **Validation**: Endpoints work, auth works, data is logged correctly

### Task 4.3: Implement Analytics Dashboard UI

- [ ] Create `apps/nextjs/src/app/analytics/layout.tsx`
  - Authentication check (redirect to login if not authenticated)
  - Navigation menu (overview, downloads, forms, access-requests)
  - Breadcrumbs and page titles
- [ ] Create `apps/nextjs/src/app/analytics/page.tsx` (Overview dashboard)
  - Display key metrics:
    - Total document downloads (all time, this month, this week)
    - Top 5 downloaded documents
    - Form submissions by type (chart)
    - Pending NDA access requests count
  - Date range picker (last 7 days, 30 days, 90 days, custom)
  - Charts using Recharts or similar
- [ ] Create `apps/nextjs/src/app/analytics/downloads.tsx`
  - Table of all downloads: document name, company, date, user
  - Filters: date range, document, company
  - Sort by date, document, company
  - Export to CSV (optional)
- [ ] Create `apps/nextjs/src/app/analytics/requests.tsx`
  - Table of document access requests (especially NDA-protected docs)
  - Columns: Document, Requester, Company, Reason, Status, Approval Date
  - Filters: Status (pending, approved, denied), date range
  - Action buttons: Approve, Deny (with modal for denial reason)
  - Email notification sent to requester when approved/denied
- [ ] Create `apps/nextjs/src/app/analytics/forms.tsx`
  - Table of form submissions: type, email, company, message, date, status
  - Filters: form type, date range, status (new, responded, closed)
  - Search by email or company
  - Mark as "responded" once team replies
- [ ] Create unit tests: `analytics-dashboard.test.tsx`
  - Test authentication/access control
  - Test metric calculations
  - Test filters and sorting
  - Test approval workflow UI
- [ ] **Validation**: Dashboard loads, all data displays correctly, approval flow works

### Task 4.4: Set Up Static Data Loading

- [ ] Import JSON data files in page component
  - Alternatively, create data loader utility function
  - Validate data on load (using Zod schemas)
  - Handle missing/invalid data gracefully
- [ ] Add error boundaries for each section
  - Fallback UI if section fails to load
  - Log errors to Sentry (if available)
- [ ] **Validation**: Data loads without errors, error boundaries work, no missing data

### Task 4.5: Performance Testing & Optimization

- [ ] Run Lighthouse audit
  - Target scores: >90 all metrics
  - Identify bottlenecks (images, JavaScript, CSS)
- [ ] Optimize images:
  - Use next/image for automatic optimization
  - Responsive srcset for mobile/desktop
  - Consider AVIF/WebP formats
- [ ] Code splitting (optional):
  - Dynamic imports for sections below fold
  - Defer non-critical sections
- [ ] **Validation**: Lighthouse score > 90, no performance warnings

### Task 4.6: Content Review & Finalization

- [ ] Security team reviews all security overview content
- [ ] Legal team reviews compliance information
- [ ] Sales/Marketing reviews messaging and CTAs
- [ ] Update data files based on feedback
- [ ] Final content accuracy check
- [ ] **Validation**: All stakeholders sign off, content is accurate and approved

### Task 4.7: Deployment Setup

- [ ] Configure environment variables (if needed)
  - Email service credentials
  - Analytics keys
  - API endpoints
  - Descope credentials
- [ ] Test in staging environment
  - Run full E2E tests
  - Manual testing of all flows
  - Accessibility audit in staging
  - Analytics dashboard testing (create test data)
- [ ] Deploy to production
  - Set up auto-deploy on main branch (via Vercel or similar)
  - Monitor for errors post-launch
  - Test live environment
- [ ] **Validation**: Site is live, all pages load, forms work, analytics dashboard works, no errors in production logs

### Task 4.8: Post-Launch Monitoring

- [ ] Set up analytics tracking:
  - Log document downloads with metadata (user, company, timestamp)
  - Log form submissions with response time
  - Log Descope authentication events
  - Log NDA access request approvals/denials
- [ ] Set up error tracking (Sentry)
  - Monitor for JavaScript errors
  - Track form submission failures
  - Track analytics dashboard errors
  - Alert on critical issues
- [ ] Create monitoring dashboard
  - Core Web Vitals
  - Uptime monitoring
  - Error rates
  - Document download trends
  - Form submission trends
- [ ] **Validation**: Monitoring is working, dashboards are live, alerts are configured

---

## Summary of Deliverables

By end of Phase 4, the Trust Center will include:

### Pages

- ✅ `/trust-center` - Main landing page with all sections

### Components (7)

- ✅ HeroSection
- ✅ ComplianceGrid
- ✅ SecurityOverview
- ✅ DocumentLibrary
- ✅ SubprocessorsList
- ✅ FAQSection
- ✅ ContactForm

### Data

- ✅ Certifications (6 items)
- ✅ Documents (15-20 items)
- ✅ Subprocessors (8-10 items)
- ✅ FAQs (8-10 items)

### Backend

- ✅ tRPC endpoint for contact form
- ✅ tRPC endpoint for document requests (public and NDA-protected)
- ✅ tRPC endpoint for analytics queries
- ✅ tRPC endpoint for access request approval workflow
- ✅ Email/logging integration
- ✅ Database schema for tracking downloads, forms, and access requests

### Quality

- ✅ WCAG 2.1 AA compliance
- ✅ Lighthouse score > 90
- ✅ Responsive design (mobile-first)
- ✅ Full test coverage
- ✅ SEO optimized
- ✅ Descope authentication integration
- ✅ Analytics dashboard for Security/Sales/Legal teams
- ✅ NDA document request workflow with approval system

---

## Estimation

| Phase     | Task Count | Estimated Effort | Parallelizable?  |
| --------- | ---------- | ---------------- | ---------------- |
| Phase 1   | 2          | 3-4 days         | No (sequential)  |
| Phase 2   | 7          | 8-10 days        | Yes (most tasks) |
| Phase 3   | 4          | 4-5 days         | Partial          |
| Phase 4   | 8          | 8-10 days        | Partial          |
| **Total** | **21**     | **23-29 days**   | ~50%             |

**Timeline**: If one developer: 5-6 weeks
If parallel work (2-3 developers): 2-3 weeks

---

## Dependencies & Ordering

```
Phase 1 (Data Models)
    ↓
Phase 2 (Components)
    ↓
Phase 3 (Assembly & SEO)
    ↓
Phase 4 (Backend & Deploy)
```

**Internal ordering**:

- Task 1.1 → 1.2 (models before validation)
- Task 2.1-2.7 can run in parallel (no dependencies)
- Task 3.1 → 3.2-3.4 (page assembly first)
- Task 4.1 → 4.2-4.6 (backend integration first)

---

## Acceptance Criteria

### Overall Acceptance

- [ ] All 21 tasks marked complete
- [ ] All tests passing (`pnpm test`)
- [ ] Lighthouse score > 90
- [ ] Zero accessibility violations (axe audit)
- [ ] Zero TypeScript errors (`pnpm typecheck`)
- [ ] Stakeholder sign-off on content and design
- [ ] Site live at `/trust-center` URL
- [ ] Analytics dashboard live at `/analytics` URL (Descope auth protected)
- [ ] All Descope authentication flows tested
- [ ] All analytics data logged and visible in dashboard

### Per-Phase Acceptance

**Phase 1**: Data files valid, schemas correct, no TypeScript errors
**Phase 2**: All components render, tests pass, no console errors
**Phase 3**: Page loads, metadata correct, responsive, accessible
**Phase 4**: Forms work, analytics dashboard works, monitoring live, no production errors
