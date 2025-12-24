# Trust Center - Technical Design

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Trust Center (Next.js App)      │
├─────────────────────────────────────────┤
│  Pages                                  │
│  ├── /trust-center (main page)          │
│  └── /trust-center/document/[id]        │
├─────────────────────────────────────────┤
│  Components (Sections)                  │
│  ├── HeroSection                        │
│  ├── ComplianceGrid                     │
│  ├── SecurityOverview                   │
│  ├── DocumentLibrary                    │
│  ├── SubprocessorsList                  │
│  ├── FAQSection                         │
│  └── ContactForm                        │
├─────────────────────────────────────────┤
│  Data Layer                             │
│  ├── Certification Data (JSON)          │
│  ├── Document Metadata (JSON)           │
│  ├── Subprocessor List (JSON)           │
│  └── FAQ Content (MDX or JSON)          │
├─────────────────────────────────────────┤
│  tRPC Services                          │
│  ├── Contact Form Handler               │
│  ├── Document Request Logger            │
│  └── Subprocessor Subscribe (optional)  │
└─────────────────────────────────────────┘
```

## Key Design Decisions

### 1. Static-First Approach (NOT Dynamic CMS)

**Decision**: Use static JSON/MDX files for all content, not a headless CMS.

**Rationale**:
- v1 scope explicitly excludes admin portal
- Git-based content management is sufficient for v1
- Faster initial delivery (no backend infrastructure)
- Better SEO and performance (static generation)
- Content is rarely changed (quarterly compliance updates at most)

**Trade-off**: 
- No non-technical content updates
- Requires git knowledge to update content
- Addresses by providing clear content templates and documentation

**v2 Path**: 
- If content updates become frequent, migrate to Sanity or Contentful
- No code changes needed, just swap data layer

### 2. Descope Authentication (NOT Email Gating)

**Decision**: Use Descope (existing auth infrastructure) for document access, not email gating.

**Rationale**:
- We already have Descope auth integrated in the project
- Descope provides better audit trails and user management than email gating
- Allows customers and prospects to securely access sensitive docs without friction
- Enables self-service for non-NDA documents
- We can track who accessed what via our own auth system

**Implementation**:
- Public documents: No auth required, direct download
- Restricted docs (SOC 2 details, security policies): Require Descope login
- Customer-specific docs (custom DPA, amendments): Require Descope + additional verification
- NDA docs: Manual request via contact form + sales team handling

**User Flow**:
1. Unauthenticated user clicks "Download" on public doc → instant download
2. Unauthenticated user clicks "Download" on restricted doc → redirects to Descope login
3. After login, user can download restricted docs immediately
4. All downloads are logged for analytics

**Security Considerations**:
- Descope auth handles session security
- Document links can be time-limited (optional)
- All access is logged with user ID, IP, timestamp
- Rate-limiting on downloads per user per time period

### 3. Component Composition Strategy

**Single Page vs. Multi-Page**:
- Decision: Single page (`/trust-center`) with sections as components
- Rationale: Better UX for scrolling through related sections, better SEO (single URL for all content), easier mobile navigation

**Data Flow**:
```
/trust-center Page
├── useEffect: Fetch all static data
├── State: { certifications, documents, subprocessors, faqs }
├── HeroSection (static props)
├── ComplianceGrid (static + client filtering)
├── SecurityOverview (static)
├── DocumentLibrary (static + client filtering + email gating)
├── SubprocessorsList (static + searchable)
├── FAQSection (static + accordion state)
└── ContactForm (form submission)
```

### 4. SEO & Performance Strategy

**SEO Considerations**:
- Static generation: All pages pre-rendered at build time
- Metadata: Custom `<title>`, `<meta name="description">` per section
- Structured data: JSON-LD schema for Organization, WebSite, FAQPage
- Keywords: "Descope security", "SOC 2 certified", "GDPR compliant", etc.
- OpenGraph: Social sharing images and descriptions

**Performance Budget**:
- Lighthouse score: >90 across all metrics
- First Contentful Paint (FCP): <2s on 4G
- Cumulative Layout Shift (CLS): <0.1
- Strategy:
  - Code split by section (dynamic imports optional)
  - Image optimization (next/image)
  - CSS minification (Tailwind)
  - Static generation (ISR if needed for subprocessor updates)

### 5. Data Structure & Content Organization

#### Certifications Schema
```typescript
interface Certification {
  id: string
  name: string
  logo: string
  status: 'active' | 'in-progress' | 'planned'
  lastAuditDate: string
  expiryDate?: string
  certificateUrl: string // public PDF link
  description: string
  standards: string[]
}
```

#### Documents Schema
```typescript
interface Document {
  id: string
  title: string
  category: 'compliance-reports' | 'security-policies' | 'questionnaires' | 'data-processing'
  description: string
  isPublic: boolean // true = instant download, false = email gate
  fileUrl: string // S3 or Cloud Storage URL
  fileSize: number
  updatedAt: string
  tags: string[]
}
```

#### Subprocessors Schema
```typescript
interface Subprocessor {
  id: string
  name: string
  purpose: string // e.g., "Email delivery", "Analytics"
  dataProcessed: string[] // e.g., ["user emails", "usage analytics"]
  location: string // e.g., "US", "EU"
  contract: string // DPA/contract reference
  status: 'active' | 'deprecated'
}
```

### 6. Form Handling Strategy

**Contact Form (tRPC endpoint)**:
```typescript
// Input validation with Zod
interface ContactFormInput {
  name: string
  email: string
  company: string
  message: string
  documentId?: string // if requesting specific document
}

