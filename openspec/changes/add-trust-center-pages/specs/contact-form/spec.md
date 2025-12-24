# Capability: Contact Form

## Overview
The Contact Form allows users to request documents, ask security questions, or schedule security review calls. Form submissions are validated, rate-limited, and routed to the appropriate team.

## ADDED Requirements

### Requirement: Display Contact Form
The system SHALL display contact form.

Show a form with fields for user inquiry.

#### Details
- Form fields:
  1. **Name** (required): User's full name
  2. **Email** (required): User's email address
  3. **Company** (optional): User's company name
  4. **Request Type** (required): Dropdown with options:
     - "Request Document"
     - "Security Question"
     - "Schedule Security Review"
     - "Other"
  5. **Message** (required): Detailed message or question (textarea, min 10 chars)
- Form layout:
  - Vertical stack (labels above inputs)
  - Clear visual hierarchy
  - Required field indicators (*)
  - Helpful placeholders (optional)
  - Submit button: "Send Request" or "Submit"
  - Optional: "Cancel" or "Clear" button

#### Scenario: User fills contact form
- User scrolls to contact form section
- Form shows fields: Name, Email, Company, Request Type (dropdown), Message
- User enters:
  - Name: "Jane Doe"
  - Email: "jane@descope-trust-center.com"
  - Company: "Acme Corp"
  - Request Type: "Request Document" (dropdown)
  - Message: "We need the detailed SOC 2 report for our compliance audit."
- User clicks "Send Request"

### Requirement: Form Validation
The system SHALL form validation.

Validate all required fields and formats.

#### Details
- **Name**: Required, min 2 chars, max 100 chars
- **Email**: Required, valid email format (RFC 5322)
  - Show error if email is invalid: "Please enter a valid email address"
- **Company**: Optional, max 100 chars
- **Request Type**: Required, must be one of dropdown options
- **Message**: Required, min 10 chars, max 5000 chars
  - Show error if message is too short: "Please provide more detail (at least 10 characters)"
- Validation happens:
  - On blur (for individual fields)
  - On submit (for all fields)
- Error messages appear inline below each field in red text
- Failed submit shows summary error message: "Please fix the errors below"
- All error messages are clear and helpful

#### Scenario: User submits incomplete form
- User leaves Name field blank and clicks Submit
- Error message appears below Name field: "Name is required"
- Submit button is disabled or shows error state
- User is not navigated away from form
- User can correct and resubmit

#### Scenario: User enters invalid email
- User enters: "notanemail"
- On blur, error message appears: "Please enter a valid email address"
- Email field is highlighted in red
- User corrects email
- Error message disappears

### Requirement: Rate Limiting
The system SHALL rate limiting.

Prevent spam by rate-limiting form submissions.

#### Details
- IP-based rate limiting:
  - Max 5 form submissions per IP per hour
  - After limit exceeded, show message: "You've submitted too many requests. Please try again in [X] minutes."
- Email-based rate limiting (optional):
  - Max 3 requests per email address per day
  - After limit exceeded, show: "We've received your request. We'll respond within 24 hours."
- Rate limit errors are user-friendly and don't leak technical details

#### Scenario: User hits rate limit
- User has submitted 5 requests in the past hour
- User submits another request
- Form shows error: "You've submitted too many requests. Please try again in 45 minutes."
- Submit button is disabled
- User understands they need to wait before resubmitting

#### Scenario: Spam attack
- Multiple IP addresses submit spam in rapid succession
- Backend rate limiter blocks IPs after >10 requests/hour
- Spam requests are logged for analysis
- Legitimate users are not affected (per-IP, per-email limits are generous)

### Requirement: Form Submission & Response
The system SHALL form submission & response.

Handle form submission and provide feedback.

#### Details
- On submit:
  - Form shows loading state (spinner or disabled button with "Submitting...")
  - Submission is sent to tRPC endpoint: `contact.submit()`
  - User is not navigated away during submission
- On success:
  - Success message appears: "Thank you! We've received your request and will respond within 1 business day."
  - Form resets to empty state (or stays filled for user confirmation)
  - Optional: Success modal or toast notification
