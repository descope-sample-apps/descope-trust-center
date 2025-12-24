# Capability: Analytics Dashboard

## Overview
The Analytics Dashboard is an internal tool accessible to Security, Sales, and Legal teams to monitor Trust Center engagement, track document access, manage NDA-protected document requests, and analyze form submissions. The dashboard provides real-time insights into user behavior and document usage.

## ADDED Requirements

### Requirement: Authentication & Authorization
The system SHALL ensure authentication & authorization.

Only authenticated users with proper roles can access the dashboard.

#### Details
- Dashboard is protected by Descope authentication
  - Users must be logged in via Descope to access any analytics pages
  - Unauthenticated users are redirected to login
- Role-based access control:
  - **Admin role**: Full access to all analytics, can approve/deny document requests
  - **Security role**: Access to download stats, access requests, form submissions
  - **Sales role**: Access to download stats (by company), form submissions
  - **Legal role**: Access to access requests, document download stats, compliance tracking
  - Unauthorized roles see "Access Denied" page
- Session validation on every page load
- Auto-logout after 30 minutes of inactivity

#### Scenario: User accesses analytics dashboard
- Unauthenticated user navigates to `/analytics`
- Redirected to Descope login page
- User logs in
- Redirect back to `/analytics` (dashboard overview)
- User sees analytics based on their role

#### Scenario: User without proper role
- User logs in with "viewer" role (no admin, security, sales, or legal role)
- User navigates to `/analytics`
- Dashboard shows: "You don't have access to analytics. Contact your administrator."
- User is redirected to homepage or shown a generic error page

### Requirement: Dashboard Overview
The system SHALL display dashboard overview.

Show high-level metrics and key insights at a glance.

#### Details
- Overview page shows:
  - Total document downloads (all-time, this month, this week)
  - Top 5 downloaded documents (with download counts)
  - Form submission summary by type (chart showing counts: contact, document-request, security-review)
  - Pending NDA access requests count (badge with number)
  - Recent activity timeline (last 5 submissions or downloads)
  - Quick access buttons to other sections
- Date range picker:
  - Default: Last 30 days
  - Options: Last 7 days, Last 30 days, Last 90 days, Custom range
  - Updates all charts and metrics when changed
- Charts use clear colors and legends
- All metrics update in real-time or with minimal delay (< 5 seconds)
- Mobile-friendly layout (responsive, stacked on mobile)

#### Scenario: User views dashboard overview
- User navigates to `/analytics`
- Dashboard shows:
  - "2,145 downloads this month" (big number)
  - "347 new downloads this week" (trend indicator)
  - "Top documents" chart showing SOC 2 Report (523 downloads), GDPR Policy (234 downloads)
  - "5 pending NDA requests" (badge)
  - Recent downloads timeline showing: "Jane Doe (Acme Corp) downloaded SOC 2 Report - Dec 20, 10:15 AM"
- User clicks "Last 7 days" date range
- All metrics update to show weekly data

### Requirement: Document Download Analytics
The system SHALL provide document download analytics.

Track and display detailed document download statistics.

#### Details
- Download stats page shows:
  - Table with columns:
    - Document Name (title with category badge)
    - Total Downloads (lifetime)
    - Downloads This Month
    - Downloads This Week
    - Last Download (date and user company)
    - Access Type (Public or Requires Auth)
  - Sortable by any column (click header to sort)
  - Filterable by:
    - Date range (picker)
    - Category (dropdown: Compliance, Security Policies, Questionnaires, Data Processing)
    - Access type (Public, Restricted, NDA)
  - Search by document name
  - Export to CSV (includes all data with timestamps)
  - Download count trends over time (line chart showing downloads per week/month)
- Additional details:
  - Click on document row to see detailed view:
    - Download history (table: timestamp, user email, company, IP address)
    - Top countries/regions downloading
    - Top companies downloading (anonymized if not authenticated users)
  - User retention (are repeated downloaders engaging more?)

#### Scenario: User views download analytics
- User navigates to `/analytics/downloads`
- Table shows all documents with total downloads
- User clicks "Category" filter and selects "Compliance Reports"
- Table updates to show only compliance documents
- User clicks SOC 2 Report row
- Detailed view opens showing download history over time
- User exports data to CSV

#### Scenario: User analyzes document popularity
- User views download table
- Sorts by "Downloads This Month" in descending order
- Identifies top 3 most downloaded documents
- Uses this data to prioritize content updates

### Requirement: Form Submission Analytics
The system SHALL provide form submission analytics.

