# Visual Regression Test Suite

This document provides comprehensive information about the visual regression test suite for the Descope Trust Center application.

## Overview

The visual regression test suite ensures visual consistency across different browsers, devices, and screen sizes. It includes multiple test files covering different aspects of the application's visual appearance and user experience.

## New Visual Regression Suite (v2.0)

We've introduced a comprehensive visual regression test suite with enhanced capabilities:

### Key Features
- **Comprehensive Coverage**: Tests all major components and layouts
- **Cross-browser Testing**: Chrome, Firefox, Safari support
- **Responsive Design**: Multiple viewport testing
- **Interactive States**: Hover, focus, and active states
- **Theme Testing**: Light and dark mode support
- **Accessibility Testing**: ARIA compliance and keyboard navigation
- **Performance Testing**: Loading states and layout stability

### New Test Files
- **`visual-regression-suite.spec.ts`** - Main comprehensive test suite
- **`playwright.config.visual.ts`** - Visual testing specific configuration
- **`scripts/visual-test-runner.ts`** - Enhanced test runner with multiple commands
- **`tests/visual-test-config.json`** - Comprehensive test configuration

### New NPM Scripts
```bash
bun run test:visual-regression      # Full visual regression suite
bun run test:visual-basic          # Basic visual tests
bun run test:visual-cross-browser  # Cross-browser tests
bun run test:visual-responsive     # Responsive design tests
bun run test:visual-mobile         # Mobile-specific tests
bun run test:visual-dark           # Dark mode tests
bun run test:visual-update         # Update screenshots
```

## Test Files

### 1. `visual.spec.ts` - Basic Visual Tests
- **Purpose**: Basic page load and navigation visual tests
- **Coverage**: Homepage loading, navigation, mobile responsiveness, dark mode
- **Key Tests**:
  - Homepage loads correctly
  - Navigation works correctly  
  - Responsive design on mobile
  - Dark mode visual testing

### 2. `components.spec.ts` - Component Visual Tests
- **Purpose**: Visual tests for individual components
- **Coverage**: Button, card, form, security, document, and contact components
- **Key Tests**:
  - Button component rendering
  - Card components rendering
  - Form elements rendering
  - Security overview section
  - Document library section
  - Contact form functionality

### 3. `accessibility.spec.ts` - Accessibility Visual Tests
- **Purpose**: Accessibility and visual regression tests
- **Coverage**: Meta tags, heading structure, color contrast, keyboard navigation
- **Key Tests**:
  - Proper meta tags
  - Proper heading structure
  - Sufficient color contrast
  - Keyboard navigation works
  - Images have alt attributes
  - Visual regression across viewports

### 4. `enhanced-visual.spec.ts` - Enhanced Visual Tests
- **Purpose**: Advanced visual testing with comprehensive state coverage
- **Coverage**: Hover states, focus states, form interactions, navigation, modals
- **Key Tests**:
  - Homepage visual regression across viewports
  - Component hover states
  - Component focus states
  - Form interaction visual testing
  - Navigation menu visual testing
  - Card component visual testing
  - Modal/dialog visual testing
  - Table component visual testing
  - Loading states visual testing
  - Scroll behavior visual testing
  - Error states visual testing

### 5. `comprehensive-visual.spec.ts` - Comprehensive Visual Tests
- **Purpose**: Complete application visual regression suite
- **Coverage**: Full application testing with advanced helper utilities
- **Key Tests**:
  - Complete application visual regression
  - Comprehensive responsive design testing
  - Component interaction states
  - Form validation and error states
  - Accessibility and ARIA compliance
  - Typography and text rendering
  - Image and media rendering
  - Color scheme and theme testing
  - Performance and loading states
  - Scroll behavior and layout stability
  - Component boundaries and overflow
  - Error handling and edge cases
  - Cross-device compatibility

### 6. `cross-browser-visual.spec.ts` - Cross-Browser Visual Tests
- **Purpose**: Cross-browser visual consistency testing
- **Coverage**: Chrome, Firefox, Safari, mobile browsers
- **Key Tests**:
  - Homepage visual consistency across browsers
  - Compliance cards cross-browser consistency
  - Document cards cross-browser consistency
  - Security highlights cross-browser consistency
  - FAQ section cross-browser consistency
  - Typography and text rendering cross-browser consistency
  - Button and interactive element cross-browser consistency
  - Badge and status indicator cross-browser consistency
  - Responsive layout cross-browser consistency
  - Color and theme cross-browser consistency
  - Form and input cross-browser consistency
  - Icon and SVG cross-browser consistency

## Helper Utilities

### 1. `visual-regression-helper.ts` - Basic Helper
Provides fundamental visual testing utilities:
- Screenshot capture with consistent options
- Element stability waiting
- Viewport testing
- Hover and focus state testing
- Dark mode testing
- Loading state testing

### 2. `advanced-visual-regression-helper.ts` - Advanced Helper
Provides comprehensive visual testing utilities:
- Advanced screenshot capture with masking
- Page stability waiting with image loading
- Comprehensive responsive testing
- Detailed interaction testing
- Accessibility testing
- Performance testing
- Boundary and overflow testing
- Error handling testing

