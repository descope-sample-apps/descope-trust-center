# Visual Testing with Playwright

This directory contains visual tests for the Descope Trust Center application using Playwright.

## Setup

The visual tests are already configured with Playwright. To get started:

1. Install dependencies:
   ```bash
   bun install
   ```

2. Install Playwright browsers:
   ```bash
   bunx playwright install
   ```

## Running Tests

### Basic Test Commands

- **Run all tests:** `bun run test`
- **Run tests in headed mode:** `bun run test:headed`
- **Run tests with UI:** `bun run test:ui`
- **Debug tests:** `bun run test:debug`
- **View test report:** `bun run test:report`
- **Generate tests with codegen:** `bun run test:codegen`

### Test Files

- `visual.spec.ts` - Basic page load and navigation tests
- `components.spec.ts` - Component-specific visual tests
- `accessibility.spec.ts` - Accessibility and visual regression tests
- `fixtures.ts` - Common test utilities and setup

## Visual Testing Features

### Screenshot Testing
- Automatic screenshots on test failures
- Visual regression comparison across viewports
- Component-level screenshot testing

### Cross-Browser Testing
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

### Responsive Testing
- Desktop (1920x1080)
- Tablet (1024x768) 
- Mobile (375x667)

### Accessibility Testing
- Heading structure validation
- Alt text verification
- Keyboard navigation testing
- Color contrast checks

## Configuration

### Playwright Config
The `playwright.config.ts` file contains:
- Browser configurations
- Test directory settings
- Reporter configuration
- Web server setup

### Test Configuration
The `tests/test-config.json` file contains:
- Viewport definitions
- Screenshot options
- Visual regression thresholds
- Test suite definitions

## Writing New Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test('test description', async ({ page }) => {
  await page.goto('/');
  
  // Your test logic here
  
  // Take screenshot for visual testing
  await expect(page).toHaveScreenshot('test-name.png');
});
```

### Using Test Utilities
```typescript
import { test, expect, TestUtils } from './fixtures';

test('test with utilities', async ({ page }) => {
  await page.goto('/');
  
  // Wait for stable element
  const element = await TestUtils.waitForStableElement(page, 'selector');
  
  // Check if in viewport
  const isVisible = await TestUtils.isInViewport(page, 'selector');
});
```

## CI/CD Integration

Visual tests run automatically on:
- Pull requests
- Pushes to main/develop branches

The workflow:
1. Builds the application
2. Runs all visual tests
3. Uploads test reports and artifacts
4. Fails if visual regressions are detected

## Best Practices

1. **Use specific selectors** - Avoid brittle selectors that might change
2. **Wait for stability** - Use `waitForStableElement` for dynamic content
3. **Test user flows** - Focus on complete user journeys
4. **Keep tests independent** - Each test should work in isolation
5. **Use descriptive names** - Make test names and screenshot names meaningful

## Troubleshooting

### Common Issues

1. **Flaky tests** - Increase wait times or use more specific selectors
2. **Screenshot differences** - Check for animations or dynamic content
3. **Timeout errors** - Increase timeout in test configuration
4. **Browser issues** - Reinstall Playwright browsers

### Debug Mode
Run tests in debug mode to step through execution:
```bash
bun run test:debug
```

### Test UI
Use the Playwright Test UI for interactive test management:
```bash
bun run test:ui
```

## Updating Screenshots

When intentional visual changes are made, update screenshots:

1. Run tests locally to see differences
2. Review changes are intentional
3. Update screenshots with:
   ```bash
   bunx playwright test --update-snapshots
   ```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Visual Testing Guide](https://playwright.dev/docs/visual-comparisons)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)