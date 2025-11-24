#!/usr/bin/env node

/**
 * GAMILIT MVP - Smoke Tests for Staging Environment
 * ================================================
 * Validates database seeds, backend APIs, and critical paths
 * before production deployment.
 */

const { Pool } = require('pg');
const axios = require('axios');

// Configuration
const DB_CONFIG = {
  connectionString: 'postgresql://gamilit_user:3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q@localhost:5432/gamilit_platform'
};

const API_BASE_URL = 'http://localhost:3006';
const TEST_START_TIME = Date.now();

// Test Results Storage
const results = {
  database: [],
  backend: [],
  critical: [],
  warnings: []
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testResult(category, name, passed, details = '') {
  const status = passed ? 'PASS' : 'FAIL';
  const color = passed ? 'green' : 'red';
  log(`  [${status}] ${name}${details ? ' - ' + details : ''}`, color);
  results[category].push({ name, passed, details });
  return passed;
}

function warning(message) {
  log(`  [WARN] ${message}`, 'yellow');
  results.warnings.push(message);
}

// ============================================================================
// DATABASE TESTS
// ============================================================================

async function testDatabaseConnectivity() {
  log('\n=== 1. DATABASE CONNECTIVITY & SEEDS ===', 'cyan');

  const pool = new Pool(DB_CONFIG);

  try {
    // Test 1.1: Database Connection
    await pool.query('SELECT NOW()');
    testResult('database', 'Database connection', true);

    // Test 1.2: Verify modules exist
    const modulesResult = await pool.query('SELECT COUNT(*) FROM educational_content.modules');
    const moduleCount = parseInt(modulesResult.rows[0].count);
    testResult('database', 'Modules table accessible', moduleCount > 0, `Found ${moduleCount} modules`);

    if (moduleCount === 5) {
      testResult('database', 'Expected module count (5)', true);
    } else {
      testResult('database', 'Expected module count (5)', false, `Found ${moduleCount} instead`);
    }

    // Test 1.3: Check modules 1-3 are published
    const publishedModulesQuery = `
      SELECT id, title, status, is_published
      FROM educational_content.modules
      WHERE id IN (1, 2, 3)
      ORDER BY id
    `;
    const publishedModules = await pool.query(publishedModulesQuery);

    let allPublished = true;
    publishedModules.rows.forEach(module => {
      const isCorrect = module.status === 'published' && module.is_published === true;
      if (!isCorrect) {
        allPublished = false;
        testResult('database', `Module ${module.id} published status`, false,
          `status=${module.status}, is_published=${module.is_published}`);
      }
    });

    if (allPublished && publishedModules.rows.length === 3) {
      testResult('database', 'Modules 1-3 published correctly', true);
    }

    // Test 1.4: Check modules 4-5 are in backlog
    const backlogModulesQuery = `
      SELECT id, title, status, is_published
      FROM educational_content.modules
      WHERE id IN (4, 5)
      ORDER BY id
    `;
    const backlogModules = await pool.query(backlogModulesQuery);

    let allBacklog = true;
    backlogModules.rows.forEach(module => {
      const isCorrect = module.status === 'backlog' && module.is_published === false;
      if (!isCorrect) {
        allBacklog = false;
        testResult('database', `Module ${module.id} backlog status`, false,
          `status=${module.status}, is_published=${module.is_published}`);
      }
    });

    if (allBacklog && backlogModules.rows.length === 2) {
      testResult('database', 'Modules 4-5 in backlog correctly', true);
    }

    // Test 1.5: Check exercises for modules 1-3
    const exercisesQuery = `
      SELECT module_id, COUNT(*) as count
      FROM educational_content.exercises
      WHERE module_id IN (1, 2, 3)
      GROUP BY module_id
      ORDER BY module_id
    `;
    const exercisesResult = await pool.query(exercisesQuery);

    let totalExercises = 0;
    exercisesResult.rows.forEach(row => {
      totalExercises += parseInt(row.count);
      log(`    Module ${row.module_id}: ${row.count} exercises`, 'blue');
    });

    if (totalExercises >= 17) {
      testResult('database', 'Exercise count for modules 1-3', true, `${totalExercises} exercises found (≥17 required)`);
    } else {
      testResult('database', 'Exercise count for modules 1-3', false, `Only ${totalExercises} exercises found (<17 required)`);
    }

    // Test 1.6: Check for orphaned records
    const orphanedExercisesQuery = `
      SELECT COUNT(*) FROM educational_content.exercises e
      WHERE NOT EXISTS (SELECT 1 FROM educational_content.modules m WHERE m.id = e.module_id)
    `;
    const orphanedExercises = await pool.query(orphanedExercisesQuery);
    const orphanedCount = parseInt(orphanedExercises.rows[0].count);

    testResult('database', 'No orphaned exercises', orphanedCount === 0,
      orphanedCount > 0 ? `Found ${orphanedCount} orphaned records` : '');

    await pool.end();
    return true;

  } catch (error) {
    testResult('database', 'Database connectivity', false, error.message);
    await pool.end();
    return false;
  }
}

// ============================================================================
// BACKEND API TESTS
// ============================================================================

async function testBackendAPIs() {
  log('\n=== 2. BACKEND API ENDPOINTS ===', 'cyan');

  try {
    // Test 2.1: GET /api/modules
    try {
      const modulesResponse = await axios.get(`${API_BASE_URL}/api/modules`);
      const modules = modulesResponse.data;

      if (Array.isArray(modules) && modules.length === 5) {
        testResult('backend', 'GET /api/modules returns 5 modules', true);
      } else {
        testResult('backend', 'GET /api/modules returns 5 modules', false,
          `Returned ${Array.isArray(modules) ? modules.length : 'non-array'} modules`);
      }

      // Check published modules
      const publishedModules = modules.filter(m => m.is_published === true);
      testResult('backend', 'Published modules count', publishedModules.length === 3,
        `Found ${publishedModules.length} published modules`);

    } catch (error) {
      testResult('backend', 'GET /api/modules', false, error.message);
    }

    // Test 2.2: GET /api/modules/:id for modules 1-3 (should include exercises)
    for (let moduleId of [1, 2, 3]) {
      try {
        const moduleResponse = await axios.get(`${API_BASE_URL}/api/modules/${moduleId}`);
        const module = moduleResponse.data;

        const hasExercises = module.exercises && Array.isArray(module.exercises) && module.exercises.length > 0;
        testResult('backend', `GET /api/modules/${moduleId} includes exercises`, hasExercises,
          hasExercises ? `${module.exercises.length} exercises` : 'No exercises found');

      } catch (error) {
        testResult('backend', `GET /api/modules/${moduleId}`, false, error.message);
      }
    }

    // Test 2.3: GET /api/modules/:id for modules 4-5 (should show backlog)
    for (let moduleId of [4, 5]) {
      try {
        const moduleResponse = await axios.get(`${API_BASE_URL}/api/modules/${moduleId}`);
        const module = moduleResponse.data;

        const isBacklog = module.status === 'backlog' && module.is_published === false;
        testResult('backend', `GET /api/modules/${moduleId} shows backlog`, isBacklog);

      } catch (error) {
        testResult('backend', `GET /api/modules/${moduleId}`, false, error.message);
      }
    }

    // Test 2.4: Gamification endpoints (if available)
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/api/health`);
      testResult('backend', 'Backend health check', healthResponse.status === 200);
    } catch (error) {
      warning('Backend health endpoint not available or not responding');
    }

    return true;

  } catch (error) {
    testResult('backend', 'Backend API tests', false, error.message);
    return false;
  }
}

// ============================================================================
// CRITICAL USER FLOWS
// ============================================================================

async function testCriticalFlows() {
  log('\n=== 3. CRITICAL USER FLOWS ===', 'cyan');

  try {
    // Test 3.1: Student can view published modules
    const modulesResponse = await axios.get(`${API_BASE_URL}/api/modules`);
    const publishedModules = modulesResponse.data.filter(m => m.is_published === true);

    testResult('critical', 'Student can view published modules',
      publishedModules.length >= 3, `${publishedModules.length} published modules available`);

    // Test 3.2: Student can access module details with exercises
    let canAccessExercises = true;
    for (let module of publishedModules.slice(0, 3)) {
      try {
        const detailResponse = await axios.get(`${API_BASE_URL}/api/modules/${module.id}`);
        if (!detailResponse.data.exercises || detailResponse.data.exercises.length === 0) {
          canAccessExercises = false;
          break;
        }
      } catch (error) {
        canAccessExercises = false;
        break;
      }
    }

    testResult('critical', 'Student can access exercises for published modules', canAccessExercises);

    // Test 3.3: Backlog modules are properly marked
    const backlogModules = modulesResponse.data.filter(m => m.status === 'backlog');
    testResult('critical', 'Backlog modules properly identified',
      backlogModules.length >= 2, `${backlogModules.length} modules in backlog`);

    return true;

  } catch (error) {
    testResult('critical', 'Critical user flows', false, error.message);
    return false;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function runSmokeTests() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║        GAMILIT MVP - STAGING SMOKE TESTS                       ║', 'cyan');
  log('║        Testing critical paths before production deploy         ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════╝', 'cyan');

  // Run all test suites
  await testDatabaseConnectivity();
  await testBackendAPIs();
  await testCriticalFlows();

  // Generate summary
  log('\n=== TEST SUMMARY ===', 'cyan');

  const allTests = [
    ...results.database,
    ...results.backend,
    ...results.critical
  ];

  const passed = allTests.filter(t => t.passed).length;
  const failed = allTests.filter(t => !t.passed).length;
  const total = allTests.length;

  log(`\nTotal Tests: ${total}`);
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`Warnings: ${results.warnings.length}`, results.warnings.length > 0 ? 'yellow' : 'green');

  const executionTime = ((Date.now() - TEST_START_TIME) / 1000).toFixed(2);
  log(`\nExecution Time: ${executionTime}s`);

  // Determine if production-ready
  const criticalFailures = results.critical.filter(t => !t.passed).length;
  const databaseFailures = results.database.filter(t => !t.passed).length;

  log('\n=== RECOMMENDATION ===', 'cyan');

  if (criticalFailures === 0 && databaseFailures === 0 && failed <= 2) {
    log('✓ APPROVE - MVP is ready for production deployment', 'green');
    log('  All critical tests passed. Any failures are non-blocking.', 'green');
  } else if (criticalFailures > 0) {
    log('✗ BLOCK - Critical failures detected', 'red');
    log(`  ${criticalFailures} critical test(s) failed. Must be resolved before deploy.`, 'red');
  } else if (databaseFailures > 2) {
    log('✗ BLOCK - Database integrity issues', 'red');
    log(`  ${databaseFailures} database test(s) failed. Review seed data.`, 'red');
  } else {
    log('⚠ CAUTION - Some tests failed, review required', 'yellow');
    log(`  ${failed} test(s) failed. Review before deployment.`, 'yellow');
  }

  // Return exit code
  process.exit(criticalFailures > 0 || databaseFailures > 2 ? 1 : 0);
}

// Run tests
runSmokeTests().catch(error => {
  log('\n✗ FATAL ERROR: Smoke tests failed to execute', 'red');
  console.error(error);
  process.exit(1);
});
