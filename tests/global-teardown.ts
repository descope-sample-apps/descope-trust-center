import { type FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting Playwright global teardown...');
  
  // Clean up any global test data or state
  // This could include:
  // - Cleaning up test databases
  // - Removing temporary files
  // - Resetting test environments
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;