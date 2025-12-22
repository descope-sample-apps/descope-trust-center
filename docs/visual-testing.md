# Enhanced Visual Testing Setup

This document describes the enhanced visual testing setup for the Descope Trust Center application using Playwright.

## 🎯 Overview

The visual testing setup provides comprehensive visual regression testing across multiple browsers, viewports, and user interactions. It includes:

- **Basic Visual Tests** - Page load and navigation testing
- **Component Tests** - Individual component visual testing
- **Accessibility Tests** - Accessibility and visual regression testing
- **Enhanced Visual Tests** - Advanced interaction testing
- **Cross-Browser Testing** - Testing across Chromium, Firefox, and WebKit
- **Responsive Testing** - Testing across desktop, tablet, and mobile viewports

## 🚀 Quick Start

### 1. Install Dependencies
```bash
bun install
```

### 2. Install Playwright Browsers
```bash
bunx playwright install
```

### 3. Run Visual Tests
```bash
# Run all visual tests
bun run test:visual all

# Run basic visual tests
bun run test:visual basic

# Run enhanced visual tests
bun run test:visual enhanced
```

## 📋 Available Commands

### Basic Testing Commands
- `bun run test:visual basic` - Run basic visual tests
- `bun run test:visual components` - Run component visual tests
- `bun run test:visual accessibility` - Run accessibility tests
- `bun run test:visual enhanced` - Run enhanced visual tests
- `bun run test:visual all` - Run all visual tests

### Browser-Specific Commands
- `bun run test:visual cross-browser` - Run tests across all browsers
- `bun run test:visual mobile` - Run mobile-specific tests
- `bun run test:visual dark-mode` - Run dark mode tests

### Development Commands
- `bun run test:visual update-screenshots` - Update all screenshots
- `bun run test:visual debug` - Run tests in debug mode
- `bun run test:visual ui` - Run tests with Playwright UI
- `bun run test:visual codegen` - Open Playwright codegen
- `bun run test:visual report` - Show test report

## 📁 Test Structure

```
tests/
├── visual.spec.ts              # Basic visual tests
├── components.spec.ts          # Component visual tests
├── accessibility.spec.ts      # Accessibility and visual regression
├── enhanced-visual.spec.ts     # Enhanced interaction tests
├── visual-regression-helper.ts # Visual testing utilities
├── fixtures.ts                 # Common test fixtures
├── global-setup.ts            # Global test setup
├── global-teardown.ts         # Global test teardown
├── test-config.json           # Test configuration
└── README.md                  # Test documentation
```

## 🎨 Visual Testing Features

### Screenshot Testing
- **Automatic Screenshots** - Screenshots taken on test failures
- **Manual Screenshots** - Explicit screenshot testing with `toHaveScreenshot()`
- **Component Screenshots** - Individual component visual testing
- **Full Page Screenshots** - Complete page visual testing

### Responsive Testing
- **Desktop** - 1920x1080 viewport
- **Tablet** - 1024x768 viewport
- **Mobile** - 375x667 viewport
- **Custom Viewports** - Additional viewport sizes as needed

### Cross-Browser Testing
- **Chromium** - Chrome/Edge testing
- **Firefox** - Firefox testing
- **WebKit** - Safari testing
- **Mobile Browsers** - Mobile Chrome and Safari testing

### Interaction Testing
- **Hover States** - Visual testing of hover interactions
- **Focus States** - Visual testing of keyboard focus
- **Click Interactions** - Visual testing of click events
- **Form Interactions** - Visual testing of form filling and validation
- **Loading States** - Visual testing of loading and error states

### Theme Testing
- **Light Mode** - Default light theme testing
- **Dark Mode** - Dark theme testing (if available)
- **Theme Switching** - Visual testing of theme transitions

## 🔧 Configuration

### Playwright Configuration
The main configuration is in `playwright.config.ts`:
- Browser configurations
- Test directory settings
- Reporter configuration
- Web server setup

### Enhanced Configuration
Additional configuration is available in `playwright.config.enhanced.ts`:
- Advanced browser settings
- Visual regression specific settings
- Multiple reporters
- Global setup/teardown

### Test Configuration
Test-specific configuration is in `tests/test-config.json`:
- Viewport definitions
- Screenshot options
- Visual regression thresholds
- Test suite definitions

## 📊 Test Reports

### HTML Report
- **Location**: `playwright-report/index.html`
- **Features**: Interactive test results, screenshots, videos
- **Command**: `bun run test:report`