Track and analyze contact form and document request submissions.

#### Details
- Form stats page shows:
  - Summary metrics:
    - Total submissions (all-time, this month, this week)
    - Average response time (how long until team responds)
    - Submission breakdown by type (bar chart: contact, document-request, security-review, other)
  - Table with all submissions:
    - Columns: Type, Email/Company, Submitted Date, Status (New, Responded, Closed), Response Date (if responded)
    - Filterable by:
      - Type (dropdown)
      - Date range
      - Status (New, Responded, Closed)
    - Searchable by email or company
    - Sortable by any column
  - Status labels:
    - "New" (blue) - Awaiting team response
    - "Responded" (green) - Team has replied
    - "Closed" (gray) - Resolved
  - Click on submission row for details:
    - Full submission data (email, company, message, etc.)
    - Internal response history (comments from team)
    - Documents shared with user (if any)
    - Overall time to response

#### Scenario: User views form analytics
- User navigates to `/analytics/forms`
- Dashboard shows: "143 total submissions, 45 this month"
- Breakdown chart: Contact (60), Document Request (50), Security Review (25), Other (8)
- Table shows submissions, sorted by date (newest first)
- User filters by "Type: Document Request" and "Status: New"
- Table updates to show pending document requests needing responses
- User clicks a submission to see full details and respond

#### Scenario: User identifies response trends
- User views form analytics over last 90 days
- Identifies that average response time is 2.3 days
- Sees spike in submissions during specific week (competitor announcement?)
- Uses data to justify hiring support staff

### Requirement: NDA Access Request Management
The system SHALL provide NDA access request management.

Manage approval workflow for NDA-protected documents.

#### Details
- Access requests page shows:
  - Table with all access requests for NDA-protected documents:
    - Columns: Document, Requester (email/name), Company, Submitted Date, Status (Pending, Approved, Denied), Action Buttons
    - All requests show Pending status first
    - Approved requests show green badge with approval date
    - Denied requests show red badge with denial date and reason
  - Filters:
    - Status (Pending, Approved, Denied)
    - Date range
    - Document name
  - Search by company or requester email
  - Action buttons for pending requests:
    - "Approve" button:
      - Opens modal with:
        - Pre-filled message to send requester
        - Option to add note/comment
        - Confirm button
      - On approve: Send email to requester with download link + access granted
      - Update status to "Approved" with timestamp
      - Log approval in audit trail
    - "Deny" button:
      - Opens modal with:
        - Dropdown for denial reason (Not relevant to business, Competitor, Legal issue, Other)
        - Text field for custom message (required)
        - Deny button
      - On deny: Send email to requester with reason and contact info for appeal
      - Update status to "Denied"
      - Log denial in audit trail
  - Approved requests show:
    - Date approved
    - User who approved it (admin name)
    - Option to revoke access
  - Click on request row for full details:
    - Requester company info (from form submission)
    - Reason provided by requester
    - Comments/notes from security team
    - Full audit trail

#### Scenario: Security team reviews pending request
- Security team navigates to `/analytics/access-requests`
- Table shows 3 pending NDA requests
- Team member clicks "Approve" on "Acme Corp" request for Penetration Test Results
- Modal opens with pre-filled message: "Your request has been approved. Download link: [link]"
- Team member clicks "Approve"
- Email sent to requester
- Status updates to "Approved" (Dec 20, 2024 - Approved by John Security)
- Request moves to bottom of table (or filtered out if "Pending" filter active)

#### Scenario: Security team denies request
- Team member clicks "Deny" on suspicious request
- Modal opens with dropdown: [Not relevant to business, Competitor, Legal issue, Other]
- Team member selects "Competitor"
- Adds message: "Thank you for your interest. We're unable to share this document with competitors at this time."
- Clicks "Deny"
- Email sent to requester with message
- Request marked as "Denied" with timestamp
- Audit log shows denial reason

### Requirement: User Engagement Tracking
The system SHALL track user engagement.

Monitor user behavior and identify patterns.

#### Details
- Engagement metrics page shows:
  - User activity summary:
    - Total unique users (downloading or submitting)
    - Repeat users (percentage who download/submit multiple times)
    - Companies represented (unique company count)
  - Top companies by engagement:
    - Table: Company Name, Downloads, Form Submissions, Total Interactions
    - Sortable, filterable, searchable
    - Click to see company's full history
  - Engagement funnel:
    - Users who downloaded documents → Users who submitted forms → Users who requested demos
    - Shows conversion rates between stages
  - Geographic distribution:
    - Map or bar chart showing downloads by country/region
    - Top 10 countries by engagement
  - Device type distribution:
    - Mobile vs Desktop usage percentages
    - Browser type breakdown (optional)