// Handler options:
// 1. Send email immediately (Resend, SendGrid)
// 2. Log to database for manual review
// 3. Create Slack notification
// 4. Both
```

**Email Gating (simpler approach for now)**:
```typescript
interface DocumentRequest {
  email: string
  documentId: string
  requestedAt: timestamp
  // Later: send email with download link
}
```

### 7. Accessibility Requirements

**WCAG 2.1 AA Compliance**:
- Semantic HTML: `<header>`, `<section>`, `<nav>`, `<article>`, `<footer>`
- Keyboard navigation: All interactive elements focusable, logical tab order
- Color contrast: 4.5:1 for text, 3:1 for large text
- Images: All `<img>` have descriptive alt text
- Forms: Labels, error messages, field descriptions
- Accordion/expandable: ARIA roles and attributes
- Search/filter: Announce dynamic results to screen readers

**Testing Plan**:
- axe DevTools browser extension
- WAVE (WebAIM) validation
- Screen reader testing (NVDA, JAWS)
- Keyboard-only navigation

### 8. Analytics Dashboard

**Decision**: Build internal analytics dashboard to track document access and contact requests.

**Rationale**:
- Understand which documents prospects/customers care about most
- Track engagement with different security practices (hero stats, FAQ, security overview)
- Manage and respond to document requests
- Measure success metrics (reduced inbound requests)
- Enable sales/security teams to follow up with interested prospects

**Dashboard Features**:
- Document downloads: Track which docs downloaded, by user, timestamp
- Access requests: View pending/approved/denied requests for NDA documents
- Contact form submissions: Queue of security questions/requests to respond to
- Engagement metrics: Page views, time spent per section, scroll depth
- User insights: Top users, company affiliation, geography
- Trends: Weekly/monthly downloads, peak interest times

**Implementation**:
- tRPC endpoint to log document downloads: `analytics.logDownload()`
- tRPC endpoint to log document requests: `analytics.logRequest()`
- Database schema: `document_downloads`, `document_requests`, `contact_submissions`
- Optional: Google Analytics for public-facing engagement
- Internal dashboard: Protected by Descope auth, accessible to Security/Sales/Legal

**Data Retention**:
- Store logs for 12 months
- PII (email, IP) stored separately from analytics
- GDPR/CCPA compliant (allow users to request deletion)

---

## File Structure

```
apps/nextjs/src/app/
├── trust-center/
│   ├── page.tsx                    # Main landing page (all sections)
│   ├── layout.tsx                  # Layout with metadata
│   ├── styles.css                  # Trust center styles (or Tailwind)
│   └── _components/
│       ├── hero-section.tsx
│       ├── compliance-grid.tsx
│       ├── security-overview.tsx
│       ├── document-library.tsx
│       ├── subprocessors-list.tsx
│       ├── faq-section.tsx
│       └── contact-form.tsx
├── api/
│   └── trust-center/
│       └── [trpc]/
│           └── route.ts             # tRPC endpoint (reuse existing)
└── data/
    ├── certifications.json
    ├── documents.json
    ├── subprocessors.json
    └── faqs.json
