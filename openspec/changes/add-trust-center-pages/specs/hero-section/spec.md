# Capability: Hero Section

## Overview
The Hero Section is the first component users see on the Trust Center page. It establishes trust messaging, displays key security metrics, and includes a clear call-to-action.

## ADDED Requirements

### Requirement: Display Hero Messaging
The system SHALL display a compelling hero section with company branding and trust-focused messaging.

#### Details
- Hero section spans full viewport width
- Displays: Company name, hero headline, subheadline, 3-4 key trust stats
- Trust stats show: SOC 2 Type II Certified, 99.99% Uptime, GDPR Compliant, [Custom metric]
- Stats displayed with icons and numbers
- Responsive layout: Full-width on desktop, stacked on mobile

#### Scenario: User views Trust Center on desktop
- User navigates to `/trust-center`
- Hero section is the first element in viewport
- Hero displays Descope logo, headline ("Descope Security & Compliance"), subheadline
- 4 trust stat cards are visible: SOC 2, Uptime, GDPR, Privacy
- Each stat card has an icon and description
- CTA button "View Compliance Details" is prominently visible below stats

#### Scenario: User views Trust Center on mobile
- Same content as desktop, but layout is vertical
- Trust stats stack in 2 columns on mobile (not 4)
- Text sizes are readable (16px+ for body)
- CTA button is full-width and easy to tap (44px+ height)

### Requirement: Display Call-to-Action Button
The system SHALL include a prominent CTA that guides users to explore security details.

#### Details
- CTA button text: "View Compliance Details" or "Explore Security"
- Button styling: Primary brand color, hover effects
- Clicking CTA scrolls to compliance section (smooth scroll)
- Alternative: Link to document download section

#### Scenario: User clicks CTA button
- User sees CTA button in hero section
- Clicks button
- Page smoothly scrolls to Compliance Grid section
- Focus moves to compliance section heading (for accessibility)

### Requirement: Responsive Design
The system SHALL ensure the hero section is responsive across all device sizes.

#### Details
- Desktop (1200px+): Full width, 4-column stat grid
- Tablet (768px-1199px): Full width, 2-column stat grid
- Mobile (320px-767px): Full width, stacked single column or 2-column grid
- No horizontal scroll on any device
- Touch targets > 44px on mobile

#### Scenario: User resizes browser window
- User starts on desktop view (1200px+)
- Hero displays 4 stats in a row
- User resizes to tablet (900px)
- Hero reflows to 2x2 grid without breaking layout
- User resizes to mobile (375px)
- Hero reflows to stacked/single column layout
- No content is hidden or cut off

### Requirement: Accessibility Compliance
The system SHALL ensure the hero section is accessible to all users, including those using assistive technologies.

#### Details
- Semantic HTML: `<header>` with `<h1>`, `<p>`, `<button>`
- Color contrast: 4.5:1 for all text
- Images: All have descriptive alt text
- CTA button: Keyboard focusable, visible focus indicator
- Screen reader: All content is announced correctly
- No auto-playing audio/video

#### Scenario: User navigates with keyboard only
- User presses Tab to focus CTA button
- Focus indicator (outline) is visible and clear
- User presses Enter to activate button
- Page scrolls and focus moves to next section

#### Scenario: User with screen reader
- Screen reader announces: "Hero Section"
- Announces heading: "Descope Security & Compliance"
- Announces each stat: "SOC 2 Type II Certified" with icon description
- Announces button: "View Compliance Details, button"

## MODIFIED Requirements
None (new section).

## REMOVED Requirements
None (new section).

