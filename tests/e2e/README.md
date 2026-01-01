# E2E Tests

This directory contains end-to-end tests for the Trust Center application using Playwright.

## Test Scenarios

- Homepage loading with all sections
- Certification grid filtering
- Document library search
- Public document download
- Login modal for gated documents
- Authentication flow (login/logout)
- Contact form submission
- Subprocessors table search
- FAQ accordion expand/collapse
- Responsive layout at mobile breakpoint

## Running Tests

```bash
pnpm test:e2e
```

## CI Integration

Tests run automatically in CI on every push to main and PRs.
