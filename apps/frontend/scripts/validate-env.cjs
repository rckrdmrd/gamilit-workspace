#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 *
 * Validates that all required environment variables are present
 * and have correct values before building for production.
 *
 * Usage: node scripts/validate-env.js [--mode=production]
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const REQUIRED_VARS = {
  development: [
    'VITE_API_HOST',
    'VITE_API_PROTOCOL',
  ],
  production: [
    'VITE_API_HOST',
    'VITE_API_PROTOCOL',
    'VITE_APP_ENV',
  ],
};

const LOCALHOST_PATTERNS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Load environment file
 */
function loadEnvFile(mode) {
  const envFile = mode === 'production'
    ? path.join(__dirname, '../.env.production')
    : path.join(__dirname, '../.env');

  if (!fs.existsSync(envFile)) {
    console.error(`❌ Environment file not found: ${envFile}`);
    process.exit(1);
  }

  const content = fs.readFileSync(envFile, 'utf-8');
  const env = {};

  content.split('\n').forEach((line) => {
    // Skip comments and empty lines
    if (line.startsWith('#') || line.trim() === '') {
      return;
    }

    // Parse KEY=VALUE
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

/**
 * Check if value contains localhost patterns
 */
function containsLocalhost(value) {
  if (!value) return false;
  return LOCALHOST_PATTERNS.some(pattern =>
    value.toLowerCase().includes(pattern)
  );
}

/**
 * Validate environment variables
 */
function validateEnv(env, mode) {
  const errors = [];
  const warnings = [];

  console.log(`\n🔍 Validating environment for mode: ${mode}\n`);

  // Check required variables
  const required = REQUIRED_VARS[mode] || REQUIRED_VARS.development;

  required.forEach((varName) => {
    if (!env[varName]) {
      errors.push(`Missing required variable: ${varName}`);
    } else {
      console.log(`✅ ${varName}: ${env[varName]}`);
    }
  });

  // Production-specific validations
  if (mode === 'production') {
    // 1. Check API_HOST doesn't point to localhost
    if (env.VITE_API_HOST && containsLocalhost(env.VITE_API_HOST)) {
      errors.push(
        `VITE_API_HOST points to localhost in production: ${env.VITE_API_HOST}`
      );
    }

    // 2. Check WS_HOST doesn't point to localhost
    if (env.VITE_WS_HOST && containsLocalhost(env.VITE_WS_HOST)) {
      errors.push(
        `VITE_WS_HOST points to localhost in production: ${env.VITE_WS_HOST}`
      );
    }

    // 3. Check API_PROTOCOL is https in production
    if (env.VITE_API_PROTOCOL && env.VITE_API_PROTOCOL !== 'https') {
      warnings.push(
        `VITE_API_PROTOCOL should be 'https' in production: ${env.VITE_API_PROTOCOL}`
      );
    }

    // 4. Check WS_PROTOCOL is wss in production
    if (env.VITE_WS_PROTOCOL && env.VITE_WS_PROTOCOL !== 'wss') {
      warnings.push(
        `VITE_WS_PROTOCOL should be 'wss' in production: ${env.VITE_WS_PROTOCOL}`
      );
    }

    // 5. Check APP_ENV is set to production
    if (env.VITE_APP_ENV !== 'production') {
      warnings.push(
        `VITE_APP_ENV is not set to 'production': ${env.VITE_APP_ENV}`
      );
    }

    // 6. Check DEBUG flags are disabled
    if (env.VITE_ENABLE_DEBUG === 'true') {
      warnings.push('VITE_ENABLE_DEBUG is enabled in production');
    }

    if (env.VITE_MOCK_API === 'true') {
      errors.push('VITE_MOCK_API is enabled in production');
    }

    // 7. Check analytics is enabled
    if (env.VITE_ENABLE_ANALYTICS !== 'true') {
      warnings.push('VITE_ENABLE_ANALYTICS is not enabled in production');
    }
  }

  // Display results
  console.log('\n' + '='.repeat(60));

  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:\n');
    warnings.forEach((warning) => {
      console.log(`   - ${warning}`);
    });
  }

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:\n');
    errors.forEach((error) => {
      console.log(`   - ${error}`);
    });
    console.log('\n' + '='.repeat(60));
    console.log('\n❌ Environment validation FAILED\n');
    process.exit(1);
  }

  console.log('\n✅ Environment validation PASSED\n');
  console.log('='.repeat(60) + '\n');
}

// ============================================================================
// MAIN
// ============================================================================

function main() {
  // Parse arguments
  const args = process.argv.slice(2);
  const modeArg = args.find(arg => arg.startsWith('--mode='));
  const mode = modeArg ? modeArg.split('=')[1] : process.env.NODE_ENV || 'development';

  console.log('\n' + '='.repeat(60));
  console.log('  GAMILIT Platform - Environment Validation');
  console.log('='.repeat(60));

  // Load and validate environment
  const env = loadEnvFile(mode);
  validateEnv(env, mode);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { loadEnvFile, validateEnv };
