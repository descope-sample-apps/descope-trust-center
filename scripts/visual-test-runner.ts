#!/usr/bin/env bun

/**
 * Visual Regression Test Runner
 * 
 * Comprehensive visual testing script with multiple configurations
 * and reporting options for the Descope Trust Center.
 */

import { spawn } from 'child_process';
import { argv } from 'process';

interface TestCommand {
  description: string;
  args: string[];
  config?: string;
}

const testCommands: Record<string, TestCommand> = {
  // Basic visual tests
  'basic': {
    description: 'Run basic visual regression tests',
    args: ['test', 'tests/visual-regression-suite.spec.ts'],
    config: 'playwright.config.ts'
  },
  
  // Full visual regression suite
  'full': {
    description: 'Run complete visual regression test suite',
    args: ['test', 'tests/visual-regression-suite.spec.ts'],
    config: 'playwright.config.visual.ts'
  },
  
  // Cross-browser visual tests
  'cross-browser': {
    description: 'Run visual tests across all browsers',
    args: ['test', 'tests/visual-regression-suite.spec.ts', '--project=chromium-desktop', '--project=firefox-desktop', '--project=webkit-desktop'],
    config: 'playwright.config.visual.ts'
  },
  
  // Responsive design tests
  'responsive': {
    description: 'Run responsive design visual tests',
    args: ['test', 'tests/visual-regression-suite.spec.ts', '--project=chromium-tablet', '--project=chromium-mobile'],
    config: 'playwright.config.visual.ts'
  },
  
  // Mobile-specific tests
  'mobile': {
    description: 'Run mobile visual tests',
    args: ['test', 'tests/visual-regression-suite.spec.ts', '--project=chromium-mobile', '--project=webkit-mobile'],
    config: 'playwright.config.visual.ts'
  },
  
  // Dark mode tests
  'dark-mode': {
    description: 'Run dark mode visual tests',
    args: ['test', 'tests/visual-regression-suite.spec.ts', '--project=dark-mode'],
    config: 'playwright.config.visual.ts'
  },
  
  // High contrast tests
  'high-contrast': {
    description: 'Run high contrast mode tests',
    args: ['test', 'tests/visual-regression-suite.spec.ts', '--project=high-contrast'],
    config: 'playwright.config.visual.ts'
  },
  
  // All projects comprehensive test
  'all-projects': {
    description: 'Run tests across all configured projects',
    args: ['test', 'tests/visual-regression-suite.spec.ts'],
    config: 'playwright.config.visual.ts'
  },
  
  // Update screenshots
  'update': {
    description: 'Update all visual test screenshots',
    args: ['test', 'tests/visual-regression-suite.spec.ts', '--update-snapshots'],
    config: 'playwright.config.visual.ts'
  },
  
  // CI mode tests
  'ci': {
    description: 'Run tests in CI mode with retries',
    args: ['test', 'tests/visual-regression-suite.spec.ts'],
    config: 'playwright.config.visual.ts',
  },
  
  // Development mode tests
  'dev': {
    description: 'Run tests in development mode',
    args: ['test', 'tests/visual-regression-suite.spec.ts', '--headed'],
    config: 'playwright.config.ts'
  },
  
  // Debug mode
  'debug': {
    description: 'Run tests in debug mode',
    args: ['test', 'tests/visual-regression-suite.spec.ts', '--debug'],
    config: 'playwright.config.visual.ts'
  },
  
  // UI mode
  'ui': {
    description: 'Run tests with Playwright UI',
    args: ['test', '--ui'],
    config: 'playwright.config.visual.ts'
  },
  
  // Generate code
  'codegen': {
    description: 'Open Playwright codegen for test creation',
    args: ['codegen', 'http://localhost:3000'],
    config: 'playwright.config.ts'
  },
  
  // Show report
  'report': {
    description: 'Show visual test report',
    args: ['show-report'],
    config: 'playwright.config.ts'
  },
  
  // List tests
  'list': {
    description: 'List all available tests',
    args: ['test', '--list'],
    config: 'playwright.config.visual.ts'
  },
  
  // Clean test results
  'clean': {
    description: 'Clean test results and screenshots',
    args: ['test', '--clean'],
    config: 'playwright.config.ts'
  }
};

