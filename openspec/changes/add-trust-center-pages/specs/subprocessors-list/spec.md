# Capability: Subprocessors List

## Overview
The Subprocessors List displays a searchable and filterable table of third-party vendors that process customer data on behalf of Descope. Users can discover vendor details and subscribe to change notifications.

## ADDED Requirements

### Requirement: Display Subprocessor Table
The system SHALL display subprocessor table.

Show a comprehensive list of subprocessors in a tabular format.

#### Details
- Table columns:
  1. **Vendor Name**: Name of third-party service provider
  2. **Purpose**: What the vendor does (e.g., "Email delivery", "Analytics", "Cloud storage")
  3. **Data Processed**: What customer data is shared (e.g., "User IDs", "Email addresses", "Usage analytics")
  4. **Location**: Where data is processed (e.g., "United States", "European Union")
  5. **Status**: Current status (Active, Deprecated, Sunset planned)
  6. **Contract**: Link to DPA or contract reference
- Table headers are sticky (remain visible when scrolling)
- Rows are sortable by clicking column headers (optional for v1)
- Default sort: By vendor name (A-Z)

#### Scenario: User views Subprocessor Table
- User sees table with 8-10 vendor rows
- Columns are clearly labeled: Vendor Name, Purpose, Data Processed, Location, Status, Contract
- Table displays:
  - Stripe | Payment processing | Payment info, customer emails | US | Active | View DPA
  - Sendgrid | Email delivery | User emails | US | Active | View DPA
  - Mixpanel | Analytics | Usage analytics, event logs | US | Active | View DPA
  - AWS | Cloud infrastructure | All data (encrypted) | US/EU | Active | View Agreement
  - And more...
- All rows are visible and readable

#### Scenario: User views on tablet
- Table columns are adjusted for smaller screen
- "Data Processed" column may be abbreviated to "Data" or shown on hover
- Table is horizontally scrollable (only if necessary)
- Vendor name and purpose always visible

#### Scenario: User views on mobile
- Table is converted to card view (not horizontal scroll)
- Each vendor is a card with:
  - Vendor name (bold)
  - Purpose
  - Data Processed
  - Location
  - Status badge
  - Contract link
- Cards are stacked vertically and full-width

### Requirement: Search Subprocessors
The system SHALL search subprocessors.

Allow users to search vendors by name or purpose.

#### Details
- Search input field above table with label: "Search vendors..."
- Real-time search as user types
- Searches: Vendor name, purpose, data processed, location
- Results update dynamically (no page reload)
- If no matches found, show: "No vendors found matching your search"
- Search is case-insensitive
- Special characters handled gracefully

#### Scenario: User searches for "email"
- User enters "email" in search field
- Table filters to show vendors related to email:
  - SendGrid | Email delivery | User emails | US | Active
  - Amazon SES | Email delivery | User emails | US | Active
- Other vendors are hidden
- Results count shown: "2 vendors found"

#### Scenario: User searches for location "EU"
- User enters "EU" in search field
- Table filters to show EU-based vendors:
  - Datadog | Monitoring | Logs, metrics | EU | Active
  - AWS EU | Cloud infrastructure | All data | EU | Active
- US-based vendors are hidden

### Requirement: Filter by Status
The system SHALL filter by status.

Allow users to filter vendors by operational status.

#### Details
- Filter buttons above table: "All" (default), "Active", "Deprecated", "Sunset Planned"
- Clicking filter updates table to show only matching vendors
- Active filter is visually highlighted
- If no vendors match, show: "No active vendors" or similar
- Filters can be combined with search (search within filtered set)

#### Scenario: User filters to Active vendors
- User clicks "Active" filter
- Table shows only active vendors
- Deprecated or sunset-planned vendors are hidden
- "Active" button is highlighted

#### Scenario: User searches within filtered results
- User has "Active" filter applied
- User searches for "email"
- Table shows only active email-related vendors
- Search results are within the active vendor set

### Requirement: Link to Contracts/DPA
The system SHALL link to contracts/dpa.

Show links to Data Processing Agreements or vendor contracts.

#### Details
- Contract column shows:
  - "View DPA" link for vendors with standard DPA
  - "View Agreement" link for custom contracts
  - "Request" link for vendors where DPA is under negotiation
- Links open in new tab
- Links are keyboard-accessible and descriptive

#### Scenario: User views contract for SendGrid
- User sees SendGrid row: "View DPA" link in Contract column
- Clicks link
- DPA PDF opens in new tab
- User can download or view in browser

#### Scenario: User requests DPA for new vendor
- User sees vendor row with "Request" link (vendor is recent/under negotiation)
- Clicks link
- Contact form opens with pre-filled vendor name and subject "Request DPA for [Vendor]"
- User can submit request

### Requirement: Display Data Processing Details
The system SHALL display data processing details.

Show what data each vendor processes.

