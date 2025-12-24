# Capability: Compliance Grid

## Overview
The Compliance Grid displays certification badges and status for key security and compliance certifications (SOC 2, ISO 27001, GDPR, CCPA, HIPAA, PCI DSS). Each card shows certification details and links to verified certificates.

## ADDED Requirements

### Requirement: Display Certification Cards
The system SHALL display certification cards.

Show certifications as a grid of cards with key information.

#### Details
- Grid layout: 3 columns on desktop, 2 columns on tablet, 1 column on mobile
- Each card displays:
  - Certification logo/icon
  - Certification name (e.g., "SOC 2 Type II")
  - Status badge (Active, In Progress, Planned)
  - Last audit date (e.g., "Audited: Dec 2024")
  - Expiry date if applicable (e.g., "Expires: Dec 2025")
  - Brief description (1-2 sentences)
  - "View Certificate" button (if public) or "Request Access" button (if restricted)

#### Scenario: User views Compliance Grid
- User scrolls to Compliance Grid section
- Grid displays 6 certification cards: SOC 2, ISO 27001, GDPR, CCPA, HIPAA, PCI DSS
- All cards are visible and properly spaced
- Cards have consistent height and styling
- Logo images load correctly

#### Scenario: User views on mobile
- Compliance Grid displays in 1 column
- Cards are full-width and readable
- All information is visible without horizontal scroll

### Requirement: Filter Certifications by Status
The system SHALL filter certifications by status.

Allow users to filter certifications by status.

#### Details
- Filter buttons above grid: "All" (default), "Active", "In Progress", "Planned"
- Clicking filter updates grid to show only matching certifications
- Active filter is visually highlighted
- If no certifications match filter, show message: "No certifications found"
- Filter persists during session (not across page reloads)

#### Scenario: User filters to Active certifications
- User sees filter buttons: "All", "Active", "In Progress", "Planned"
- User clicks "Active"
- Grid updates to show only Active certifications (e.g., SOC 2, ISO 27001, GDPR, CCPA)
- "Active" button is highlighted
- Inactive certifications (HIPAA, PCI DSS in progress) are hidden

#### Scenario: User clears filter
- User clicks "All"
- All certifications are visible again
- "All" button is highlighted

### Requirement: Link to Certificates
The system SHALL link to certificates.

Each certification card links to proof of certification.

#### Details
- Card has "View Certificate" button (if certification is public/active)
- Button links to certificate PDF or verification page (external link)
- Link opens in new tab
- Button text changes to "Request Access" for restricted certifications
- Restricted certifications trigger email form (see Email Gating requirement)

#### Scenario: User clicks View Certificate
- User sees certification card with "View Certificate" button
- Clicks button
- Certificate PDF opens in new tab
- User can download or view certificate in browser

#### Scenario: User requests access to restricted certification
- User sees certification card with "Request Access" button (for In Progress status)
- Clicks button
- Email form modal or inline form appears
- User enters email and optional message
- Form submits, user sees confirmation message

### Requirement: Display Audit Dates and Expiry
The system SHALL display audit dates and expiry.

Show when certifications were last audited and when they expire.

#### Details
- Display format: "Last Audited: Dec 2024" or "Audited: Dec 2024"
- Expiry date: "Expires: Dec 2025" (only if applicable)
- If expiry is within 90 days, highlight in yellow/orange
- If expired, show status as "Expired" and highlight in red
- Sort cards by expiry date (soonest first) or by status

#### Scenario: Certification expires soon
- Certification audit expires in 60 days (Feb 2025)
- Card displays: "Expires: Feb 2025" in yellow highlight
- User immediately sees which certifications need renewal

#### Scenario: Multiple certifications with different statuses
- Cards are sorted by expiry date (soonest first)
- Active certifications with furthest expiry dates are at the bottom
- In Progress certifications are shown with gray status badge

### Requirement: Accessibility Compliance
The system SHALL accessibility compliance.

Compliance Grid is accessible to all users.

#### Details
- Semantic HTML: Cards use `<article>`, buttons are properly labeled
- Color contrast: Status badges have 4.5:1 contrast
- Status badges use text + color (not just color to indicate status)
- Links have descriptive text ("View Certificate for SOC 2", not just "View")
- Keyboard navigation: Tab through all cards and buttons, visible focus indicator
- Screen reader: Cards are announced as separate items, all information is read

#### Scenario: User navigates with keyboard
- User presses Tab to focus each certification card
- Focus indicator is visible around card border or button
- User presses Enter on "View Certificate" button
- Link is activated and certificate opens

#### Scenario: Screen reader user
- Screen reader announces: "Compliance Certifications, list"
- For each certification: "SOC 2 Type II, Status: Active, Last Audited: December 2024, Expires: December 2025, View Certificate button"
- All information is announced in logical order

## MODIFIED Requirements
None (new section).

## REMOVED Requirements
None (new section).