## Test Configuration

### Viewports Tested
- **Desktop**: 1920x1080, 1440x900, 1366x768
- **Tablet**: 1024x768, 768x1024
- **Mobile**: 414x896, 375x667, 360x640

### Browsers Tested
- Chrome (Desktop & Mobile)
- Firefox (Desktop)
- Safari (Desktop & Mobile)
- Edge (via Chrome)

### Test Options
- **Screenshot on failure**: Enabled
- **Video on failure**: Enabled
- **Trace on retry**: Enabled
- **Animations**: Disabled for consistency
- **Wait for stability**: Enabled

## Running Tests

### Using the Visual Test Script
```bash
# Run basic visual tests
bun run visual-test basic

# Run component tests
bun run visual-test components

# Run accessibility tests
bun run visual-test accessibility

# Run enhanced visual tests
bun run visual-test enhanced

# Run comprehensive visual tests
bun run visual-test comprehensive

# Run cross-browser visual tests
bun run visual-test cross-browser

# Run all visual tests
bun run visual-test all

# Run tests across all browser projects
bun run visual-test cross-browser-projects

# Run mobile-specific tests
bun run visual-test mobile

# Run dark mode tests
bun run visual-test dark-mode

# Update screenshots
bun run visual-test update-screenshots

# Debug mode
bun run visual-test debug

# UI mode
bun run visual-test ui

# Show test report
bun run visual-test report
```

### Using Playwright Directly
```bash
# Run specific test file
bunx playwright test tests/visual.spec.ts

# Run all tests
bunx playwright test

# Run in headed mode
bunx playwright test --headed

# Run specific browser
bunx playwright test --project=chromium

# Update screenshots
bunx playwright test --update-snapshots

# Run with UI
bunx playwright test --ui
```

## Test Reports

After running tests, you can view detailed reports:

### HTML Report
```bash
bun run test:report
# Opens: playwright-report/index.html
```

### JSON Report
- Location: `test-results/results.json`
- Contains detailed test results and metadata

### JUnit Report
- Location: `test-results/results.xml`
- For CI/CD integration

## Screenshots

Screenshots are stored in the test results directory:
- **Success screenshots**: `test-results/`
- **Failure screenshots**: Automatically captured and stored in test report
- **Baseline screenshots**: Used for comparison in regression testing

## Best Practices

### Writing New Tests
1. **Use descriptive test names**: Make test purposes clear
2. **Test user flows**: Focus on complete user journeys
3. **Use consistent selectors**: Prefer stable selectors like `data-testid`
4. **Wait for stability**: Use helper utilities for consistent testing
5. **Test multiple states**: Cover default, hover, focus, and error states

### Maintaining Tests
1. **Update screenshots regularly**: When intentional changes are made
2. **Review failures**: Distinguish between real regressions and intentional changes
3. **Monitor performance**: Keep test execution times reasonable
4. **Check coverage**: Ensure all important UI elements are tested

### CI/CD Integration
The visual tests are integrated into CI/CD pipelines:
- **Pull requests**: Visual tests run automatically
- **Main branch**: Full test suite execution
- **Failure handling**: Tests fail on visual regressions

## Troubleshooting

### Common Issues
1. **Flaky tests**: Increase wait times or use more specific selectors
2. **Screenshot differences**: Check for animations or dynamic content
3. **Timeout errors**: Increase timeout in test configuration
4. **Browser issues**: Reinstall Playwright browsers

### Debug Mode
Run tests in debug mode to step through execution:
```bash
bun run visual-test debug
```

### Test UI
Use the Playwright Test UI for interactive test management:
```bash
bun run visual-test ui
```

## Configuration Files

### `playwright.config.ts` - Main Configuration
- Browser configurations
- Test directory settings
- Reporter configuration
- Web server setup

### `playwright.config.enhanced.ts` - Enhanced Configuration
- Advanced browser settings
- Multiple viewport configurations
- Enhanced reporting options
- Global setup/teardown

### `test-config.json` - Test Configuration
- Viewport definitions
- Screenshot options
- Visual regression thresholds
- Test suite definitions

## Future Enhancements

### Planned Features
1. **AI-powered visual comparisons**: Using computer vision for better diff detection
2. **Performance integration**: Combining visual tests with performance metrics
3. **Accessibility automation**: Automated accessibility testing integration
4. **Component library testing**: Visual testing for reusable components
5. **Mobile app testing**: Extension to mobile application testing

### Improvements
1. **Parallel execution**: Optimizing test execution time
2. **Smart screenshot updates**: AI-assisted screenshot management
3. **Integration with design tools**: Linking with Figma/Sketch designs
4. **Regression analysis**: Advanced regression detection and reporting

## Support

For questions or issues related to visual testing:
1. Check this documentation
2. Review test files for examples
3. Use debug mode to troubleshoot
4. Check Playwright documentation at https://playwright.dev/
5. Review test logs and reports for detailed information