#### Scenario: Sales team analyzes engagement
- Sales team navigates to engagement analytics
- Views top companies: Acme Corp (23 downloads, 5 submissions), TechCorp (18 downloads, 3 submissions)
- Identifies highly engaged companies for outreach
- Downloads company list to CSV for sales pipeline
- Uses engagement data to prioritize follow-ups

### Requirement: Compliance & Audit Trail
The system SHALL maintain compliance & audit trail.

All actions logged for audit and compliance purposes.

#### Details
- Audit log page (admin-only) shows:
  - All analytics dashboard access: who accessed when, IP address
  - All approval/denial actions: who approved, which document, when, reason
  - All data exports: who exported, what data, when
  - Cannot be edited or deleted (immutable log)
  - Searchable and filterable by action type, user, date range
  - Exportable for compliance audits
- Data retention:
  - Download logs retained for 2 years
  - Form submissions retained for 2 years
  - Access requests retained for 5 years (longer for compliance)
  - Audit logs retained indefinitely
- Compliance reports (admin-only):
  - Generate reports for SOC 2, GDPR, CCPA audits
  - Show document access patterns, data sharing practices
  - Prove data handling practices align with policies

#### Scenario: Compliance audit
- Security auditor requests proof that document access is controlled
- Admin navigates to analytics dashboard
- Exports access request approval log (past 12 months)
- Document shows: Date, Requester, Company, Document, Status, Approved/Denied By
- Proves that NDA-protected documents were reviewed before sharing
- Included in SOC 2 audit evidence

### Requirement: Responsive Dashboard Design
The system SHALL provide responsive dashboard design.

Analytics works on all devices (primarily desktop).

#### Details
- Desktop (1200px+): Full layout with all charts, tables, filters
- Tablet (768px-1199px): Simplified layout, stacked sections, full-width tables with horizontal scroll (if needed)
- Mobile (320px-767px): Card-based layout, one metric/section per card, simplified charts
- Navigation:
  - Desktop: Sidebar menu with all sections
  - Tablet: Top navigation with dropdown menu
  - Mobile: Hamburger menu (collapsed by default)
- Tables:
  - Desktop: Full table with all columns
  - Tablet: Reduced columns, scrollable horizontally
  - Mobile: Card view (one row per card, scrollable vertically)
- Charts:
  - Desktop: Full-size charts with legends
  - Tablet: Slightly reduced, but readable
  - Mobile: Simplified charts or metrics only (no complex charts)

#### Scenario: Admin views dashboard on phone
- Navigates to `/analytics` on mobile
- Sees hamburger menu at top
- Clicks menu to see: Overview, Downloads, Forms, Access Requests, Audit Log
- Selects "Downloads"
- Views download metrics in card format
- Taps document to expand details
- All information readable without zooming

### Requirement: Accessibility Compliance
The system SHALL ensure accessibility compliance.

Analytics Dashboard is fully accessible.

#### Details
- Semantic HTML: `<main>`, `<nav>`, `<table>`, `<button>`, etc.
- Tables:
  - Proper `<thead>`, `<tbody>`, `<th>` tags
  - Column headers have `scope="col"`
  - Accessible table navigation
- Forms & Filters:
  - Labels associated with inputs
  - Dropdown menus have descriptive labels
  - Date pickers are keyboard-accessible
- Buttons & Links:
  - Descriptive text (not "Click here")
  - Proper ARIA roles
  - Visible focus indicators
- Charts:
  - Alt text describing data
  - Data table alternative provided
  - Color not only indicator (use patterns/icons too)
- Keyboard navigation:
  - All interactive elements reachable via Tab
  - Logical tab order
  - Escape key closes modals
- Screen reader:
  - Page structure announced correctly
  - Chart data announced (alternative table)
  - Error messages clear
  - Status updates announced (approval success, etc.)
- Color contrast: 4.5:1 for text, labels, icons

#### Scenario: Keyboard user manages access requests
- User tabs through dashboard
- Focuses on "Approve" button
- Presses Enter
- Modal opens with focus moved to button
- User tabs through modal fields
- User presses Enter to confirm or Escape to cancel
- Focus returns to "Approve" button

## MODIFIED Requirements
None (new section).

## REMOVED Requirements
None (new section).