#### Details
- "Data Processed" column lists sensitive data types:
  - "User IDs" - Unique identifiers for users
  - "Email addresses" - User email addresses
  - "Usage analytics" - Aggregated usage data (no PII)
  - "Logs" - System logs (may contain IP addresses, timestamps)
  - "All data (encrypted)" - Full database access, but data is encrypted at rest
- Details are descriptive but not overly technical
- If data is encrypted or anonymized, note that clearly

#### Scenario: User reviews data processed by AWS
- AWS row shows: "All data (encrypted)"
- Description: AWS stores encrypted backups, but does not have encryption keys
- User understands AWS has access to data but cannot read it

#### Scenario: User reviews data processed by Mixpanel
- Mixpanel row shows: "Usage analytics"
- Description: Aggregated, non-identifying analytics
- User understands no PII is shared with Mixpanel

### Requirement: Subscribe to Subprocessor Changes
The system SHALL subscribe to subprocessor changes.

Allow users to receive notifications when subprocessors change.

#### Details
- "Subscribe" button or "Notify me" toggle below table
- Clicking opens modal or inline form with email field
- Email is required, optional: Company, notification frequency
- Submission subscribes user to email notifications:
  - New vendors added
  - Vendors removed/deprecated
  - Data processing changes
  - Major vendor updates
- Success message: "Check your email for confirmation. You'll receive updates when subprocessors change."
- User can unsubscribe via email link

#### Scenario: User subscribes to updates
- User sees "Subscribe to Updates" button below table
- Clicks button
- Form modal appears with field: "Email address"
- User enters email
- Clicks "Subscribe"
- Success message: "Check your email to confirm subscription"
- Email is sent with confirmation link

#### Scenario: Subprocessor list changes
- New vendor is added to the list
- All subscribed users receive email: "Descope Subprocessor Update: Acme Corp added as [Purpose]"
- Email includes summary of change and link to full list

### Requirement: Display Vendor Metadata
The system SHALL display vendor metadata.

Show additional context for each vendor.

#### Details
- Optional metadata columns (if space allows):
  - **Since**: When vendor relationship started (e.g., "Since 2023")
  - **Region**: Specific region if multi-region (e.g., "North America", "EMEA")
  - **SOC 2**: Whether vendor is SOC 2 certified (badge or indicator)
- Hoverable tooltips for acronyms (e.g., "DPA: Data Processing Agreement")
- Status badge styling:
  - Active: Green background
  - Deprecated: Gray background
  - Sunset Planned: Yellow/orange background

#### Scenario: User reviews AWS metadata
- AWS row shows:
  - Purpose: Cloud infrastructure
  - Data: All data (encrypted)
  - Location: US/EU
  - Status: Active (green badge)
  - SOC 2: ✓ Certified (indicator)
  - Since: 2020

### Requirement: Responsive Table Design
The system SHALL responsive table design.

Table adapts to all device sizes without losing functionality.

#### Details
- Desktop (1200px+): Full table with all columns visible
- Tablet (768px-1199px): Simplified table (hide optional columns, or convert to cards)
- Mobile (320px-767px): Card view, each vendor is a stacked card
- Search field and filters always visible
- No horizontal scroll on mobile (or minimal if unavoidable)
- Touch targets > 44px on mobile

#### Scenario: User views on mobile
- Table is converted to card layout
- Each vendor displays as a full-width card:
  - Vendor name (bold, large)
  - Purpose
  - Data Processed
  - Location
  - Status badge (colored)
  - Contract link
- Cards are stacked vertically
- Search and filter buttons are at the top, easy to tap

### Requirement: Accessibility Compliance
The system SHALL accessibility compliance.

Subprocessor List is accessible to all users.

#### Details
- Semantic HTML: `<table>` with proper `<thead>`, `<tbody>`, `<th>`, `<td>`
- Table caption or heading: "List of subprocessors authorized to process customer data"
- Column headers: Descriptive and clickable (if sortable)
- Links: Descriptive text, not "Click here" or "View"
- Forms: Labels associated, error messages clear
- Color contrast: 4.5:1 for all text, status badges use text + color
- Keyboard navigation: Tab through all interactive elements, visible focus
- Screen reader: Table announced as table, columns announced, data cells readable

#### Scenario: Keyboard user filters vendors
- User presses Tab to focus "Active" filter button
- Focus indicator is visible
- User presses Enter or Space to activate button
- Table filters and focus remains visible

#### Scenario: Screen reader user
- Screen reader announces: "Subprocessors list table with 6 columns and 10 rows"
- Column headers announced: "Vendor Name, Purpose, Data Processed, Location, Status, Contract"
- For each row: "SendGrid, Email delivery, User emails, United States, Active, View DPA link"
- All data is announced in logical table structure

## MODIFIED Requirements
None (new section).

## REMOVED Requirements
None (new section).

