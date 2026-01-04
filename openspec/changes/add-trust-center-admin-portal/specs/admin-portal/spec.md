## ADDED Requirements

### Requirement: Admin Portal Access

The system SHALL provide an admin portal accessible only to users with admin role or @descope.com email domain.

#### Scenario: Admin user login

- **WHEN** a user with admin role logs in
- **THEN** they can access /admin routes
- **AND** non-admin users receive access denied

#### Scenario: Descope email access

- **WHEN** a user with @descope.com email logs in
- **THEN** they can access admin portal regardless of explicit role

### Requirement: Certifications Management

The system SHALL allow admins to perform CRUD operations on certifications.

#### Scenario: Create certification

- **WHEN** admin submits certification form with name, description, logo, dates
- **THEN** certification is saved as draft in database
- **AND** audit log records the creation

#### Scenario: Update certification

- **WHEN** admin modifies existing certification
- **THEN** changes are saved
- **AND** audit log records the update with old/new values

#### Scenario: Delete certification

- **WHEN** admin deletes a certification
- **THEN** it is removed from database
- **AND** audit log records the deletion

#### Scenario: Publish certification

- **WHEN** admin publishes a draft certification
- **THEN** status changes to published
- **AND** it becomes visible on public Trust Center
- **AND** audit log records the publish action

### Requirement: Documents Management

The system SHALL allow admins to manage documents with file uploads.

#### Scenario: Upload document

- **WHEN** admin uploads a file with title and description
- **THEN** file URL is stored in database
- **AND** document is saved as draft

#### Scenario: Update document metadata

- **WHEN** admin changes document title or access level
- **THEN** changes are saved without re-uploading file

#### Scenario: Delete document

- **WHEN** admin deletes a document
- **THEN** database record is removed
- **AND** file may remain in storage for audit purposes

### Requirement: Subprocessors Management

The system SHALL allow admins to manage subprocessor vendor information.

#### Scenario: Add subprocessor

- **WHEN** admin adds vendor details
- **THEN** subprocessor is saved as draft

#### Scenario: Update subprocessor

- **WHEN** admin modifies vendor information
- **THEN** changes are saved

#### Scenario: Publish subprocessor list

- **WHEN** admin publishes subprocessors
- **THEN** they appear on public Trust Center

### Requirement: FAQs Management

The system SHALL allow admins to manage frequently asked questions.

#### Scenario: Create FAQ

- **WHEN** admin adds question and answer
- **THEN** FAQ is saved as draft

#### Scenario: Edit FAQ

- **WHEN** admin modifies question or answer
- **THEN** changes are saved

#### Scenario: Categorize FAQs

- **WHEN** admin assigns category to FAQ
- **THEN** category is stored for filtering

### Requirement: Draft/Publish Workflow

The system SHALL support draft and published states for all content.

#### Scenario: Draft editing

- **WHEN** admin edits draft content
- **THEN** changes don't affect public view

#### Scenario: Publish content

- **WHEN** admin publishes draft
- **THEN** content becomes publicly visible

#### Scenario: Unpublish content

- **WHEN** admin unpublishes content
- **THEN** it returns to draft state and is hidden from public

### Requirement: Audit Logging

The system SHALL log all content changes with user attribution.

#### Scenario: Change tracking

- **WHEN** any CRUD operation occurs
- **THEN** audit log captures action, user, timestamp, and changed values

#### Scenario: Audit log viewing

- **WHEN** admin views audit logs
- **THEN** they can see chronological history of changes

#### Scenario: Change details

- **WHEN** viewing specific audit entry
- **THEN** old and new values are displayed for updates