- On error:
  - Error message appears: "Something went wrong. Please try again or email us at [address]"
  - Form state is preserved (user doesn't lose their input)
  - User can retry submission
- Submission data is not shown to user (privacy)

#### Scenario: User submits form successfully
- User fills form and clicks "Send Request"
- Button shows "Submitting..." state
- After 1-2 seconds, button state resets
- Success message appears at top of form: "Thank you! We've received your request and will respond within 1 business day."
- User sees confirmation that submission was successful
- Form fields remain visible (for reference)

#### Scenario: Network error during submission
- User submits form
- Network error occurs (offline, server unavailable)
- Error message appears: "Something went wrong. Please try again or email us at security@descope.com"
- Form data is preserved
- User can fix the issue and retry

### Requirement: Email Notification Integration
The system SHALL email notification integration.

Send confirmation and internal notifications.

#### Details
- User receives confirmation email:
  - Subject: "We received your security inquiry"
  - Body: Confirms receipt, provides expected response time, includes reference number
  - From: noreply@descope.com or support@descope.com
- Internal team receives notification:
  - Email to: security-requests@descope.com (or similar)
  - Includes: User name, email, company, request type, message
  - Allows team to prioritize and respond
- Email service: Resend, SendGrid, or internal mail server
- No user data is logged publicly or in error messages

#### Scenario: User submits form
- Form validation passes
- User receives confirmation email within seconds
- Confirmation email includes:
  - Timestamp of submission
  - Reference number (e.g., "REQ-2024-12345")
  - Expected response time: "We'll respond within 1 business day"
  - Contact info if user needs immediate help

#### Scenario: Internal team receives request
- Security team receives email:
  - From: Form submission system
  - Subject: "New security inquiry: Request Document"
  - Body includes full submission details in formatted table
  - Team can filter, sort, prioritize requests

### Requirement: Request Type Handling
The system SHALL request type handling.

Route requests appropriately based on type.

#### Details
- **Request Document**:
   - User specifies which document they need (from document library)
   - Routed to: Legal/Compliance team
   - Response: Document sent via email or available for download via Descope
   - Special handling for NDA-protected documents: Requires approval before access granted
- **Security Question**:
   - User asks about security practices
   - Routed to: Security team
   - Response: Detailed answer or meeting scheduled
- **Schedule Security Review**:
   - User wants to book a security review call
   - Routed to: Security/Sales team
   - Response: Calendar invite sent, prep materials shared
- **Other**:
   - User has general inquiry
   - Routed to: Sales or Support team
   - Response: Routed to appropriate department

#### Scenario: User requests public document
- User selects "Request Document" from dropdown
- Form shows optional field: "Which document?" with autocomplete (lists public documents)
- User selects "GDPR Compliance Statement"
- User enters message: "Needed for our audit"
- Submit goes to Legal team
- Document is available for immediate download in Document Library

#### Scenario: User requests NDA-protected document
- User selects "Request Document" from dropdown
- Form shows optional field: "Which document?" with autocomplete (includes NDA-protected docs)
- User selects "Penetration Test Results (NDA Required)"
- Form shows additional required field: "Company name" (pre-filled if from Descope auth)
- Form shows additional field: "Why do you need this document?" (required for NDA docs)
- User enters message: "Security audit requirement"
- Submit goes to Security + Legal team for approval
- Team reviews company and use case
- If approved, user gets email with download link or Descope access granted
- If denied, user gets polite response explaining denial reason

#### Scenario: User requests security review
- User selects "Schedule Security Review"
- Form shows additional field: "Preferred time zone"
- User selects Pacific Time
- Message: "We'd like to discuss your security architecture"
- Submit goes to Security + Sales team
- They coordinate and send calendar invite within 24 hours

### Requirement: Responsive Form Design
The system SHALL responsive form design.

Form is usable on all devices.

#### Details
- Desktop (1200px+): Form displayed in centered container (400-600px wide)
- Tablet (768px-1199px): Form takes up 70-80% of width
- Mobile (320px-767px): Form is full-width with padding
- Input fields:
  - Full-width on all devices
  - Min height 44px for touch targets
  - Clear spacing between fields
  - Readable text size (16px minimum to prevent auto-zoom on iOS)
- Button: Full-width or fixed width, always easy to tap

#### Scenario: User fills form on mobile
- Form fields are full-width
- Tap target for each field is > 44px
- Keyboard appears when user focuses email field
- Form doesn't jump or reflow unexpectedly
- Submit button is easy to tap at bottom of form

### Requirement: Accessibility Compliance
The system SHALL accessibility compliance.

Contact Form is fully accessible.

#### Details
- Semantic HTML: `<form>`, `<label>`, `<input>`, `<textarea>`, `<select>`, `<button>`
- Labels: Every input has associated `<label>` with `for` attribute
- Required fields: Marked with `*` symbol AND `aria-required="true"`
- Error messages: Associated with fields via `aria-describedby`
- Form submission: Announced to screen readers
- Color contrast: 4.5:1 for labels and error messages
- Focus management:
  - Focus visible on all interactive elements
  - Focus moves logically through form (top to bottom)
  - After submission, focus moves to success message
- Tab order: Logical (left-to-right, top-to-bottom)

#### Scenario: Screen reader user fills form
- Screen reader announces: "Contact form"
- "Name" label is announced with input field
- User types "Jane Doe"
- User presses Tab
- "Email" label is announced
- User types "jane@descope-trust-center.com"
- All fields are announced with labels
- User presses Tab to reach submit button
- Button is announced: "Send Request, button"
- User presses Enter
- Screen reader announces: "Form submitted successfully. Thank you for your request."

#### Scenario: Keyboard user fills form
- User presses Tab to move through form
- Focus indicator visible around each field
- User can type in fields without mouse
- User presses Tab to reach submit button
- User presses Enter to submit
- Focus moves to success message
- User can Tab to other sections or close message

## MODIFIED Requirements
None (new section).

## REMOVED Requirements
None (new section).