```

**Alternative**: If organizing by capability, use feature-based structure:
```
apps/nextjs/src/app/trust-center/
├── (hero)/
│   └── _components/hero-section.tsx
├── (compliance)/
│   └── _components/compliance-grid.tsx
├── (library)/
│   └── _components/document-library.tsx
...
```

We'll use the simpler flat structure for v1, refactor to feature-based if components grow.

---

## Content Update Strategy

### Data Files Location
```
apps/nextjs/src/app/data/
├── certifications.json      # Certification status, audit dates
├── documents.json           # Document metadata and categories
├── subprocessors.json       # Vendor list
└── faqs.json               # FAQ content
```

### Update Process
1. Edit JSON files in version control
2. Commit and push to feature branch
3. PR review and merge to main
4. Automatic rebuild and deploy on merge
5. Changes live within 1-2 minutes

### Content Ownership
- **Certifications**: Legal/Security team (quarterly review)
- **Documents**: Security team + legal (on-demand)
- **Subprocessors**: Procurement/Security (on-demand)
- **FAQs**: Product/Sales/Security (on-demand)

---

## Security Considerations

### 1. Document Access
- Public docs: No restrictions, public CloudStorage bucket
- Gated docs: Email + IP rate-limiting only (no auth)
- NDAs: Can be emailed manually after form submission

### 2. Form Submission Validation
- Email: RFC 5322 validation
- Rate limiting: 50 requests per IP per day
- CSRF protection: Next.js built-in
- No sensitive data in form (no credit cards, SSNs)

### 3. Data Leaks
- Never log emails or personal data to analytics
- Store form submissions encrypted if persisting
- Regular review of what's stored and why

### 4. Subdomain/Domain Strategy
- Option 1: `trust.descope.com` (subdomain)
- Option 2: `descope.com/trust-center` (path)
- Recommendation: Path (`/trust-center`) for simplicity, single SSL cert

---

## Performance Optimization Strategy

### Build-Time
- Static generation: All pages pre-built at build time
- ISR: Optional incremental static regeneration for subprocessor updates (60s revalidation)
- Bundle analysis: Monitor bundle size growth

### Runtime
- Code splitting: Each section can be dynamically imported (if needed)
- Image optimization: Use `next/image` with optimized formats (AVIF, WebP)
- Lazy loading: Defer below-fold content loading
- Caching headers: Set long cache for assets, short for document metadata

### Monitoring
- Sentry for errors
- Web Vitals tracking via Google Analytics
- Document download tracking (optional)

---

## Testing Strategy

### Unit Tests
- Component rendering
- Data transformation
- Form validation

### Integration Tests
- Page loads with all sections
- Search/filter in document library and subprocessors
- Form submission flow
- Email gating validation

### E2E Tests (optional for v1)
- Full page navigation
- Document download
- Contact form submission

### Accessibility Tests
- axe DevTools automation
- Manual keyboard navigation
- Screen reader testing

---

## Deployment & Rollout

### Deployment Target
- Vercel (recommended for Next.js)
- Environment: Production
- Branch: main
- Auto-deploy on merge

### Rollout Plan
1. Internal testing (dev team)
2. Stakeholder review (legal, security, sales)
3. Beta with trusted customers (optional)
4. Public launch with announcement

### Monitoring Post-Launch
- Error tracking (Sentry)
- Page analytics (Google Analytics)
- Document downloads tracking
- Form submission metrics
- Core Web Vitals monitoring

---

## Future Enhancements (v2+)

### High Priority
- [ ] Admin portal for content management (Sanity/Contentful)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Real-time status page integration
- [ ] Newsletter signup for subprocessor updates

### Medium Priority
- [ ] Dynamic compliance report generation (PDF)
- [ ] Interactive compliance timeline
- [ ] Security incident response simulator
- [ ] Penetration test report archive

### Low Priority
- [ ] AI chatbot for security questions
- [ ] Compliance requirement search
- [ ] Custom report builder
- [ ] API for compliance status