function runCommand(command: string, args: string[], config?: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const configArgs = config ? ['--config', config] : [];
    const allArgs = ['playwright', ...args, ...configArgs];
    
    console.log(`🚀 Running: bunx ${allArgs.join(' ')}`);
    console.log(`📁 Config: ${config || 'default'}`);
    console.log('');
    
    const child = spawn('bunx', allArgs, {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        CI: process.env.CI || 'false',
        // Ensure consistent environment for visual testing
        TZ: 'UTC',
        LANG: 'en_US.UTF-8'
      }
    });
    
    child.on('close', (code) => {
      console.log('');
      if (code === 0) {
        console.log('✅ Visual tests completed successfully');
        resolve(code);
      } else {
        console.log(`❌ Visual tests failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error('❌ Error running visual tests:', error);
      reject(error);
    });
  });
}

function showHelp(): void {
  console.log('🎨 Descope Trust Center Visual Regression Test Runner');
  console.log('');
  console.log('Usage: bun run visual-test-runner <command>');
  console.log('');
  console.log('Available commands:');
  console.log('');
  
  Object.entries(testCommands).forEach(([cmd, info]) => {
    console.log(`  ${cmd.padEnd(15)} ${info.description}`);
  });
  
  console.log('');
  console.log('Examples:');
  console.log('  bun run visual-test-runner basic');
  console.log('  bun run visual-test-runner full');
  console.log('  bun run visual-test-runner cross-browser');
  console.log('  bun run visual-test-runner responsive');
  console.log('  bun run visual-test-runner update');
  console.log('');
  console.log('Environment Variables:');
  console.log('  CI=true              Enable CI mode with retries');
  console.log('  HEADED=true          Run tests in headed mode');
  console.log('  DEBUG=true           Enable debug mode');
  console.log('  UPDATE_SNAPSHOTS=true Update screenshots');
}

function validateEnvironment(): void {
  // Check if required dependencies are available
  const requiredPackages = ['@playwright/test'];
  
  console.log('🔍 Validating environment...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`   Node.js: ${nodeVersion}`);
  
  // Check if we're in the right directory
  const packageJsonPath = './package.json';
  try {
    require.resolve(packageJsonPath);
    console.log('   ✅ package.json found');
  } catch (error) {
    console.error('   ❌ package.json not found. Please run from project root.');
    process.exit(1);
  }
  
  // Check if test directory exists
  const testDir = './tests';
  try {
    require.resolve(testDir);
    console.log('   ✅ tests directory found');
  } catch (error) {
    console.error('   ❌ tests directory not found.');
    process.exit(1);
  }
  
  console.log('   ✅ Environment validation complete');
  console.log('');
}

async function main(): Promise<void> {
  const [,, command] = argv;
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }
  
  const testCommand = testCommands[command];
  if (!testCommand) {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
  
  try {
    // Validate environment before running tests
    validateEnvironment();
    
    // Set environment variables based on command
    if (command === 'ci') {
      process.env.CI = 'true';
    }
    
    if (command === 'debug') {
      process.env.DEBUG = 'true';
    }
    
    if (command === 'update') {
      process.env.UPDATE_SNAPSHOTS = 'true';
    }
    
    // Run the test command
    await runCommand(command, testCommand.args, testCommand.config);
    
    // Show additional information for certain commands
    if (command === 'report') {
      console.log('📊 Test report opened in browser');
    }
    
    if (command === 'update') {
      console.log('📸 Screenshots updated successfully');
      console.log('💡 Don\'t forget to commit the updated screenshots');
    }
    
  } catch (error) {
    console.error('❌ Visual test execution failed:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  main().catch(console.error);
}