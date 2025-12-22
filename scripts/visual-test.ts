#!/usr/bin/env bun

/**
 * Visual Testing Script
 * 
 * This script provides various commands for running visual tests
 * with different configurations and scenarios.
 */

import { spawn } from 'child_process';
import { argv } from 'process';

const commands = {
  // Basic visual tests
  'basic': {
    description: 'Run basic visual tests',
    args: ['test', 'tests/visual.spec.ts'],
  },
  
  // Component tests
  'components': {
    description: 'Run component visual tests',
    args: ['test', 'tests/components.spec.ts'],
  },
  
  // Accessibility tests
  'accessibility': {
    description: 'Run accessibility and visual regression tests',
    args: ['test', 'tests/accessibility.spec.ts'],
  },
  
  // Enhanced visual tests
  'enhanced': {
    description: 'Run enhanced visual tests with advanced features',
    args: ['test', 'tests/enhanced-visual.spec.ts'],
  },
  
  // Comprehensive visual tests
  'comprehensive': {
    description: 'Run comprehensive visual regression test suite',
    args: ['test', 'tests/comprehensive-visual.spec.ts'],
  },
  
  // Cross-browser visual tests
  'cross-browser': {
    description: 'Run cross-browser visual consistency tests',
    args: ['test', 'tests/cross-browser-visual.spec.ts'],
  },
  
  // All visual tests
  'all': {
    description: 'Run all visual tests',
    args: ['test', 'tests/'],
  },
  
  // Cross-browser project tests
  'cross-browser-projects': {
    description: 'Run tests across all browser projects',
    args: ['test', '--project=chromium', '--project=firefox', '--project=webkit'],
  },
  
  // Mobile tests
  'mobile': {
    description: 'Run mobile-specific tests',
    args: ['test', '--project=Mobile Chrome', '--project=Mobile Safari'],
  },
  
  // Dark mode tests
  'dark-mode': {
    description: 'Run dark mode visual tests',
    args: ['test', '--project=dark-mode'],
  },
  
  // Visual regression tests
  'regression': {
    description: 'Run visual regression tests only',
    args: ['test', '--project=visual-regression'],
  },
  
  // Update screenshots
  'update-screenshots': {
    description: 'Update all screenshots',
    args: ['test', '--update-snapshots'],
  },
  
  // Debug mode
  'debug': {
    description: 'Run tests in debug mode',
    args: ['test', '--debug'],
  },
  
  // UI mode
  'ui': {
    description: 'Run tests with Playwright UI',
    args: ['test', '--ui'],
  },
  
  // Generate code
  'codegen': {
    description: 'Open Playwright codegen for test creation',
    args: ['codegen', 'http://localhost:3000'],
  },
  
  // Show report
  'report': {
    description: 'Show test report',
    args: ['show-report'],
  },
};

function runCommand(_command: string, args: string[]) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Running: bunx playwright ${args.join(' ')}`);
    
    const child = spawn('bunx', ['playwright', ...args], {
      stdio: 'inherit',
      shell: true,
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Command completed successfully');
        resolve(code);
      } else {
        console.log(`❌ Command failed with code ${code}`);
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      console.error('❌ Error running command:', error);
      reject(error);
    });
  });
}

function showHelp() {
  console.log('🎨 Visual Testing Script');
  console.log('');
  console.log('Usage: bun run visual-test <command>');
  console.log('');
  console.log('Available commands:');
  console.log('');
  
  Object.entries(commands).forEach(([cmd, info]) => {
    console.log(`  ${cmd.padEnd(15)} ${info.description}`);
  });
  
  console.log('');
  console.log('Examples:');
  console.log('  bun run visual-test basic');
  console.log('  bun run visual-test all');
  console.log('  bun run visual-test update-screenshots');
  console.log('  bun run visual-test cross-browser');
}

async function main() {
  const [,, command] = argv;
  
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }
  
  const cmd = commands[command as keyof typeof commands];
  if (!cmd) {
    console.error(`❌ Unknown command: ${command}`);
    showHelp();
    process.exit(1);
  }
  
  try {
    await runCommand(command, cmd.args);
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  main().catch(console.error);
}