### JSON Report
- **Location**: `test-results/results.json`
- **Features**: Machine-readable test results
- **Usage**: CI/CD integration

### JUnit Report
- **Location**: `test-results/results.xml`
- **Features**: JUnit-compatible test results
- **Usage**: CI/CD integration

## 🔄 CI/CD Integration

### GitHub Actions
Visual tests run automatically on:
- Pull requests
- Pushes to main/develop branches

### Workflow Steps
1. **Build Application** - Build the Next.js application
2. **Install Browsers** - Install Playwright browsers
3. **Run Tests** - Execute visual tests
4. **Upload Results** - Upload test reports and artifacts
5. **Fail on Regression** - Fail build if visual regressions detected

## 📝 Writing New Tests

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

### Using Visual Regression Helper
```typescript
import { test, expect } from '@playwright/test';
import { VisualRegressionHelper } from './visual-regression-helper';

test('test with helper', async ({ page }) => {
  const vr = new VisualRegressionHelper(page);
  await page.goto('/');
  
  // Test responsive viewports
  await vr.testResponsiveViewports('component-name');
  
  // Test hover states
  await vr.testHoverStates('selector', 'screenshot-name');
  
  // Test focus states
  await vr.testFocusStates('selector', 'screenshot-name');
});
```

### Test Categories
- **Smoke Tests** - Basic functionality testing
- **Regression Tests** - Visual regression testing
- **Component Tests** - Individual component testing
- **Integration Tests** - Multi-component interaction testing
- **Accessibility Tests** - Accessibility compliance testing

## 🎯 Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow consistent naming conventions

### 2. Selector Strategy
- Use stable selectors (data-testid, id, class)
- Avoid brittle selectors (dynamic classes, XPath)
- Use semantic selectors when possible

### 3. Screenshot Management
- Use descriptive screenshot names
- Test multiple viewports
- Consider animation states

### 4. Test Stability
- Wait for elements to be stable
- Handle loading states appropriately
- Use appropriate timeouts

### 5. Maintenance
- Update screenshots when intentional changes occur
- Review test failures for legitimate regressions
- Keep tests independent and isolated

## 🐛 Troubleshooting

### Common Issues

#### Flaky Tests
- **Cause**: Timing issues, dynamic content
- **Solution**: Increase wait times, use more specific selectors
- **Prevention**: Use `waitForStableElement` helper

#### Screenshot Differences
- **Cause**: Animations, dynamic content, browser differences
- **Solution**: Disable animations, wait for stability
- **Prevention**: Use consistent test data

#### Timeout Errors
- **Cause**: Slow loading, network issues
- **Solution**: Increase timeouts, check server status
- **Prevention**: Use appropriate timeout values

#### Browser Issues
- **Cause**: Browser version conflicts
- **Solution**: Reinstall Playwright browsers
- **Command**: `bunx playwright install`

### Debug Mode
Run tests in debug mode to step through execution:
```bash
bun run test:visual debug
```

### Test UI
Use the Playwright Test UI for interactive test management:
```bash
bun run test:visual ui
```

## 📈 Performance Considerations

### Test Parallelization
- Tests run in parallel by default
- Use `test.serial.only` for serial execution
- Configure worker count in CI/CD

### Screenshot Optimization
- Use appropriate screenshot formats
- Consider clip regions for large components
- Optimize animation handling

### Resource Management
- Clean up test data in teardown
- Use appropriate browser contexts
- Manage memory usage in long test runs

## 🔮 Future Enhancements

### Planned Features
- **Visual AI Testing** - AI-powered visual analysis
- **Performance Testing** - Visual performance metrics
- **Cross-Device Testing** - Real device testing
- **Advanced Regression** - Pixel-level regression analysis

### Integration Opportunities
- **Design Systems** - Design token validation
- **Component Libraries** - Component documentation testing
- **A/B Testing** - Visual A/B test validation
- **Analytics Integration** - User behavior correlation

## 📚 Resources

### Documentation
- [Playwright Documentation](https://playwright.dev/)
- [Visual Testing Guide](https://playwright.dev/docs/visual-comparisons)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Test Configuration](https://playwright.dev/docs/test-configuration)

### Tools and Extensions
- [Playwright VS Code Extension](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)
- [Playwright Test Runner](https://playwright.dev/docs/test-runner)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)

### Community
- [Playwright Discord](https://discord.gg/playwright)
- [GitHub Discussions](https://github.com/microsoft/playwright/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)

---

For questions or issues with the visual testing setup, please refer to the [Playwright documentation](https://playwright.dev/) or create an issue in the project repository.